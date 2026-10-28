from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class SubjectAttendanceDetail(BaseModel):
    course_code: str
    course_name: str
    credits: str = "3 Credits"
    staff_name: str = "Faculty"
    total_hours: int = 0
    attended_hours: int = 0
    absent_hours: int = 0
    od_hours: int = 0
    percentage: float = 0.0
    max_absences_allowed: int = 0
    status: str = "Status: Safe"


class StudentAttendanceSummaryResponse(BaseModel):
    overall_percentage: float = 0.0
    total_sessions: int = 0
    total_days: int = 0
    total_conducted_hours: int = 0
    total_attended_hours: int = 0
    total_conducted_days: int = 0
    total_attended_days: int = 0
    total_absent_days: int = 0
    present_sessions: int = 0
    present_days: int = 0
    effective_present_days: int = 0
    effective_present_sessions: int = 0
    actual_present_days: int = 0
    absent_sessions: int = 0
    absent_days: int = 0
    od_sessions: int = 0
    od_days: int = 0
    on_duty_days: int = 0
    on_duty_sessions: int = 0
    can_miss: int = 0
    status: str = "Safe Zone"
    subjects: List[SubjectAttendanceDetail] = []


class StudentRosterItem(BaseModel):
    student_id: int
    full_name: str
    roll_no: str
    register_number: str
    existing_status: str = "PRESENT"


class SessionRosterResponse(BaseModel):
    session_id: Optional[int] = None
    timetable_entry_id: Optional[int] = None
    date: str
    course_code: str
    course_name: str
    section_name: str
    room_name: str
    students: List[StudentRosterItem] = []


class RecordSubmitItem(BaseModel):
    student_id: int
    status: str  # PRESENT, ABSENT, OD
    remarks: Optional[str] = None


class AttendanceSubmitRequest(BaseModel):
    timetable_entry_id: int
    marking_date: str
    records: List[RecordSubmitItem]


class AttendanceHistoryItem(BaseModel):
    id: int
    course: Optional[str] = None
    course_code: str
    subject_code: Optional[str] = None
    course_name: str
    subject_name: Optional[str] = None
    date: str
    marking_date: Optional[str] = None
    attendance_date: str
    period: Optional[str] = None
    period_number: Optional[int] = None
    present: Optional[int] = None
    present_count: int = 0
    total: Optional[int] = None
    total_students: int = 0
    total_count: Optional[int] = None
    marked_by: str = ""
    marked_by_name: Optional[str] = None
    staff: Optional[str] = None
    status: str = "pending"


class AttendanceHistoryResponse(BaseModel):
    success: bool = True
    sessions: List[AttendanceHistoryItem] = []
    data: List[AttendanceHistoryItem] = []


class TimetableSlotItem(BaseModel):
    id: str
    period: str
    period_number: int
    start_time: str
    end_time: str
    time: str
    title: str
    subject_name: str
    code: str
    course_code: str
    type: str = "Theory"
    room: str = "Room 302"
    room_name: str = "Room 302"
    section_name: str = ""
    faculty: str = "Faculty"
    staff_name: str = "Faculty"
    attendance_marked: bool = False
    status: str = "UPCOMING"
    is_break: bool = False


class TodayScheduleResponse(BaseModel):
    day: str
    date: str
    schedule: List[TimetableSlotItem] = []


class WeeklyDaySchedule(BaseModel):
    day: str
    slots: List[TimetableSlotItem] = []


class WeeklyTimetableResponse(BaseModel):
    department: str
    semester: int
    section: str
    schedule: List[WeeklyDaySchedule] = []
    rows: List[List[Any]] = []
    weeklySchedule: Optional[List[Dict[str, Any]]] = []
    weekly_grid: Optional[List[Dict[str, Any]]] = []
