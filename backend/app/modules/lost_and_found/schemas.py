from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field


T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = "Operation successful"
    data: Optional[T] = None


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=64, description="Category name (e.g. Electronics, Accessories)")
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Location Schemas ---
class LocationBase(BaseModel):
    name: str
    building: Optional[str] = None
    floor: Optional[str] = None
    zone: Optional[str] = None


class LocationCreate(LocationBase):
    pass


class LocationOut(LocationBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Media Schemas ---
class MediaOut(BaseModel):
    id: str
    file_name: str
    file_url: str
    media_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReportMediaOut(BaseModel):
    id: str
    media_url: Optional[str] = None
    media_item: Optional[MediaOut] = None

    model_config = ConfigDict(from_attributes=True)


# --- Lost Report Schemas ---
class LostReportCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    category_id: str
    last_seen_location_id: Optional[str] = None
    last_seen_location_name: Optional[str] = None  # Friendly zone text if ID not provided
    brand_model: Optional[str] = None
    description: str = Field(..., min_length=5)
    lost_at: Optional[datetime] = None
    reward_text: Optional[str] = None
    image_url: Optional[str] = None


class LostReportUpdate(BaseModel):
    title: Optional[str] = None
    brand_model: Optional[str] = None
    description: Optional[str] = None
    last_seen_location_id: Optional[str] = None
    status: Optional[str] = None


class LostReportOut(BaseModel):
    id: str
    reporter_id: str
    reporter_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    last_seen_location_id: Optional[str] = None
    location_name: Optional[str] = None
    title: str
    brand_model: Optional[str] = None
    description: str
    lost_at: Optional[datetime] = None
    status: str
    media: List[ReportMediaOut] = []
    primary_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Found Report Schemas ---
class FoundReportCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    category_id: str
    found_location_id: Optional[str] = None
    found_location_name: Optional[str] = None
    description: str = Field(..., min_length=5)
    found_at: Optional[datetime] = None
    custody_desk: str = Field(default="Desk 02 (Vault A-14)")
    inventory_tag: Optional[str] = None  # If not given, system generates #SEC-XXX
    storage_status: Optional[str] = "INTAKE_PENDING"
    image_url: Optional[str] = None


class FoundReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    storage_status: Optional[str] = None
    custody_desk: Optional[str] = None


class FoundReportOut(BaseModel):
    id: str
    reported_by: str
    finder_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    found_location_id: Optional[str] = None
    location_name: Optional[str] = None
    title: str
    description: str
    found_at: Optional[datetime] = None
    custody_desk: str
    inventory_tag: str
    storage_status: str
    media: List[ReportMediaOut] = []
    primary_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Match Schemas ---
class MatchVerificationOut(BaseModel):
    id: str
    match_id: str
    challenge_question: str
    owner_response: Optional[str] = None
    officer_notes: Optional[str] = None
    concordance_score: Optional[float] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemMatchOut(BaseModel):
    id: str
    lost_report_id: str
    found_report_id: str
    lost_report: Optional[LostReportOut] = None
    found_report: Optional[FoundReportOut] = None
    text_similarity: Optional[float] = None
    image_similarity: Optional[float] = None
    combined_score: float
    criteria_json: Optional[str] = None
    criteria_list: Optional[List[Dict[str, Any]]] = None
    status: str
    verifications: List[MatchVerificationOut] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RunMatchingRequest(BaseModel):
    lost_report_id: Optional[str] = None
    found_report_id: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)


class VerificationCreate(BaseModel):
    challenge_question: str
    owner_response: Optional[str] = None
    officer_notes: Optional[str] = None
    concordance_score: Optional[float] = Field(default=100.0, ge=0.0, le=100.0)


# --- Claim & Handover Schemas ---
class ClaimCreate(BaseModel):
    found_report_id: str
    lost_report_id: Optional[str] = None
    verification_notes: Optional[str] = None


class ClaimReview(BaseModel):
    status: str = Field(..., pattern="^(APPROVED|REJECTED)$")
    review_notes: Optional[str] = None


class ItemClaimOut(BaseModel):
    id: str
    found_report_id: str
    lost_report_id: Optional[str] = None
    claimed_by: str
    claimant_name: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HandoverCreate(BaseModel):
    claim_id: str
    received_by: Optional[str] = None
    handover_location_id: Optional[str] = None


class ItemHandoverOut(BaseModel):
    id: str
    claim_id: str
    handed_over_by: Optional[str] = None
    officer_name: Optional[str] = None
    received_by: str
    receiver_name: Optional[str] = None
    handover_location_id: Optional[str] = None
    location_name: Optional[str] = None
    handed_over_at: datetime
    pickup_pass_tag: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
