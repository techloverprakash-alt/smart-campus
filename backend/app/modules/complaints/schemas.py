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


class IssueCategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    default_priority: str


class ComplaintCreate(BaseModel):
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    title: str = Field(..., min_length=3, description="Summary or subject of the complaint")
    description: str = Field(..., min_length=5, description="Full details of the complaint")
    priority: Optional[str] = Field(default="MEDIUM", description="LOW, MEDIUM, HIGH, URGENT")
    room_identifier: Optional[str] = None
    location_id: Optional[int] = None


class ComplaintStatusUpdate(BaseModel):
    status: str = Field(..., description="OPEN, IN_PROGRESS, RESOLVED, REJECTED")
    admin_remarks: Optional[str] = Field(default=None, description="Resolution notes from Admin")


class StudentDetailOut(BaseModel):
    register_number: Optional[str] = None
    roll_number: Optional[str] = None
    department: Optional[str] = None
    section: Optional[str] = None


class StaffDetailOut(BaseModel):
    faculty_id: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    cabin_number: Optional[str] = None


class ComplaintReporterOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    identifier: str
    student_details: Optional[StudentDetailOut] = None
    staff_details: Optional[StaffDetailOut] = None


class ComplaintOut(BaseModel):
    id: int
    ticket_number: str
    title: Optional[str] = None
    description: str
    priority: str
    status: str
    category_id: int
    category_name: str
    location_id: Optional[int] = None
    location_name: Optional[str] = None
    room_identifier: Optional[str] = None
    admin_remarks: Optional[str] = None
    created_at: str
    resolved_at: Optional[str] = None
    reporter: ComplaintReporterOut


