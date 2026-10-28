import csv
import datetime
import logging
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session

from app.modules.academic.models import CampusLocation, MediaAttachment
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

logger = logging.getLogger("smart_campus.lost_found_seeder")
DB_CSV_DIR = Path(__file__).resolve().parent.parent.parent.parent / "db"


def parse_int(val: Optional[str]) -> Optional[int]:
    if not val or val.strip() == "":
        return None
    try:
        return int(val.strip())
    except ValueError:
        return None


def parse_float(val: Optional[str]) -> Optional[float]:
    if not val or val.strip() == "":
        return None
    try:
        return float(val.strip())
    except ValueError:
        return None


def parse_datetime(val: Optional[str]) -> Optional[datetime.datetime]:
    if not val or val.strip() == "":
        return None
    val = val.strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.datetime.strptime(val, fmt)
        except ValueError:
            pass
    return None


def seed_lost_and_found_csvs(db: Session):
    """
    Seeds System 5 / Module 6 Lost and Found dataset from CSV files (Tables 34 through 41):
      34_item_categories.csv
      35_lost_reports.csv
      36_found_reports.csv
      37_report_media.csv
      38_item_matches.csv
      39_match_verifications.csv
      40_item_claims.csv
      41_item_handovers.csv
    """
    logger.info("=== Seeding Lost & Found Tables 34-41 from CSV files ===")

    # 1. Table 34: item_categories
    f_cat = DB_CSV_DIR / "34_item_categories.csv"
    if f_cat.exists():
        with open(f_cat, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cid = parse_int(row.get("id"))
                existing = db.query(ItemCategory).filter_by(id=cid).first()
                if not existing:
                    c = ItemCategory(
                        id=cid,
                        name=row.get("name", "").strip(),
                        description=row.get("description", "").strip(),
                    )
                    db.merge(c)
        db.commit()
        logger.info("Seeded 34_item_categories.csv")

    # 2. Table 35: lost_reports
    f_lost = DB_CSV_DIR / "35_lost_reports.csv"
    if f_lost.exists():
        with open(f_lost, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                lid = parse_int(row.get("id"))
                existing = db.query(LostReport).filter_by(id=lid).first()
                if not existing:
                    lost_time = parse_datetime(row.get("lost_at")) or datetime.datetime.utcnow()
                    lr = LostReport(
                        id=lid,
                        reporter_id=parse_int(row.get("reporter_id")),
                        category_id=parse_int(row.get("category_id")),
                        last_seen_location_id=parse_int(row.get("last_seen_location_id")),
                        title=row.get("title", "").strip(),
                        brand_model=row.get("brand_model", "").strip() or None,
                        description=row.get("description", "").strip(),
                        lost_at=lost_time,
                        status=row.get("status", "OPEN").strip().upper(),
                    )
                    db.merge(lr)
        db.commit()
        logger.info("Seeded 35_lost_reports.csv")

    # 3. Table 36: found_reports
    f_found = DB_CSV_DIR / "36_found_reports.csv"
    if f_found.exists():
        with open(f_found, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                fid = parse_int(row.get("id"))
                existing = db.query(FoundReport).filter_by(id=fid).first()
                if not existing:
                    found_time = parse_datetime(row.get("found_at")) or datetime.datetime.utcnow()
                    fr = FoundReport(
                        id=fid,
                        reported_by=parse_int(row.get("reported_by")),
                        category_id=parse_int(row.get("category_id")),
                        found_location_id=parse_int(row.get("found_location_id")),
                        title=row.get("title", "").strip(),
                        description=row.get("description", "").strip(),
                        found_at=found_time,
                        custody_desk=row.get("custody_desk", "").strip(),
                        inventory_tag=row.get("inventory_tag", "").strip(),
                        storage_status=row.get("storage_status", "IN_CUSTODY").strip().upper(),
                    )
                    db.merge(fr)
        db.commit()
        logger.info("Seeded 36_found_reports.csv")

    # 4. Table 37: report_media
    f_media = DB_CSV_DIR / "37_report_media.csv"
    if f_media.exists():
        with open(f_media, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                mid = parse_int(row.get("id"))
                existing = db.query(ReportMedia).filter_by(id=mid).first()
                if not existing:
                    att_id = parse_int(row.get("media_id"))
                    # Resolve media_url from MediaAttachment if present
                    url = None
                    if att_id:
                        att = db.query(MediaAttachment).filter_by(id=att_id).first()
                        if att:
                            url = f"/static/{att.storage_key}" if not att.storage_key.startswith("/") else att.storage_key
                    if not url:
                        url = f"/static/uploads/media_{att_id or mid}.jpg"

                    rm = ReportMedia(
                        id=mid,
                        lost_report_id=parse_int(row.get("lost_report_id")),
                        found_report_id=parse_int(row.get("found_report_id")),
                        media_id=att_id,
                        media_url=url,
                    )
                    db.merge(rm)
        db.commit()
        logger.info("Seeded 37_report_media.csv")

    # 5. Table 38: item_matches
    f_matches = DB_CSV_DIR / "38_item_matches.csv"
    if f_matches.exists():
        with open(f_matches, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                match_id = parse_int(row.get("id"))
                existing = db.query(ItemMatch).filter_by(id=match_id).first()
                if not existing:
                    m = ItemMatch(
                        id=match_id,
                        lost_report_id=parse_int(row.get("lost_report_id")),
                        found_report_id=parse_int(row.get("found_report_id")),
                        text_similarity=parse_float(row.get("text_similarity")),
                        image_similarity=parse_float(row.get("image_similarity")),
                        combined_score=parse_float(row.get("combined_score")) or 0.5,
                        criteria_json=row.get("criteria_json", "").strip() or None,
                        status=row.get("status", "CANDIDATE").strip().upper(),
                    )
                    db.merge(m)
        db.commit()
        logger.info("Seeded 38_item_matches.csv")

    # 6. Table 39: match_verifications
    f_verif = DB_CSV_DIR / "39_match_verifications.csv"
    if f_verif.exists():
        with open(f_verif, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                vid = parse_int(row.get("id"))
                existing = db.query(MatchVerification).filter_by(id=vid).first()
                if not existing:
                    v = MatchVerification(
                        id=vid,
                        match_id=parse_int(row.get("match_id")),
                        challenge_question=row.get("challenge_question", "").strip(),
                        owner_response=row.get("owner_response", "").strip() or None,
                        officer_notes=row.get("officer_notes", "").strip() or None,
                        concordance_score=parse_float(row.get("concordance_score")),
                        verified_by=parse_int(row.get("verified_by")),
                        status=row.get("status", "PENDING").strip().upper(),
                    )
                    db.merge(v)
        db.commit()
        logger.info("Seeded 39_match_verifications.csv")

    # 7. Table 40: item_claims
    f_claims = DB_CSV_DIR / "40_item_claims.csv"
    if f_claims.exists():
        with open(f_claims, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cid = parse_int(row.get("id"))
                existing = db.query(ItemClaim).filter_by(id=cid).first()
                if not existing:
                    cl = ItemClaim(
                        id=cid,
                        found_report_id=parse_int(row.get("found_report_id")),
                        lost_report_id=parse_int(row.get("lost_report_id")),
                        claimed_by=parse_int(row.get("claimed_by")),
                        status=row.get("status", "PENDING").strip().upper(),
                        reviewed_by=parse_int(row.get("reviewed_by")),
                    )
                    db.merge(cl)
        db.commit()
        logger.info("Seeded 40_item_claims.csv")

    # 8. Table 41: item_handovers
    f_handovers = DB_CSV_DIR / "41_item_handovers.csv"
    if f_handovers.exists():
        with open(f_handovers, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                hid = parse_int(row.get("id"))
                existing = db.query(ItemHandover).filter_by(id=hid).first()
                if not existing:
                    ho_time = parse_datetime(row.get("handed_over_at")) or datetime.datetime.utcnow()
                    ho = ItemHandover(
                        id=hid,
                        claim_id=parse_int(row.get("claim_id")),
                        handed_over_by=parse_int(row.get("handed_over_by")),
                        received_by=parse_int(row.get("received_by")),
                        handover_location_id=parse_int(row.get("handover_location_id")),
                        handed_over_at=ho_time,
                        pickup_pass_tag=f"PASS-{hid:04d}-{ho_time.strftime('%Y%m%d')}"
                    )
                    db.merge(ho)
        db.commit()
        logger.info("Seeded 41_item_handovers.csv")

    logger.info("=== Completed Seeding Lost & Found Tables 34-41 ===")

