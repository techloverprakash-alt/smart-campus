import json
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.access.permissions import check_ownership_or_admin, get_current_user, require_role
from app.database import get_db
from app.infrastructure.storage import storage_adapter
from app.modules.core.models import User
from app.modules.lost_and_found.models import (
    FoundReport,
    ItemCategory,
    ItemClaim,
    ItemHandover,
    ItemMatch,
    LostReport,
    MatchVerification,
)
from app.modules.lost_and_found.repository import LostAndFoundRepository
from app.modules.lost_and_found.schemas import (
    CategoryCreate,
    CategoryOut,
    ClaimCreate,
    ClaimReview,
    FoundReportCreate,
    FoundReportOut,
    FoundReportUpdate,
    HandoverCreate,
    ItemClaimOut,
    ItemHandoverOut,
    ItemMatchOut,
    LocationOut,
    LostReportCreate,
    LostReportOut,
    LostReportUpdate,
    MatchVerificationOut,
    ReportMediaOut,
    RunMatchingRequest,
    StandardResponse,
    VerificationCreate,
)
from app.modules.lost_and_found.service import LostAndFoundService

router = APIRouter(prefix="", tags=["Lost and Found System"])


def format_lost_report(r: LostReport) -> LostReportOut:
    media_list = [
        ReportMediaOut(id=m.id, media_url=m.media_url) for m in (r.media or [])
    ]
    primary_img = media_list[0].media_url if media_list else None
    return LostReportOut(
        id=r.id,
        reporter_id=r.reporter_id,
        reporter_name=r.reporter.full_name if r.reporter else None,
        category_id=r.category_id,
        category_name=r.category.name if r.category else None,
        last_seen_location_id=r.last_seen_location_id,
        location_name=r.last_seen_location.name if r.last_seen_location else None,
        title=r.title,
        brand_model=r.brand_model,
        description=r.description,
        lost_at=r.lost_at,
        status=r.status,
        media=media_list,
        primary_image_url=primary_img,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


def format_found_report(r: FoundReport) -> FoundReportOut:
    media_list = [
        ReportMediaOut(id=m.id, media_url=m.media_url) for m in (r.media or [])
    ]
    primary_img = media_list[0].media_url if media_list else None
    return FoundReportOut(
        id=r.id,
        reported_by=r.reported_by,
        finder_name=r.finder.full_name if r.finder else None,
        category_id=r.category_id,
        category_name=r.category.name if r.category else None,
        found_location_id=r.found_location_id,
        location_name=r.found_location.name if r.found_location else None,
        title=r.title,
        description=r.description,
        found_at=r.found_at,
        custody_desk=r.custody_desk,
        inventory_tag=r.inventory_tag,
        storage_status=r.storage_status,
        media=media_list,
        primary_image_url=primary_img,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


def format_match(m: ItemMatch) -> ItemMatchOut:
    crit_list = []
    if m.criteria_json:
        try:
            crit_list = json.loads(m.criteria_json)
        except Exception:
            crit_list = []

    ver_list = [
        MatchVerificationOut(
            id=v.id,
            match_id=v.match_id,
            challenge_question=v.challenge_question,
            owner_response=v.owner_response,
            officer_notes=v.officer_notes,
            concordance_score=v.concordance_score,
            status=v.status,
            created_at=v.created_at
        ) for v in (m.verifications or [])
    ]

    return ItemMatchOut(
        id=m.id,
        lost_report_id=m.lost_report_id,
        found_report_id=m.found_report_id,
        lost_report=format_lost_report(m.lost_report) if m.lost_report else None,
        found_report=format_found_report(m.found_report) if m.found_report else None,
        text_similarity=m.text_similarity,
        image_similarity=m.image_similarity,
        combined_score=m.combined_score,
        criteria_json=m.criteria_json,
        criteria_list=crit_list,
        status=m.status,
        verifications=ver_list,
        created_at=m.created_at
    )


# =============================================================================
# Categories & Locations (Tables 34 & Supporting)
# =============================================================================

@router.get("/categories", response_model=StandardResponse[List[CategoryOut]])
def list_categories(db: Session = Depends(get_db)):
    """List all available item categories."""
    repo = LostAndFoundRepository(db)
    cats = repo.list_categories()
    return StandardResponse(data=[CategoryOut.model_validate(c) for c in cats])


@router.post("/categories", response_model=StandardResponse[CategoryOut], status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "OFFICER", "STAFF"]))
):
    """Admin / Officer: add a new item category."""
    repo = LostAndFoundRepository(db)
    existing = repo.get_category_by_name(payload.name)
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{payload.name}' already exists.")
    cat = repo.create_category(payload.name, payload.description)
    return StandardResponse(data=CategoryOut.model_validate(cat), message="Category created.")


@router.get("/locations", response_model=StandardResponse[List[LocationOut]])
def list_locations(db: Session = Depends(get_db)):
    """List campus locations and zones."""
    repo = LostAndFoundRepository(db)
    locs = repo.list_locations()
    return StandardResponse(data=[LocationOut.model_validate(l) for l in locs])


# =============================================================================
# Lost Reports (Table 35)
# =============================================================================

@router.post("/lost", response_model=StandardResponse[LostReportOut], status_code=status.HTTP_201_CREATED)
def create_lost_report(
    payload: LostReportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Submit a new lost item report."""
    service = LostAndFoundService(db)
    report = service.submit_lost_report(payload, reporter_id=user.id)
    return StandardResponse(data=format_lost_report(report), message="Lost report registered.")


@router.get("/lost", response_model=StandardResponse[List[LostReportOut]])
def list_lost_reports(
    category_id: Optional[str] = Query(None),
    location_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    reporter_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Browse lost item reports."""
    repo = LostAndFoundRepository(db)
    reports = repo.list_lost_reports(
        category_id=category_id,
        location_id=location_id,
        status=status,
        reporter_id=reporter_id,
        search=search,
        limit=limit,
        offset=offset
    )
    return StandardResponse(data=[format_lost_report(r) for r in reports])


@router.get("/lost/{id}", response_model=StandardResponse[LostReportOut])
def get_lost_report(id: str, db: Session = Depends(get_db)):
    """Retrieve details of a single lost report."""
    repo = LostAndFoundRepository(db)
    report = repo.get_lost_report(id)
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found.")
    return StandardResponse(data=format_lost_report(report))


@router.patch("/lost/{id}", response_model=StandardResponse[LostReportOut])
def update_lost_report(
    id: str,
    payload: LostReportUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update details of a lost report (Owner or Admin)."""
    repo = LostAndFoundRepository(db)
    report = repo.get_lost_report(id)
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found.")
    check_ownership_or_admin(report.reporter_id, user)
    updated = repo.update_lost_report(id, payload.model_dump(exclude_unset=True))
    return StandardResponse(data=format_lost_report(updated), message="Report updated.")


@router.delete("/lost/{id}", response_model=StandardResponse[dict])
def delete_lost_report(
    id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete or withdraw a lost report (Owner or Admin)."""
    repo = LostAndFoundRepository(db)
    report = repo.get_lost_report(id)
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found.")
    check_ownership_or_admin(report.reporter_id, user)
    repo.delete_lost_report(id)
    return StandardResponse(data={"deleted_id": id}, message="Report removed.")


# =============================================================================
# Found Reports (Table 36)
# =============================================================================

@router.post("/found", response_model=StandardResponse[FoundReportOut], status_code=status.HTTP_201_CREATED)
def create_found_report(
    payload: FoundReportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Record a found item intake and custody deposit."""
    service = LostAndFoundService(db)
    report = service.submit_found_report(payload, reported_by=user.id)
    return StandardResponse(data=format_found_report(report), message="Found item intake logged.")


@router.get("/found", response_model=StandardResponse[List[FoundReportOut]])
def list_found_reports(
    category_id: Optional[str] = Query(None),
    location_id: Optional[str] = Query(None),
    storage_status: Optional[str] = Query(None),
    reported_by: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Browse found items custody registry."""
    repo = LostAndFoundRepository(db)
    reports = repo.list_found_reports(
        category_id=category_id,
        location_id=location_id,
        storage_status=storage_status,
        reported_by=reported_by,
        search=search,
        limit=limit,
        offset=offset
    )
    return StandardResponse(data=[format_found_report(r) for r in reports])


@router.get("/found/{id}", response_model=StandardResponse[FoundReportOut])
def get_found_report(id: str, db: Session = Depends(get_db)):
    """Retrieve details of a found item report."""
    repo = LostAndFoundRepository(db)
    report = repo.get_found_report(id)
    if not report:
        raise HTTPException(status_code=404, detail="Found report not found.")
    return StandardResponse(data=format_found_report(report))


@router.patch("/found/{id}", response_model=StandardResponse[FoundReportOut])
def update_found_report(
    id: str,
    payload: FoundReportUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "OFFICER", "STAFF"]))
):
    """Update custody status or desk location for a found item."""
    repo = LostAndFoundRepository(db)
    report = repo.get_found_report(id)
    if not report:
        raise HTTPException(status_code=404, detail="Found report not found.")
    updated = repo.update_found_report(id, payload.model_dump(exclude_unset=True))
    return StandardResponse(data=format_found_report(updated), message="Found item record updated.")


# =============================================================================
# AI Matches & Triage (Table 38 & 39)
# =============================================================================

@router.get("/matches", response_model=StandardResponse[List[ItemMatchOut]])
def list_matches(
    lost_report_id: Optional[str] = Query(None),
    found_report_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve candidate AI similarity matches pairing lost and found reports."""
    repo = LostAndFoundRepository(db)
    matches = repo.list_matches(
        lost_report_id=lost_report_id,
        found_report_id=found_report_id,
        user_id=user_id,
        status=status,
        limit=limit
    )
    return StandardResponse(data=[format_match(m) for m in matches])


@router.post("/matches/trigger", response_model=StandardResponse[List[ItemMatchOut]])
def trigger_matching(
    payload: RunMatchingRequest,
    db: Session = Depends(get_db)
):
    """Manually invoke matching evaluation for a specific lost or found report."""
    service = LostAndFoundService(db)
    results = []
    if payload.lost_report_id:
        results = service.evaluate_matches_for_lost(payload.lost_report_id)
    elif payload.found_report_id:
        results = service.evaluate_matches_for_found(payload.found_report_id)
    else:
        raise HTTPException(status_code=400, detail="Provide lost_report_id or found_report_id.")
    return StandardResponse(data=[format_match(m) for m in results], message=f"Evaluated {len(results)} match candidate(s).")


@router.post("/matches/{id}/dismiss", response_model=StandardResponse[dict])
def dismiss_match(
    id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "OFFICER", "STAFF"]))
):
    """Dismiss a false match candidate."""
    repo = LostAndFoundRepository(db)
    match = repo.get_match(id)
    if not match:
        raise HTTPException(status_code=404, detail="Match candidate not found.")
    match.status = "DISMISSED"
    db.commit()
    return StandardResponse(data={"match_id": id, "status": "DISMISSED"}, message="Match candidate dismissed.")


@router.post("/matches/{id}/verify", response_model=StandardResponse[MatchVerificationOut])
def verify_match_challenge(
    id: str,
    payload: VerificationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Record double-blind ownership verification challenge and concordance score."""
    service = LostAndFoundService(db)
    ver = service.record_verification(match_id=id, data=payload, officer_id=user.id)
    return StandardResponse(
        data=MatchVerificationOut(
            id=ver.id,
            match_id=ver.match_id,
            challenge_question=ver.challenge_question,
            owner_response=ver.owner_response,
            officer_notes=ver.officer_notes,
            concordance_score=ver.concordance_score,
            status=ver.status,
            created_at=ver.created_at
        ),
        message="Verification challenge recorded."
    )


# =============================================================================
# Claims & Custody Handovers (Tables 40 & 41)
# =============================================================================

@router.post("/claims", response_model=StandardResponse[ItemClaimOut], status_code=status.HTTP_201_CREATED)
def submit_claim(
    payload: ClaimCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Student / User submits a claim on a found item."""
    service = LostAndFoundService(db)
    claim = service.process_claim(payload, claimed_by=user.id)
    return StandardResponse(
        data=ItemClaimOut(
            id=claim.id,
            found_report_id=claim.found_report_id,
            lost_report_id=claim.lost_report_id,
            claimed_by=claim.claimed_by,
            claimant_name=user.full_name,
            status=claim.status,
            reviewed_by=claim.reviewed_by,
            created_at=claim.created_at,
            updated_at=claim.updated_at
        ),
        message="Item claim submitted."
    )


@router.get("/claims", response_model=StandardResponse[List[ItemClaimOut]])
def list_claims(
    found_report_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """View active claims."""
    repo = LostAndFoundRepository(db)
    claimed_by = user.id if user.role not in ("ADMIN", "OFFICER", "STAFF") else None
    claims = repo.list_claims(found_report_id=found_report_id, claimed_by=claimed_by, status=status)
    return StandardResponse(
        data=[
            ItemClaimOut(
                id=c.id,
                found_report_id=c.found_report_id,
                lost_report_id=c.lost_report_id,
                claimed_by=c.claimed_by,
                claimant_name=c.claimant.full_name if c.claimant else None,
                status=c.status,
                reviewed_by=c.reviewed_by,
                created_at=c.created_at,
                updated_at=c.updated_at
            ) for c in claims
        ]
    )


@router.patch("/claims/{id}/review", response_model=StandardResponse[ItemClaimOut])
def review_claim(
    id: str,
    payload: ClaimReview,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "OFFICER", "STAFF"]))
):
    """Officer / Admin: approve or reject an item claim."""
    repo = LostAndFoundRepository(db)
    claim = repo.review_claim(id, new_status=payload.status, reviewer_id=user.id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    return StandardResponse(
        data=ItemClaimOut(
            id=claim.id,
            found_report_id=claim.found_report_id,
            lost_report_id=claim.lost_report_id,
            claimed_by=claim.claimed_by,
            claimant_name=claim.claimant.full_name if claim.claimant else None,
            status=claim.status,
            reviewed_by=claim.reviewed_by,
            created_at=claim.created_at,
            updated_at=claim.updated_at
        ),
        message=f"Claim {payload.status.lower()}."
    )


@router.post("/handovers", response_model=StandardResponse[ItemHandoverOut], status_code=status.HTTP_201_CREATED)
def complete_handover(
    payload: HandoverCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "OFFICER", "STAFF"]))
):
    """Officer: finalize physical item handover and issue digital pickup pass."""
    service = LostAndFoundService(db)
    try:
        handover = service.complete_handover(payload, officer_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return StandardResponse(
        data=ItemHandoverOut(
            id=handover.id,
            claim_id=handover.claim_id,
            handed_over_by=handover.handed_over_by,
            officer_name=user.full_name,
            received_by=handover.received_by,
            receiver_name=handover.receiver.full_name if handover.receiver else None,
            handover_location_id=handover.handover_location_id,
            location_name=handover.location.name if handover.location else None,
            handed_over_at=handover.handed_over_at,
            pickup_pass_tag=handover.pickup_pass_tag
        ),
        message="Handover release finalized. Digital pickup pass issued."
    )


@router.get("/handovers/{id}", response_model=StandardResponse[ItemHandoverOut])
def get_handover(id: str, db: Session = Depends(get_db)):
    """Retrieve handover details and digital pickup pass."""
    repo = LostAndFoundRepository(db)
    h = repo.get_handover(id)
    if not h:
        raise HTTPException(status_code=404, detail="Handover record not found.")
    return StandardResponse(
        data=ItemHandoverOut(
            id=h.id,
            claim_id=h.claim_id,
            handed_over_by=h.handed_over_by,
            officer_name=h.officer.full_name if h.officer else None,
            received_by=h.received_by,
            receiver_name=h.receiver.full_name if h.receiver else None,
            handover_location_id=h.handover_location_id,
            location_name=h.location.name if h.location else None,
            handed_over_at=h.handed_over_at,
            pickup_pass_tag=h.pickup_pass_tag
        )
    )


# =============================================================================
# Media Upload Endpoint
# =============================================================================

@router.post("/media/upload", response_model=StandardResponse[dict])
async def upload_media_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Upload an item photograph; returns persistent file URL."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are permitted.")
    destination, file_url = await storage_adapter.save_upload(file)
    return StandardResponse(
        data={"file_url": file_url, "file_path": destination, "file_name": file.filename},
        message="Media uploaded successfully."
    )
