import datetime
import json
from typing import Any, Dict, List, Optional, Union
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.modules.academic.models import CampusLocation, MediaAttachment
from app.modules.auth.models import User
from app.modules.lost_and_found.models import (
    FoundReport,
    ItemCategory,
    ItemClaim,
    ItemEmbedding,
    ItemHandover,
    ItemMatch,
    LostReport,
    MatchVerification,
    ReportMedia,
)


class LostAndFoundRepository:
    """
    SQLAlchemy repository encapsulating data access for Tables 34 through 41.
    """
    def __init__(self, db: Session):
        self.db = db

    # =========================================================================
    # Categories & Locations
    # =========================================================================

    def get_category(self, category_id: Union[int, str]) -> Optional[ItemCategory]:
        try:
            cid = int(category_id)
            return self.db.query(ItemCategory).filter(ItemCategory.id == cid).first()
        except (ValueError, TypeError):
            return self.db.query(ItemCategory).filter(ItemCategory.name == str(category_id)).first()

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

    def get_or_create_category(self, name: str, description: Optional[str] = None) -> ItemCategory:
        clean_name = name.strip()
        cat = self.db.query(ItemCategory).filter(ItemCategory.name.ilike(clean_name)).first()
        if not cat:
            cat = ItemCategory(name=clean_name, description=description or f"Items categorized under {clean_name}")
            self.db.add(cat)
            self.db.commit()
            self.db.refresh(cat)
        return cat

    def list_locations(self) -> List[CampusLocation]:
        return self.db.query(CampusLocation).order_by(CampusLocation.name.asc()).all()

    def get_location(self, location_id: Union[int, str]) -> Optional[CampusLocation]:
        try:
            lid = int(location_id)
            return self.db.query(CampusLocation).filter(CampusLocation.id == lid).first()
        except (ValueError, TypeError):
            return self.db.query(CampusLocation).filter(CampusLocation.name == str(location_id)).first()

    def get_or_create_location(self, name: str, location_type: Optional[str] = None) -> CampusLocation:
        clean_name = name.strip()
        loc = self.db.query(CampusLocation).filter(CampusLocation.name.ilike(clean_name)).first()
        if not loc:
            loc = CampusLocation(name=clean_name, location_type=location_type or "OTHER")
            self.db.add(loc)
            self.db.commit()
            self.db.refresh(loc)
        return loc

    # =========================================================================
    # Lost Reports (Table 35)
    # =========================================================================

    def create_lost_report(
        self,
        reporter_id: int,
        category_id: int,
        title: str,
        description: str,
        last_seen_location_id: Optional[int] = None,
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

    def get_lost_report(self, report_id: Union[int, str]) -> Optional[LostReport]:
        try:
            rid = int(report_id)
        except (ValueError, TypeError):
            return None
        return (
            self.db.query(LostReport)
            .options(
                joinedload(LostReport.reporter),
                joinedload(LostReport.category),
                joinedload(LostReport.last_seen_location),
                joinedload(LostReport.media),
            )
            .filter(LostReport.id == rid)
            .first()
        )

    def list_lost_reports(
        self,
        reporter_id: Optional[Union[int, str]] = None,
        category_id: Optional[Union[int, str]] = None,
        location_id: Optional[Union[int, str]] = None,
        status: Optional[str] = None,
        search_query: Optional[str] = None,
    ) -> List[LostReport]:
        query = (
            self.db.query(LostReport)
            .options(
                joinedload(LostReport.reporter),
                joinedload(LostReport.category),
                joinedload(LostReport.last_seen_location),
                joinedload(LostReport.media),
            )
        )

        if reporter_id is not None:
            try:
                rid = int(reporter_id)
                query = query.filter(LostReport.reporter_id == rid)
            except ValueError:
                pass
        if category_id is not None:
            try:
                cid = int(category_id)
                query = query.filter(LostReport.category_id == cid)
            except ValueError:
                pass
        if location_id is not None:
            try:
                lid = int(location_id)
                query = query.filter(LostReport.last_seen_location_id == lid)
            except ValueError:
                pass
        if status:
            query = query.filter(LostReport.status.ilike(status))
        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.filter(or_(LostReport.title.ilike(term), LostReport.description.ilike(term)))

        return query.order_by(LostReport.created_at.desc()).all()

    def update_lost_report(self, report_id: Union[int, str], **kwargs) -> Optional[LostReport]:
        report = self.get_lost_report(report_id)
        if not report:
            return None
        for k, v in kwargs.items():
            if hasattr(report, k) and v is not None:
                setattr(report, k, v)
        report.updated_at = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(report)
        return report

    def delete_lost_report(self, report_id: Union[int, str]) -> bool:
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
        reported_by: int,
        category_id: int,
        title: str,
        description: str,
        custody_desk: str,
        inventory_tag: str,
        found_location_id: Optional[int] = None,
        found_at: Optional[datetime.datetime] = None,
        storage_status: str = "IN_CUSTODY"
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

    def get_found_report(self, report_id: Union[int, str]) -> Optional[FoundReport]:
        try:
            rid = int(report_id)
        except (ValueError, TypeError):
            return None
        return (
            self.db.query(FoundReport)
            .options(
                joinedload(FoundReport.finder),
                joinedload(FoundReport.category),
                joinedload(FoundReport.found_location),
                joinedload(FoundReport.media),
            )
            .filter(FoundReport.id == rid)
            .first()
        )

    def list_found_reports(
        self,
        reported_by: Optional[Union[int, str]] = None,
        category_id: Optional[Union[int, str]] = None,
        location_id: Optional[Union[int, str]] = None,
        storage_status: Optional[str] = None,
        search_query: Optional[str] = None,
    ) -> List[FoundReport]:
        query = (
            self.db.query(FoundReport)
            .options(
                joinedload(FoundReport.finder),
                joinedload(FoundReport.category),
                joinedload(FoundReport.found_location),
                joinedload(FoundReport.media),
            )
        )

        if reported_by is not None:
            try:
                rb = int(reported_by)
                query = query.filter(FoundReport.reported_by == rb)
            except ValueError:
                pass
        if category_id is not None:
            try:
                cid = int(category_id)
                query = query.filter(FoundReport.category_id == cid)
            except ValueError:
                pass
        if location_id is not None:
            try:
                lid = int(location_id)
                query = query.filter(FoundReport.found_location_id == lid)
            except ValueError:
                pass
        if storage_status:
            query = query.filter(FoundReport.storage_status.ilike(storage_status))
        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.filter(or_(FoundReport.title.ilike(term), FoundReport.description.ilike(term)))

        return query.order_by(FoundReport.created_at.desc()).all()

    def update_found_report(self, report_id: Union[int, str], **kwargs) -> Optional[FoundReport]:
        report = self.get_found_report(report_id)
        if not report:
            return None
        for k, v in kwargs.items():
            if hasattr(report, k) and v is not None:
                setattr(report, k, v)
        report.updated_at = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(report)
        return report

    # =========================================================================
    # Report Media (Table 37)
    # =========================================================================

    def attach_media(
        self,
        media_url: str,
        lost_report_id: Optional[int] = None,
        found_report_id: Optional[int] = None,
        media_id: Optional[int] = None,
    ) -> ReportMedia:
        rm = ReportMedia(
            lost_report_id=lost_report_id,
            found_report_id=found_report_id,
            media_id=media_id,
            media_url=media_url
        )
        self.db.add(rm)
        self.db.commit()
        self.db.refresh(rm)
        return rm

    # =========================================================================
    # Item Matches (Table 38)
    # =========================================================================

    def create_or_update_match(
        self,
        lost_report_id: int,
        found_report_id: int,
        combined_score: float,
        text_similarity: Optional[float] = None,
        image_similarity: Optional[float] = None,
        criteria_json: Optional[str] = None,
        status: str = "CANDIDATE"
    ) -> ItemMatch:
        match = self.db.query(ItemMatch).filter(
            ItemMatch.lost_report_id == lost_report_id,
            ItemMatch.found_report_id == found_report_id
        ).first()

        if match:
            match.combined_score = combined_score
            match.text_similarity = text_similarity
            match.image_similarity = image_similarity
            if criteria_json:
                match.criteria_json = criteria_json
            match.status = status
        else:
            match = ItemMatch(
                lost_report_id=lost_report_id,
                found_report_id=found_report_id,
                text_similarity=text_similarity,
                image_similarity=image_similarity,
                combined_score=combined_score,
                criteria_json=criteria_json,
                status=status
            )
            self.db.add(match)

        self.db.commit()
        self.db.refresh(match)
        return match

    def get_match(self, match_id: Union[int, str]) -> Optional[ItemMatch]:
        try:
            mid = int(match_id)
        except (ValueError, TypeError):
            return None
        return (
            self.db.query(ItemMatch)
            .options(
                joinedload(ItemMatch.lost_report).joinedload(LostReport.reporter),
                joinedload(ItemMatch.found_report).joinedload(FoundReport.finder),
                joinedload(ItemMatch.verifications),
            )
            .filter(ItemMatch.id == mid)
            .first()
        )

    def list_matches(
        self,
        lost_report_id: Optional[Union[int, str]] = None,
        found_report_id: Optional[Union[int, str]] = None,
        status: Optional[str] = None,
        user_id: Optional[Union[int, str]] = None
    ) -> List[ItemMatch]:
        query = (
            self.db.query(ItemMatch)
            .join(ItemMatch.lost_report)
            .join(ItemMatch.found_report)
            .options(
                joinedload(ItemMatch.lost_report).joinedload(LostReport.reporter),
                joinedload(ItemMatch.found_report).joinedload(FoundReport.finder),
                joinedload(ItemMatch.verifications),
            )
        )

        if lost_report_id is not None:
            try:
                l_id = int(lost_report_id)
                query = query.filter(ItemMatch.lost_report_id == l_id)
            except ValueError:
                pass
        if found_report_id is not None:
            try:
                f_id = int(found_report_id)
                query = query.filter(ItemMatch.found_report_id == f_id)
            except ValueError:
                pass
        if status:
            query = query.filter(ItemMatch.status.ilike(status))
        if user_id is not None:
            try:
                uid = int(user_id)
                query = query.filter(
                    or_(
                        LostReport.reporter_id == uid,
                        FoundReport.reported_by == uid
                    )
                )
            except ValueError:
                pass

        return query.order_by(ItemMatch.combined_score.desc()).all()

    def update_match_status(self, match_id: Union[int, str], status: str) -> Optional[ItemMatch]:
        match = self.get_match(match_id)
        if match:
            match.status = status
            self.db.commit()
            self.db.refresh(match)
        return match

    # =========================================================================
    # Match Verifications (Table 39)
    # =========================================================================

    def create_verification(
        self,
        match_id: int,
        challenge_question: str,
        owner_response: Optional[str] = None,
        officer_notes: Optional[str] = None,
        concordance_score: Optional[float] = None,
        verified_by: Optional[int] = None,
        status: str = "APPROVED"
    ) -> MatchVerification:
        v = MatchVerification(
            match_id=match_id,
            challenge_question=challenge_question,
            owner_response=owner_response,
            officer_notes=officer_notes,
            concordance_score=concordance_score,
            verified_by=verified_by,
            status=status
        )
        self.db.add(v)
        self.db.commit()
        self.db.refresh(v)
        return v

    def get_verification(self, verification_id: Union[int, str]) -> Optional[MatchVerification]:
        try:
            vid = int(verification_id)
        except (ValueError, TypeError):
            return None
        return (
            self.db.query(MatchVerification)
            .options(
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.reporter),
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.media),
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.category),
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.last_seen_location),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.finder),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.media),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.category),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.found_location),
                joinedload(MatchVerification.verifier),
            )
            .filter(MatchVerification.id == vid)
            .first()
        )

    def list_verifications(
        self,
        status: Optional[str] = None,
        match_id: Optional[Union[int, str]] = None
    ) -> List[MatchVerification]:
        query = (
            self.db.query(MatchVerification)
            .options(
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.reporter),
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.media),
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.category),
                joinedload(MatchVerification.match).joinedload(ItemMatch.lost_report).joinedload(LostReport.last_seen_location),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.finder),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.media),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.category),
                joinedload(MatchVerification.match).joinedload(ItemMatch.found_report).joinedload(FoundReport.found_location),
                joinedload(MatchVerification.verifier),
            )
        )
        if status:
            query = query.filter(MatchVerification.status.ilike(status.strip()))
        if match_id is not None:
            try:
                mid = int(match_id)
                query = query.filter(MatchVerification.match_id == mid)
            except (ValueError, TypeError):
                pass

        return query.order_by(MatchVerification.created_at.desc()).all()

    def update_verification(
        self,
        verification_id: Union[int, str],
        status: str,
        officer_notes: Optional[str] = None,
        concordance_score: Optional[float] = None,
        verified_by: Optional[int] = None
    ) -> Optional[MatchVerification]:
        v = self.get_verification(verification_id)
        if not v:
            return None
        v.status = status
        if officer_notes is not None:
            v.officer_notes = officer_notes
        if concordance_score is not None:
            v.concordance_score = concordance_score
        if verified_by is not None:
            v.verified_by = verified_by
        self.db.commit()
        self.db.refresh(v)
        return v

    # =========================================================================
    # Multimodal Item Embeddings (Table: item_embeddings & PostgreSQL pgvector)
    # =========================================================================

    def save_item_embedding(
        self,
        report_type: str,
        report_id: int,
        vector: List[float],
        modality: str = "text",
        model_name: str = "jina-clip-v2",
        qdrant_point_id: Optional[str] = None
    ) -> ItemEmbedding:
        """
        Dual-persists 1024-dimensional multimodal vector:
        1. Stores JSON representation directly on LostReport/FoundReport (embedding_json)
        2. Records structured row in item_embeddings table
        """
        clean_type = report_type.lower().strip()
        vec_json = json.dumps([round(float(x), 6) for x in vector])

        # 1. Update report column
        if clean_type == "lost":
            report = self.get_lost_report(report_id)
            if report:
                report.embedding_json = vec_json
        elif clean_type == "found":
            report = self.get_found_report(report_id)
            if report:
                report.embedding_json = vec_json

        # 2. Update or insert in item_embeddings table
        existing = (
            self.db.query(ItemEmbedding)
            .filter(
                ItemEmbedding.report_type == clean_type,
                (ItemEmbedding.lost_report_id == report_id) if clean_type == "lost" else (ItemEmbedding.found_report_id == report_id),
                ItemEmbedding.modality == modality
            )
            .first()
        )

        if existing:
            existing.vector_json = vec_json
            existing.vector_dim = len(vector)
            existing.model_name = model_name
            if qdrant_point_id:
                existing.qdrant_point_id = str(qdrant_point_id)
            self.db.commit()
            self.db.refresh(existing)
            return existing

        item_emb = ItemEmbedding(
            report_type=clean_type,
            lost_report_id=report_id if clean_type == "lost" else None,
            found_report_id=report_id if clean_type == "found" else None,
            modality=modality,
            model_name=model_name,
            vector_dim=len(vector),
            vector_json=vec_json,
            qdrant_point_id=str(qdrant_point_id) if qdrant_point_id else None
        )
        self.db.add(item_emb)
        self.db.commit()
        self.db.refresh(item_emb)
        return item_emb

    def get_item_embedding(
        self,
        report_type: str,
        report_id: int,
        modality: str = "text"
    ) -> Optional[List[float]]:
        clean_type = report_type.lower().strip()
        emb_record = (
            self.db.query(ItemEmbedding)
            .filter(
                ItemEmbedding.report_type == clean_type,
                (ItemEmbedding.lost_report_id == report_id) if clean_type == "lost" else (ItemEmbedding.found_report_id == report_id),
                ItemEmbedding.modality == modality
            )
            .first()
        )
        if emb_record and emb_record.vector_json:
            try:
                return json.loads(emb_record.vector_json)
            except Exception:
                pass

        # Fallback to column
        if clean_type == "lost":
            r = self.get_lost_report(report_id)
            if r and r.embedding_json:
                try:
                    return json.loads(r.embedding_json)
                except Exception:
                    pass
        elif clean_type == "found":
            fr = self.get_found_report(report_id)
            if fr and fr.embedding_json:
                try:
                    return json.loads(fr.embedding_json)
                except Exception:
                    pass
        return None

    # =========================================================================
    # Item Claims (Table 40)
    # =========================================================================

    def create_claim(
        self,
        found_report_id: int,
        claimed_by: int,
        lost_report_id: Optional[int] = None,
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

    def get_claim(self, claim_id: Union[int, str]) -> Optional[ItemClaim]:
        try:
            cid = int(claim_id)
        except (ValueError, TypeError):
            return None
        return (
            self.db.query(ItemClaim)
            .options(
                joinedload(ItemClaim.found_report),
                joinedload(ItemClaim.lost_report),
                joinedload(ItemClaim.claimant),
                joinedload(ItemClaim.reviewer),
                joinedload(ItemClaim.handover),
            )
            .filter(ItemClaim.id == cid)
            .first()
        )

    def list_claims(
        self,
        found_report_id: Optional[Union[int, str]] = None,
        claimed_by: Optional[Union[int, str]] = None,
        status: Optional[str] = None
    ) -> List[ItemClaim]:
        query = (
            self.db.query(ItemClaim)
            .options(
                joinedload(ItemClaim.found_report),
                joinedload(ItemClaim.lost_report),
                joinedload(ItemClaim.claimant),
                joinedload(ItemClaim.reviewer),
                joinedload(ItemClaim.handover),
            )
        )
        if found_report_id is not None:
            try:
                fid = int(found_report_id)
                query = query.filter(ItemClaim.found_report_id == fid)
            except ValueError:
                pass
        if claimed_by is not None:
            try:
                cb = int(claimed_by)
                query = query.filter(ItemClaim.claimed_by == cb)
            except ValueError:
                pass
        if status:
            query = query.filter(ItemClaim.status.ilike(status))

        return query.order_by(ItemClaim.created_at.desc()).all()

    def update_claim(
        self,
        claim_id: Union[int, str],
        status: str,
        reviewed_by: Optional[int] = None
    ) -> Optional[ItemClaim]:
        claim = self.get_claim(claim_id)
        if not claim:
            return None
        claim.status = status
        if reviewed_by:
            claim.reviewed_by = reviewed_by
        claim.updated_at = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(claim)
        return claim

    def cancel_conflicting_pending_claims(self, found_report_id: int, approved_claim_id: int):
        """When a claim is approved, any other pending claims on the same found item are rejected."""
        self.db.query(ItemClaim).filter(
            ItemClaim.found_report_id == found_report_id,
            ItemClaim.id != approved_claim_id,
            ItemClaim.status == "PENDING"
        ).update(
            {"status": "REJECTED", "updated_at": datetime.datetime.utcnow()},
            synchronize_session=False
        )
        self.db.commit()

    # =========================================================================
    # Item Handovers (Table 41)
    # =========================================================================

    def create_handover(
        self,
        claim_id: int,
        received_by: int,
        handed_over_by: Optional[int] = None,
        handover_location_id: Optional[int] = None,
        pickup_pass_tag: Optional[str] = None
    ) -> ItemHandover:
        handover = ItemHandover(
            claim_id=claim_id,
            handed_over_by=handed_over_by,
            received_by=received_by,
            handover_location_id=handover_location_id,
            handed_over_at=datetime.datetime.utcnow(),
            pickup_pass_tag=pickup_pass_tag or f"PASS-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        )
        self.db.add(handover)
        self.db.commit()
        self.db.refresh(handover)
        return handover

    def get_handover(self, handover_id: Union[int, str]) -> Optional[ItemHandover]:
        try:
            hid = int(handover_id)
        except (ValueError, TypeError):
            return None
        return (
            self.db.query(ItemHandover)
            .options(
                joinedload(ItemHandover.claim),
                joinedload(ItemHandover.officer),
                joinedload(ItemHandover.receiver),
                joinedload(ItemHandover.location),
            )
            .filter(ItemHandover.id == hid)
            .first()
        )
