import datetime
import json
import logging
from typing import Any, Dict, List, Optional
import numpy as np
from sqlalchemy.orm import Session

from app.infrastructure.embedding import embedding_adapter
from app.infrastructure.vector_search import vector_search_adapter
from app.modules.lost_and_found.models import (
    FoundReport,
    ItemCategory,
    ItemClaim,
    ItemHandover,
    ItemMatch,
    LostReport,
    MatchVerification,
)
from app.modules.lost_and_found.repository import LostAndFoundRepository
from app.modules.lost_and_found.schemas import (
    ClaimCreate,
    FoundReportCreate,
    HandoverCreate,
    LostReportCreate,
    VerificationCreate,
)

logger = logging.getLogger(__name__)


class LostAndFoundService:
    """
    Core business domain service coordinating reporting, AI vector embedding,
    multi-signal candidate triage, and custody handover state transitions.
    """
    def __init__(self, db: Session):
        self.db = db
        self.repo = LostAndFoundRepository(db)

    # =========================================================================
    # Report Submission & Indexing
    # =========================================================================

    def submit_lost_report(self, data: LostReportCreate, reporter_id: str) -> LostReport:
        # Resolve location
        loc_id = data.last_seen_location_id
        if not loc_id and data.last_seen_location_name:
            loc = self.repo.get_or_create_location(data.last_seen_location_name)
            loc_id = loc.id

        report = self.repo.create_lost_report(
            reporter_id=reporter_id,
            category_id=data.category_id,
            last_seen_location_id=loc_id,
            title=data.title,
            brand_model=data.brand_model,
            description=data.description,
            lost_at=data.lost_at,
            status="OPEN"
        )

        # Attach media if provided
        if data.image_url:
            self.repo.attach_media(
                media_url=data.image_url,
                lost_report_id=report.id,
                user_id=reporter_id
            )

        # Asynchronously generate vector and index into Qdrant
        vector = embedding_adapter.get_text_vector(f"{data.title}. {data.description}")
        if vector is not None:
            vector_search_adapter.upsert_item(
                record_id=report.id,
                vector=vector,
                modality="text",
                payload={
                    "report_id": report.id,
                    "type": "lost",
                    "title": data.title,
                    "category_id": data.category_id,
                    "description": data.description,
                    "location_id": loc_id or "",
                    "created_at": datetime.datetime.utcnow().isoformat(),
                }
            )

        # Automatic cross-modal triage against existing found items
        self.evaluate_matches_for_lost(report.id)
        return self.repo.get_lost_report(report.id) or report

    def submit_found_report(self, data: FoundReportCreate, reported_by: str) -> FoundReport:
        # Resolve location
        loc_id = data.found_location_id
        if not loc_id and data.found_location_name:
            loc = self.repo.get_or_create_location(data.found_location_name)
            loc_id = loc.id

        # Generate inventory tag if missing
        tag = data.inventory_tag
        if not tag:
            import random
            tag = f"#SEC-{random.randint(100, 999)}"

        report = self.repo.create_found_report(
            reported_by=reported_by,
            category_id=data.category_id,
            found_location_id=loc_id,
            title=data.title,
            description=data.description,
            custody_desk=data.custody_desk,
            inventory_tag=tag,
            found_at=data.found_at,
            storage_status=data.storage_status or "INTAKE_PENDING"
        )

        # Attach media if provided
        if data.image_url:
            self.repo.attach_media(
                media_url=data.image_url,
                found_report_id=report.id,
                user_id=reported_by
            )

        # Index vector into Qdrant
        vector = embedding_adapter.get_text_vector(f"{data.title}. {data.description}")
        if vector is not None:
            vector_search_adapter.upsert_item(
                record_id=report.id,
                vector=vector,
                modality="text",
                payload={
                    "report_id": report.id,
                    "type": "found",
                    "title": data.title,
                    "category_id": data.category_id,
                    "description": data.description,
                    "location_id": loc_id or "",
                    "inventory_tag": tag,
                    "created_at": datetime.datetime.utcnow().isoformat(),
                }
            )

        # Automatic cross-modal triage against open lost reports
        self.evaluate_matches_for_found(report.id)
        return self.repo.get_found_report(report.id) or report

    # =========================================================================
    # AI Candidate Matching Engine
    # =========================================================================

    def compute_similarity(self, lost: LostReport, found: FoundReport) -> Dict[str, Any]:
        """
        Calculates multi-signal similarity scores and criteria checks.
        """
        criteria = []

        # 1. Category check
        category_match = (lost.category_id == found.category_id)
        criteria.append({
            "label": "Category Match",
            "passed": category_match
        })

        # 2. Textual / Semantic similarity
        lost_words = set(lost.title.lower().split() + lost.description.lower().split())
        found_words = set(found.title.lower().split() + found.description.lower().split())
        shared = lost_words.intersection(found_words)
        jaccard = len(shared) / max(1, len(lost_words.union(found_words)))
        text_score = min(1.0, 0.4 + (jaccard * 1.2)) if shared else 0.35

        # 3. Location proximity check
        loc_match = (
            lost.last_seen_location_id and found.found_location_id and
            lost.last_seen_location_id == found.found_location_id
        )
        criteria.append({
            "label": "Location Proximity",
            "passed": bool(loc_match)
        })

        # 4. Time delta check
        time_passed = True
        if lost.lost_at and found.found_at:
            delta = abs((found.found_at - lost.lost_at).total_seconds())
            time_passed = delta <= (7 * 86400)  # within 7 days
            criteria.append({
                "label": f"Time Delta < {int(delta // 3600)}h",
                "passed": time_passed
            })

        # Combined weighted score (0 - 100)
        score = (text_score * 0.5)
        if category_match:
            score += 0.30
        if loc_match:
            score += 0.15
        if time_passed:
            score += 0.05

        combined_percent = round(min(99.0, max(45.0, score * 100)), 1)
        return {
            "combined_score": combined_percent,
            "text_similarity": round(text_score, 3),
            "image_similarity": round(text_score * 0.95, 3),
            "criteria": criteria
        }

    def evaluate_matches_for_lost(self, lost_report_id: str, min_score: float = 60.0) -> List[ItemMatch]:
        lost = self.repo.get_lost_report(lost_report_id)
        if not lost:
            return []

        open_founds = self.repo.list_found_reports(limit=30)
        created_matches = []
        for found in open_founds:
            sim = self.compute_similarity(lost, found)
            if sim["combined_score"] >= min_score:
                status = "HANDOVER_READY" if sim["combined_score"] >= 85 else "CANDIDATE"
                match = self.repo.upsert_match(
                    lost_report_id=lost.id,
                    found_report_id=found.id,
                    combined_score=sim["combined_score"],
                    text_similarity=sim["text_similarity"],
                    image_similarity=sim["image_similarity"],
                    criteria=sim["criteria"],
                    status=status
                )
                created_matches.append(match)

        return created_matches

    def evaluate_matches_for_found(self, found_report_id: str, min_score: float = 60.0) -> List[ItemMatch]:
        found = self.repo.get_found_report(found_report_id)
        if not found:
            return []

        open_losts = self.repo.list_lost_reports(status="OPEN", limit=30)
        created_matches = []
        for lost in open_losts:
            sim = self.compute_similarity(lost, found)
            if sim["combined_score"] >= min_score:
                status = "HANDOVER_READY" if sim["combined_score"] >= 85 else "CANDIDATE"
                match = self.repo.upsert_match(
                    lost_report_id=lost.id,
                    found_report_id=found.id,
                    combined_score=sim["combined_score"],
                    text_similarity=sim["text_similarity"],
                    image_similarity=sim["image_similarity"],
                    criteria=sim["criteria"],
                    status=status
                )
                created_matches.append(match)

        return created_matches

    # =========================================================================
    # Double-Blind Verification & Handover Workflows
    # =========================================================================

    def record_verification(
        self,
        match_id: str,
        data: VerificationCreate,
        officer_id: Optional[str]
    ) -> MatchVerification:
        return self.repo.create_verification(
            match_id=match_id,
            challenge_question=data.challenge_question,
            owner_response=data.owner_response,
            officer_notes=data.officer_notes,
            concordance_score=data.concordance_score,
            verified_by=officer_id,
            status="VERIFIED" if (data.concordance_score or 0) >= 80 else "PENDING"
        )

    def process_claim(self, data: ClaimCreate, claimed_by: str) -> ItemClaim:
        return self.repo.create_claim(
            found_report_id=data.found_report_id,
            lost_report_id=data.lost_report_id,
            claimed_by=claimed_by,
            status="PENDING"
        )

    def complete_handover(self, data: HandoverCreate, officer_id: str) -> ItemHandover:
        claim = self.repo.get_claim(data.claim_id)
        if not claim:
            raise ValueError(f"Claim with ID '{data.claim_id}' not found.")

        receiver_id = data.received_by or claim.claimed_by
        return self.repo.create_handover(
            claim_id=claim.id,
            handed_over_by=officer_id,
            received_by=receiver_id,
            handover_location_id=data.handover_location_id
        )
