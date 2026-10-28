import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.access.permissions import get_current_user, require_role
from app.database import get_db
from app.modules.auth.models import User
from app.modules.materials.schemas import (
    AnnouncementCreate,
    AnnouncementResponse,
    AnnouncementUpdate,
    StudyMaterialCreate,
    StudyMaterialResponse,
    StudyMaterialUpdate,
)
from app.modules.materials.service import AnnouncementService, MaterialService

logger = logging.getLogger("smart_campus.materials_router")

materials_router = APIRouter(prefix="/materials", tags=["Study Materials"])
announcements_router = APIRouter(tags=["Announcements & Circulars"])


# =============================================================================
# Study Materials Endpoints
# =============================================================================
@materials_router.get(
    "",
    response_model=List[StudyMaterialResponse],
    summary="Get study materials, notes, and question papers"
)
def get_materials(
    subject_id: Optional[int] = Query(None, description="Filter by subject ID"),
    section_id: Optional[int] = Query(None, description="Filter by section ID"),
    unit_number: Optional[int] = Query(None, description="Filter by syllabus unit (1-5)"),
    type: Optional[str] = Query(None, description="Filter by type (PDF, NOTES, QP)"),
    limit: int = Query(50, description="Max items to return"),
    offset: int = Query(0, description="Pagination offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = MaterialService(db)
    return service.list_materials(
        current_user=current_user,
        subject_id=subject_id,
        section_id=section_id,
        unit_number=unit_number,
        material_type=type,
        limit=limit,
        offset=offset,
    )


@materials_router.get(
    "/{material_id}",
    response_model=StudyMaterialResponse,
    summary="Get single study material details"
)
def get_material_by_id(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = MaterialService(db)
    return service.get_material_by_id(material_id)


@materials_router.post(
    "",
    response_model=StudyMaterialResponse,
    summary="Staff / Admin: Upload or publish new study material"
)
def create_material(
    payload: StudyMaterialCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = MaterialService(db)
    return service.create_material(current_user, payload)


@materials_router.patch(
    "/{material_id}",
    response_model=StudyMaterialResponse,
    summary="Staff / Admin: Update study material metadata"
)
def update_material(
    material_id: int,
    payload: StudyMaterialUpdate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = MaterialService(db)
    return service.update_material(current_user, material_id, payload)


@materials_router.delete(
    "/{material_id}",
    summary="Staff / Admin: Delete a study material"
)
def delete_material(
    material_id: int,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = MaterialService(db)
    return service.delete_material(current_user, material_id)


# =============================================================================
# Announcements Endpoints
# =============================================================================
@announcements_router.get(
    "/announcements",
    response_model=List[AnnouncementResponse],
    summary="Get announcements and notices"
)
def get_announcements(
    limit: int = Query(20, description="Max notices to return"),
    offset: int = Query(0, description="Offset"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AnnouncementService(db)
    return service.list_announcements(current_user=current_user, limit=limit, offset=offset)


@announcements_router.get(
    "/public/announcements",
    response_model=List[AnnouncementResponse],
    summary="Public: Get campus announcements without authentication"
)
def get_public_announcements(
    limit: int = Query(10, description="Max items"),
    offset: int = Query(0, description="Offset"),
    db: Session = Depends(get_db),
):
    service = AnnouncementService(db)
    return service.list_announcements(current_user=None, limit=limit, offset=offset)


@announcements_router.get(
    "/announcements/{announcement_id}",
    response_model=AnnouncementResponse,
    summary="Get single announcement details"
)
def get_announcement_by_id(
    announcement_id: int,
    db: Session = Depends(get_db),
):
    service = AnnouncementService(db)
    return service.get_announcement_by_id(announcement_id)


@announcements_router.post(
    "/announcements",
    response_model=AnnouncementResponse,
    summary="Admin / Staff: Create a campus circular or announcement"
)
def create_announcement(
    payload: AnnouncementCreate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = AnnouncementService(db)
    return service.create_announcement(current_user, payload)


@announcements_router.patch(
    "/announcements/{announcement_id}",
    response_model=AnnouncementResponse,
    summary="Admin / Staff: Update an announcement"
)
def update_announcement(
    announcement_id: int,
    payload: AnnouncementUpdate,
    current_user: User = Depends(require_role(["ADMIN", "STAFF"])),
    db: Session = Depends(get_db),
):
    service = AnnouncementService(db)
    return service.update_announcement(current_user, announcement_id, payload)


@announcements_router.delete(
    "/announcements/{announcement_id}",
    summary="Admin: Delete an announcement"
)
def delete_announcement(
    announcement_id: int,
    current_user: User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    service = AnnouncementService(db)
    return service.delete_announcement(current_user, announcement_id)

