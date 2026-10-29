import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.access.permissions import get_current_user, require_role
from app.database import get_db
from app.modules.academic.schemas import (
    CourseOfferingCreate,
    CourseOfferingResponse,
    StaffWorkloadItem,
    SubjectCreate,
    SubjectResponse,
)
from app.modules.academic.service import AcademicService
from app.modules.auth.models import User

logger = logging.getLogger("smart_campus.academic_router")

academic_router = APIRouter(tags=["Academic & Course Allocation Management"])


# =============================================================================
# 1. Subject Master Endpoints
# =============================================================================
@academic_router.get(
    "/subjects",
    response_model=List[SubjectResponse],
    summary="Get all academic subjects with optional department filter",
)
def get_subjects(
    department_id: Optional[int] = Query(None, description="Optional department filter"),
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.get_subjects(department_id=department_id)


@academic_router.post(
    "/subjects",
    response_model=SubjectResponse,
    summary="Admin: Add a new subject to the academic catalog",
)
def create_subject(
    payload: SubjectCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.create_subject(payload)


@academic_router.delete(
    "/subjects/{subject_id}",
    summary="Admin: Delete a subject from catalog",
)
def delete_subject(
    subject_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.delete_subject(subject_id)


# =============================================================================
# 2. Course Offerings / Subject Allocation Endpoints
# =============================================================================
@academic_router.get(
    "/offerings",
    response_model=List[CourseOfferingResponse],
    summary="Get all assigned course offerings with enrolled student counts",
)
def get_course_offerings(
    department_id: Optional[int] = Query(None),
    section_id: Optional[int] = Query(None),
    staff_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.get_course_offerings(
        department_id=department_id,
        section_id=section_id,
        staff_id=staff_id,
    )


@academic_router.post(
    "/offerings",
    response_model=CourseOfferingResponse,
    summary="Admin: Assign subject to staff member and class section",
)
def create_course_offering(
    payload: CourseOfferingCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.create_course_offering(payload)


@academic_router.delete(
    "/offerings/{offering_id}",
    summary="Admin: Unassign / remove subject allocation",
)
def delete_course_offering(
    offering_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.delete_course_offering(offering_id)


# =============================================================================
# 3. Faculty Workload & Metadata
# =============================================================================
@academic_router.get(
    "/staff-workload",
    response_model=List[StaffWorkloadItem],
    summary="Get authoritative faculty workload data for Admin Dashboard",
)
def get_staff_workload(
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.get_staff_workload()


@academic_router.get(
    "/metadata",
    summary="Get academic dropdown options: departments, sections, staff, subjects",
)
def get_academic_metadata(
    db: Session = Depends(get_db),
):
    service = AcademicService(db)
    return service.get_metadata()

