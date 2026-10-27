import datetime
import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """
    Core authoritative user model for students, staff, security officers, and administrators.
    """
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    identifier = Column(String(64), unique=True, nullable=False, index=True)  # Roll no / Faculty ID / Admin username
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(64), nullable=True)
    role = Column(String(32), default="STUDENT", nullable=False, index=True)  # STUDENT, STAFF, ADMIN, OFFICER
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<User {self.identifier} ({self.role})>"


class Location(Base):
    """
    Campus spatial location or zone.
    """
    __tablename__ = "locations"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    building = Column(String(128), nullable=True)
    floor = Column(String(64), nullable=True)
    zone = Column(String(128), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<Location {self.name} ({self.zone})>"


class Media(Base):
    """
    Stored media attachments (photos, scans, verification proof).
    """
    __tablename__ = "media"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_url = Column(String(512), nullable=False)
    media_type = Column(String(64), default="image/jpeg")
    uploaded_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    uploader = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<Media {self.file_name}>"
