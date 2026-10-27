import datetime
import uuid
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base
from app.modules.core.models import Location, Media, User


class ItemCategory(Base):
    """
    Table 34: item_categories
    Categorizes lost and found reports (e.g., Electronics, Accessories, Wallets & Cards).
    """
    __tablename__ = "item_categories"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(64), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lost_reports = relationship("LostReport", back_populates="category")
    found_reports = relationship("FoundReport", back_populates="category")

    def __repr__(self):
        return f"<ItemCategory {self.name}>"


class LostReport(Base):
    """
    Table 35: lost_reports
    Describes missing items reported by students or campus community members.
    """
    __tablename__ = "lost_reports"

    id = Column(String(64), primary_key=True, default=lambda: f"LNF-{uuid.uuid4().hex[:6].upper()}")
    reporter_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(64), ForeignKey("item_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    last_seen_location_id = Column(String(64), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    brand_model = Column(String(128), nullable=True)
    description = Column(Text, nullable=False)
    lost_at = Column(DateTime, nullable=True)
    status = Column(String(32), default="OPEN", nullable=False, index=True)  # OPEN, MATCH_FOUND, CLAIMED, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id])
    category = relationship("ItemCategory", back_populates="lost_reports")
    last_seen_location = relationship("Location", foreign_keys=[last_seen_location_id])
    media = relationship("ReportMedia", back_populates="lost_report", cascade="all, delete-orphan")
    matches = relationship("ItemMatch", back_populates="lost_report", foreign_keys="[ItemMatch.lost_report_id]", cascade="all, delete-orphan")
    claims = relationship("ItemClaim", back_populates="lost_report")

    def __repr__(self):
        return f"<LostReport {self.id}: {self.title} ({self.status})>"


class FoundReport(Base):
    """
    Table 36: found_reports
    Describes discovered items and their physical custody tracking.
    """
    __tablename__ = "found_reports"

    id = Column(String(64), primary_key=True, default=lambda: f"FND-{uuid.uuid4().hex[:6].upper()}")
    reported_by = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(64), ForeignKey("item_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    found_location_id = Column(String(64), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    found_at = Column(DateTime, nullable=True)
    custody_desk = Column(String(128), nullable=False)  # e.g., 'Desk 02 (Vault A-14)'
    inventory_tag = Column(String(64), unique=True, nullable=False, index=True)  # e.g., '#SEC-990'
    storage_status = Column(String(32), default="INTAKE_PENDING", nullable=False, index=True)  # INTAKE_PENDING, SECURED, LOCKED, RELEASED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    finder = relationship("User", foreign_keys=[reported_by])
    category = relationship("ItemCategory", back_populates="found_reports")
    found_location = relationship("Location", foreign_keys=[found_location_id])
    media = relationship("ReportMedia", back_populates="found_report", cascade="all, delete-orphan")
    matches = relationship("ItemMatch", back_populates="found_report", foreign_keys="[ItemMatch.found_report_id]", cascade="all, delete-orphan")
    claims = relationship("ItemClaim", back_populates="found_report", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FoundReport {self.id}: {self.title} (Tag: {self.inventory_tag})>"


class ReportMedia(Base):
    """
    Table 37: report_media
    Connects photos and visual files to lost or found reports.
    """
    __tablename__ = "report_media"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    lost_report_id = Column(String(64), ForeignKey("lost_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    found_report_id = Column(String(64), ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    media_id = Column(String(64), ForeignKey("media.id", ondelete="CASCADE"), nullable=True, index=True)
    media_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lost_report = relationship("LostReport", back_populates="media")
    found_report = relationship("FoundReport", back_populates="media")
    media_item = relationship("Media", foreign_keys=[media_id])

    def __repr__(self):
        return f"<ReportMedia {self.id}>"


class ItemMatch(Base):
    """
    Table 38: item_matches
    Stores AI candidate matches pairing a lost report with a found report.
    """
    __tablename__ = "item_matches"

    id = Column(String(64), primary_key=True, default=lambda: f"CAND-{uuid.uuid4().hex[:6].upper()}")
    lost_report_id = Column(String(64), ForeignKey("lost_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    found_report_id = Column(String(64), ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    text_similarity = Column(Float, nullable=True)
    image_similarity = Column(Float, nullable=True)
    combined_score = Column(Float, nullable=False, index=True)  # Normalized 0-100 or 0.0-1.0
    criteria_json = Column(Text, nullable=True)  # JSON-encoded array of match checks
    status = Column(String(32), default="CANDIDATE", nullable=False, index=True)  # CANDIDATE, PENDING_VERIFICATION, VERIFIED, REJECTED, HANDOVER_READY, RELEASED, DISMISSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lost_report = relationship("LostReport", back_populates="matches", foreign_keys=[lost_report_id])
    found_report = relationship("FoundReport", back_populates="matches", foreign_keys=[found_report_id])
    verifications = relationship("MatchVerification", back_populates="match", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("lost_report_id", "found_report_id", name="uq_lost_found_match"),
    )

    def __repr__(self):
        return f"<ItemMatch {self.id} score={self.combined_score:.2f} ({self.status})>"


class MatchVerification(Base):
    """
    Table 39: match_verifications
    Ownership double-blind verification challenge attempts before handover approval.
    """
    __tablename__ = "match_verifications"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = Column(String(64), ForeignKey("item_matches.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_question = Column(Text, nullable=False)
    owner_response = Column(Text, nullable=True)
    officer_notes = Column(Text, nullable=True)
    concordance_score = Column(Float, nullable=True)  # 0-100%
    verified_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(32), default="PENDING", nullable=False)  # PENDING, VERIFIED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    match = relationship("ItemMatch", back_populates="verifications")
    verifier = relationship("User", foreign_keys=[verified_by])

    def __repr__(self):
        return f"<MatchVerification {self.id} concordance={self.concordance_score}>"


class ItemClaim(Base):
    """
    Table 40: item_claims
    Records item claim attempts submitted by a student or reporter.
    """
    __tablename__ = "item_claims"

    id = Column(String(64), primary_key=True, default=lambda: f"CLM-{uuid.uuid4().hex[:6].upper()}")
    found_report_id = Column(String(64), ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    lost_report_id = Column(String(64), ForeignKey("lost_reports.id", ondelete="SET NULL"), nullable=True, index=True)
    claimed_by = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="PENDING", nullable=False, index=True)  # PENDING, APPROVED, REJECTED, CANCELLED
    reviewed_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    found_report = relationship("FoundReport", back_populates="claims")
    lost_report = relationship("LostReport", back_populates="claims")
    claimant = relationship("User", foreign_keys=[claimed_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    handover = relationship("ItemHandover", back_populates="claim", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ItemClaim {self.id} ({self.status})>"


class ItemHandover(Base):
    """
    Table 41: item_handovers
    Records the verified physical custody transfer and digital pickup pass.
    """
    __tablename__ = "item_handovers"

    id = Column(String(64), primary_key=True, default=lambda: f"HND-{uuid.uuid4().hex[:6].upper()}")
    claim_id = Column(String(64), ForeignKey("item_claims.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    handed_over_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    received_by = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    handover_location_id = Column(String(64), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    handed_over_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    pickup_pass_tag = Column(String(64), nullable=True)  # Digital pickup pass token

    claim = relationship("ItemClaim", back_populates="handover")
    officer = relationship("User", foreign_keys=[handed_over_by])
    receiver = relationship("User", foreign_keys=[received_by])
    location = relationship("Location", foreign_keys=[handover_location_id])

    def __repr__(self):
        return f"<ItemHandover {self.id} claim={self.claim_id}>"
