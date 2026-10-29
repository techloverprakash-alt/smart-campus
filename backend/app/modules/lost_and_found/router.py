import json
from typing import Any, List, Optional, Union
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.access.permissions import check_ownership_or_admin, get_current_user, require_role
from app.database import get_db
from app.infrastructure.storage import storage_adapter
from app.modules.academic.models import CampusLocation, MediaAttachment
from app.modules.auth.models import User
from app.modules.lost_and_found.models import (
    FoundReport,
    ItemCategory,
    ItemClaim,
    ItemHandover,
    ItemMatch,
    LostReport,
    MatchVerification,
    ReportMedia,
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
    FoundRequestCreate,
    HandoverCreate,
    ItemClaimOut,
    ItemHandoverOut,
    ItemMatchOut,
    LocationOut,
    LostReportCreate,
    LostReportOut,
    LostReportUpdate,
    MatchVerificationDetailedOut,
    MatchVerificationOut,
    MoveToVerificationRequest,
    ReportMediaOut,
    RunMatchingRequest,
    SimilarFoundItemOut,
    StandardResponse,
    VerificationCreate,
    VerificationReview,
)
from app.modules.lost_and_found.service import LostAndFoundService

router = APIRouter(prefix="", tags=["Lost and Found System"])


def format_lost_report(r: LostReport) -> LostReportOut:
    media_list = [
        ReportMediaOut(
            id=m.id,
            lost_report_id=m.lost_report_id,
            found_report_id=m.found_report_id,
            media_id=m.media_id,
            media_url=m.media_url,
            created_at=m.created_at,
        )
        for m in (r.media or [])
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
        ReportMediaOut(
            id=m.id,
            lost_report_id=m.lost_report_id,
            found_report_id=m.found_report_id,
            media_id=m.media_id,
            media_url=m.media_url,
            created_at=m.created_at,
        )
        for m in (r.media or [])
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


def format_match(m: ItemMatch, current_user: Optional[User] = None) -> ItemMatchOut:
    crit_list = []
    if m.criteria_json:
        try:
            parsed = json.loads(m.criteria_json)
            if isinstance(parsed, dict):
                for k, v in parsed.items():
                    crit_list.append({"rule": k, "value": v})
            elif isinstance(parsed, list):
                crit_list = parsed
        except Exception:
            pass

    verif_outs = [
        MatchVerificationOut(
            id=v.id,
            match_id=v.match_id,
            challenge_question=v.challenge_question,
            owner_response=v.owner_response,
            officer_notes=v.officer_notes,
            concordance_score=v.concordance_score,
            verified_by=v.verified_by,
            status=v.status,
            created_at=v.created_at,
        )
        for v in (m.verifications or [])
    ]

    lost_out = format_lost_report(m.lost_report) if m.lost_report else None
    found_out = format_found_report(m.found_report) if m.found_report else None

    # Privacy Rule: The finder must not see match scores or private owner contact details.
    # Scores are only exposed to the lost item owner or authorized administrators/HOD.
    combined_score = m.combined_score
    text_sim = m.text_similarity
    img_sim = m.image_similarity
    if current_user and m.lost_report and current_user.id != m.lost_report.reporter_id:
        is_privileged = getattr(current_user, "is_hod", False) or (current_user.primary_role == "ADMIN")
        if not is_privileged:
            combined_score = 0.0
            text_sim = None
            img_sim = None
            crit_list = []
            if lost_out:
                lost_out.reporter_name = "Campus Member"

    return ItemMatchOut(
        id=m.id,
        lost_report_id=m.lost_report_id,
        found_report_id=m.found_report_id,
        lost_report=lost_out,
        found_report=found_out,
        text_similarity=text_sim,
        image_similarity=img_sim,
        combined_score=combined_score,
        criteria_json=m.criteria_json if (not current_user or current_user.primary_role == "ADMIN" or (m.lost_report and current_user.id == m.lost_report.reporter_id)) else None,
        criteria_list=crit_list,
        status=m.status,
        verifications=verif_outs,
        created_at=m.created_at,
    )


def format_claim(c: ItemClaim) -> ItemClaimOut:
    return ItemClaimOut(
        id=c.id,
        found_report_id=c.found_report_id,
        lost_report_id=c.lost_report_id,
        claimed_by=c.claimed_by,
        claimant_name=c.claimant.full_name if c.claimant else None,
        status=c.status,
        reviewed_by=c.reviewed_by,
        found_report=format_found_report(c.found_report) if c.found_report else None,
        lost_report=format_lost_report(c.lost_report) if c.lost_report else None,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


def format_handover(h: ItemHandover) -> ItemHandoverOut:
    return ItemHandoverOut(
        id=h.id,
        claim_id=h.claim_id,
        handed_over_by=h.handed_over_by,
        officer_name=h.officer.full_name if h.officer else None,
        received_by=h.received_by,
        receiver_name=h.receiver.full_name if h.receiver else None,
        handover_location_id=h.handover_location_id,
        location_name=h.location.name if h.location else None,
        handed_over_at=h.handed_over_at,
        pickup_pass_tag=h.pickup_pass_tag,
    )


def format_verification_detailed(v: MatchVerification) -> MatchVerificationDetailedOut:
    m_out = format_match(v.match) if v.match else None
    v_name = v.verifier.full_name if v.verifier else None
    return MatchVerificationDetailedOut(
        id=v.id,
        match_id=v.match_id,
        challenge_question=v.challenge_question,
        owner_response=v.owner_response,
        officer_notes=v.officer_notes,
        concordance_score=v.concordance_score,
        verified_by=v.verified_by,
        verifier_name=v_name,
        status=v.status,
        created_at=v.created_at,
        match=m_out,
    )


# =============================================================================
# Categories & Locations (Tables 34 & 14)
# =============================================================================

@router.get("/categories", response_model=StandardResponse[List[CategoryOut]])
def list_categories(db: Session = Depends(get_db)):
    """List standard Lost and Found item categories."""
    repo = LostAndFoundRepository(db)
    cats = repo.list_categories()
    return StandardResponse(data=[CategoryOut.model_validate(c) for c in cats])


@router.post("/categories", response_model=StandardResponse[CategoryOut], status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF"]))
):
    """Add a new item category (Admin / Staff)."""
    repo = LostAndFoundRepository(db)
    existing = repo.get_category_by_name(payload.name)
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists.")
    cat = repo.create_category(payload.name, payload.description)
    return StandardResponse(data=CategoryOut.model_validate(cat), message="Category created.")


@router.get("/locations", response_model=StandardResponse[List[LocationOut]])
def list_locations(db: Session = Depends(get_db)):
    """List campus locations and zones for report geolocation."""
    repo = LostAndFoundRepository(db)
    locs = repo.list_locations()
    out = [
        LocationOut(
            id=l.id,
            name=l.name,
            location_type=l.location_type,
            building=getattr(l, "description", None),
            zone=l.location_type,
        )
        for l in locs
    ]
    return StandardResponse(data=out)


# =============================================================================
# Lost Reports (Table 35)
# =============================================================================

@router.post("/lost", response_model=StandardResponse[LostReportOut], status_code=status.HTTP_201_CREATED)
def create_lost_report(
    payload: LostReportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Submit a new lost item report with Jina CLIP v2 embedding."""
    service = LostAndFoundService(db)
    report = service.submit_lost_report(payload, reporter_id=user.id)
    return StandardResponse(data=format_lost_report(report), message="Lost report logged successfully.")


@router.get("/lost", response_model=StandardResponse[List[LostReportOut]])
def list_lost_reports(
    reporter_id: Optional[Union[int, str]] = Query(None),
    category_id: Optional[Union[int, str]] = Query(None),
    location_id: Optional[Union[int, str]] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List missing item reports with optional filters."""
    repo = LostAndFoundRepository(db)
    reports = repo.list_lost_reports(
        reporter_id=reporter_id,
        category_id=category_id,
        location_id=location_id,
        status=status,
        search_query=search,
    )
    return StandardResponse(data=[format_lost_report(r) for r in reports])


@router.get("/lost/{report_id}", response_model=StandardResponse[LostReportOut])
def get_lost_report(report_id: Union[int, str], db: Session = Depends(get_db)):
    """Fetch lost report by ID."""
    repo = LostAndFoundRepository(db)
    report = repo.get_lost_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found.")
    return StandardResponse(data=format_lost_report(report))


@router.patch("/lost/{report_id}", response_model=StandardResponse[LostReportOut])
def update_lost_report(
    report_id: Union[int, str],
    payload: LostReportUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update details or status of an existing lost report."""
    repo = LostAndFoundRepository(db)
    report = repo.get_lost_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found.")
    check_ownership_or_admin(report.reporter_id, user)

    updated = repo.update_lost_report(report_id, **payload.model_dump(exclude_unset=True))
    return StandardResponse(data=format_lost_report(updated), message="Report updated.")


@router.delete("/lost/{report_id}", response_model=StandardResponse[dict])
def delete_lost_report(
    report_id: Union[int, str],
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Withdraw or delete a lost report."""
    repo = LostAndFoundRepository(db)
    report = repo.get_lost_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Lost report not found.")
    check_ownership_or_admin(report.reporter_id, user)

    repo.delete_lost_report(report_id)
    return StandardResponse(data={"deleted_id": report_id}, message="Report deleted.")


@router.post("/lost/{report_id}/found-request", response_model=StandardResponse[ItemMatchOut], status_code=status.HTTP_201_CREATED)
def submit_found_request_endpoint(
    report_id: Union[int, str],
    payload: FoundRequestCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Finder action: Touch a reported lost item and send a found discovery request to the owner.
    Creates a candidate match in 'FOUND_REQUEST' status and alerts the lost item reporter.
    """
    service = LostAndFoundService(db)
    try:
        rid = int(report_id)
        match = service.submit_found_request(rid, payload, finder_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return StandardResponse(
        data=format_match(match),
        message="Found request submitted. The lost item owner has been notified to verify."
    )



# =============================================================================
# Found Reports (Table 36)
# =============================================================================

@router.post("/found", response_model=StandardResponse[FoundReportOut], status_code=status.HTTP_201_CREATED)
def create_found_report(
    payload: FoundReportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Register discovered property with Jina CLIP v2 embedding."""
    service = LostAndFoundService(db)
    report = service.submit_found_report(payload, reported_by=user.id)
    return StandardResponse(data=format_found_report(report), message="Found item intake logged.")


@router.get("/found", response_model=StandardResponse[List[FoundReportOut]])
def list_found_reports(
    reported_by: Optional[Union[int, str]] = Query(None),
    category_id: Optional[Union[int, str]] = Query(None),
    location_id: Optional[Union[int, str]] = Query(None),
    storage_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List found property in campus custody."""
    repo = LostAndFoundRepository(db)
    reports = repo.list_found_reports(
        reported_by=reported_by,
        category_id=category_id,
        location_id=location_id,
        storage_status=storage_status,
        search_query=search,
    )
    return StandardResponse(data=[format_found_report(r) for r in reports])


@router.get("/found/{report_id}", response_model=StandardResponse[FoundReportOut])
def get_found_report(report_id: Union[int, str], db: Session = Depends(get_db)):
    """Fetch found item report by ID."""
    repo = LostAndFoundRepository(db)
    report = repo.get_found_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Found report not found.")
    return StandardResponse(data=format_found_report(report))


@router.patch("/found/{report_id}/custody", response_model=StandardResponse[FoundReportOut])
def update_found_custody(
    report_id: Union[int, str],
    payload: FoundReportUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF"]))
):
    """Update found item physical custody or vault state (Admin / Staff)."""
    repo = LostAndFoundRepository(db)
    report = repo.get_found_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Found report not found.")

    updated = repo.update_found_report(report_id, **payload.model_dump(exclude_unset=True))
    return StandardResponse(data=format_found_report(updated), message="Custody updated.")


# =============================================================================
# AI Similarity Candidate Matches & Search (Table 38)
# =============================================================================

@router.get("/similarity-search", response_model=StandardResponse[List[SimilarFoundItemOut]])
def search_similar_found(
    query: str = Query(..., min_length=1, description="Lost item query or description"),
    category_id: Optional[Union[int, str]] = Query(None),
    location_id: Optional[Union[int, str]] = Query(None),
    top_k: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Calculates multimodal/text similarity scores of all existing found items against a lost user's query.
    Used when a found item was turned in BEFORE the lost report was logged.
    """
    service = LostAndFoundService(db)
    raw_results = service.search_similar_found_items(
        query=query,
        category_id=category_id,
        location_id=location_id,
        top_k=top_k
    )
    out = [
        SimilarFoundItemOut(
            found_report=format_found_report(r["found_report"]),
            similarity_score=r["similarity_score"],
            text_similarity=r["text_similarity"],
            image_similarity=r["image_similarity"],
            match_id=r["match_id"]
        )
        for r in raw_results
    ]
    return StandardResponse(data=out, message=f"Found {len(out)} potential match candidates.")


@router.get("/matches", response_model=StandardResponse[List[ItemMatchOut]])
def list_matches(
    lost_report_id: Optional[Union[int, str]] = Query(None),
    found_report_id: Optional[Union[int, str]] = Query(None),
    status: Optional[str] = Query(None),
    user_id: Optional[Union[int, str]] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retrieve candidate matches.
    Admins see all matches across campus.
    Normal students/staff see matches where they are the reporter of the lost item or finder of the found item.
    """
    repo = LostAndFoundRepository(db)
    effective_user_id = user_id
    if user.primary_role not in ("ADMIN", "STAFF") and not user_id:
        effective_user_id = user.id

    matches = repo.list_matches(
        lost_report_id=lost_report_id,
        found_report_id=found_report_id,
        status=status,
        user_id=effective_user_id,
    )
    return StandardResponse(data=[format_match(m, current_user=user) for m in matches])


@router.post("/matches/{match_id}/request-human-verification", response_model=StandardResponse[MatchVerificationOut])
def request_human_verification_endpoint(
    match_id: Union[int, str],
    payload: MoveToVerificationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Lost User action: Review the incoming found request and click the button to move to Human Verification.
    Queues the candidate match for physical custody verification by campus administrative staff.
    """
    service = LostAndFoundService(db)
    try:
        mid = int(match_id)
        is_admin = (getattr(user, "primary_role", "") == "ADMIN")
        verification = service.request_human_verification(mid, payload, user_id=user.id, is_admin=is_admin)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    out = MatchVerificationOut(
        id=verification.id,
        match_id=verification.match_id,
        challenge_question=verification.challenge_question,
        owner_response=verification.owner_response,
        officer_notes=verification.officer_notes,
        concordance_score=verification.concordance_score,
        verified_by=verification.verified_by,
        status=verification.status,
        created_at=verification.created_at,
    )
    return StandardResponse(
        data=out,
        message="Item successfully queued for human verification at the campus custody desk."
    )



@router.post("/matches/trigger", response_model=StandardResponse[List[ItemMatchOut]])
def trigger_matching(
    payload: RunMatchingRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Force run AI multimodal matching triage with Jina CLIP v2."""
    service = LostAndFoundService(db)
    results = []
    if payload.lost_report_id:
        try:
            lid = int(payload.lost_report_id)
            results = service.evaluate_matches_for_lost(lid, top_k=payload.top_k)
        except ValueError:
            pass
    elif payload.found_report_id:
        try:
            fid = int(payload.found_report_id)
            results = service.evaluate_matches_for_found(fid, top_k=payload.top_k)
        except ValueError:
            pass
    else:
        # Evaluate for all open lost reports
        repo = LostAndFoundRepository(db)
        for lr in repo.list_lost_reports(status="OPEN"):
            results.extend(service.evaluate_matches_for_lost(lr.id, top_k=payload.top_k))

    return StandardResponse(data=[format_match(m) for m in results], message=f"Generated {len(results)} match candidates.")


@router.post("/matches/{match_id}/dismiss", response_model=StandardResponse[dict])
def dismiss_match(
    match_id: Union[int, str],
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF"]))
):
    """Dismiss a candidate match (Admin / Staff)."""
    repo = LostAndFoundRepository(db)
    updated = repo.update_match_status(match_id, "DISMISSED")
    if not updated:
        raise HTTPException(status_code=404, detail="Match not found.")
    return StandardResponse(data={"match_id": match_id, "status": "DISMISSED"}, message="Match dismissed.")


# =============================================================================
# Double-Blind Match Verification (Table 39)
# =============================================================================

@router.post("/matches/{match_id}/verify", response_model=StandardResponse[MatchVerificationOut])
def verify_match_challenge(
    match_id: Union[int, str],
    payload: VerificationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF", "HOD"]))
):
    """Verify ownership challenge details (Admin / Staff / HOD)."""
    service = LostAndFoundService(db)
    try:
        mid = int(match_id)
        v = service.verify_match(mid, payload, verified_by=user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    out = MatchVerificationOut(
        id=v.id,
        match_id=v.match_id,
        challenge_question=v.challenge_question,
        owner_response=v.owner_response,
        officer_notes=v.officer_notes,
        concordance_score=v.concordance_score,
        verified_by=v.verified_by,
        status=v.status,
        created_at=v.created_at,
    )
    return StandardResponse(data=out, message="Match verification recorded.")


@router.get("/verifications", response_model=StandardResponse[List[MatchVerificationDetailedOut]])
def list_verifications(
    status: Optional[str] = Query(None),
    match_id: Optional[Union[int, str]] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF", "HOD"]))
):
    """
    List human verification challenge queue for HOD and administration review.
    Displays pending challenge responses submitted by owners for physical custody authorization.
    """
    repo = LostAndFoundRepository(db)
    records = repo.list_verifications(status=status, match_id=match_id)
    return StandardResponse(data=[format_verification_detailed(v) for v in records])


@router.get("/verifications/{verification_id}", response_model=StandardResponse[MatchVerificationDetailedOut])
def get_verification_item(
    verification_id: Union[int, str],
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF", "HOD"]))
):
    """Get full verification challenge details including lost and found metadata."""
    repo = LostAndFoundRepository(db)
    v = repo.get_verification(verification_id)
    if not v:
        raise HTTPException(status_code=404, detail="Verification record not found.")
    return StandardResponse(data=format_verification_detailed(v))


@router.patch("/verifications/{verification_id}/review", response_model=StandardResponse[MatchVerificationDetailedOut])
def review_verification_endpoint(
    verification_id: Union[int, str],
    payload: VerificationReview,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF", "HOD"]))
):
    """
    Approve or reject physical verification challenge (HOD / Admin).
    When approved: Marks match, lost report, and found report as VERIFIED, authorizes handover,
    auto-approves claim, and dispatches custody desk release alerts to owner and finder.
    """
    service = LostAndFoundService(db)
    try:
        vid = int(verification_id)
        v = service.review_verification(
            verification_id=vid,
            status=payload.status,
            officer_notes=payload.officer_notes,
            concordance_score=payload.concordance_score,
            verified_by=user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return StandardResponse(
        data=format_verification_detailed(v),
        message=f"Verification challenge #{verification_id} {payload.status.lower()} successfully."
    )


# =============================================================================
# Ownership Claims (Table 40)
# =============================================================================

@router.post("/claims", response_model=StandardResponse[ItemClaimOut], status_code=status.HTTP_201_CREATED)
def submit_claim(
    payload: ClaimCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Submit a formal ownership claim for a found item."""
    service = LostAndFoundService(db)
    try:
        claim = service.submit_claim(payload, claimed_by=user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return StandardResponse(data=format_claim(claim), message="Ownership claim submitted.")


@router.get("/claims", response_model=StandardResponse[List[ItemClaimOut]])
def list_claims(
    found_report_id: Optional[Union[int, str]] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List item claims. Students see their own; Admins see all."""
    repo = LostAndFoundRepository(db)
    claimed_by = None if user.primary_role in ("ADMIN", "STAFF") else user.id
    claims = repo.list_claims(found_report_id=found_report_id, claimed_by=claimed_by, status=status)
    return StandardResponse(data=[format_claim(c) for c in claims])


@router.patch("/claims/{claim_id}/review", response_model=StandardResponse[ItemClaimOut])
def review_claim(
    claim_id: Union[int, str],
    payload: ClaimReview,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF", "HOD"]))
):
    """Approve or reject a claim with conflict handling (Admin / Staff / HOD)."""
    service = LostAndFoundService(db)
    try:
        cid = int(claim_id)
        claim = service.review_claim(cid, status=payload.status, reviewed_by=user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return StandardResponse(data=format_claim(claim), message=f"Claim #{claim_id} set to {payload.status}.")


# =============================================================================
# Physical Handover Receipts (Table 41)
# =============================================================================

@router.post("/handovers", response_model=StandardResponse[ItemHandoverOut], status_code=status.HTTP_201_CREATED)
def create_handover(
    payload: HandoverCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(["ADMIN", "STAFF", "HOD"]))
):
    """Execute physical return and generate digital pickup receipt (Admin / Staff)."""
    service = LostAndFoundService(db)
    try:
        handover = service.execute_handover(payload, handed_over_by=user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return StandardResponse(data=format_handover(handover), message="Handover finalized.")


# =============================================================================
# Media Upload (Table 37 / Table 15)
# =============================================================================

@router.post("/upload", response_model=StandardResponse[dict])
@router.post("/media/upload", response_model=StandardResponse[dict])
async def upload_media_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Upload item photo; stores file and creates MediaAttachment metadata."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are permitted.")

    destination, file_url = await storage_adapter.save_upload(file)

    # Record MediaAttachment in Table 15
    try:
        file_size = None
        p = storage_adapter.upload_dir / (file_url.split("/")[-1])
        if p.exists():
            file_size = p.stat().st_size

        ma = MediaAttachment(
            storage_key=file_url,
            original_filename=file.filename or "uploaded_photo.jpg",
            mime_type=file.content_type or "image/jpeg",
            file_size=file_size,
            uploaded_by=user.id
        )
        db.add(ma)
        db.commit()
        db.refresh(ma)
        media_id = ma.id
    except Exception:
        media_id = None

    return StandardResponse(
        data={
            "file_url": file_url,
            "file_path": destination,
            "file_name": file.filename,
            "media_id": media_id
        },
        message="Media uploaded successfully."
    )
