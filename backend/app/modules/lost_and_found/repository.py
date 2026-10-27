import datetime
import json
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.modules.core.models import Location, Media, User
from app.modules.lost_and_found.models import (
    FoundReport,
    ItemCategory,
    ItemClaim,
    ItemHandover,
    ItemMatch,
    LostReport,
    MatchVerification,
    ReportMedia,
)


class LostAndFoundRepository:
    """
    SQLAlchemy repository encapsulating all database interactions for the 8 Lost and Found tables.
    """
    def __init__(self, db: Session):
        self.db = db

    # =========================================================================
    # Categories & Locations
    # =========================================================================

    def get_category(self, category_id: str) -> Optional[ItemCategory]:
        return self.db.query(ItemCategory).filter(ItemCategory.id == category_id).first()

    def get_category_by_name(self, name: str) -> Optional[ItemCategory]:
        return self.db.query(ItemCategory).filter(ItemCategory.name.ilike(name.strip())).first()

    def list_categories(self) -> List[ItemCategory]:
        return self.db.query(ItemCategory).order_by(ItemCategory.name.asc()).all()

    def create_category(self, name: str, description: Optional[str] = None) -> ItemCategory:
        cat = ItemCategory(name=name.strip(), description=description)
        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return cat

    def get_or_create_location(self, name: str, zone: Optional[str] = None) -> Location:
        clean_name = name.strip()
        loc = self.db.query(Location).filter(Location.name.ilike(clean_name)).first()
        if not loc:
            loc = Location(name=clean_name, zone=zone or clean_name)
            self.db.add(loc)
            self.db.commit()
            self.db.refresh(loc)
        return loc

    def get_location(self, location_id: str) -> Optional[Location]:
        return self.db.query(Location).filter(Location.id == location_id).first()

    def list_locations(self) -> List[Location]:
        return self.db.query(Location).order_by(Location.name.asc()).all()

    # =========================================================================
    # Lost Reports (Table 35)
    # =========================================================================

    def create_lost_report(
        self,
        reporter_id: str,
        category_id: str,
        title: str,
        description: str,
        last_seen_location_id: Optional[str] = None,
        brand_model: Optional[str] = None,
        lost_at: Optional[datetime.datetime] = None,
        status: str = "OPEN"
    ) -> LostReport:
        report = LostReport(
            reporter_id=reporter_id,
            category_id=category_id,
            last_seen_location_id=last_seen_location_id,
            title=title,
            brand_model=brand_model,
            description=description,
            lost_at=lost_at or datetime.datetime.utcnow(),
            status=status
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_lost_report(self, report_id: str) -> Optional[LostReport]:
        return (
            self.db.query(LostReport)
            .options(
                joinedload(LostReport.reporter),
                joinedload(LostReport.category),
                joinedload(LostReport.last_seen_location),
                joinedload(LostReport.media).joinedload(ReportMedia.media_item)
            )
            .filter(LostReport.id == report_id)
            .first()
        )

    def list_lost_reports(
        self,
        category_id: Optional[str] = None,
        location_id: Optional[str] = None,
        status: Optional[str] = None,
        reporter_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[LostReport]:
        q = (
            self.db.query(LostReport)
            .options(
                joinedload(LostReport.reporter),
                joinedload(LostReport.category),
                joinedload(LostReport.last_seen_location),
                joinedload(LostReport.media).joinedload(ReportMedia.media_item)
            )
        )
        if category_id:
            q = q.filter(LostReport.category_id == category_id)
        if location_id:
            q = q.filter(LostReport.last_seen_location_id == location_id)
        if status:
            q = q.filter(LostReport.status == status)
        if reporter_id:
            q = q.filter(LostReport.reporter_id == reporter_id)
        if search:
            s = f"%{search.strip()}%"
            q = q.filter(or_(LostReport.title.ilike(s), LostReport.description.ilike(s), LostReport.brand_model.ilike(s)))
        return q.order_by(LostReport.created_at.desc()).offset(offset).limit(limit).all()

    def update_lost_report(self, report_id: str, updates: Dict[str, Any]) -> Optional[LostReport]:
        report = self.get_lost_report(report_id)
        if not report:
            return None
        for k, v in updates.items():
            if hasattr(report, k) and v is not None:
                setattr(report, k, v)
        report.updated_at = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(report)
        return report

    def delete_lost_report(self, report_id: str) -> bool:
        report = self.get_lost_report(report_id)
        if not report:
            return False
        self.db.delete(report)
        self.db.commit()
        return True

    # =========================================================================
    # Found Reports (Table 36)
    # =========================================================================

    def create_found_report(
        self,
        reported_by: str,
        category_id: str,
        title: str,
        description: str,
        custody_desk: str,
        inventory_tag: str,
        found_location_id: Optional[str] = None,
        found_at: Optional[datetime.datetime] = None,
        storage_status: str = "INTAKE_PENDING"
    ) -> FoundReport:
        report = FoundReport(
            reported_by=reported_by,
            category_id=category_id,
            found_location_id=found_location_id,
            title=title,
            description=description,
            custody_desk=custody_desk,
            inventory_tag=inventory_tag,
            found_at=found_at or datetime.datetime.utcnow(),
            storage_status=storage_status
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_found_report(self, report_id: str) -> Optional[FoundReport]:
        return (
            self.db.query(FoundReport)
            .options(
                joinedload(FoundReport.finder),
                joinedload(FoundReport.category),
                joinedload(FoundReport.found_location),
                joinedload(FoundReport.media).joinedload(ReportMedia.media_item)
            )
            .filter(FoundReport.id == report_id)
            .first()
        )

    def get_found_by_tag(self, inventory_tag: str) -> Optional[FoundReport]:
        return self.db.query(FoundReport).filter(FoundReport.inventory_tag == inventory_tag).first()

    def list_found_reports(
        self,
        category_id: Optional[str] = None,
        location_id: Optional[str] = None,
        storage_status: Optional[str] = None,
        reported_by: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[FoundReport]:
        q = (
            self.db.query(FoundReport)
            .options(
                joinedload(FoundReport.finder),
                joinedload(FoundReport.category),
                joinedload(FoundReport.found_location),
                joinedload(FoundReport.media).joinedload(ReportMedia.media_item)
            )
        )
        if category_id:
            q = q.filter(FoundReport.category_id == category_id)
        if location_id:
            q = q.filter(FoundReport.found_location_id == location_id)
        if storage_status:
            q = q.filter(FoundReport.storage_status == storage_status)
        if reported_by:
            q = q.filter(FoundReport.reported_by == reported_by)
        if search:
            s = f"%{search.strip()}%"
            q = q.filter(or_(FoundReport.title.ilike(s), FoundReport.description.ilike(s), FoundReport.inventory_tag.ilike(s)))
        return q.order_by(FoundReport.created_at.desc()).offset(offset).limit(limit).all()

    def update_found_report(self, report_id: str, updates: Dict[str, Any]) -> Optional[FoundReport]:
        report = self.get_found_report(report_id)
        if not report:
            return None
        for k, v in updates.items():
            if hasattr(report, k) and v is not None:
                setattr(report, k, v)
        report.updated_at = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(report)
        return report

    # =========================================================================
    # Media Attachments (Table 37)
    # =========================================================================

    def attach_media(
        self,
        media_url: str,
        file_path: Optional[str] = None,
        lost_report_id: Optional[str] = None,
        found_report_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> ReportMedia:
        media_rec = Media(
            file_name=media_url.split("/")[-1],
            file_path=file_path or media_url,
            file_url=media_url,
            uploaded_by=user_id
        )
        self.db.add(media_rec)
        self.db.flush()

        rep_media = ReportMedia(
            lost_report_id=lost_report_id,
            found_report_id=found_report_id,
            media_id=media_rec.id,
            media_url=media_url
        )
        self.db.add(rep_media)
        self.db.commit()
        self.db.refresh(rep_media)
        return rep_media

    # =========================================================================
    # Item Matches (Table 38)
    # =========================================================================

    def upsert_match(
        self,
        lost_report_id: str,
        found_report_id: str,
        combined_score: float,
        text_similarity: Optional[float] = None,
        image_similarity: Optional[float] = None,
        criteria: Optional[List[Dict[str, Any]]] = None,
        status: str = "CANDIDATE"
    ) -> ItemMatch:
        match = (
            self.db.query(ItemMatch)
            .filter(
                ItemMatch.lost_report_id == lost_report_id,
                ItemMatch.found_report_id == found_report_id
            )
            .first()
        )
        crit_str = json.dumps(criteria or [])
        if match:
            match.combined_score = combined_score
            match.text_similarity = text_similarity
            match.image_similarity = image_similarity
            match.criteria_json = crit_str
            match.status = status
        else:
            match = ItemMatch(
                lost_report_id=lost_report_id,
                found_report_id=found_report_id,
                combined_score=combined_score,
                text_similarity=text_similarity,
                image_similarity=image_similarity,
                criteria_json=crit_str,
                status=status
            )
            self.db.add(match)
        self.db.commit()
        self.db.refresh(match)
        return match

    def get_match(self, match_id: str) -> Optional[ItemMatch]:
        return (
            self.db.query(ItemMatch)
            .options(
                joinedload(ItemMatch.lost_report),
                joinedload(ItemMatch.found_report),
                joinedload(ItemMatch.verifications)
            )
            .filter(ItemMatch.id == match_id)
            .first()
        )

    def list_matches(
        self,
        lost_report_id: Optional[str] = None,
        found_report_id: Optional[str] = None,
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[ItemMatch]:
        q = (
            self.db.query(ItemMatch)
            .options(
                joinedload(ItemMatch.lost_report),
                joinedload(ItemMatch.found_report),
                joinedload(ItemMatch.verifications)
            )
        )
        if lost_report_id:
            q = q.filter(ItemMatch.lost_report_id == lost_report_id)
        if found_report_id:
            q = q.filter(ItemMatch.found_report_id == found_report_id)
        if user_id:
            q = q.join(LostReport, ItemMatch.lost_report_id == LostReport.id).join(FoundReport, ItemMatch.found_report_id == FoundReport.id)
            q = q.filter(or_(LostReport.reporter_id == user_id, FoundReport.reported_by == user_id))
        if status:
            q = q.filter(ItemMatch.status == status)
        return q.order_by(ItemMatch.combined_score.desc()).limit(limit).all()

    # =========================================================================
    # Match Verifications (Table 39)
    # =========================================================================

    def create_verification(
        self,
        match_id: str,
        challenge_question: str,
        owner_response: Optional[str] = None,
        officer_notes: Optional[str] = None,
        concordance_score: Optional[float] = 100.0,
        verified_by: Optional[str] = None,
        status: str = "VERIFIED"
    ) -> MatchVerification:
        ver = MatchVerification(
            match_id=match_id,
            challenge_question=challenge_question,
            owner_response=owner_response,
            officer_notes=officer_notes,
            concordance_score=concordance_score,
            verified_by=verified_by,
            status=status
        )
        self.db.add(ver)
        # Update match status to HANDOVER_READY if verified
        if status == "VERIFIED":
            match = self.get_match(match_id)
            if match:
                match.status = "HANDOVER_READY"
        self.db.commit()
        self.db.refresh(ver)
        return ver

    # =========================================================================
    # Item Claims (Table 40)
    # =========================================================================

    def create_claim(
        self,
        found_report_id: str,
        claimed_by: str,
        lost_report_id: Optional[str] = None,
        status: str = "PENDING"
    ) -> ItemClaim:
        claim = ItemClaim(
            found_report_id=found_report_id,
            lost_report_id=lost_report_id,
            claimed_by=claimed_by,
            status=status
        )
        self.db.add(claim)
        self.db.commit()
        self.db.refresh(claim)
        return claim

    def get_claim(self, claim_id: str) -> Optional[ItemClaim]:
        return (
            self.db.query(ItemClaim)
            .options(
                joinedload(ItemClaim.claimant),
                joinedload(ItemClaim.found_report),
                joinedload(ItemClaim.lost_report),
                joinedload(ItemClaim.handover)
            )
            .filter(ItemClaim.id == claim_id)
            .first()
        )

    def list_claims(
        self,
        found_report_id: Optional[str] = None,
        claimed_by: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[ItemClaim]:
        q = (
            self.db.query(ItemClaim)
            .options(
                joinedload(ItemClaim.claimant),
                joinedload(ItemClaim.found_report),
                joinedload(ItemClaim.lost_report)
            )
        )
        if found_report_id:
            q = q.filter(ItemClaim.found_report_id == found_report_id)
        if claimed_by:
            q = q.filter(ItemClaim.claimed_by == claimed_by)
        if status:
            q = q.filter(ItemClaim.status == status)
        return q.order_by(ItemClaim.created_at.desc()).all()

    def review_claim(self, claim_id: str, new_status: str, reviewer_id: str) -> Optional[ItemClaim]:
        claim = self.get_claim(claim_id)
        if not claim:
            return None
        claim.status = new_status
        claim.reviewed_by = reviewer_id
        claim.updated_at = datetime.datetime.utcnow()
        if new_status == "APPROVED":
            # Update associated reports to CLAIMED
            if claim.found_report:
                claim.found_report.storage_status = "LOCKED"
            if claim.lost_report:
                claim.lost_report.status = "CLAIMED"
        self.db.commit()
        self.db.refresh(claim)
        return claim

    # =========================================================================
    # Item Handovers (Table 41)
    # =========================================================================

    def create_handover(
        self,
        claim_id: str,
        received_by: str,
        handed_over_by: Optional[str] = None,
        handover_location_id: Optional[str] = None,
        pickup_pass_tag: Optional[str] = None
    ) -> ItemHandover:
        handover = ItemHandover(
            claim_id=claim_id,
            handed_over_by=handed_over_by,
            received_by=received_by,
            handover_location_id=handover_location_id,
            pickup_pass_tag=pickup_pass_tag or f"#DISC-{uuid.uuid4().hex[:4].upper()}"
        )
        self.db.add(handover)
        # Update claim and reports status to RELEASED/CLOSED
        claim = self.get_claim(claim_id)
        if claim:
            claim.status = "APPROVED"
            if claim.found_report:
                claim.found_report.storage_status = "RELEASED"
            if claim.lost_report:
                claim.lost_report.status = "CLOSED"
        self.db.commit()
        self.db.refresh(handover)
        return handover

    def get_handover(self, handover_id: str) -> Optional[ItemHandover]:
        return (
            self.db.query(ItemHandover)
            .options(
                joinedload(ItemHandover.claim),
                joinedload(ItemHandover.officer),
                joinedload(ItemHandover.receiver),
                joinedload(ItemHandover.location)
            )
            .filter(ItemHandover.id == handover_id)
            .first()
        )
