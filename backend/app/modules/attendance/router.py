import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.access.permissions import get_current_user, require_role
from app.database import get_db
from app.modules.attendance.schemas import (
    AttendanceHistoryResponse,
    AttendanceSubmitRequest,
    SessionRosterResponse,
    StudentAttendanceSummaryResponse,
    TodayScheduleResponse,
    WeeklyTimetableResponse,
)
from app.modules.attendance.service import AttendanceService
from app.modules.auth.models import User

logger = logging.getLogger("smart_campus.attendance_router")

attendance_router = APIRouter(tags=["Attendance Management"])
timetable_router = APIRouter(tags=["Timetable Management"])


# =============================================================================
# Attendance Endpoints
# =============================================================================
@attendance_router.get(
    "/student/summary",
    response_model=StudentAttendanceSummaryResponse,
    summary="Get cumulative student attendance summary and per-subject breakdown"
)
def get_student_attendance_summary(
    student_id: Optional[int] = Query(None, description="Optional target student ID for staff/admin"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns live student attendance summary:
    - Overall cumulative attendance percentage
    - Total days, sessions, present, absent, on-duty
    - Safe-to-miss classes threshold calculation (75% threshold)
    - Subject-wise hours and status breakdown
    """
    service = AttendanceService(db)
    return service.get_student_summary(current_user, student_id)


@attendance_router.get(
    "/session/students",
    response_model=SessionRosterResponse,
    summary="Get student roster for attendance marking in a timetable period"
)
def get_session_roster(
    timetable_entry_id: Optional[int] = Query(None, description="ID of the timetable entry period"),
    date: Optional[str] = Query(None, description="Marking date (YYYY-MM-DD)"),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Returns student roster enrolled in the section for marking attendance.
    Includes any existing saved status (PRESENT, ABSENT, OD).
    """
    service = AttendanceService(db)
    return service.get_session_roster(timetable_entry_id, date, current_user=current_user)


@attendance_router.post(
    "/session/{session_id}/review",
    summary="Review and approve/reject an attendance session"
)
def review_attendance_session(
    session_id: int,
    action: str = Query("approved", description="Action to take: approved, rejected, or pending"),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Approve or reject a submitted attendance session record.
    """
    service = AttendanceService(db)
    return service.review_session(session_id, action, current_user)


@attendance_router.post(
    "/submit",
    summary="Submit and record attendance for a session"
)
def submit_attendance(
    payload: AttendanceSubmitRequest,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Saves or updates attendance session and student attendance records in the database.
    """
    service = AttendanceService(db)
    return service.submit_attendance(current_user, payload)


@attendance_router.get(
    "/history",
    response_model=AttendanceHistoryResponse,
    summary="Get attendance submission history log"
)
def get_attendance_history(
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    limit: int = Query(10, description="Max records to return"),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Returns recent attendance sessions with headcount and submission statuses.
    """
    service = AttendanceService(db)
    return service.get_history(current_user, limit, date)


# =============================================================================
# Timetable Endpoints
# =============================================================================
@timetable_router.get(
    "/today",
    response_model=TodayScheduleResponse,
    summary="Get today's schedule with live period status (DONE/NOW/UPCOMING)"
)
def get_today_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns active daily timetable slots for the logged-in student or faculty member.
    Calculates live period status (DONE, NOW, UPCOMING) and whether attendance is marked.
    """
    service = AttendanceService(db)
    return service.get_today_schedule(current_user)


@timetable_router.get(
    "/weekly",
    response_model=WeeklyTimetableResponse,
    summary="Get weekly timetable schedule matrix"
)
def get_weekly_timetable(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns complete Monday through Friday timetable slots and matrix grid.
    """
    service = AttendanceService(db)
    return service.get_weekly_timetable(current_user)


@timetable_router.post(
    "/entry",
    summary="Admin: Create timetable entry with conflict checks"
)
def create_timetable_entry(
    payload: Dict[str, Any],
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    from app.modules.attendance.schemas import CreateTimetableEntryRequest
    req = CreateTimetableEntryRequest(**payload)
    service = AttendanceService(db)
    return service.create_timetable_entry(req)


@timetable_router.delete(
    "/entry/{entry_id}",
    summary="Admin: Delete a timetable entry"
)
def delete_timetable_entry(
    entry_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AttendanceService(db)
    return service.delete_timetable_entry(entry_id)



@timetable_router.get(
    "/department",
    summary="Admin: Get department timetable grid"
)
def get_department_timetable(
    department_id: Optional[int] = Query(None),
    semester_id: Optional[int] = Query(None),
    section_id: Optional[int] = Query(None),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = AttendanceService(db)
    return service.get_weekly_timetable(current_user)


