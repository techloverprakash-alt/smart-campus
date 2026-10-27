import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, EmailStr, Field


# =============================================================================
# Authentication Schemas
# =============================================================================
class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Roll No, Register Number, Faculty ID, Admin username, or email")
    password: str = Field(..., description="Plaintext password for verification")
    role: Optional[str] = Field(None, description="Optional expected role: STUDENT, STAFF, ADMIN")


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class UserSummary(BaseModel):
    id: int
    identifier: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserSummary


# =============================================================================
# Profile Read Schemas
# =============================================================================
class DepartmentInfo(BaseModel):
    id: Optional[int] = 1
    name: str = "Department of Computer Science & Engineering"
    code: str = "CSE"


class FacultyMentorSummary(BaseModel):
    id: int
    faculty_id: str
    full_name: str
    designation: str
    email: Optional[str] = None
    phone: Optional[str] = None
    cabin_number: Optional[str] = None


class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    identifier: str
    register_number: str
    roll_number: str
    full_name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = "O+ve"
    cgpa: Optional[float] = None
    section: Optional[str] = "Section A"
    batch: Optional[str] = "2021–2025"
    semester: Optional[str] = "8th Semester"
    department: Optional[DepartmentInfo] = None
    faculty_mentor: Optional[FacultyMentorSummary] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class MenteeSummary(BaseModel):
    id: int
    user_id: int
    register_number: str
    roll_number: str
    name: str
    email: str
    cgpa: Optional[float] = None
    section: Optional[str] = "Sec A"
    phone: Optional[str] = None


class StaffProfileOut(BaseModel):
    id: int
    user_id: int
    identifier: str
    faculty_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    designation: str
    cabin_number: Optional[str] = None
    mentor_capacity: int = 15
    assigned_students_count: int = 0
    experience: Optional[str] = "9+ Years Academic & Research"
    qualifications: Optional[str] = "Ph.D. in Computer Science"
    department: Optional[DepartmentInfo] = None
    mentees: List[MenteeSummary] = []
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class AdminProfileOut(BaseModel):
    id: int
    user_id: int
    identifier: str
    full_name: str
    email: str
    phone: Optional[str] = None
    designation: str
    office_location: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class FullProfileResponse(BaseModel):
    data: Dict[str, Any]


# =============================================================================
# Admin Student Enrollment & Roster Schemas
# =============================================================================
class StudentEnrollRequest(BaseModel):
    full_name: str
    register_number: str
    roll_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = "2004-01-01"
    gender: Optional[str] = None
    department_code: Optional[str] = "CSE"
    batch_name: Optional[str] = "2021-2025"
    section_name: Optional[str] = "Section A"
    cgpa: Optional[float] = 8.0
    mentor_id: Optional[int] = None
    password: Optional[str] = None


class BulkStudentItem(BaseModel):
    register_number: str
    roll_number: Optional[str] = None
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department_code: Optional[str] = None
    batch_name: Optional[str] = None
    section_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    cgpa: Optional[float] = None
    generated_password: Optional[str] = None


class BulkStudentEnrollRequest(BaseModel):
    students: List[BulkStudentItem]
    default_department_code: Optional[str] = "CSE"
    default_batch_name: Optional[str] = "2021-2025"
    default_section_name: Optional[str] = "Section A"
    conflict_strategy: Optional[str] = "skip"


# =============================================================================
# Admin Staff Onboarding Schemas
# =============================================================================
class StaffEnrollRequest(BaseModel):
    faculty_id: str
    full_name: str
    email: str
    department_name: Optional[str] = "Computer Science and Engineering"
    designation: str
    phone: Optional[str] = None
    cabin_number: Optional[str] = None
    mentor_capacity: Optional[int] = 15
    qualifications: Optional[str] = None
    experience: Optional[str] = None
    custom_password: Optional[str] = None


# =============================================================================
# Mentor & Proctor Allocation Schemas
# =============================================================================
class FacultyMentorOut(BaseModel):
    id: int
    name: str
    title: str
    assigned: int
    capacity: int
    department: Optional[str] = "CSE"


class StudentAllocationItem(BaseModel):
    id: str  # register_number
    rawId: int  # student_profiles.id
    name: str
    section: str
    mentor: Optional[str] = None
    mentor_id: Optional[int] = None
    initials: str
    avatar: Optional[str] = None


class StudentAllocationResponse(BaseModel):
    students: List[StudentAllocationItem]


class MentorAssignRequest(BaseModel):
    student_ids: List[Union[str, int]]
    faculty_mentor_id: Union[str, int]


class MentorUnassignRequest(BaseModel):
    student_ids: List[Union[str, int]]


class AutoDistributeRequest(BaseModel):
    department_name: Optional[str] = None
