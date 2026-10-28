import datetime
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base
import app.modules.academic.models as _academic_models
import app.modules.auth.models as _auth_models


# =============================================================================
# Table 16: subjects
# =============================================================================
class Subject(Base):
    """
    Table 16: subjects
    Authoritative catalog of academic subjects/courses offered across departments.
    """
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(32), unique=True, nullable=False, index=True)  # CS8701, CS8702
    title = Column(String(255), nullable=False)
    credits = Column(Integer, default=3, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    department = relationship("Department", back_populates="subjects")
    offerings = relationship("CourseOffering", back_populates="subject", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Subject id={self.id} code='{self.code}' title='{self.title}'>"


# =============================================================================
# Table 17: course_offerings
# =============================================================================
class CourseOffering(Base):
    """
    Table 17: course_offerings
    Connects a subject to a specific section and teaching faculty member for a given term.
    """
    __tablename__ = "course_offerings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id = Column(Integer, ForeignKey("staff_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year = Column(String(32), nullable=False)  # 2025-2026
    semester = Column(Integer, nullable=False)          # 7

    # Relationships
    subject = relationship("Subject", back_populates="offerings", lazy="joined")
    section = relationship("Section", back_populates="course_offerings", lazy="joined")
    staff = relationship("StaffProfile", lazy="joined")
    timetable_entries = relationship("TimetableEntry", back_populates="course_offering", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CourseOffering id={self.id} subject_id={self.subject_id} section_id={self.section_id}>"


# =============================================================================
# Table 18: timetable_entries
# =============================================================================
class TimetableEntry(Base):
    """
    Table 18: timetable_entries
    Scheduled weekly period slot for a course offering in a physical campus location.
    """
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_offering_id = Column(Integer, ForeignKey("course_offerings.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(String(32), nullable=False, index=True)  # MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY
    period_number = Column(Integer, nullable=False)               # 1, 2, 3, 4, 5...
    start_time = Column(String(16), nullable=False)              # 09:00:00
    end_time = Column(String(16), nullable=False)                # 09:50:00
    location_id = Column(Integer, ForeignKey("campus_locations.id", ondelete="SET NULL"), nullable=True, index=True)

    # Relationships
    course_offering = relationship("CourseOffering", back_populates="timetable_entries", lazy="joined")
    location = relationship("CampusLocation", back_populates="timetable_entries", lazy="joined")
    attendance_sessions = relationship("AttendanceSession", back_populates="timetable_entry", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<TimetableEntry id={self.id} day='{self.day_of_week}' p={self.period_number}>"


# =============================================================================
# Table 19: attendance_sessions
# =============================================================================
class AttendanceSession(Base):
    """
    Table 19: attendance_sessions
    An individual attendance-taking event for a scheduled timetable entry and date.
    """
    __tablename__ = "attendance_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timetable_entry_id = Column(Integer, ForeignKey("timetable_entries.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_date = Column(Date, nullable=False, index=True)
    marked_by = Column(Integer, ForeignKey("staff_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(32), default="SUBMITTED", nullable=False)  # SUBMITTED, REVIEWED, PENDING
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("timetable_entry_id", "attendance_date", name="uq_session_entry_date"),
    )

    # Relationships
    timetable_entry = relationship("TimetableEntry", back_populates="attendance_sessions", lazy="joined")
    marker = relationship("StaffProfile", foreign_keys=[marked_by], lazy="joined")
    reviewer = relationship("User", foreign_keys=[reviewed_by], lazy="joined")
    records = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AttendanceSession id={self.id} date='{self.attendance_date}' status='{self.status}'>"


# =============================================================================
# Table 20: attendance_records
# =============================================================================
class AttendanceRecord(Base):
    """
    Table 20: attendance_records
    Individual student attendance entry (PRESENT, ABSENT, OD) for a session.
    """
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("attendance_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(16), default="PRESENT", nullable=False, index=True)  # PRESENT, ABSENT, OD
    remarks = Column(String(255), nullable=True)

    __table_args__ = (
        UniqueConstraint("session_id", "student_id", name="uq_session_student"),
    )

    # Relationships
    session = relationship("AttendanceSession", back_populates="records")
    student = relationship("StudentProfile", foreign_keys=[student_id], lazy="joined")

    def __repr__(self):
        return f"<AttendanceRecord id={self.id} student_id={self.student_id} status='{self.status}'>"
