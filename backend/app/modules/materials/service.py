import datetime
import logging
import os
import uuid
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.modules.academic.models import Department, MediaAttachment, Section
from app.modules.attendance.models import CourseOffering, Subject
from app.modules.auth.models import Role, User
from app.modules.materials.models import Announcement, AnnouncementTarget, StudyMaterial
from app.modules.materials.schemas import (
    AnnouncementCreate,
    AnnouncementResponse,
    AnnouncementTargetSchema,
    AnnouncementUpdate,
    StudyMaterialCreate,
    StudyMaterialResponse,
    StudyMaterialUpdate,
)

logger = logging.getLogger("smart_campus.materials_service")


# =============================================================================
# 1. Study Material Service
# =============================================================================
class MaterialService:
    def __init__(self, db: Session):
        self.db = db

    def list_materials(
        self,
        current_user: Optional[User] = None,
        subject_id: Optional[int] = None,
        section_id: Optional[int] = None,
        unit_number: Optional[int] = None,
        material_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves curriculum notes, slides, and question papers.
        Filters by student's section or course offering when applicable.
        """
        query = (
            self.db.query(StudyMaterial)
            .join(CourseOffering, StudyMaterial.course_offering_id == CourseOffering.id)
            .order_by(StudyMaterial.published_at.desc(), StudyMaterial.id.desc())
        )

        if subject_id:
            query = query.filter(CourseOffering.subject_id == subject_id)
        if section_id:
            query = query.filter(CourseOffering.section_id == section_id)
        if unit_number:
            query = query.filter(StudyMaterial.unit_number == unit_number)

        # If student: filter by student section if available
        if current_user and current_user.student_profile and current_user.student_profile.section_id:
            student_sec_id = current_user.student_profile.section_id
            # Include materials for student's section or general
            query = query.filter(
                (CourseOffering.section_id == student_sec_id) | (CourseOffering.section_id == None)
            )

        materials = query.offset(offset).limit(limit).all()

        results = []
        for m in materials:
            off = m.course_offering
            sub = off.subject if off else None
            f = m.file
            instructor_name = (
                m.uploader.full_name
                if m.uploader and m.uploader.full_name
                else (off.staff.user.full_name if off and off.staff and off.staff.user else "Faculty")
            )
            code_str = sub.code if sub else "COURSE"
            title_str = sub.title if sub else "Lecture Material"
            sec_name = off.section.name if off and off.section else ""

            unit_str = f"Unit {m.unit_number}" if m.unit_number else "Notes"
            mime_str = f.mime_type if f else "application/pdf"
            is_pdf = "pdf" in (mime_str or "").lower()
            doc_type = "PDF" if is_pdf else "NOTES"

            results.append({
                "id": m.id,
                "course_offering_id": m.course_offering_id,
                "title": m.title,
                "unit_number": m.unit_number,
                "file_id": m.file_id,
                "uploaded_by": m.uploaded_by,
                "published_at": m.published_at,
                "code": code_str,
                "course_code": code_str,
                "course_name": title_str,
                "subject_code": code_str,
                "section_name": sec_name,
                "instructor": instructor_name,
                "file_name": f.original_filename if f else f"{code_str}_{unit_str}.pdf",
                "storage_key": f.storage_key if f else "",
                "file_size": f.file_size if f else 2450000,
                "mime_type": mime_str,
                "type": doc_type,
                "unit": unit_str,
                "reads": "1.4k reads",
            })
        return results

    def get_material_by_id(self, material_id: int) -> Dict[str, Any]:
        m = self.db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
        if not m:
            raise HTTPException(status_code=404, detail="Study material not found.")

        off = m.course_offering
        sub = off.subject if off else None
        f = m.file
        instructor_name = (
            m.uploader.full_name
            if m.uploader and m.uploader.full_name
            else (off.staff.user.full_name if off and off.staff and off.staff.user else "Faculty")
        )

        return {
            "id": m.id,
            "course_offering_id": m.course_offering_id,
            "title": m.title,
            "unit_number": m.unit_number,
            "file_id": m.file_id,
            "uploaded_by": m.uploaded_by,
            "published_at": m.published_at,
            "code": sub.code if sub else "COURSE",
            "course_code": sub.code if sub else "COURSE",
            "course_name": sub.title if sub else "Lecture Material",
            "subject_code": sub.code if sub else "COURSE",
            "section_name": off.section.name if off and off.section else "",
            "instructor": instructor_name,
            "file_name": f.original_filename if f else "Document.pdf",
            "storage_key": f.storage_key if f else "",
            "file_size": f.file_size if f else 1024,
            "mime_type": f.mime_type if f else "application/pdf",
            "type": "PDF",
            "unit": f"Unit {m.unit_number}" if m.unit_number else "Notes",
            "reads": "1.4k reads",
        }

    def upload_material_file(
        self,
        current_user: User,
        file: UploadFile,
        title: Optional[str] = None,
        course_offering_id: Optional[int] = None,
        subject_code: Optional[str] = None,
        unit_number: Optional[int] = 1,
        academic_year: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Saves the physical document file to disk, creates a media_attachment,
        and links it to a new StudyMaterial record.
        """
        if hasattr(file, "file") and hasattr(file.file, "read"):
            content = file.file.read()
        elif hasattr(file, "read") and callable(file.read):
            content = file.read()
        else:
            content = b""
        file_size = len(content)

        unique_name = f"{uuid.uuid4().hex}_{file.filename or 'document.pdf'}"
        from app.infrastructure.storage import UPLOAD_DIR
        destination = UPLOAD_DIR / unique_name
        with open(destination, "wb") as f_out:
            f_out.write(content)

        file_url = f"/static/uploads/{unique_name}"

        # 1. Create MediaAttachment in Table 15
        media = MediaAttachment(
            storage_key=file_url,
            original_filename=file.filename or "Document.pdf",
            mime_type=file.content_type or "application/pdf",
            file_size=file_size,
            uploaded_by=current_user.id,
            created_at=datetime.datetime.utcnow(),
        )
        self.db.add(media)
        self.db.flush()

        # 2. Resolve Course Offering
        offering = None
        if course_offering_id:
            offering = self.db.query(CourseOffering).filter_by(id=course_offering_id).first()

        if not offering and subject_code:
            clean_code = subject_code.split(" ")[0].strip()
            sub = self.db.query(Subject).filter(Subject.code.ilike(f"%{clean_code}%")).first()
            if sub:
                offering = self.db.query(CourseOffering).filter_by(subject_id=sub.id).first()
                if not offering:
                    offering = CourseOffering(
                        subject_id=sub.id,
                        academic_year=academic_year or "2024-2025",
                        semester=sub.semester or 5,
                    )
                    self.db.add(offering)
                    self.db.flush()

        if not offering:
            offering = self.db.query(CourseOffering).first()

        if not offering:
            sub = self.db.query(Subject).first()
            if not sub:
                sub = Subject(code="GEN101", title="General Engineering", semester=1)
                self.db.add(sub)
                self.db.flush()
            offering = CourseOffering(subject_id=sub.id, academic_year="2024-2025", semester=1)
            self.db.add(offering)
            self.db.flush()

        # 3. Create StudyMaterial in Table 21
        clean_title = title or (file.filename.rsplit(".", 1)[0] if file.filename else "Curriculum Document")
        material = StudyMaterial(
            course_offering_id=offering.id,
            title=clean_title,
            unit_number=unit_number or 1,
            file_id=media.id,
            uploaded_by=current_user.id,
            published_at=datetime.datetime.utcnow(),
        )
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return self.get_material_by_id(material.id)

    def create_material(self, current_user: User, data: StudyMaterialCreate) -> Dict[str, Any]:
        off = self.db.query(CourseOffering).filter_by(id=data.course_offering_id).first()
        if not off:
            raise HTTPException(status_code=404, detail="Course offering not found.")

        material = StudyMaterial(
            course_offering_id=data.course_offering_id,
            title=data.title,
            unit_number=data.unit_number,
            file_id=data.file_id,
            uploaded_by=current_user.id,
            published_at=datetime.datetime.utcnow(),
        )
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return self.get_material_by_id(material.id)

    def update_material(
        self, current_user: User, material_id: int, data: StudyMaterialUpdate
    ) -> Dict[str, Any]:
        material = self.db.query(StudyMaterial).filter_by(id=material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Study material not found.")

        if data.title is not None:
            material.title = data.title
        if data.unit_number is not None:
            material.unit_number = data.unit_number
        if data.file_id is not None:
            material.file_id = data.file_id

        self.db.commit()
        return self.get_material_by_id(material.id)

    def delete_material(self, current_user: User, material_id: int) -> Dict[str, Any]:
        material = self.db.query(StudyMaterial).filter_by(id=material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Study material not found.")

        self.db.delete(material)
        self.db.commit()
        return {"success": True, "message": "Study material deleted successfully."}


# =============================================================================
# 2. Announcement Service
# =============================================================================
class AnnouncementService:
    def __init__(self, db: Session):
        self.db = db

    def list_announcements(
        self,
        current_user: Optional[User] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves public or targeted circulars and announcements.
        """
        query = self.db.query(Announcement).filter(Announcement.status == "PUBLISHED").order_by(
            Announcement.published_at.desc(), Announcement.id.desc()
        )

        announcements = query.offset(offset).limit(limit).all()

        results = []
        for ann in announcements:
            author = ann.creator.full_name if ann.creator and ann.creator.full_name else "Campus Administration"
            # Format date e.g. "18 OCT 2025"
            date_str = ann.published_at.strftime("%d %b %Y").upper()

            title_l = ann.title.lower()
            tag = "AU EXAM" if "exam" in title_l else "ACADEMIC" if "internal" in title_l or "schedule" in title_l else "EVENTS"

            target_schemas = []
            for t in ann.targets:
                target_schemas.append({
                    "department_id": t.department_id,
                    "section_id": t.section_id,
                    "role_id": t.role_id,
                    "department_name": t.department.name if t.department else None,
                    "section_name": t.section.name if t.section else None,
                    "role_name": t.role.name if t.role else None,
                })

            results.append({
                "id": ann.id,
                "title": ann.title,
                "body": ann.body,
                "created_by": ann.created_by,
                "author_name": author,
                "status": ann.status,
                "published_at": ann.published_at,
                "date": date_str,
                "tag": tag,
                "targets": target_schemas,
            })
        return results

    def get_announcement_by_id(self, announcement_id: int) -> Dict[str, Any]:
        ann = self.db.query(Announcement).filter(Announcement.id == announcement_id).first()
        if not ann:
            raise HTTPException(status_code=404, detail="Announcement not found.")

        author = ann.creator.full_name if ann.creator and ann.creator.full_name else "Campus Administration"
        date_str = ann.published_at.strftime("%d %b %Y").upper()
        title_l = ann.title.lower()
        tag = "AU EXAM" if "exam" in title_l else "ACADEMIC" if "internal" in title_l or "schedule" in title_l else "EVENTS"

        return {
            "id": ann.id,
            "title": ann.title,
            "body": ann.body,
            "created_by": ann.created_by,
            "author_name": author,
            "status": ann.status,
            "published_at": ann.published_at,
            "date": date_str,
            "tag": tag,
            "targets": [
                {
                    "department_id": t.department_id,
                    "section_id": t.section_id,
                    "role_id": t.role_id,
                    "department_name": t.department.name if t.department else None,
                    "section_name": t.section.name if t.section else None,
                    "role_name": t.role.name if t.role else None,
                }
                for t in ann.targets
            ],
        }

    def create_announcement(self, current_user: User, data: AnnouncementCreate) -> Dict[str, Any]:
        ann = Announcement(
            title=data.title,
            body=data.body,
            status=data.status or "PUBLISHED",
            created_by=current_user.id,
            published_at=datetime.datetime.utcnow(),
        )
        self.db.add(ann)
        self.db.flush()

        if data.targets:
            for t_in in data.targets:
                target = AnnouncementTarget(
                    announcement_id=ann.id,
                    department_id=t_in.department_id,
                    section_id=t_in.section_id,
                    role_id=t_in.role_id,
                )
                self.db.add(target)

        self.db.commit()
        return self.get_announcement_by_id(ann.id)

    def update_announcement(
        self, current_user: User, announcement_id: int, data: AnnouncementUpdate
    ) -> Dict[str, Any]:
        ann = self.db.query(Announcement).filter_by(id=announcement_id).first()
        if not ann:
            raise HTTPException(status_code=404, detail="Announcement not found.")

        if data.title is not None:
            ann.title = data.title
        if data.body is not None:
            ann.body = data.body
        if data.status is not None:
            ann.status = data.status

        self.db.commit()
        return self.get_announcement_by_id(ann.id)

    def delete_announcement(self, current_user: User, announcement_id: int) -> Dict[str, Any]:
        ann = self.db.query(Announcement).filter_by(id=announcement_id).first()
        if not ann:
            raise HTTPException(status_code=404, detail="Announcement not found.")

        self.db.delete(ann)
        self.db.commit()
        return {"success": True, "message": "Announcement deleted successfully."}

