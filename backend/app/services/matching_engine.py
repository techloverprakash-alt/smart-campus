import datetime
import json
import logging
import re
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np
from sqlalchemy.orm import Session

from app.models import MatchRecord, Report
from app.schemas import CandidateMatchItem, EngineConfig, ReportMatchesResponse, SignalScores
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)

# Campus Zones and Hierarchy Mapping
CAMPUS_ZONES = {
    # Library Zone
    "library": {"library_floor_1", "library_floor_2", "library_study_rooms", "library_cubicles", "library_entrance"},
    # Dining Zone
    "dining": {"cafeteria_main", "food_court", "coffee_shop", "dining_hall", "snack_bar"},
    # Sports Zone
    "sports": {"gym_court_1", "gym_fitness", "sports_pool", "sports_field", "locker_rooms"},
    # Academic Buildings
    "academics": {"hall_a", "hall_b", "computer_lab_1", "computer_lab_2", "science_lab", "engineering_block"},
    # Student Life & Admin
    "student_center": {"student_center_lobby", "admissions", "admin_office", "bookstore", "atrium"},
}

# Reverse lookup for zone
LOCATION_TO_ZONE: Dict[str, str] = {}
for zone, locs in CAMPUS_ZONES.items():
    for loc in locs:
        LOCATION_TO_ZONE[loc] = zone

# Synonym map for basic item keywords and colors
COLOR_SYNONYMS = {
    "dark": {"black", "dark gray", "charcoal"},
    "grey": {"gray"},
    "navy": {"blue", "dark blue"},
    "crimson": {"red", "burgundy", "maroon"},
    "tan": {"brown", "beige", "khaki"},
    "golden": {"gold", "yellow"},
}


class AutomatedMatchingEngine:
    """
    Automated Lost-and-Found Matching Engine.
    Combines 5 independent signals:
      1. Text semantic similarity (MobileCLIP)
      2. Visual image similarity (MobileCLIP)
      3. Keyword and item attribute matching
      4. Campus location proximity hierarchy
      5. Date and time compatibility
    Combines signals into a dynamically re-normalized weighted ranking score.
    """
    def __init__(self, config: Optional[EngineConfig] = None):
        self.config = config or EngineConfig()

    @staticmethod
    def build_structured_text(report: Report) -> str:
        """Constructs an information-rich text string for MobileCLIP text encoding."""
        parts = [f"Item: {report.title}", f"Category: {report.category}"]
        if report.color:
            parts.append(f"Color: {report.color}")
        if report.brand:
            parts.append(f"Brand: {report.brand}")
        parts.append(f"Description: {report.description}")
        return ". ".join(parts)

    @staticmethod
    def compute_text_similarity(report1: Report, report2: Report) -> float:
        """
        Computes MobileCLIP text embedding cosine similarity.
        Normalizes raw cosine score [-1.0, 1.0] to [0.0, 1.0].
        """
        t1 = AutomatedMatchingEngine.build_structured_text(report1)
        t2 = AutomatedMatchingEngine.build_structured_text(report2)

        v1 = embedding_service.encode_text(t1, normalize=True)
        v2 = embedding_service.encode_text(t2, normalize=True)

        raw_sim, _ = embedding_service.calculate_cosine_similarity(v1, v2)
        # Cosine similarity below 0 represents unrelated/opposite semantics; map to 0.0
        return max(0.0, min(1.0, float(raw_sim)))

    @staticmethod
    def compute_image_similarity(report1: Report, report2: Report) -> Optional[float]:
        """
        Computes MobileCLIP image cosine similarity.
        Returns None if either report does not possess an image.
        """
        if not report1.has_image or not report1.image_path:
            return None
        if not report2.has_image or not report2.image_path:
            return None

        try:
            v1 = embedding_service.encode_image(report1.image_path, normalize=True)
            v2 = embedding_service.encode_image(report2.image_path, normalize=True)
            raw_sim, _ = embedding_service.calculate_cosine_similarity(v1, v2)
            return max(0.0, min(1.0, float(raw_sim)))
        except Exception as e:
            logger.warning(f"Could not compute image similarity between {report1.id} and {report2.id}: {e}")
            return None

    @staticmethod
    def compute_keyword_similarity(report1: Report, report2: Report) -> float:
        """
        Computes deterministic attribute matching score based on:
        - Category match (weight: 0.40)
        - Color match (weight: 0.25)
        - Brand match (weight: 0.20)
        - Token/keyword overlap (weight: 0.15)
        """
        score = 0.0
        total_w = 0.0

        # 1. Category match
        c1 = (report1.category or "").strip().lower()
        c2 = (report2.category or "").strip().lower()
        if c1 and c2:
            total_w += 0.40
            if c1 == c2:
                score += 0.40 * 1.0
            elif (c1 in ("electronics", "accessories") and c2 in ("electronics", "accessories")):
                score += 0.40 * 0.5

        # 2. Color match
        col1 = (report1.color or "").strip().lower()
        col2 = (report2.color or "").strip().lower()
        if col1 and col2:
            total_w += 0.25
            if col1 == col2:
                score += 0.25 * 1.0
            else:
                # Check synonym match
                syns = COLOR_SYNONYMS.get(col1, set()) | {col1}
                if col2 in syns:
                    score += 0.25 * 0.8
                elif col1 in (report2.description or "").lower() or col2 in (report1.description or "").lower():
                    score += 0.25 * 0.7

        # 3. Brand match
        b1 = (report1.brand or "").strip().lower()
        b2 = (report2.brand or "").strip().lower()
        if b1 and b2:
            total_w += 0.20
            if b1 == b2:
                score += 0.20 * 1.0
            elif b1 in b2 or b2 in b1:
                score += 0.20 * 0.85
        elif b1 and b1 in (report2.description or "").lower():
            total_w += 0.20
            score += 0.20 * 0.75
        elif b2 and b2 in (report1.description or "").lower():
            total_w += 0.20
            score += 0.20 * 0.75

        # 4. Text tokens Jaccard overlap (excluding common generic stopwords)
        stopwords = {"the", "a", "an", "in", "on", "at", "and", "or", "of", "with", "item", "lost", "found", "near", "my", "this"}
        tokens1 = set(re.findall(r"\w+", (report1.title + " " + report1.description).lower())) - stopwords
        tokens2 = set(re.findall(r"\w+", (report2.title + " " + report2.description).lower())) - stopwords
        if tokens1 and tokens2:
            total_w += 0.15
            jaccard = len(tokens1 & tokens2) / len(tokens1 | tokens2)
            score += 0.15 * min(1.0, jaccard * 2.0)  # scale jaccard

        if total_w == 0.0:
            return 0.5  # neutral baseline if no attributes available

        return round(score / total_w, 4)

    @staticmethod
    def compute_location_compatibility(report1: Report, report2: Report) -> float:
        """
        Computes campus location compatibility based on hierarchical location mapping:
        - Same exact location ID: 1.0
        - Same building / zone: 0.70
        - Known campus zone (different building): 0.35
        - Unknown or unmapped location: 0.20
        """
        loc1 = (report1.location_id or "").strip().lower()
        loc2 = (report2.location_id or "").strip().lower()

        if not loc1 or not loc2 or loc1 == "unknown" or loc2 == "unknown":
            return 0.20

        # Exact location match
        if loc1 == loc2:
            return 1.0

        # Check zone hierarchy
        zone1 = LOCATION_TO_ZONE.get(loc1)
        zone2 = LOCATION_TO_ZONE.get(loc2)

        if zone1 and zone2 and zone1 == zone2:
            return 0.70  # Same campus zone (e.g. both in library building on different floors)

        # Check partial string containment (e.g. 'library' in both)
        if any(term in loc1 and term in loc2 for term in ["library", "gym", "cafeteria", "sports", "hall", "lab"]):
            return 0.65

        # Different zones on campus
        return 0.35

    @staticmethod
    def compute_time_compatibility(report1: Report, report2: Report) -> Optional[float]:
        """
        Computes incident date/time compatibility.
        Lost items are usually found either shortly after or around the same time they were lost.
        Returns None if either timestamp is missing.
        """
        t1 = report1.incident_datetime
        t2 = report2.incident_datetime

        if t1 is None or t2 is None:
            return None

        # Determine which is lost and which is found
        if report1.report_type == "lost" and report2.report_type == "found":
            t_lost, t_found = t1, t2
        elif report1.report_type == "found" and report2.report_type == "lost":
            t_lost, t_found = t2, t1
        else:
            # Same type comparison
            diff_hours = abs((t1 - t2).total_seconds()) / 3600.0
            return max(0.1, 1.0 - (diff_hours / (24.0 * 14.0)))

        # Signed time delta in hours (positive if found after lost)
        delta_hours = (t_found - t_lost).total_seconds() / 3600.0

        if delta_hours >= 0:
            # Found after lost
            if delta_hours <= 24:
                return 1.0
            elif delta_hours <= 72:  # 3 days
                return 0.85
            elif delta_hours <= 168:  # 1 week
                return 0.70
            elif delta_hours <= 336:  # 2 weeks
                return 0.50
            elif delta_hours <= 720:  # 1 month
                return 0.30
            else:
                return 0.15
        else:
            # Found before reported lost time (can occur due to human estimation inaccuracy)
            abs_delta = abs(delta_hours)
            if abs_delta <= 12:
                return 0.70
            elif abs_delta <= 24:
                return 0.40
            else:
                return 0.15

    def calculate_combined_score(
        self,
        text_score: float,
        image_score: Optional[float],
        keyword_score: float,
        location_score: float,
        time_score: Optional[float]
    ) -> Tuple[float, SignalScores]:
        """
        Dynamically calculates the combined ranking score:
            score = sum(w_i * s_i) / sum(available_w_i)
        Automatically re-normalizes weights when signals are missing (e.g. image or time).
        """
        signals = SignalScores(
            text=round(text_score, 4),
            image=round(image_score, 4) if image_score is not None else None,
            keyword=round(keyword_score, 4),
            location=round(location_score, 4),
            time=round(time_score, 4) if time_score is not None else None,
        )

        numerator = 0.0
        denominator = 0.0

        # Text
        numerator += self.config.text_weight * text_score
        denominator += self.config.text_weight

        # Image (omitted if None)
        if image_score is not None:
            numerator += self.config.image_weight * image_score
            denominator += self.config.image_weight

        # Keyword
        numerator += self.config.keyword_weight * keyword_score
        denominator += self.config.keyword_weight

        # Location
        numerator += self.config.location_weight * location_score
        denominator += self.config.location_weight

        # Time (omitted if None)
        if time_score is not None:
            numerator += self.config.time_weight * time_score
            denominator += self.config.time_weight

        if denominator == 0.0:
            return 0.0, signals

        combined = float(numerator / denominator)
        return round(max(0.0, min(1.0, combined)), 4), signals

    @staticmethod
    def generate_explanation_reasons(
        signals: SignalScores,
        report1: Report,
        report2: Report
    ) -> List[str]:
        """Generates transparent, human-readable explanations for why this match was suggested."""
        reasons = []

        if signals.image is not None and signals.image >= 0.75:
            reasons.append(f"High visual similarity ({int(signals.image * 100)}%) between photos")
        elif signals.image is not None and signals.image >= 0.55:
            reasons.append("Moderate visual resemblance in uploaded photos")

        if signals.text is not None and signals.text >= 0.70:
            reasons.append(f"Semantically matching descriptions ({int(signals.text * 100)}%)")

        # Attribute reasons
        if report1.category and report2.category and report1.category.lower() == report2.category.lower():
            reasons.append(f"Matching category: {report1.category.title()}")

        if report1.brand and report2.brand and report1.brand.lower() == report2.brand.lower():
            reasons.append(f"Matching brand: {report1.brand.title()}")

        if report1.color and report2.color and report1.color.lower() == report2.color.lower():
            reasons.append(f"Matching color: {report1.color.title()}")

        # Location reason
        if signals.location is not None:
            if signals.location >= 0.95:
                reasons.append(f"Reported at the same location ({report1.location_name})")
            elif signals.location >= 0.65:
                reasons.append("Reported in the same campus building / zone")

        # Time reason
        if signals.time is not None and signals.time >= 0.70:
            reasons.append("Reported within a highly compatible timeframe")

        if not reasons:
            reasons.append("General semantic correlation across item attributes")

        return reasons

    def match_report(
        self,
        target_report_id: str,
        db: Session,
        top_k: Optional[int] = None
    ) -> ReportMatchesResponse:
        """
        Executes candidate retrieval, multi-signal scoring, and match persistence for a report.
        """
        limit = top_k or self.config.top_k
        target_report = db.query(Report).filter(Report.id == target_report_id).first()
        if not target_report:
            raise ValueError(f"Report '{target_report_id}' not found.")

        # If target report is deleted or claimed, return empty matches
        if target_report.status in ("deleted", "claimed"):
            return ReportMatchesResponse(
                query_report_id=target_report.id,
                query_report_type=target_report.report_type,
                total_candidates_found=0,
                matches=[]
            )

        # Opposite report type
        candidate_type = "found" if target_report.report_type == "lost" else "lost"

        # 1. Candidate Retrieval from Qdrant via vector similarity
        # Query vector from target report's text
        target_text = self.build_structured_text(target_report)
        target_vector = embedding_service.encode_text(target_text, normalize=True).tolist()

        candidate_ids: Set[str] = set()

        try:
            # Query Qdrant with modality filter
            scored_points = qdrant_service.search_similar(
                query_vector=target_vector,
                limit=30,  # retrieve top 30 semantic candidates for multi-signal re-ranking
                collection_name=qdrant_service.collection_name
            )
            for pt in scored_points:
                rec_id = (pt.payload or {}).get("record_id")
                if rec_id and rec_id != target_report.id:
                    candidate_ids.add(rec_id)
        except Exception as e:
            logger.warning(f"Qdrant retrieval note: {e}. Falling back to relational candidate set.")

        # Also retrieve active relational candidates of opposite type as safety net
        relational_candidates = (
            db.query(Report)
            .filter(
                Report.report_type == candidate_type,
                Report.status == "open",
                Report.id != target_report.id
            )
            .all()
        )
        for r in relational_candidates:
            candidate_ids.add(r.id)

        # Fetch full eligible candidate reports
        if not candidate_ids:
            return ReportMatchesResponse(
                query_report_id=target_report.id,
                query_report_type=target_report.report_type,
                total_candidates_found=0,
                matches=[]
            )

        eligible_reports = (
            db.query(Report)
            .filter(
                Report.id.in_(list(candidate_ids)),
                Report.report_type == candidate_type,
                Report.status == "open"
            )
            .all()
        )

        evaluated_matches: List[CandidateMatchItem] = []

        # 2. Evaluate all 5 signals for each candidate
        for candidate in eligible_reports:
            # Determine lost vs found assignment
            lost_rep = target_report if target_report.report_type == "lost" else candidate
            found_rep = candidate if target_report.report_type == "lost" else target_report

            # Compute individual signals
            s_text = self.compute_text_similarity(target_report, candidate)
            s_image = self.compute_image_similarity(target_report, candidate)
            s_keyword = self.compute_keyword_similarity(target_report, candidate)
            s_location = self.compute_location_compatibility(target_report, candidate)
            s_time = self.compute_time_compatibility(target_report, candidate)

            # Combined ranking score with dynamic re-normalization
            ranking_score, signals = self.calculate_combined_score(
                text_score=s_text,
                image_score=s_image,
                keyword_score=s_keyword,
                location_score=s_location,
                time_score=s_time
            )

            # Skip candidates strictly below threshold
            if ranking_score < self.config.min_score_threshold:
                continue

            reasons = self.generate_explanation_reasons(signals, target_report, candidate)

            # 3. Match persistence & deduplication
            match_id = f"match_{lost_rep.id}_{found_rep.id}"
            existing_match = db.query(MatchRecord).filter(MatchRecord.id == match_id).first()

            if existing_match:
                # Update existing match record
                existing_match.ranking_score = ranking_score
                existing_match.text_score = signals.text
                existing_match.image_score = signals.image
                existing_match.keyword_score = signals.keyword
                existing_match.location_score = signals.location
                existing_match.time_score = signals.time
                existing_match.reasons = json.dumps(reasons)
                existing_match.evaluated_at = datetime.datetime.utcnow()
                db_match = existing_match
            else:
                # Insert new match record
                db_match = MatchRecord(
                    id=match_id,
                    lost_report_id=lost_rep.id,
                    found_report_id=found_rep.id,
                    ranking_score=ranking_score,
                    text_score=signals.text,
                    image_score=signals.image,
                    keyword_score=signals.keyword,
                    location_score=signals.location,
                    time_score=signals.time,
                    reasons=json.dumps(reasons),
                    algorithm_version="v1.0.0",
                    status="potential_match",
                    is_reviewed=False,
                    evaluated_at=datetime.datetime.utcnow()
                )
                db.add(db_match)

            db.commit()

            evaluated_matches.append(
                CandidateMatchItem(
                    match_id=db_match.id,
                    candidate_report_id=candidate.id,
                    candidate_report_type=candidate.report_type,
                    title=candidate.title,
                    description=candidate.description,
                    category=candidate.category,
                    color=candidate.color,
                    brand=candidate.brand,
                    location_name=candidate.location_name,
                    incident_datetime=candidate.incident_datetime.isoformat() if candidate.incident_datetime else None,
                    image_path=candidate.image_path,
                    has_image=candidate.has_image,
                    ranking_score=ranking_score,
                    ranking_percentage=round(ranking_score * 100.0, 2),
                    signals=signals,
                    reasons=reasons,
                    status=db_match.status,
                    is_reviewed=db_match.is_reviewed,
                    evaluated_at=db_match.evaluated_at.isoformat()
                )
            )

        # Sort descending by ranking score
        evaluated_matches.sort(key=lambda m: m.ranking_score, reverse=True)
        top_matches = evaluated_matches[:limit]

        top_match = top_matches[0] if top_matches else None

        return ReportMatchesResponse(
            query_report_id=target_report.id,
            query_report_type=target_report.report_type,
            total_candidates_found=len(top_matches),
            top_match=top_match,
            matches=top_matches
        )


# Global default engine instance
matching_engine = AutomatedMatchingEngine()
