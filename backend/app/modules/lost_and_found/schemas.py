from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar, Union
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = "Operation successful"
    data: Optional[T] = None


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=64, description="Category name (e.g. Electronics & Audio, ID Cards & Wallets)")
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: Union[int, str]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Location Schemas ---
class LocationBase(BaseModel):
    name: str
    building: Optional[str] = None
    floor: Optional[str] = None
    zone: Optional[str] = None
    location_type: Optional[str] = None


class LocationCreate(LocationBase):
    pass


class LocationOut(LocationBase):
    id: Union[int, str]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Media Schemas ---
class ReportMediaOut(BaseModel):
    id: Union[int, str]
    lost_report_id: Optional[Union[int, str]] = None
    found_report_id: Optional[Union[int, str]] = None
    media_id: Optional[Union[int, str]] = None
    media_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Lost Report Schemas ---
class LostReportCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    category_id: Union[int, str]
    last_seen_location_id: Optional[Union[int, str]] = None
    last_seen_location_name: Optional[str] = None
    brand_model: Optional[str] = None
    description: str = Field(..., min_length=5)
    lost_at: Optional[datetime] = None
    reward_text: Optional[str] = None
    image_url: Optional[str] = None
    media_urls: Optional[List[str]] = None


class LostReportUpdate(BaseModel):
    title: Optional[str] = None
    brand_model: Optional[str] = None
    description: Optional[str] = None
    last_seen_location_id: Optional[Union[int, str]] = None
    status: Optional[str] = None


class LostReportOut(BaseModel):
    id: Union[int, str]
    reporter_id: Union[int, str]
    reporter_name: Optional[str] = None
    category_id: Union[int, str]
    category_name: Optional[str] = None
    last_seen_location_id: Optional[Union[int, str]] = None
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
    category_id: Union[int, str]
    found_location_id: Optional[Union[int, str]] = None
    found_location_name: Optional[str] = None
    description: str = Field(..., min_length=5)
    found_at: Optional[datetime] = None
    custody_desk: str = Field(default="Admin Ground Floor Custody Desk")
    inventory_tag: Optional[str] = None  # System auto-generates if missing
    storage_status: Optional[str] = "IN_CUSTODY"
    image_url: Optional[str] = None
    media_urls: Optional[List[str]] = None


class FoundReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    storage_status: Optional[str] = None
    custody_desk: Optional[str] = None


class FoundReportOut(BaseModel):
    id: Union[int, str]
    reported_by: Union[int, str]
    finder_name: Optional[str] = None
    category_id: Union[int, str]
    category_name: Optional[str] = None
    found_location_id: Optional[Union[int, str]] = None
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
class FoundRequestCreate(BaseModel):
    title: Optional[str] = None
    description: str = Field(..., min_length=3, description="Where and how the item was found")
    found_location_id: Optional[Union[int, str]] = None
    found_location_name: Optional[str] = None
    custody_desk: Optional[str] = "Admin Ground Floor Custody Desk"
    image_url: Optional[str] = None
    finder_notes: Optional[str] = None


class MoveToVerificationRequest(BaseModel):
    owner_response: Optional[str] = Field(None, description="Owner's proof, secret mark, or description")
    challenge_question: Optional[str] = "Confirm unique markings, color shade, or specific contents."
    officer_notes: Optional[str] = None


class SimilarFoundItemOut(BaseModel):
    found_report: FoundReportOut
    similarity_score: float  # e.g. 0.94 (94%)
    text_similarity: Optional[float] = None
    image_similarity: Optional[float] = None
    match_id: Optional[Union[int, str]] = None


class MatchVerificationOut(BaseModel):
    id: Union[int, str]
    match_id: Union[int, str]
    challenge_question: str
    owner_response: Optional[str] = None
    officer_notes: Optional[str] = None
    concordance_score: Optional[float] = None
    verified_by: Optional[Union[int, str]] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemMatchOut(BaseModel):
    id: Union[int, str]
    lost_report_id: Union[int, str]
    found_report_id: Union[int, str]
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
    lost_report_id: Optional[Union[int, str]] = None
    found_report_id: Optional[Union[int, str]] = None
    top_k: int = Field(default=5, ge=1, le=20)


class VerificationCreate(BaseModel):
    challenge_question: str
    owner_response: Optional[str] = None
    officer_notes: Optional[str] = None
    concordance_score: Optional[float] = Field(default=95.0, ge=0.0, le=100.0)
    status: Optional[str] = "APPROVED"


# --- Claim & Handover Schemas ---
class ClaimCreate(BaseModel):
    found_report_id: Union[int, str]
    lost_report_id: Optional[Union[int, str]] = None
    verification_notes: Optional[str] = None


class ClaimReview(BaseModel):
    status: str = Field(..., pattern="^(APPROVED|REJECTED)$")
    review_notes: Optional[str] = None


class ItemClaimOut(BaseModel):
    id: Union[int, str]
    found_report_id: Union[int, str]
    lost_report_id: Optional[Union[int, str]] = None
    claimed_by: Union[int, str]
    claimant_name: Optional[str] = None
    status: str
    reviewed_by: Optional[Union[int, str]] = None
    found_report: Optional[FoundReportOut] = None
    lost_report: Optional[LostReportOut] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HandoverCreate(BaseModel):
    claim_id: Union[int, str]
    received_by: Optional[Union[int, str]] = None
    handover_location_id: Optional[Union[int, str]] = None
    handover_notes: Optional[str] = None


class ItemHandoverOut(BaseModel):
    id: Union[int, str]
    claim_id: Union[int, str]
    handed_over_by: Optional[Union[int, str]] = None
    officer_name: Optional[str] = None
    received_by: Union[int, str]
    receiver_name: Optional[str] = None
    handover_location_id: Optional[Union[int, str]] = None
    location_name: Optional[str] = None
    handed_over_at: datetime
    pickup_pass_tag: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
