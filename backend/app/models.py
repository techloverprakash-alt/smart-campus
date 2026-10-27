import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from app.database import Base


class Report(Base):
    """
    Authoritative student Lost or Found item report stored in the relational database.
    """
    __tablename__ = "reports"

    id = Column(String(64), primary_key=True, index=True)
    report_type = Column(String(16), nullable=False, index=True)  # 'lost' or 'found'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), nullable=False, index=True)  # e.g. 'electronics', 'clothing', 'accessories'
    color = Column(String(64), nullable=True)
    brand = Column(String(64), nullable=True)
    attributes = Column(Text, nullable=True)  # JSON-encoded extra key-value tags
    location_id = Column(String(64), nullable=False, index=True)  # e.g. 'library_floor_2'
    location_name = Column(String(255), nullable=False)
    incident_datetime = Column(DateTime, nullable=True)
    image_path = Column(String(512), nullable=True)
    has_image = Column(Boolean, default=False)
    status = Column(String(32), default="open", index=True)  # 'open', 'resolved', 'claimed', 'deleted'
    user_id = Column(String(64), nullable=False, index=True)
    user_contact_private = Column(String(255), nullable=True)  # Protected: never leaked in public match candidate APIs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.id} type={self.report_type} status={self.status}>"


class MatchRecord(Base):
    """
    Persisted multi-signal match candidate pairing a lost report with a found report.
    Guarantees no duplicate records for the same pair.
    """
    __tablename__ = "matches"

    id = Column(String(128), primary_key=True, index=True)
    lost_report_id = Column(String(64), nullable=False, index=True)
    found_report_id = Column(String(64), nullable=False, index=True)
    ranking_score = Column(Float, nullable=False, index=True)
    text_score = Column(Float, nullable=True)
    image_score = Column(Float, nullable=True)
    keyword_score = Column(Float, nullable=True)
    location_score = Column(Float, nullable=True)
    time_score = Column(Float, nullable=True)
    reasons = Column(Text, nullable=True)  # JSON-encoded list of explanation strings
    algorithm_version = Column(String(32), default="v1.0.0")
    status = Column(String(32), default="potential_match", index=True)  # 'potential_match', 'reviewed', 'rejected', 'confirmed'
    is_reviewed = Column(Boolean, default=False)
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("lost_report_id", "found_report_id", name="uq_lost_found_pair"),
        Index("idx_lost_ranking", "lost_report_id", "ranking_score"),
        Index("idx_found_ranking", "found_report_id", "ranking_score"),
    )

    def __repr__(self):
        return f"<MatchRecord {self.id} score={self.ranking_score:.2f} status={self.status}>"
