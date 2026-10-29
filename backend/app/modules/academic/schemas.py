from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class SubjectCreate(BaseModel):
    code: str
    title: str
    credits: int = 3
    department_id: int = 1
    subject_type: Optional[str] = "Theory"
    semester: Optional[int] = 7


class SubjectResponse(BaseModel):
    id: int
    code: str
    title: str
    credits: int
    department_id: int
    department_name: Optional[str] = None
    subject_type: Optional[str] = "Theory"
    offerings_count: int = 0


class CourseOfferingCreate(BaseModel):
    subject_id: int
    staff_id: int
    section_id: int
    academic_year: str = "2025-2026"
    semester: int = 7


class CourseOfferingResponse(BaseModel):
    id: int
    subject_id: int
    subject_code: str
    subject_title: str
    staff_id: int
    staff_name: str
    staff_faculty_id: str
    section_id: int
    section_name: str
    department_name: str
    student_count: int = 0
    academic_year: str
    semester: int


class StaffWorkloadSubject(BaseModel):
    offering_id: int
    code: str
    title: str
    type: str = "Core Theory"
    credits: int = 3
    hours: str = "4 hrs/week"
    classSection: str
    room: str = "LH-101"
    student_count: int = 0


class StaffWorkloadItem(BaseModel):
    id: int
    staffId: int
    facultyId: str
    name: str
    designation: str
    department: str
    cabin: str
    email: str
    phone: str
    initials: str
    avatarBg: str = "#dbeafe"
    avatarText: str = "#003fb1"
    subjects: List[StaffWorkloadSubject] = []
