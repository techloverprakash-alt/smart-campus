import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.access.permissions import require_role
from app.database import get_db
from app.modules.auth.models import User
from app.modules.reports.schemas import (
    DefaultersResponse,
    DepartmentSummaryResponse,
    FacultyWorkloadResponse,
)
from app.modules.reports.service import ReportsService

logger = logging.getLogger("smart_campus.reports_router")

reports_router = APIRouter(tags=["Institutional Reports & Analytics"])


@reports_router.get(
    "/department/summary",
    summary="Get institutional department summary and attendance KPIs"
)
def get_department_summary(
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Returns live institutional KPIs from Supabase PostgreSQL:
    - total_students, total_staff
    - today_attendance_percentage
    - overall_attendance_percentage
    - students_below_75_count
    - weekly_trend (Mon-Fri real data)
    """
    service = ReportsService(db)
    summary = service.get_department_summary()
    d = summary.model_dump()
    return {"data": d, **d}


@reports_router.get(
    "/attendance/defaulters",
    summary="Get attendance defaulters list below configured threshold"
)
def get_attendance_defaulters(
    threshold: float = Query(75.0, description="Attendance threshold percentage"),
    section_id: Optional[int] = Query(None, description="Optional section filter"),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Returns list of students below threshold with real attended vs total sessions.
    """
    service = ReportsService(db)
    res = service.get_attendance_defaulters(threshold=threshold, section_id=section_id)
    d = res.model_dump()
    return {"data": d, **d}


@reports_router.get(
    "/faculty/workload",
    summary="Get faculty teaching credit hours and workload breakdown"
)
def get_faculty_workload(
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Audits teaching workload, theory/lab offerings, and mentee quotas across all faculty.
    """
    service = ReportsService(db)
    res = service.get_faculty_workload()
    d = res.model_dump()
    return {"data": d, **d}

