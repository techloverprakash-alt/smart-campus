import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class IncidentTicketOut(BaseModel):
    id: str
    numeric_id: int
    category: str
    detail: str
    location: str
    room_identifier: Optional[str] = None
    priority: str
    status: str
    assignee: str
    reported_by_name: str
    created_at: str
    time_ago: str
    resolved_at: Optional[str] = None


class BuildingIncidentStats(BaseModel):
    name: str
    incidents: int
    highest: bool = False
    values: List[int] = []


class CategoryBreakdownItem(BaseModel):
    label: str
    color: str
    count: int
    percent: float


class StatusBreakdownItem(BaseModel):
    label: str
    count: int
    percent: float
    color: str


class ControlCenterSummaryResponse(BaseModel):
    total_complaints: int
    pending_staff_assignment: int
    resolution_rate: float
    lost_found_recovery_rate: float
    target_sla_adherence: float
    current_sla_adherence: float
    building_breakdown: List[BuildingIncidentStats] = []
    category_breakdown: List[CategoryBreakdownItem] = []
    status_breakdown: List[StatusBreakdownItem] = []


class EmergencyBroadcastCreate(BaseModel):
    message: str = Field(..., min_length=5, description="Broadcast alert message")
    target_audience: str = Field(default="All Campus Devices", description="Target devices/roles")


class EmergencyBroadcastOut(BaseModel):
    id: int
    message: str
    target_audience: str
    status: str
    created_by: Optional[int] = None
    created_at: str
    sent_at: Optional[str] = None


class AssignIncidentRequest(BaseModel):
    complaint_id: int
    technician_user_id: int
    diagnostic_note: Optional[str] = None

