import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.access.permissions import get_current_user, require_role
from app.database import get_db
from app.modules.academic.models import AcademicBatch, Department, Section
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    AdminProfileOut,
    AutoDistributeRequest,
    BulkStudentEnrollRequest,
    LoginRequest,
    LogoutRequest,
    MentorAssignRequest,
    MentorUnassignRequest,
    RefreshTokenRequest,
    StaffEnrollRequest,
    StaffProfileOut,
    StudentEnrollRequest,
    StudentProfileOut,
    TokenResponse,
)
from app.modules.auth.service import AuthService

logger = logging.getLogger("smart_campus.auth_router")

auth_router = APIRouter(tags=["Authentication"])
profile_router = APIRouter(tags=["Profiles & Management"])


# =============================================================================
# Authentication Endpoints
# =============================================================================
@auth_router.post("/login", response_model=TokenResponse, summary="User login across roles")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user against database with identifier/email/register_number and password.
    Returns authoritative JWT access token, cryptographically secure refresh token,
    and role-specific user summary.
    """
    service = AuthService(db)
    return service.login(payload)


@auth_router.post("/refresh", summary="Rotate and refresh access token")
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Validates hashed refresh token from database and issues a new access token.
    """
    service = AuthService(db)
    return service.refresh_access_token(payload.refresh_token)


@auth_router.post("/logout", summary="Revoke session tokens")
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    """
    Revokes the provided refresh token in the database.
    """
    service = AuthService(db)
    service.logout(payload.refresh_token)
    return {"success": True, "message": "Successfully logged out."}


# =============================================================================
# Profile Endpoints
# =============================================================================
@profile_router.get("/me", summary="Get logged-in user profile")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authoritative profile for the currently logged-in user.
    Strictly isolated:
    - Students receive their enrollment, register number, CGPA, section, and assigned faculty mentor.
    - Staff receive their faculty profile, designation, cabin, and list of 10 assigned student mentees.
    - Admins receive system governance credentials.
    Returns both a top-level dictionary and a 'data' envelope to satisfy all frontend components.
    """
    service = AuthService(db)
    prof = service.get_profile_dict(current_user)
    # Dual envelope supports both direct prop access (prof.full_name) and data wrapper (res.data.full_name)
    response = dict(prof)
    response["data"] = prof
    return response


@profile_router.patch("/me", summary="Update logged-in user profile")
def update_my_profile(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if "phone" in body:
        current_user.phone = body["phone"]
    if "full_name" in body:
        current_user.full_name = body["full_name"]
    db.commit()
    db.refresh(current_user)

    service = AuthService(db)
    prof = service.get_profile_dict(current_user)
    response = dict(prof)
    response["data"] = prof
    return response


@profile_router.get("/cohort-options", summary="Get options for cohort dropdowns")
def get_cohort_options(
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    """
    Returns dropdown options for student/staff onboarding and allocation directly from database.
    """
    service = AuthService(db)
    mentors = service.get_faculty_mentors()
    depts = db.query(Department).all()
    batches = db.query(AcademicBatch).all()
    secs = db.query(Section).all()
    return {
        "departments": [
            {"id": d.id, "name": d.name, "code": d.code, "degree": d.degree}
            for d in depts
        ],
        "batches": [b.name for b in batches],
        "sections": list(dict.fromkeys([s.name for s in secs])),
        "mentors": mentors,
    }


# =============================================================================
# Admin Student Enrollment Endpoints
# =============================================================================
@profile_router.post("/students", summary="Admin: Enroll single student")
def enroll_student(
    payload: StudentEnrollRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    result = service.enroll_single_student(payload)
    return {"data": result, **result}


@profile_router.post("/students/bulk", summary="Admin: Bulk enroll students")
def bulk_enroll_students(
    payload: BulkStudentEnrollRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    result = service.bulk_enroll_students(payload)
    return {"data": result, **result}


@profile_router.get("/students/template", summary="Download bulk student roster template")
def get_student_template():
    csv_content = (
        "register_number,full_name,email,phone,department_code,batch_name,section_name,date_of_birth,cgpa\n"
        "REG20251021,Rajesh Kumar,rajesh.k@student.edu,+91 98765 00021,CSE,2021-2025,Section A,2004-05-15,8.20\n"
        "REG20251022,Priya Sundaram,priya.s@student.edu,+91 98765 00022,CSE,2021-2025,Section A,2004-08-20,9.15\n"
    )
    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_enrollment_template.csv"},
    )


# =============================================================================
# Admin Staff Onboarding Endpoints
# =============================================================================
@profile_router.post("/staff", summary="Admin: Enroll staff member")
def enroll_staff(
    payload: StaffEnrollRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    result = service.enroll_staff_member(payload)
    return {"data": result, **result}


@profile_router.get("/staff", summary="Admin/Staff: Get all staff members")
def get_all_staff(
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    mentors = service.get_faculty_mentors()
    return {"data": mentors, "staff": mentors}


@profile_router.get("/staff/template", summary="Download staff onboarding template")
def get_staff_template():
    csv_content = (
        "faculty_id,full_name,email,phone,department_name,designation,cabin_number,mentor_capacity\n"
        "FAC-CS-003,Dr. K. Ananth,ananth.k@institution.edu,+91 98452 10845,Computer Science and Engineering,Associate Professor,CS-B206,15\n"
    )
    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=staff_onboarding_template.csv"},
    )


# =============================================================================
# Mentor & Proctor Allocation Endpoints
# =============================================================================
@profile_router.get("/staff/mentors", summary="Get faculty mentors with assignment counts")
def get_faculty_mentors(
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    mentors = service.get_faculty_mentors()
    return mentors


@profile_router.get("/students/allocation", summary="Get students for mentor allocation")
def get_student_allocation(
    department: Optional[str] = Query(None),
    section: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.get_students_allocation(
        section=section,
        status_filter=status,
        search=search,
    )


@profile_router.patch("/students/assign-mentor", summary="Assign students to faculty mentor")
def assign_student_mentor(
    payload: MentorAssignRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    result = service.assign_mentor_to_students(payload.student_ids, payload.faculty_mentor_id)
    return {"data": result, **result}


@profile_router.patch("/students/unassign-mentor", summary="Unassign mentor from students")
def unassign_student_mentor(
    payload: MentorUnassignRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    result = service.unassign_mentor_from_students(payload.student_ids)
    return {"data": result, **result}


@profile_router.post("/students/auto-distribute-mentors", summary="Auto-distribute students across mentors")
def auto_distribute_mentors(
    payload: AutoDistributeRequest,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    result = service.auto_distribute_mentors(payload.department_name)
    return {"data": result, **result}


@profile_router.get("/{user_id}", summary="Get user profile by ID")
def get_user_profile_by_id(
    user_id: int,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    target_user = service.repo.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    prof = service.get_profile_dict(target_user)
    return {"data": prof, **prof}
