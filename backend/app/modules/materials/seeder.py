import csv
import datetime
import logging
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session

from app.modules.materials.models import Announcement, AnnouncementTarget, StudyMaterial

logger = logging.getLogger("smart_campus.materials_seeder")
DB_CSV_DIR = Path(__file__).resolve().parent.parent.parent.parent / "db"


def parse_int(val: Optional[str]) -> Optional[int]:
    if not val or val.strip() == "":
        return None
    try:
        return int(val.strip())
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


def seed_materials_and_announcements(db: Session):
    """
    Seeds System 6:
      - 21_study_materials.csv
      - 22_announcements.csv
      - 23_announcement_targets.csv
    """
    logger.info("=== Seeding System 6: Study Materials & Announcements ===")

    # 1. 21_study_materials.csv
    f_materials = DB_CSV_DIR / "21_study_materials.csv"
    if f_materials.exists():
        with open(f_materials, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                m_id = parse_int(row.get("id"))
                existing = db.query(StudyMaterial).filter_by(id=m_id).first()
                if not existing:
                    pub = parse_datetime(row.get("published_at")) or datetime.datetime.utcnow()
                    m = StudyMaterial(
                        id=m_id,
                        course_offering_id=parse_int(row.get("course_offering_id")),
                        title=row.get("title", "").strip(),
                        unit_number=parse_int(row.get("unit_number")),
                        file_id=parse_int(row.get("file_id")),
                        uploaded_by=parse_int(row.get("uploaded_by")),
                        published_at=pub,
                    )
                    db.merge(m)
        db.commit()
        logger.info("Seeded 21_study_materials.csv")

    # 2. 22_announcements.csv
    f_announcements = DB_CSV_DIR / "22_announcements.csv"
    if f_announcements.exists():
        with open(f_announcements, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                a_id = parse_int(row.get("id"))
                existing = db.query(Announcement).filter_by(id=a_id).first()
                if not existing:
                    pub = parse_datetime(row.get("published_at")) or datetime.datetime.utcnow()
                    ann = Announcement(
                        id=a_id,
                        title=row.get("title", "").strip(),
                        body=row.get("body", "").strip(),
                        created_by=parse_int(row.get("created_by")),
                        status=row.get("status", "PUBLISHED").strip().upper(),
                        published_at=pub,
                    )
                    db.merge(ann)
        db.commit()
        logger.info("Seeded 22_announcements.csv")

    # 3. 23_announcement_targets.csv
    f_targets = DB_CSV_DIR / "23_announcement_targets.csv"
    if f_targets.exists():
        with open(f_targets, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                t_id = parse_int(row.get("id"))
                existing = db.query(AnnouncementTarget).filter_by(id=t_id).first()
                if not existing:
                    target = AnnouncementTarget(
                        id=t_id,
                        announcement_id=parse_int(row.get("announcement_id")),
                        department_id=parse_int(row.get("department_id")),
                        section_id=parse_int(row.get("section_id")),
                        role_id=parse_int(row.get("role_id")),
                    )
                    db.merge(target)
        db.commit()
        logger.info("Seeded 23_announcement_targets.csv")

