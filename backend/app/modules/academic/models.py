import datetime
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base
from app.modules.attendance import models as _attendance_models


# =============================================================================
# Table 8: departments
# =============================================================================
class Department(Base):
    """
    Table 8: departments
    Academic departments (CSE, IT, ECE) offering degrees and managing courses.
    """
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    degree = Column(String(64), nullable=True)

    # Relationships
    sections = relationship("Section", back_populates="department", cascade="all, delete-orphan")
    staff_members = relationship("StaffProfile", back_populates="department")
    subjects = relationship("Subject", back_populates="department", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Department id={self.id} code='{self.code}'>"


# =============================================================================
# Table 9: academic_batches
# =============================================================================
class AcademicBatch(Base):
    """
    Table 9: academic_batches
    Cohorts of students admitted across academic years (e.g., 2021-2025).
    """
    __tablename__ = "academic_batches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(64), nullable=False)
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=False)

    # Relationships
    sections = relationship("Section", back_populates="batch", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AcademicBatch id={self.id} name='{self.name}'>"


# =============================================================================
# Table 10: sections
# =============================================================================
class Section(Base):
    """
    Table 10: sections
    Specific student class cohort (e.g., CSE-A Sem 7).
    """
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_id = Column(Integer, ForeignKey("academic_batches.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(64), nullable=False)
    semester = Column(Integer, nullable=False)

    # Relationships
    department = relationship("Department", back_populates="sections")
    batch = relationship("AcademicBatch", back_populates="sections")
    students = relationship("StudentProfile", back_populates="section")
    course_offerings = relationship("CourseOffering", back_populates="section", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Section id={self.id} name='{self.name}' sem={self.semester}>"


# =============================================================================
# Table 11: mentor_allocations
# =============================================================================
class MentorAllocation(Base):
    """
    Table 11: mentor_allocations
    Historical and active student-to-faculty mentor assignments.
    """
    __tablename__ = "mentor_allocations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("staff_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)

    # Relationships
    student = relationship("StudentProfile", foreign_keys=[student_id])
    mentor = relationship("StaffProfile", foreign_keys=[mentor_id])
    assigner = relationship("User", foreign_keys=[assigned_by])

    def __repr__(self):
        return f"<MentorAllocation id={self.id} student_id={self.student_id} mentor_id={self.mentor_id}>"


# =============================================================================
# Table 12: enrollment_imports
# =============================================================================
class EnrollmentImport(Base):
    """
    Table 12: enrollment_imports
    Bulk student enrollment batches uploaded by administrators.
    """
    __tablename__ = "enrollment_imports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_id = Column(Integer, nullable=True)
    status = Column(String(32), default="COMPLETED", nullable=False)  # COMPLETED, FAILED, PENDING
    total_rows = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by])
    rows = relationship("EnrollmentImportRow", back_populates="enrollment_import", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<EnrollmentImport id={self.id} status='{self.status}' rows={self.total_rows}>"


# =============================================================================
# Table 13: enrollment_import_rows
# =============================================================================
class EnrollmentImportRow(Base):
    """
    Table 13: enrollment_import_rows
    Individual line items within a bulk student enrollment import.
    """
    __tablename__ = "enrollment_import_rows"

    id = Column(Integer, primary_key=True, autoincrement=True)
    import_id = Column(Integer, ForeignKey("enrollment_imports.id", ondelete="CASCADE"), nullable=False, index=True)
    row_number = Column(Integer, nullable=False)
    row_data = Column(Text, nullable=True)
    validation_errors = Column(Text, nullable=True)
    status = Column(String(32), default="VALID", nullable=False)  # VALID, ERROR, PROCESSED

    # Relationships
    enrollment_import = relationship("EnrollmentImport", back_populates="rows")

    def __repr__(self):
        return f"<EnrollmentImportRow id={self.id} import_id={self.import_id} row={self.row_number}>"


# =============================================================================
# Table 14: campus_locations
# =============================================================================
class CampusLocation(Base):
    """
    Table 14: campus_locations
    Physical campus rooms, laboratories, halls, and digital zones with hierarchy.
    """
    __tablename__ = "campus_locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    location_type = Column(String(64), nullable=True)  # CLASSROOM, LAB, LIBRARY, HALL, CANTEEN
    parent_location_id = Column(Integer, ForeignKey("campus_locations.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationships
    parent_location = relationship("CampusLocation", remote_side=[id], backref="child_locations")
    timetable_entries = relationship("TimetableEntry", back_populates="location")

    def __repr__(self):
        return f"<CampusLocation id={self.id} name='{self.name}'>"


# =============================================================================
# Table 15: media_attachments
# =============================================================================
class MediaAttachment(Base):
    """
    Table 15: media_attachments
    Shared storage metadata for files, study materials, photos, and import documents.
    """
    __tablename__ = "media_attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    storage_key = Column(String(512), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(128), default="image/jpeg", nullable=False)
    file_size = Column(Integer, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<MediaAttachment id={self.id} file='{self.original_filename}'>"
