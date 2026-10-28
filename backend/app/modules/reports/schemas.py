import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class WeeklyTrendItem(BaseModel):
    label: str
    percentage: float


class DepartmentSummaryResponse(BaseModel):
    total_students: int
    total_staff: int
    today_attendance_percentage: float
    overall_attendance_percentage: float
    students_below_75_count: int
    active_courses_count: int
    total_sessions_conducted: int
    weekly_trend: List[WeeklyTrendItem] = []


class DefaulterStudentOut(BaseModel):
    student_id: int
    user_id: int
    name: str
    register_number: str
    roll_number: str
    department: str
    section: str
    attended_sessions: int
    total_sessions: int
    percentage: float
    mentor_name: Optional[str] = None
    mentor_id: Optional[int] = None
    critical_alert: bool = False


class DefaultersResponse(BaseModel):
    threshold: float
    defaulters_count: int
    students: List[DefaulterStudentOut] = []


class FacultyCourseItem(BaseModel):
    code: str
    title: str
    section: str
    credits: int
    type: str  # Core Theory, Practical Lab


class FacultyWorkloadItem(BaseModel):
    faculty_id: str
    staff_id: int
    user_id: int
    name: str
    designation: str
    department: str
    cabin: Optional[str] = None
    email: str
    total_credits: int
    total_hours_per_week: int
    courses_count: int
    mentees_count: int
    capacity: int
    courses: List[FacultyCourseItem] = []


class FacultyWorkloadResponse(BaseModel):
    total_faculty: int
    average_hours_per_week: float
    faculty: List[FacultyWorkloadItem] = []

