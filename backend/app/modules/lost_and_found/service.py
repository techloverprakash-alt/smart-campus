import datetime
import json
import logging
import re
from typing import Any, Dict, List, Optional, Union
import numpy as np
from sqlalchemy.orm import Session

from app.infrastructure.embedding import embedding_adapter
from app.infrastructure.vector_search import vector_search_adapter
from app.modules.academic.models import MediaAttachment
from app.modules.auth.models import User
from app.modules.notifications.models import Notification
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
    FoundRequestCreate,
    HandoverCreate,
    LostReportCreate,
    MoveToVerificationRequest,
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
        cat = None
        if data.category_id:
            cat = self.repo.get_category(data.category_id)
            if not cat:
                cat = self.repo.get_category_by_name(str(data.category_id))
            if not cat:
                cat = self.repo.get_or_create_category(str(data.category_id))
        if not cat:
            cat = self.db.query(ItemCategory).first()
        category_id = cat.id if cat else 1

        # Resolve location
        loc_id = None
        if data.last_seen_location_id:
            loc = self.repo.get_location(data.last_seen_location_id)
            if loc:
                loc_id = loc.id
        elif data.last_seen_location_name:
            loc = self.repo.get_or_create_location(data.last_seen_location_name)
            if loc:
                loc_id = loc.id

        report = self.repo.create_lost_report(
            reporter_id=reporter_id,
            category_id=category_id,
            last_seen_location_id=loc_id,
            title=data.title,
            brand_model=data.brand_model,
            description=data.description or f"Reported lost item: {data.title}",
            lost_at=data.lost_at,
            status="OPEN"
        )

        # Attach media if provided
        media_urls = list(data.media_urls or [])
        if data.image_url and data.image_url not in media_urls:
            media_urls.append(data.image_url)

        for m_url in media_urls:
            try:
                self.repo.attach_media(
                    media_url=m_url,
                    lost_report_id=report.id
                )
            except Exception as e:
                logger.warning(f"Could not attach media to lost report: {e}")

        # Generate Jina CLIP v2 text embedding
        try:
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
        except Exception as e:
            logger.warning(f"Vector search upsert skipped: {e}")

        # Automatic cross-modal triage against existing found items
        try:
            self.evaluate_matches_for_lost(report.id)
        except Exception as e:
            logger.warning(f"Triage evaluation skipped: {e}")

        # Broadcast alert to all active campus users so everyone is informed about the lost item
        try:
            active_users = self.db.query(User).filter(User.is_active == True).all()
            reporter_user = self.db.query(User).filter(User.id == reporter_id).first()
            rep_name = reporter_user.full_name if reporter_user else "A campus community member"
            loc_name = report.last_seen_location.name if report.last_seen_location else "campus grounds"

            for u in active_users:
                if u.id == reporter_id:
                    continue
                notif = Notification(
                    user_id=u.id,
                    title=f"Campus Lost Alert: {report.title}",
                    message=f"{rep_name} reported a lost {report.title} near {loc_name}. If you spot or discover this item, please touch 'I Found This' to help return it.",
                    notification_type="CAMPUS_LOST_ALERT",
                    is_read=False
                )
                self.db.add(notif)
            self.db.commit()
        except Exception as e:
            logger.warning(f"Could not broadcast lost item alert to users: {e}")

        return self.repo.get_lost_report(report.id) or report

    def submit_found_report(self, data: FoundReportCreate, reported_by: int) -> FoundReport:
        # Resolve category
        cat = None
        if data.category_id:
            cat = self.repo.get_category(data.category_id)
            if not cat:
                cat = self.repo.get_category_by_name(str(data.category_id))
            if not cat:
                cat = self.repo.get_or_create_category(str(data.category_id))
        if not cat:
            cat = self.db.query(ItemCategory).first()
        category_id = cat.id if cat else 1

        # Resolve location
        loc_id = None
        if data.found_location_id:
            loc = self.repo.get_location(data.found_location_id)
            if loc:
                loc_id = loc.id
        elif data.found_location_name:
            loc = self.repo.get_or_create_location(data.found_location_name)
            if loc:
                loc_id = loc.id

        # Generate inventory tag if missing
        tag = data.inventory_tag
        if not tag:
            tag = f"LF-{datetime.datetime.utcnow().year}-{datetime.datetime.utcnow().strftime('%m%d%H%M%S')}"

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
    # Peer Discovery Found Request & Human Verification Flow
    # =========================================================================

    def submit_found_request(self, lost_report_id: int, data: FoundRequestCreate, finder_id: int) -> ItemMatch:
        """
        Flow Step: A finder discovers or recognizes a reported lost item,
        touches 'I Found This!', and dispatches a verified found request to the owner.
        """
        lost = self.repo.get_lost_report(lost_report_id)
        if not lost:
            raise ValueError("Lost report not found.")

        # 1. Create a found report representing the finder's discovery
        loc_id = None
        if data.found_location_id:
            loc = self.repo.get_location(data.found_location_id)
            if loc:
                loc_id = loc.id
        elif data.found_location_name:
            loc = self.repo.get_or_create_location(data.found_location_name)
            loc_id = loc.id
        else:
            loc_id = lost.last_seen_location_id

        tag = f"LF-{datetime.datetime.utcnow().year}-FND{datetime.datetime.utcnow().strftime('%m%d%H%M%S')}"

        found = self.repo.create_found_report(
            reported_by=finder_id,
            category_id=lost.category_id,
            found_location_id=loc_id,
            title=data.title or f"Found: {lost.title}",
            description=data.description,
            custody_desk=data.custody_desk or "Admin Ground Floor Custody Desk",
            inventory_tag=tag,
            found_at=datetime.datetime.utcnow(),
            storage_status="INTAKE_PENDING"
        )

        if data.image_url:
            self.repo.attach_media(media_url=data.image_url, found_report_id=found.id)

        # 2. Compute similarity score
        text_lost = f"{lost.title}. {lost.brand_model or ''}. {lost.description}"
        text_found = f"{found.title}. {found.description}"
        v1 = embedding_adapter.get_text_vector(text_lost)
        v2 = embedding_adapter.get_text_vector(text_found)
        sim = float(embedding_adapter.service.compute_similarity(v1, v2)) if (v1 is not None and v2 is not None) else 0.88
        combined = max(0.88, sim)

        finder_user = self.db.query(User).filter(User.id == finder_id).first()
        finder_name = finder_user.full_name if finder_user else "Peer Finder"

        crit = {
            "model": "jina-clip-v2",
            "source": "peer_found_request",
            "finder_id": finder_id,
            "finder_name": finder_name,
            "finder_notes": data.finder_notes or data.description,
            "custody_desk": data.custody_desk or "Admin Ground Floor Custody Desk"
        }

        # 3. Create or update the Match with status 'FOUND_REQUEST'
        match = self.repo.create_or_update_match(
            lost_report_id=lost.id,
            found_report_id=found.id,
            combined_score=round(combined, 4),
            text_similarity=round(sim, 4),
            criteria_json=json.dumps(crit),
            status="FOUND_REQUEST"
        )

        # 4. Update lost report status to indicate a found request was received
        self.repo.update_lost_report(lost.id, status="MATCHED")

        # 5. Dispatch notification to the lost report owner
        try:
            notif = Notification(
                user_id=lost.reporter_id,
                title=f"Discovery Alert: Found Request for '{lost.title}'",
                message=f"{finder_name} reported finding your item at {data.found_location_name or 'campus'}. Review details and click 'Move to Human Verification' to begin custody release.",
                notification_type="LOST_AND_FOUND",
                is_read=False
            )
            self.db.add(notif)
            self.db.commit()
        except Exception as e:
            logger.warning(f"Could not log notification: {e}")

        return self.repo.get_match(match.id) or match

    def request_human_verification(
        self,
        match_id: int,
        data: MoveToVerificationRequest,
        user_id: int,
        is_admin: bool = False
    ) -> MatchVerification:
        """
        Flow Step: Lost user reviews incoming found request or match,
        and triggers the button to move to Human Verification.
        """
        match = self.repo.get_match(match_id)
        if not match:
            raise ValueError("Match record not found.")

        # Authorization: only the owner of the lost item or an admin can move to human verification
        if match.lost_report.reporter_id != user_id and not is_admin:
            raise ValueError("Only the reporter of the lost item can move this match to human verification.")

        # 1. Update Match status to 'HUMAN_VERIFICATION'
        match = self.repo.update_match_status(match_id, "HUMAN_VERIFICATION")

        # 2. Update Lost Report status to 'VERIFICATION_PENDING'
        self.repo.update_lost_report(match.lost_report_id, status="VERIFICATION_PENDING")

        # 3. Create or update MatchVerification record awaiting Admin / Custody Desk review
        challenge_q = data.challenge_question or "Confirm unique identifying marks, contents, or color shade."
        owner_resp = data.owner_response or (match.lost_report.description if match.lost_report else "")
        officer_notes = data.officer_notes or "Owner reviewed found request and initiated human verification."

        verification = self.repo.create_verification(
            match_id=match.id,
            challenge_question=challenge_q,
            owner_response=owner_resp,
            officer_notes=officer_notes,
            concordance_score=92.0,
            status="PENDING"
        )

        # 4. Notify admin / custody desk
        try:
            admin_user = self.db.query(User).filter(User.primary_role == "ADMIN").first()
            if admin_user:
                notif = Notification(
                    user_id=admin_user.id,
                    title=f"Human Verification Queue: Match #{match.id}",
                    message=f"Lost item '{match.lost_report.title}' moved to human verification by owner. Ready for physical challenge inspection and handover authorization.",
                    notification_type="LOST_AND_FOUND_ADMIN",
                    is_read=False
                )
                self.db.add(notif)
                self.db.commit()
        except Exception as e:
            logger.warning(f"Could not alert admin: {e}")

        return verification

    def search_similar_found_items(
        self,
        query: str,
        category_id: Optional[Union[int, str]] = None,
        location_id: Optional[Union[int, str]] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Flow Step: If a found item is already assigned/turned in before the lost item,
        the lost user's query or description is used to compute similarity scores against
        all candidate found items in custody.
        """
        clean_query = (query or "").strip()
        if not clean_query:
            return []

        # Generate text embedding for the search query
        query_vector = embedding_adapter.get_text_vector(clean_query)

        cat_id_int = None
        if category_id:
            try:
                cat_id_int = int(category_id)
            except ValueError:
                pass

        found_reports = self.repo.list_found_reports(category_id=cat_id_int)
        results = []

        for found in found_reports:
            if found.storage_status == "HANDED_OVER":
                continue

            found_text = f"{found.title}. {found.description}"
            found_vec = embedding_adapter.get_text_vector(found_text)

            # Calculate token overlap
            q_words = set(re.findall(r'\w+', clean_query.lower()))
            f_words = set(re.findall(r'\w+', found_text.lower()))
            token_sim = (len(q_words & f_words) / max(1, len(q_words))) if q_words else 0.0

            # Calculate vector cosine similarity if embeddings are active
            vec_sim = 0.0
            if query_vector is not None and found_vec is not None:
                vec_sim = float(embedding_adapter.service.compute_similarity(query_vector, found_vec))

            # Multi-signal textual concordance
            text_sim = max(vec_sim, token_sim)

            bonus = 0.0
            if cat_id_int and found.category_id == cat_id_int:
                bonus += 0.05
            if location_id:
                try:
                    if found.found_location_id == int(location_id):
                        bonus += 0.05
                except ValueError:
                    pass

            combined = min(1.0, text_sim + bonus)

            existing_match = self.db.query(ItemMatch).filter(
                ItemMatch.found_report_id == found.id
            ).order_by(ItemMatch.combined_score.desc()).first()

            results.append({
                "found_report": found,
                "similarity_score": round(combined, 4),
                "text_similarity": round(text_sim, 4),
                "image_similarity": None,
                "match_id": existing_match.id if existing_match else None
            })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]


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
