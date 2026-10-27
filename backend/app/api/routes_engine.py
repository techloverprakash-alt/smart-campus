import asyncio
import datetime
import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MatchRecord, Report
from app.schemas import (
    CandidateMatchItem,
    ConfirmClaimRequest,
    DualReportVerificationDetail,
    EngineConfig,
    ManualVerificationPacket,
    MatchStatusUpdate,
    ReportCreate,
    ReportMatchesResponse,
    ReportOut,
    ReportVerificationSummary,
    ReportWithTopMatchesResponse,
    SignalScores,
)
from app.services.embedding_service import embedding_service
from app.services.matching_engine import matching_engine
from app.services.qdrant_service import qdrant_service

router = APIRouter(prefix="/api", tags=["Automated Matching Engine"])


def to_verification_summary(r: Report) -> ReportVerificationSummary:
    """Formats a database report into a clean summary for manual verification packets."""
    return ReportVerificationSummary(
        report_id=r.id,
        report_type=r.report_type,
        title=r.title,
        description=r.description,
        category=r.category,
        color=r.color,
        brand=r.brand,
        location_name=r.location_name,
        incident_datetime=r.incident_datetime.isoformat() if r.incident_datetime else None,
        has_image=r.has_image,
        image_path=r.image_path,
        user_id=r.user_id,
        status=r.status
    )



# =====================================================================
# Report Management Endpoints
# =====================================================================

@router.post(
    "/engine/reports",
    response_model=ReportOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new Lost or Found report and index for matching"
)
async def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a new student report, generates MobileCLIP embeddings, stores authoritative record
    in the relational database, indexes vectors in Qdrant, and enables immediate multi-signal matching.
    """
    report_id = payload.report_id or f"{payload.report_type}_{uuid.uuid4().hex[:8]}"

    # Check for duplicate report ID
    existing = db.query(Report).filter(Report.id == report_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report with ID '{report_id}' already exists."
        )

    # Parse incident datetime
    incident_dt = None
    if payload.incident_datetime:
        try:
            incident_dt = datetime.datetime.fromisoformat(payload.incident_datetime.replace("Z", "+00:00"))
        except Exception:
            pass

    # Build DB Report entity
    db_report = Report(
        id=report_id,
        report_type=payload.report_type,
        title=payload.title,
        description=payload.description,
        category=payload.category.lower(),
        color=payload.color.lower() if payload.color else None,
        brand=payload.brand.lower() if payload.brand else None,
        attributes=json.dumps(payload.attributes or {}),
        location_id=payload.location_id.lower(),
        location_name=payload.location_name or payload.location_id.replace("_", " ").title(),
        incident_datetime=incident_dt,
        image_path=None,
        has_image=False,
        status="open",
        user_id=payload.user_id,
        user_contact_private=payload.user_contact_private
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Generate structured text embedding & index into Qdrant
    structured_text = matching_engine.build_structured_text(db_report)
    try:
        text_vector = await asyncio.to_thread(
            embedding_service.encode_text, structured_text, True
        )
        await asyncio.to_thread(
            qdrant_service.upsert_embedding,
            record_id=db_report.id,
            modality="text",
            vector=text_vector.tolist(),
            description=db_report.description,
            category=db_report.category,
            location=db_report.location_id,
            created_at=db_report.created_at.isoformat()
        )
    except Exception as e:
        # Relational record is safe; log Qdrant indexing warning
        pass

    return ReportOut(
        id=db_report.id,
        report_type=db_report.report_type,
        title=db_report.title,
        description=db_report.description,
        category=db_report.category,
        color=db_report.color,
        brand=db_report.brand,
        location_id=db_report.location_id,
        location_name=db_report.location_name,
        incident_datetime=db_report.incident_datetime.isoformat() if db_report.incident_datetime else None,
        image_path=db_report.image_path,
        has_image=db_report.has_image,
        status=db_report.status,
        user_id=db_report.user_id,
        created_at=db_report.created_at.isoformat(),
        updated_at=db_report.updated_at.isoformat()
    )


@router.post(
    "/engine/reports/upload",
    response_model=ReportOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a report with an uploaded image"
)
async def create_report_with_image(
    report_type: str = Form(..., description="'lost' or 'found'"),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    location_id: str = Form(...),
    user_id: str = Form(...),
    color: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    location_name: Optional[str] = Form(None),
    incident_datetime: Optional[str] = Form(None),
    user_contact_private: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Multipart endpoint supporting report submission with real item photo."""
    report_id = f"{report_type.lower()}_{uuid.uuid4().hex[:8]}"

    # Save image file if provided
    image_path = None
    has_image = False
    if file and file.filename:
        from pathlib import Path
        uploads_dir = Path("d:/image detection/image/uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        saved_file = uploads_dir / f"{report_id}_{file.filename}"
        content = await file.read()
        with open(saved_file, "wb") as f_out:
            f_out.write(content)
        image_path = str(saved_file)
        has_image = True

    incident_dt = None
    if incident_datetime:
        try:
            incident_dt = datetime.datetime.fromisoformat(incident_datetime.replace("Z", "+00:00"))
        except Exception:
            pass

    db_report = Report(
        id=report_id,
        report_type=report_type.lower(),
        title=title,
        description=description,
        category=category.lower(),
        color=color.lower() if color else None,
        brand=brand.lower() if brand else None,
        location_id=location_id.lower(),
        location_name=location_name or location_id.replace("_", " ").title(),
        incident_datetime=incident_dt,
        image_path=image_path,
        has_image=has_image,
        status="open",
        user_id=user_id,
        user_contact_private=user_contact_private
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Index text vector into Qdrant
    structured_text = matching_engine.build_structured_text(db_report)
    try:
        text_vec = await asyncio.to_thread(embedding_service.encode_text, structured_text, True)
        await asyncio.to_thread(
            qdrant_service.upsert_embedding,
            record_id=db_report.id,
            modality="text",
            vector=text_vec.tolist(),
            description=db_report.description,
            category=db_report.category,
            location=db_report.location_id
        )

        # Index image vector into Qdrant if image was uploaded
        if has_image and image_path:
            img_vec = await asyncio.to_thread(embedding_service.encode_image, image_path, True)
            await asyncio.to_thread(
                qdrant_service.upsert_embedding,
                record_id=db_report.id,
                modality="image",
                vector=img_vec.tolist(),
                description=db_report.description,
                image_path=image_path,
                category=db_report.category,
                location=db_report.location_id
            )
    except Exception:
        pass

    return ReportOut(
        id=db_report.id,
        report_type=db_report.report_type,
        title=db_report.title,
        description=db_report.description,
        category=db_report.category,
        color=db_report.color,
        brand=db_report.brand,
        location_id=db_report.location_id,
        location_name=db_report.location_name,
        incident_datetime=db_report.incident_datetime.isoformat() if db_report.incident_datetime else None,
        image_path=db_report.image_path,
        has_image=db_report.has_image,
        status=db_report.status,
        user_id=db_report.user_id,
        created_at=db_report.created_at.isoformat(),
        updated_at=db_report.updated_at.isoformat()
    )


@router.post(
    "/engine/reports/submit-and-match",
    response_model=ReportWithTopMatchesResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a report and immediately retrieve top 3 candidate matches"
)
async def submit_report_and_get_top3(
    payload: ReportCreate,
    top_k: int = Query(3, ge=1, le=10, description="Number of top matches to return (default 3)"),
    db: Session = Depends(get_db)
):
    """
    Submits a new Lost or Found report, indexes its vectors, and immediately returns
    the top 3 compatible opposite reports (Lost -> Top 3 Found, Found -> Top 3 Lost).
    """
    created_report = await create_report(payload=payload, db=db)
    
    top_candidates = []
    try:
        matches_resp = await asyncio.to_thread(
            matching_engine.match_report,
            target_report_id=created_report.id,
            db=db,
            top_k=top_k
        )
        top_candidates = matches_resp.matches[:top_k]
    except Exception:
        top_candidates = []

    return ReportWithTopMatchesResponse(
        report=created_report,
        top_3_candidates=top_candidates,
        verification_ready=True
    )


@router.post(
    "/engine/reports/upload-and-match",
    response_model=ReportWithTopMatchesResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a report with optional photo and immediately retrieve top 3 candidate matches"
)
async def upload_report_and_get_top3(
    report_type: str = Form(..., description="'lost' or 'found'"),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    location_id: str = Form(...),
    user_id: str = Form(...),
    color: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    location_name: Optional[str] = Form(None),
    incident_datetime: Optional[str] = Form(None, description="Optional incident date/time"),
    user_contact_private: Optional[str] = Form(None),
    top_k: int = Query(3, ge=1, le=10, description="Number of top matches to return (default 3)"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Submits a report with optional photo, indexes multimodal vectors, and returns
    the top 3 compatible opposite reports.
    """
    created_report = await create_report_with_image(
        report_type=report_type,
        title=title,
        description=description,
        category=category,
        location_id=location_id,
        user_id=user_id,
        color=color,
        brand=brand,
        location_name=location_name,
        incident_datetime=incident_datetime,
        user_contact_private=user_contact_private,
        file=file,
        db=db
    )

    top_candidates = []
    try:
        matches_resp = await asyncio.to_thread(
            matching_engine.match_report,
            target_report_id=created_report.id,
            db=db,
            top_k=top_k
        )
        top_candidates = matches_resp.matches[:top_k]
    except Exception:
        top_candidates = []

    return ReportWithTopMatchesResponse(
        report=created_report,
        top_3_candidates=top_candidates,
        verification_ready=True
    )


@router.get(
    "/engine/reports",
    response_model=List[ReportOut],
    summary="List active campus reports"
)
async def list_reports(
    report_type: Optional[str] = Query(None, description="'lost' or 'found'"),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query("open"),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if report_type:
        query = query.filter(Report.report_type == report_type.lower())
    if category:
        query = query.filter(Report.category == category.lower())
    if status:
        query = query.filter(Report.status == status.lower())

    reports = query.order_by(Report.created_at.desc()).all()
    return [
        ReportOut(
            id=r.id,
            report_type=r.report_type,
            title=r.title,
            description=r.description,
            category=r.category,
            color=r.color,
            brand=r.brand,
            location_id=r.location_id,
            location_name=r.location_name,
            incident_datetime=r.incident_datetime.isoformat() if r.incident_datetime else None,
            image_path=r.image_path,
            has_image=r.has_image,
            status=r.status,
            user_id=r.user_id,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat()
        )
        for r in reports
    ]


@router.get(
    "/engine/reports/{report_id}",
    response_model=ReportOut,
    summary="Get report details (privacy-safe)"
)
async def get_report(report_id: str, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Report '{report_id}' not found.")
    return ReportOut(
        id=r.id,
        report_type=r.report_type,
        title=r.title,
        description=r.description,
        category=r.category,
        color=r.color,
        brand=r.brand,
        location_id=r.location_id,
        location_name=r.location_name,
        incident_datetime=r.incident_datetime.isoformat() if r.incident_datetime else None,
        image_path=r.image_path,
        has_image=r.has_image,
        status=r.status,
        user_id=r.user_id,
        created_at=r.created_at.isoformat(),
        updated_at=r.updated_at.isoformat()
    )


# =====================================================================
# Automated Matching Engine Endpoints (Required by Section 7)
# =====================================================================

@router.post(
    "/matches/lost/{report_id}",
    response_model=ReportMatchesResponse,
    summary="Find potential found-item matches for a lost report"
)
async def match_lost_report(
    report_id: str,
    top_k: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Evaluates all 5 matching signals (Text, Image, Keyword, Location, Time)
    against eligible found items and returns ranked suggestions.
    """
    try:
        response = await asyncio.to_thread(
            matching_engine.match_report,
            target_report_id=report_id,
            db=db,
            top_k=top_k
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Matching error: {str(exc)}")


@router.post(
    "/matches/found/{report_id}",
    response_model=ReportMatchesResponse,
    summary="Find potential lost-item matches for a found report"
)
async def match_found_report(
    report_id: str,
    top_k: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Evaluates all 5 matching signals against eligible lost items and returns ranked suggestions.
    """
    try:
        response = await asyncio.to_thread(
            matching_engine.match_report,
            target_report_id=report_id,
            db=db,
            top_k=top_k
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Matching error: {str(exc)}")


@router.get(
    "/matches/{report_id}",
    response_model=ReportMatchesResponse,
    summary="Retrieve previously evaluated match suggestions for a report"
)
async def get_report_matches(
    report_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Retrieves stored match suggestions from the relational database without re-running inference.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Report '{report_id}' not found.")

    if report.report_type == "lost":
        match_records = (
            db.query(MatchRecord)
            .filter(MatchRecord.lost_report_id == report_id)
            .order_by(MatchRecord.ranking_score.desc())
            .limit(limit)
            .all()
        )
    else:
        match_records = (
            db.query(MatchRecord)
            .filter(MatchRecord.found_report_id == report_id)
            .order_by(MatchRecord.ranking_score.desc())
            .limit(limit)
            .all()
        )

    candidate_items = []
    for m in match_records:
        cand_id = m.found_report_id if report.report_type == "lost" else m.lost_report_id
        cand_report = db.query(Report).filter(Report.id == cand_id).first()
        if not cand_report or cand_report.status in ("deleted", "claimed"):
            continue

        reasons = json.loads(m.reasons) if m.reasons else []
        candidate_items.append(
            CandidateMatchItem(
                match_id=m.id,
                candidate_report_id=cand_report.id,
                candidate_report_type=cand_report.report_type,
                title=cand_report.title,
                description=cand_report.description,
                category=cand_report.category,
                color=cand_report.color,
                brand=cand_report.brand,
                location_name=cand_report.location_name,
                incident_datetime=cand_report.incident_datetime.isoformat() if cand_report.incident_datetime else None,
                image_path=cand_report.image_path,
                has_image=cand_report.has_image,
                ranking_score=m.ranking_score,
                ranking_percentage=round(m.ranking_score * 100.0, 2),
                signals=SignalScores(
                    text=m.text_score,
                    image=m.image_score,
                    keyword=m.keyword_score,
                    location=m.location_score,
                    time=m.time_score
                ),
                reasons=reasons,
                status=m.status,
                is_reviewed=m.is_reviewed,
                evaluated_at=m.evaluated_at.isoformat()
            )
        )

    return ReportMatchesResponse(
        query_report_id=report.id,
        query_report_type=report.report_type,
        total_candidates_found=len(candidate_items),
        matches=candidate_items
    )


@router.patch(
    "/matches/{match_id}/status",
    summary="Update the review status of a match record"
)
async def update_match_status(
    match_id: str,
    payload: MatchStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates the match review status ('reviewed', 'rejected', 'confirmed') by student or campus admin.
    """
    m = db.query(MatchRecord).filter(MatchRecord.id == match_id).first()
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Match record '{match_id}' not found.")

    m.status = payload.status
    m.is_reviewed = True
    db.commit()

    return {
        "status": "updated",
        "match_id": m.id,
        "new_status": m.status,
        "is_reviewed": m.is_reviewed,
        "notes": payload.notes
    }


@router.post(
    "/matches/{match_id}/confirm-for-verification",
    response_model=DualReportVerificationDetail,
    summary="User confirms 'This is mine'; returns complete dual-report verification packet for higher user"
)
async def confirm_match_for_verification(
    match_id: str,
    payload: Optional[ConfirmClaimRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Called when a student / user confirms a potential match is theirs.
    Sets the match review status to 'pending_higher_verification',
    and returns a comprehensive JavaScript/JSON formatted report containing
    the full details of BOTH the Lost report and the Found report,
    the 5-signal scores, and instructions for higher authority manual verification.
    """
    m = db.query(MatchRecord).filter(MatchRecord.id == match_id).first()
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Match record '{match_id}' not found.")

    lost_r = db.query(Report).filter(Report.id == m.lost_report_id).first()
    found_r = db.query(Report).filter(Report.id == m.found_report_id).first()
    if not lost_r or not found_r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated lost or found report missing from database.")

    # Transition status to pending higher manual verification
    m.status = "pending_higher_verification"
    m.is_reviewed = True
    db.commit()

    reasons = json.loads(m.reasons) if m.reasons else []
    return DualReportVerificationDetail(
        match_id=m.id,
        match_status=m.status,
        is_reviewed=m.is_reviewed,
        top_similarity_score=m.ranking_score,
        top_similarity_percentage=round(m.ranking_score * 100.0, 2),
        lost_report=to_verification_summary(lost_r),
        found_report=to_verification_summary(found_r),
        signals=SignalScores(
            text=m.text_score,
            image=m.image_score,
            keyword=m.keyword_score,
            location=m.location_score,
            time=m.time_score
        ),
        reasons=reasons,
        evaluated_at=m.evaluated_at.isoformat()
    )


@router.post(
    "/matches/confirm-claim",
    response_model=DualReportVerificationDetail,
    summary="Confirm match claim with JSON body payload"
)
async def confirm_match_claim_body(
    payload: ConfirmClaimRequest,
    db: Session = Depends(get_db)
):
    return await confirm_match_for_verification(match_id=payload.match_id, payload=payload, db=db)


@router.get(
    "/matches/{match_id}/verification-detail",
    response_model=DualReportVerificationDetail,
    summary="Retrieve complete dual-report verification detail for higher user"
)
async def get_dual_verification_detail(
    match_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns the complete structured detail of both the Lost item and Found item
    in JavaScript/JSON format for higher user manual verification.
    """
    m = db.query(MatchRecord).filter(MatchRecord.id == match_id).first()
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Match record '{match_id}' not found.")

    lost_r = db.query(Report).filter(Report.id == m.lost_report_id).first()
    found_r = db.query(Report).filter(Report.id == m.found_report_id).first()
    if not lost_r or not found_r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated lost or found report missing from database.")

    reasons = json.loads(m.reasons) if m.reasons else []
    return DualReportVerificationDetail(
        match_id=m.id,
        match_status=m.status,
        is_reviewed=m.is_reviewed,
        top_similarity_score=m.ranking_score,
        top_similarity_percentage=round(m.ranking_score * 100.0, 2),
        lost_report=to_verification_summary(lost_r),
        found_report=to_verification_summary(found_r),
        signals=SignalScores(
            text=m.text_score,
            image=m.image_score,
            keyword=m.keyword_score,
            location=m.location_score,
            time=m.time_score
        ),
        reasons=reasons,
        evaluated_at=m.evaluated_at.isoformat()
    )


@router.get(
    "/matches/{report_id}/verification-packet",
    response_model=ManualVerificationPacket,
    summary="Retrieve manual verification packet for top candidate match"
)
async def get_report_top_verification_packet(
    report_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves the top candidate match for a report and packages both items
    into a structured verification packet in JavaScript/JSON format.
    """
    query_rep = db.query(Report).filter(Report.id == report_id).first()
    if not query_rep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Report '{report_id}' not found.")

    if query_rep.report_type == "lost":
        top_m = db.query(MatchRecord).filter(MatchRecord.lost_report_id == report_id).order_by(MatchRecord.ranking_score.desc()).first()
    else:
        top_m = db.query(MatchRecord).filter(MatchRecord.found_report_id == report_id).order_by(MatchRecord.ranking_score.desc()).first()

    if not top_m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No evaluated match records found for '{report_id}'.")

    cand_id = top_m.found_report_id if query_rep.report_type == "lost" else top_m.lost_report_id
    cand_rep = db.query(Report).filter(Report.id == cand_id).first()
    if not cand_rep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate report record missing.")

    reasons = json.loads(top_m.reasons) if top_m.reasons else []
    return ManualVerificationPacket(
        match_id=top_m.id,
        top_similarity_score=top_m.ranking_score,
        top_similarity_percentage=round(top_m.ranking_score * 100.0, 2),
        verification_status=top_m.status,
        is_reviewed=top_m.is_reviewed,
        query_report=to_verification_summary(query_rep),
        top_matched_report=to_verification_summary(cand_rep),
        signals=SignalScores(
            text=top_m.text_score,
            image=top_m.image_score,
            keyword=top_m.keyword_score,
            location=top_m.location_score,
            time=top_m.time_score
        ),
        reasons=reasons,
        evaluated_at=top_m.evaluated_at.isoformat()
    )


@router.get("/engine/config", response_model=EngineConfig, summary="Get current matching engine weights")
async def get_engine_config():
    return matching_engine.config


@router.post("/engine/config", response_model=EngineConfig, summary="Update matching engine weights")
async def update_engine_config(config: EngineConfig):
    matching_engine.config = config
    return matching_engine.config
