import csv
import io
import logging
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.access.permissions import require_role
from app.database import get_db
from app.modules.auth.models import User
from app.modules.complaints.schemas import (
    ControlCenterSummaryResponse,
    EmergencyBroadcastCreate,
    EmergencyBroadcastOut,
    IncidentTicketOut,
)
from app.modules.complaints.service import ControlCenterService

logger = logging.getLogger("smart_campus.control_center_router")

control_center_router = APIRouter(tags=["Campus Administrator Control Center"])


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

