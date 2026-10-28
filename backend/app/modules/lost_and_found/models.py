import datetime
from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base
from app.modules.academic.models import CampusLocation, MediaAttachment
from app.modules.auth.models import User


class ItemCategory(Base):
    """
    Table 34: item_categories
    Categorizes lost and found reports (e.g., Electronics & Audio, ID Cards & Wallets).
    """
    __tablename__ = "item_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(64), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lost_reports = relationship("LostReport", back_populates="category", cascade="all, delete-orphan")
    found_reports = relationship("FoundReport", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ItemCategory id={self.id} name='{self.name}'>"


class LostReport(Base):
    """
    Table 35: lost_reports
    Describes missing items reported by students or campus community members.
    """
    __tablename__ = "lost_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("item_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    last_seen_location_id = Column(Integer, ForeignKey("campus_locations.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    brand_model = Column(String(128), nullable=True)
    description = Column(Text, nullable=False)
    lost_at = Column(DateTime, nullable=True)
    status = Column(String(32), default="OPEN", nullable=False, index=True)  # OPEN, MATCHED, RESOLVED, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id])
    category = relationship("ItemCategory", back_populates="lost_reports")
    last_seen_location = relationship("CampusLocation", foreign_keys=[last_seen_location_id])
    media = relationship("ReportMedia", back_populates="lost_report", cascade="all, delete-orphan")
    matches = relationship("ItemMatch", back_populates="lost_report", foreign_keys="[ItemMatch.lost_report_id]", cascade="all, delete-orphan")
    claims = relationship("ItemClaim", back_populates="lost_report")

    def __repr__(self):
        return f"<LostReport id={self.id} title='{self.title}' status='{self.status}'>"


class FoundReport(Base):
    """
    Table 36: found_reports
    Describes discovered items and their physical custody tracking.
    """
    __tablename__ = "found_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reported_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("item_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    found_location_id = Column(Integer, ForeignKey("campus_locations.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    found_at = Column(DateTime, nullable=True)
    custody_desk = Column(String(128), nullable=False)  # e.g., 'Admin Ground Floor Custody Desk'
    inventory_tag = Column(String(64), unique=True, nullable=False, index=True)  # e.g., 'LF-2025-001'
    storage_status = Column(String(32), default="IN_CUSTODY", nullable=False, index=True)  # INTAKE_PENDING, IN_CUSTODY, HANDED_OVER, RELEASED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    finder = relationship("User", foreign_keys=[reported_by])
    category = relationship("ItemCategory", back_populates="found_reports")
    found_location = relationship("CampusLocation", foreign_keys=[found_location_id])
    media = relationship("ReportMedia", back_populates="found_report", cascade="all, delete-orphan")
    matches = relationship("ItemMatch", back_populates="found_report", foreign_keys="[ItemMatch.found_report_id]", cascade="all, delete-orphan")
    claims = relationship("ItemClaim", back_populates="found_report", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FoundReport id={self.id} tag='{self.inventory_tag}' title='{self.title}'>"


class ReportMedia(Base):
    """
    Table 37: report_media
    Connects photos and visual files to lost or found reports.
    Enforces that exactly one of lost_report_id and found_report_id is set.
    """
    __tablename__ = "report_media"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lost_report_id = Column(Integer, ForeignKey("lost_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    found_report_id = Column(Integer, ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    media_id = Column(Integer, ForeignKey("media_attachments.id", ondelete="CASCADE"), nullable=True, index=True)
    media_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lost_report = relationship("LostReport", back_populates="media")
    found_report = relationship("FoundReport", back_populates="media")
    media_attachment = relationship("MediaAttachment", foreign_keys=[media_id])

    __table_args__ = (
        CheckConstraint(
            "(lost_report_id IS NOT NULL AND found_report_id IS NULL) OR "
            "(lost_report_id IS NULL AND found_report_id IS NOT NULL)",
            name="ck_report_media_single_parent"
        ),
    )

    def __repr__(self):
        return f"<ReportMedia id={self.id} lost={self.lost_report_id} found={self.found_report_id}>"


class ItemMatch(Base):
    """
    Table 38: item_matches
    Stores AI candidate matches pairing a lost report with a found report.
    Enforces unique constraint on (lost_report_id, found_report_id).
    """
    __tablename__ = "item_matches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lost_report_id = Column(Integer, ForeignKey("lost_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    found_report_id = Column(Integer, ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    text_similarity = Column(Float, nullable=True)
    image_similarity = Column(Float, nullable=True)
    combined_score = Column(Float, nullable=False, index=True)  # Normalized 0.0-1.0 or 0-100
    criteria_json = Column(Text, nullable=True)  # e.g., {"model": "jina-clip-v2", "location_match": true}
    status = Column(String(32), default="CANDIDATE", nullable=False, index=True)  # CANDIDATE, VERIFIED, REJECTED, DISMISSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lost_report = relationship("LostReport", back_populates="matches", foreign_keys=[lost_report_id])
    found_report = relationship("FoundReport", back_populates="matches", foreign_keys=[found_report_id])
    verifications = relationship("MatchVerification", back_populates="match", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("lost_report_id", "found_report_id", name="uq_lost_found_match"),
    )

    def __repr__(self):
        return f"<ItemMatch id={self.id} score={self.combined_score:.3f} status='{self.status}'>"


class MatchVerification(Base):
    """
    Table 39: match_verifications
    Ownership verification challenge attempts before handover approval.
    """
    __tablename__ = "match_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    match_id = Column(Integer, ForeignKey("item_matches.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_question = Column(Text, nullable=False)
    owner_response = Column(Text, nullable=True)
    officer_notes = Column(Text, nullable=True)
    concordance_score = Column(Float, nullable=True)  # e.g., 0.98 or 98.0
    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(32), default="PENDING", nullable=False)  # PENDING, APPROVED, VERIFIED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    match = relationship("ItemMatch", back_populates="verifications")
    verifier = relationship("User", foreign_keys=[verified_by])

    def __repr__(self):
        return f"<MatchVerification id={self.id} match={self.match_id} concordance={self.concordance_score}>"


class ItemClaim(Base):
    """
    Table 40: item_claims
    Records item claim attempts submitted by a student or reporter.
    """
    __tablename__ = "item_claims"

    id = Column(Integer, primary_key=True, autoincrement=True)
    found_report_id = Column(Integer, ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    lost_report_id = Column(Integer, ForeignKey("lost_reports.id", ondelete="SET NULL"), nullable=True, index=True)
    claimed_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="PENDING", nullable=False, index=True)  # PENDING, APPROVED, REJECTED, CANCELLED
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    found_report = relationship("FoundReport", back_populates="claims")
    lost_report = relationship("LostReport", back_populates="claims")
    claimant = relationship("User", foreign_keys=[claimed_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    handover = relationship("ItemHandover", back_populates="claim", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ItemClaim id={self.id} found={self.found_report_id} status='{self.status}'>"


class ItemHandover(Base):
    """
    Table 41: item_handovers
    Records the verified physical custody transfer and digital pickup pass.
    Enforces that a handover can only exist for an approved claim.
    """
    __tablename__ = "item_handovers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(Integer, ForeignKey("item_claims.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    handed_over_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    received_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    handover_location_id = Column(Integer, ForeignKey("campus_locations.id", ondelete="SET NULL"), nullable=True)
    handed_over_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    pickup_pass_tag = Column(String(64), nullable=True)  # Digital pickup pass token

    # Relationships
    claim = relationship("ItemClaim", back_populates="handover")
    officer = relationship("User", foreign_keys=[handed_over_by])
    receiver = relationship("User", foreign_keys=[received_by])
    location = relationship("CampusLocation", foreign_keys=[handover_location_id])

    def __repr__(self):
        return f"<ItemHandover id={self.id} claim={self.claim_id}>"
