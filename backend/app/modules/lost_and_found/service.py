import datetime
import json
import logging
from typing import Any, Dict, List, Optional, Union
import numpy as np
from sqlalchemy.orm import Session

from app.infrastructure.embedding import embedding_adapter
from app.infrastructure.vector_search import vector_search_adapter
from app.modules.academic.models import MediaAttachment
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

logger = logging.getLogger("smart_campus.lost_found_service")


class LostAndFoundService:
    """
    Core business service coordinating lost/found reporting,
    Jina CLIP v2 multimodal embedding, Qdrant Cloud candidate triage,
    double-blind verification, claim conflict resolution, and custody handover.
    """
    def __init__(self, db: Session):
        self.db = db
        self.repo = LostAndFoundRepository(db)

    # =========================================================================
    # Report Submission & Indexing
    # =========================================================================

    def submit_lost_report(self, data: LostReportCreate, reporter_id: int) -> LostReport:
        # Resolve category
        cat = self.repo.get_category(data.category_id)
        if not cat:
            cat = self.repo.get_category_by_name(str(data.category_id))
        category_id = cat.id if cat else 1

        # Resolve location
        loc_id = None
        if data.last_seen_location_id:
            loc = self.repo.get_location(data.last_seen_location_id)
            if loc:
                loc_id = loc.id
        elif data.last_seen_location_name:
            loc = self.repo.get_or_create_location(data.last_seen_location_name)
            loc_id = loc.id

        report = self.repo.create_lost_report(
            reporter_id=reporter_id,
            category_id=category_id,
            last_seen_location_id=loc_id,
            title=data.title,
            brand_model=data.brand_model,
            description=data.description,
            lost_at=data.lost_at,
            status="OPEN"
        )

        # Attach media if provided
        media_urls = list(data.media_urls or [])
        if data.image_url and data.image_url not in media_urls:
            media_urls.append(data.image_url)

        for m_url in media_urls:
            self.repo.attach_media(
                media_url=m_url,
                lost_report_id=report.id
            )

        # Generate Jina CLIP v2 text embedding
        text_content = f"{data.title}. {data.brand_model or ''}. {data.description}"
        vector = embedding_adapter.get_text_vector(text_content)
        if vector is not None:
            vector_search_adapter.upsert_item(
                record_id=report.id,
                vector=vector,
                modality="text",
                payload={
                    "report_id": report.id,
                    "type": "lost",
                    "title": data.title,
                    "category_id": category_id,
                    "description": data.description,
                    "location_id": loc_id or "",
                    "created_at": datetime.datetime.utcnow().isoformat(),
                    "image_url": media_urls[0] if media_urls else "",
                }
            )

        # Automatic cross-modal triage against existing found items
        self.evaluate_matches_for_lost(report.id)
        return self.repo.get_lost_report(report.id) or report

    def submit_found_report(self, data: FoundReportCreate, reported_by: int) -> FoundReport:
        # Resolve category
        cat = self.repo.get_category(data.category_id)
        if not cat:
            cat = self.repo.get_category_by_name(str(data.category_id))
        category_id = cat.id if cat else 1

        # Resolve location
        loc_id = None
        if data.found_location_id:
            loc = self.repo.get_location(data.found_location_id)
            if loc:
                loc_id = loc.id
        elif data.found_location_name:
            loc = self.repo.get_or_create_location(data.found_location_name)
            loc_id = loc.id

        # Generate inventory tag if missing
        tag = data.inventory_tag
        if not tag:
            tag = f"LF-{datetime.datetime.utcnow().year}-{str(report_id_seq() if 'report_id_seq' in globals() else datetime.datetime.utcnow().strftime('%m%d%H%M'))}"

        report = self.repo.create_found_report(
            reported_by=reported_by,
            category_id=category_id,
            found_location_id=loc_id,
            title=data.title,
            description=data.description,
            custody_desk=data.custody_desk or "Admin Ground Floor Custody Desk",
            inventory_tag=tag,
            found_at=data.found_at,
            storage_status=data.storage_status or "IN_CUSTODY"
        )

        # Attach media if provided
        media_urls = list(data.media_urls or [])
        if data.image_url and data.image_url not in media_urls:
            media_urls.append(data.image_url)

        for m_url in media_urls:
            self.repo.attach_media(
                media_url=m_url,
                found_report_id=report.id
            )

        # Generate Jina CLIP v2 text embedding
        text_content = f"{data.title}. {data.description}"
        vector = embedding_adapter.get_text_vector(text_content)
        if vector is not None:
            vector_search_adapter.upsert_item(
                record_id=report.id,
                vector=vector,
                modality="text",
                payload={
                    "report_id": report.id,
                    "type": "found",
                    "title": data.title,
                    "category_id": category_id,
                    "description": data.description,
                    "location_id": loc_id or "",
                    "created_at": datetime.datetime.utcnow().isoformat(),
                    "image_url": media_urls[0] if media_urls else "",
                }
            )

        # Automatic cross-modal triage against existing lost items
        self.evaluate_matches_for_found(report.id)
        return self.repo.get_found_report(report.id) or report

    # =========================================================================
    # AI Candidate Matching Engine (Jina CLIP v2 + Qdrant)
    # =========================================================================

    def evaluate_matches_for_lost(self, lost_report_id: int, top_k: int = 5) -> List[ItemMatch]:
        lost = self.repo.get_lost_report(lost_report_id)
        if not lost:
            return []

        lost_text = f"{lost.title}. {lost.brand_model or ''}. {lost.description}"
        query_vector = embedding_adapter.get_text_vector(lost_text)
        if query_vector is None:
            return []

        # Find existing found reports
        candidate_found_reports = self.repo.list_found_reports()
        created_matches = []

        for found in candidate_found_reports:
            if found.storage_status == "HANDED_OVER":
                continue

            found_text = f"{found.title}. {found.description}"
            found_vec = embedding_adapter.get_text_vector(found_text)
            
            # Text similarity
            text_sim = float(embedding_adapter.service.compute_similarity(query_vector, found_vec)) if found_vec is not None else 0.5

            # Image similarity if available
            img_sim = None
            if lost.media and found.media:
                lost_img = lost.media[0].media_url
                found_img = found.media[0].media_url
                if lost_img and found_img:
                    v_img1 = embedding_adapter.get_image_vector(lost_img)
                    v_img2 = embedding_adapter.get_image_vector(found_img)
                    if v_img1 is not None and v_img2 is not None:
                        img_sim = float(embedding_adapter.service.compute_similarity(v_img1, v_img2))

            # Multi-signal combined scoring
            category_match = (lost.category_id == found.category_id)
            location_match = (lost.last_seen_location_id == found.found_location_id) and (lost.last_seen_location_id is not None)

            if img_sim is not None:
                base_score = 0.55 * text_sim + 0.45 * img_sim
            else:
                base_score = text_sim

            bonus = 0.0
            if category_match:
                bonus += 0.05
            if location_match:
                bonus += 0.05
            combined = min(1.0, base_score + bonus)

            # Record candidate if score meets threshold
            if combined >= 0.50:
                crit = {
                    "model": "jina-clip-v2",
                    "dimension": 1024,
                    "location_match": location_match,
                    "category_match": category_match,
                    "text_similarity": round(text_sim, 4),
                    "image_similarity": round(img_sim, 4) if img_sim is not None else None,
                }
                match = self.repo.create_or_update_match(
                    lost_report_id=lost.id,
                    found_report_id=found.id,
                    combined_score=round(combined, 4),
                    text_similarity=round(text_sim, 4),
                    image_similarity=round(img_sim, 4) if img_sim is not None else None,
                    criteria_json=json.dumps(crit),
                    status="CANDIDATE"
                )
                created_matches.append(match)

        return created_matches

    def evaluate_matches_for_found(self, found_report_id: int, top_k: int = 5) -> List[ItemMatch]:
        found = self.repo.get_found_report(found_report_id)
        if not found:
            return []

        lost_reports = self.repo.list_lost_reports(status="OPEN")
        created = []
        for lost in lost_reports:
            matches = self.evaluate_matches_for_lost(lost.id)
            created.extend([m for m in matches if m.found_report_id == found.id])
        return created

    # =========================================================================
    # Verification & Claims
    # =========================================================================

    def verify_match(
        self,
        match_id: int,
        data: VerificationCreate,
        verified_by: Optional[int] = None
    ) -> MatchVerification:
        v = self.repo.create_verification(
            match_id=match_id,
            challenge_question=data.challenge_question,
            owner_response=data.owner_response,
            officer_notes=data.officer_notes,
            concordance_score=data.concordance_score,
            verified_by=verified_by,
            status=data.status or "APPROVED"
        )
        if (data.concordance_score or 0) >= 80.0 or data.status == "APPROVED":
            self.repo.update_match_status(match_id, "VERIFIED")
        return v

    def submit_claim(self, data: ClaimCreate, claimed_by: int) -> ItemClaim:
        found = self.repo.get_found_report(data.found_report_id)
        if not found:
            raise ValueError("Found report does not exist.")
        if found.storage_status == "HANDED_OVER":
            raise ValueError("This item has already been returned and handed over.")

        claim = self.repo.create_claim(
            found_report_id=int(data.found_report_id),
            lost_report_id=int(data.lost_report_id) if data.lost_report_id else None,
            claimed_by=claimed_by,
            status="PENDING"
        )
        return claim

    def review_claim(
        self,
        claim_id: int,
        status: str,
        reviewed_by: Optional[int] = None
    ) -> ItemClaim:
        claim = self.repo.get_claim(claim_id)
        if not claim:
            raise ValueError("Claim record not found.")

        updated_claim = self.repo.update_claim(
            claim_id=claim_id,
            status=status,
            reviewed_by=reviewed_by
        )

        if status == "APPROVED":
            # 1. Reject conflicting pending claims on the same found item
            self.repo.cancel_conflicting_pending_claims(
                found_report_id=claim.found_report_id,
                approved_claim_id=claim.id
            )
            # 2. Update found report storage status
            self.repo.update_found_report(
                report_id=claim.found_report_id,
                storage_status="LOCKED"
            )
            # 3. If linked lost report, update its status
            if claim.lost_report_id:
                self.repo.update_lost_report(
                    report_id=claim.lost_report_id,
                    status="RESOLVED"
                )

        return updated_claim

    # =========================================================================
    # Physical Custody Handover
    # =========================================================================

    def execute_handover(
        self,
        data: HandoverCreate,
        handed_over_by: int
    ) -> ItemHandover:
        claim = self.repo.get_claim(data.claim_id)
        if not claim:
            raise ValueError("Claim record not found.")

        # Business Rule: Handover can only proceed after claim is APPROVED
        if claim.status != "APPROVED":
            raise ValueError(f"Cannot execute handover: Claim #{claim.id} is '{claim.status}', must be 'APPROVED' first.")

        receiver_id = int(data.received_by) if data.received_by else claim.claimed_by
        loc_id = int(data.handover_location_id) if data.handover_location_id else None

        handover = self.repo.create_handover(
            claim_id=claim.id,
            handed_over_by=handed_over_by,
            received_by=receiver_id,
            handover_location_id=loc_id,
        )

        # Transition found report custody status to HANDED_OVER
        self.repo.update_found_report(
            report_id=claim.found_report_id,
            storage_status="HANDED_OVER"
        )

        # Transition lost report to RESOLVED
        if claim.lost_report_id:
            self.repo.update_lost_report(
                report_id=claim.lost_report_id,
                status="RESOLVED"
            )

        return handover
