import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
# Pre-import referenced models to avoid SQLAlchemy registry resolution conflicts
import app.modules.academic.models as _academic_models
import app.modules.attendance.models as _attendance_models
import app.modules.auth.models as _auth_models


# =============================================================================
# Table 21: study_materials
# =============================================================================
class StudyMaterial(Base):
    """
    Table 21: study_materials
    Connects course offerings, uploaded files, and faculty authors for verified notes.
    """
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_offering_id = Column(Integer, ForeignKey("course_offerings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    unit_number = Column(Integer, nullable=True)
    file_id = Column(Integer, ForeignKey("media_attachments.id", ondelete="SET NULL"), nullable=True, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    published_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    course_offering = relationship("CourseOffering", backref="study_materials")
    file = relationship("MediaAttachment")
    uploader = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<StudyMaterial id={self.id} title='{self.title}' unit={self.unit_number}>"


# =============================================================================
# Table 22: announcements
# =============================================================================
class Announcement(Base):
    """
    Table 22: announcements
    Public and departmental notices, official circulars, and exam timetables.
    """
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(32), default="PUBLISHED", nullable=False)  # DRAFT, PUBLISHED, ARCHIVED
    published_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    targets = relationship("AnnouncementTarget", back_populates="announcement", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Announcement id={self.id} title='{self.title}' status='{self.status}'>"


# =============================================================================
# Table 23: announcement_targets
# =============================================================================
class AnnouncementTarget(Base):
    """
    Table 23: announcement_targets
    Defines audience filters (department, section, role) for targeted delivery.
    """
    __tablename__ = "announcement_targets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=True, index=True)

    # Relationships
    announcement = relationship("Announcement", back_populates="targets")
    department = relationship("Department")
    section = relationship("Section")
    role = relationship("Role")

    def __repr__(self):
        return (
            f"<AnnouncementTarget id={self.id} ann_id={self.announcement_id} "
            f"dept={self.department_id} sec={self.section_id} role={self.role_id}>"
        )

