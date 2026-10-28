import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


# =============================================================================
# Study Material Schemas
# =============================================================================
class StudyMaterialBase(BaseModel):
    title: str
    unit_number: Optional[int] = 1
    course_offering_id: Optional[int] = None
    subject_code: Optional[str] = None
    drive_url: Optional[str] = None
    file_id: Optional[int] = None
    academic_year: Optional[str] = "2024-2025"


class StudyMaterialCreate(StudyMaterialBase):
    pass


class StudyMaterialUpdate(BaseModel):
    title: Optional[str] = None
    unit_number: Optional[int] = None
    course_offering_id: Optional[int] = None
    subject_code: Optional[str] = None
    drive_url: Optional[str] = None
    file_id: Optional[int] = None


class StudyMaterialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_offering_id: int
    title: str
    unit_number: Optional[int] = None
    file_id: Optional[int] = None
    uploaded_by: Optional[int] = None
    published_at: datetime.datetime

    # Enriched fields for web & mobile display
    code: Optional[str] = None
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    subject_code: Optional[str] = None
    section_name: Optional[str] = None
    instructor: Optional[str] = None
    file_name: Optional[str] = None
    storage_key: Optional[str] = None
    drive_url: Optional[str] = None
    is_drive_link: bool = False
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    type: str = "PDF"
    unit: str = "Unit 1"
    reads: str = "1.2k reads"


# =============================================================================
# Announcement Schemas
# =============================================================================
class AnnouncementTargetSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    department_id: Optional[int] = None
    section_id: Optional[int] = None
    role_id: Optional[int] = None
    department_name: Optional[str] = None
    section_name: Optional[str] = None
    role_name: Optional[str] = None


class AnnouncementBase(BaseModel):
    title: str
    body: str
    status: str = "PUBLISHED"


class AnnouncementCreate(AnnouncementBase):
    targets: Optional[List[AnnouncementTargetSchema]] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    status: Optional[str] = None


class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    body: str
    created_by: Optional[int] = None
    author_name: Optional[str] = "Campus Administration"
    status: str = "PUBLISHED"
    published_at: datetime.datetime

    # Enriched fields for notices cards
    date: str = "Today"
    tag: str = "ACADEMIC"
    targets: List[AnnouncementTargetSchema] = []

