import datetime
import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base

from app.modules.auth.models import User


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
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    uploader = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<Media {self.file_name}>"
