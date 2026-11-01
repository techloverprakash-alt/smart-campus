import csv
import io
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.access.permissions import require_role
from app.database import get_db
from app.modules.auth.models import User
from app.modules.complaints.schemas import (
    ComplaintCreate,
    ComplaintOut,
    ComplaintStatusUpdate,
    ControlCenterSummaryResponse,
    EmergencyBroadcastCreate,
    EmergencyBroadcastOut,
    IncidentTicketOut,
    IssueCategoryOut,
)
from app.modules.complaints.service import ComplaintService, ControlCenterService

logger = logging.getLogger("smart_campus.control_center_router")

control_center_router = APIRouter(tags=["Campus Administrator Control Center"])
complaints_router = APIRouter(tags=["Complaints & Grievances"])


@control_center_router.get(
    "/summary",
    summary="Get central command telemetry, building incidents, and SLA metrics"
)
def get_control_center_summary(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns real PostgreSQL building breakdown, SLA compliance, and work order progress.
    """
    service = ControlCenterService(db)
    summary = service.get_summary()
    d = summary.model_dump()
    return {"data": d, **d}


@control_center_router.get(
    "/incidents",
    summary="Get list of real maintenance incidents and repair tickets"
)
def get_control_center_incidents(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns real incident tickets logged across campus departments.
    """
    service = ControlCenterService(db)
    incidents = service.list_incidents()
    d_list = [i.model_dump() for i in incidents]
    return {"data": d_list, "incidents": d_list}


@control_center_router.post(
    "/broadcast",
    response_model=EmergencyBroadcastOut,
    summary="Dispatch campus emergency push alert bulletin"
)
def create_emergency_broadcast(
    payload: EmergencyBroadcastCreate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Persists emergency bulletin to PostgreSQL emergency_broadcasts and triggers notifications.
    """
    service = ControlCenterService(db)
    return service.create_emergency_broadcast(payload, current_user.id)


@control_center_router.get(
    "/export-csv",
    summary="Export central command incident and telemetry report to CSV"
)
def export_control_center_csv(
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Streams CSV report of building incidents and maintenance requests.
    """
    service = ControlCenterService(db)
    summary = service.get_summary()
    incidents = service.list_incidents()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Complaints", summary.total_complaints])
    writer.writerow(["Pending Staff Assignment", summary.pending_staff_assignment])
    writer.writerow(["Resolution Rate", f"{summary.resolution_rate}%"])
    writer.writerow(["Lost & Found Recovery", f"{summary.lost_found_recovery_rate}%"])
    writer.writerow(["Target SLA Adherence", f"{summary.target_sla_adherence}%"])
    writer.writerow(["Current SLA Adherence", f"{summary.current_sla_adherence}%"])
    writer.writerow([])

    writer.writerow(["Building", "Incidents Count"])
    for b in summary.building_breakdown:
        writer.writerow([b.name, b.incidents])
    writer.writerow([])

    writer.writerow(["Request ID", "Category", "Detail", "Location", "Priority", "Status", "Assignee"])
    for inc in incidents:
        writer.writerow([inc.id, inc.category, inc.detail, inc.location, inc.priority, inc.status, inc.assignee])

    csv_text = output.getvalue()
    return PlainTextResponse(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nexus-campus-report.csv"},
    )


# =============================================================================
# Complaints & Personal Grievance API Endpoints
# =============================================================================

@complaints_router.get("/categories", summary="List complaint & issue categories")
def get_complaint_categories(
    current_user: User = Depends(require_role(["STUDENT", "STAFF", "ADMIN"])),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)
    categories = service.list_categories()
    return {"data": [c.model_dump() for c in categories]}


@complaints_router.get("", summary="List complaints (scoped to user or all for admin)")
def list_complaints(
    role: Optional[str] = Query(None, description="Filter by reporter role: STUDENT, STAFF"),
    status: Optional[str] = Query(None, description="Filter by status: OPEN, IN_PROGRESS, RESOLVED, REJECTED, ALL"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search keyword in ticket, description, or submitter"),
    current_user: User = Depends(require_role(["STUDENT", "STAFF", "ADMIN"])),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)
    items = service.list_complaints(
        current_user=current_user,
        role=role,
        status=status,
        category_id=category_id,
        search=search,
    )
    d_list = [c.model_dump() for c in items]
    return {"data": d_list, "total": len(d_list)}


@complaints_router.post("", status_code=status.HTTP_201_CREATED, summary="Submit a new complaint or grievance")
def create_complaint(
    payload: ComplaintCreate,
    current_user: User = Depends(require_role(["STUDENT", "STAFF", "ADMIN"])),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)
    complaint = service.create_complaint(current_user=current_user, data=payload)
    return {"data": complaint.model_dump(), "message": "Complaint submitted successfully."}


@complaints_router.get("/{complaint_id}", summary="Get complaint details by ID")
def get_complaint_detail(
    complaint_id: int,
    current_user: User = Depends(require_role(["STUDENT", "STAFF", "ADMIN"])),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)
    complaint = service.get_complaint(complaint_id=complaint_id, current_user=current_user)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint ticket not found or access denied.",
        )
    return {"data": complaint.model_dump()}


@complaints_router.patch("/{complaint_id}", summary="Update complaint status & admin resolution remarks")
def update_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)
    updated = service.update_complaint_status(
        complaint_id=complaint_id,
        current_user=current_user,
        data=payload,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint ticket not found.",
        )
    return {"data": updated.model_dump(), "message": "Complaint status updated successfully."}


