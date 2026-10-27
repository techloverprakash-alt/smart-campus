import datetime
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


# =============================================================================
# Table 3: user_roles (Association Table)
# =============================================================================
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("assigned_at", DateTime, default=datetime.datetime.utcnow, nullable=False),
)


# =============================================================================
# Table 2: roles
# =============================================================================
class Role(Base):
    """
    Table 2: roles
    Captures system roles (Admin, Staff, Student).
    """
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(64), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    users = relationship("User", secondary=user_roles, back_populates="roles")

    def __repr__(self):
        return f"<Role id={self.id} name='{self.name}'>"


# =============================================================================
# Table 1: users
# =============================================================================
class User(Base):
    """
    Table 1: users
    Central user identity model for authentication and profiles.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    identifier = Column(String(64), unique=True, nullable=False, index=True)  # ADM001, FAC101, STU2025001
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users", lazy="joined")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="joined")
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="joined")
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="joined")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    @property
    def primary_role(self) -> str:
        """Returns primary role name uppercase (ADMIN, STAFF, STUDENT)."""
        if self.roles:
            return self.roles[0].name.upper()
        return "STUDENT"

    @property
    def role(self) -> str:
        return self.primary_role

    @property
    def name(self) -> str:
        if self.full_name:
            return self.full_name
        if self.identifier:
            return self.identifier
        return self.email.split("@")[0].title()

    def __repr__(self):
        return f"<User id={self.id} identifier='{self.identifier}' role='{self.primary_role}'>"


# =============================================================================
# Table 5: staff_profiles
# =============================================================================
class StaffProfile(Base):
    """
    Table 5: staff_profiles
    1:1 with users; faculty handling courses and student mentorship.
    """
    __tablename__ = "staff_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    faculty_id = Column(String(64), unique=True, nullable=False, index=True)  # FAC-CS-001
    department_id = Column(Integer, nullable=True)
    designation = Column(String(128), nullable=False)
    cabin_number = Column(String(64), nullable=True)
    mentor_capacity = Column(Integer, default=15, nullable=False)

    user = relationship("User", back_populates="staff_profile")
    mentees = relationship("StudentProfile", back_populates="mentor", foreign_keys="StudentProfile.mentor_id")

    def __repr__(self):
        return f"<StaffProfile id={self.id} faculty_id='{self.faculty_id}'>"


# =============================================================================
# Table 4: student_profiles
# =============================================================================
class StudentProfile(Base):
    """
    Table 4: student_profiles
    1:1 with users; enrolled students assigned to sections and faculty mentors.
    """
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    register_number = Column(String(64), unique=True, nullable=False, index=True)  # REG20251001
    roll_number = Column(String(64), unique=True, nullable=False, index=True)      # 21CS001
    section_id = Column(Integer, nullable=True)
    mentor_id = Column(Integer, ForeignKey("staff_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    cgpa = Column(Float, nullable=True)
    date_of_birth = Column(String(32), nullable=True)

    user = relationship("User", back_populates="student_profile")
    mentor = relationship("StaffProfile", back_populates="mentees", foreign_keys=[mentor_id], lazy="joined")

    def __repr__(self):
        return f"<StudentProfile id={self.id} roll='{self.roll_number}'>"


# =============================================================================
# Table 6: admin_profiles
# =============================================================================
class AdminProfile(Base):
    """
    Table 6: admin_profiles
    1:1 with users; administrator specific records.
    """
    __tablename__ = "admin_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    designation = Column(String(128), nullable=False)
    office_location = Column(String(255), nullable=True)

    user = relationship("User", back_populates="admin_profile")

    def __repr__(self):
        return f"<AdminProfile id={self.id} designation='{self.designation}'>"


# =============================================================================
# Table 7: refresh_tokens
# =============================================================================
class RefreshToken(Base):
    """
    Table 7: refresh_tokens
    Stores hashed session refresh tokens for secure token rotation and revocation.
    """
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken id={self.id} user_id={self.user_id}>"
