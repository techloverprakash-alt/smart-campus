import logging
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.modules.academic.models import AcademicBatch, Department, Section
from app.modules.academic.schemas import (
    CourseOfferingCreate,
    CourseOfferingResponse,
    StaffWorkloadItem,
    StaffWorkloadSubject,
    SubjectCreate,
    SubjectResponse,
)
from app.modules.attendance.models import CourseOffering, Subject, TimetableEntry
from app.modules.auth.models import StaffProfile, StudentProfile, User

logger = logging.getLogger("smart_campus.academic")


class AcademicService:
    def __init__(self, db: Session):
        self.db = db

    # =========================================================================
    # 1. Subjects Management
    # =========================================================================
    def get_subjects(self, department_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(Subject).options(joinedload(Subject.department), joinedload(Subject.offerings))
        if department_id:
            query = query.filter(Subject.department_id == department_id)
        subjects = query.order_by(Subject.code.asc()).all()

        results = []
        for s in subjects:
            dept_name = s.department.name if s.department else "General"
            sub_type = "Practical Lab" if "Lab" in s.title else "Core Theory"
            results.append({
                "id": s.id,
                "code": s.code,
                "title": s.title,
                "credits": s.credits,
                "department_id": s.department_id,
                "department_name": dept_name,
                "subject_type": sub_type,
                "offerings_count": len(s.offerings) if s.offerings else 0,
            })
        return results

    def create_subject(self, payload: SubjectCreate) -> Dict[str, Any]:
        existing = self.db.query(Subject).filter(Subject.code == payload.code.strip().upper()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with code '{payload.code.strip().upper()}' already exists ({existing.title}).",
            )

        dept = self.db.query(Department).filter(Department.id == payload.department_id).first()
        if not dept:
            dept = self.db.query(Department).first()
            if not dept:
                dept = Department(code="CSE", name="Computer Science and Engineering")
                self.db.add(dept)
                self.db.flush()

        subject = Subject(
            code=payload.code.strip().upper(),
            title=payload.title.strip(),
            credits=payload.credits,
            department_id=dept.id,
        )
        self.db.add(subject)
        self.db.commit()
        self.db.refresh(subject)

        dept_name = dept.name
        sub_type = payload.subject_type or ("Practical Lab" if "Lab" in subject.title else "Core Theory")
        return {
            "id": subject.id,
            "code": subject.code,
            "title": subject.title,
            "credits": subject.credits,
            "department_id": subject.department_id,
            "department_name": dept_name,
            "subject_type": sub_type,
            "offerings_count": 0,
        }

    def delete_subject(self, subject_id: int) -> Dict[str, Any]:
        subject = self.db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject with ID {subject_id} not found.",
            )
        code = subject.code
        title = subject.title
        self.db.delete(subject)
        self.db.commit()
        return {
            "success": True,
            "message": f"Subject '{code}: {title}' has been deleted successfully.",
            "deleted_subject_id": subject_id,
        }

    # =========================================================================
    # 2. Course Offerings (Assign Subject to Staff with Students)
    # =========================================================================
    def get_course_offerings(
        self,
        department_id: Optional[int] = None,
        section_id: Optional[int] = None,
        staff_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        query = (
            self.db.query(CourseOffering)
            .options(
                joinedload(CourseOffering.subject).joinedload(Subject.department),
                joinedload(CourseOffering.section).joinedload(Section.department),
                joinedload(CourseOffering.section).joinedload(Section.students),
                joinedload(CourseOffering.staff).joinedload(StaffProfile.user),
            )
            .order_by(CourseOffering.id.desc())
        )

        if section_id:
            query = query.filter(CourseOffering.section_id == section_id)
        if staff_id:
            query = query.filter(CourseOffering.staff_id == staff_id)

        offerings = query.all()
        results = []
        for o in offerings:
            sub = o.subject
            sec = o.section
            staff = o.staff
            staff_user = staff.user if staff else None

            # Student count in section
            student_count = len(sec.students) if sec and sec.students else 0
            dept_name = (
                sec.department.name
                if sec and sec.department
                else (sub.department.name if sub and sub.department else "Engineering")
            )

            results.append({
                "id": o.id,
                "subject_id": o.subject_id,
                "subject_code": sub.code if sub else "SUB",
                "subject_title": sub.title if sub else "Class",
                "credits": sub.credits if sub else 3,
                "staff_id": o.staff_id,
                "staff_name": staff_user.full_name if staff_user else "Faculty",
                "staff_faculty_id": staff.faculty_id if staff else "FAC",
                "staff_email": staff_user.email if staff_user else "",
                "section_id": o.section_id,
                "section_name": sec.name if sec else "Section",
                "department_name": dept_name,
                "student_count": student_count,
                "academic_year": o.academic_year,
                "semester": o.semester,
            })
        return results

    def create_course_offering(self, payload: CourseOfferingCreate) -> Dict[str, Any]:
        # Check duplicate offering for same subject, section, staff
        existing = (
            self.db.query(CourseOffering)
            .filter(
                CourseOffering.subject_id == payload.subject_id,
                CourseOffering.section_id == payload.section_id,
                CourseOffering.staff_id == payload.staff_id,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This faculty member is already assigned to this subject for this section.",
            )

        subject = self.db.query(Subject).filter(Subject.id == payload.subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found.")

        staff = self.db.query(StaffProfile).filter(StaffProfile.id == payload.staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found.")

        section = self.db.query(Section).filter(Section.id == payload.section_id).first()
        if not section:
            raise HTTPException(status_code=404, detail="Class section not found.")

        offering = CourseOffering(
            subject_id=payload.subject_id,
            staff_id=payload.staff_id,
            section_id=payload.section_id,
            academic_year=payload.academic_year or "2025-2026",
            semester=payload.semester or section.semester or 7,
        )
        self.db.add(offering)
        self.db.commit()
        self.db.refresh(offering)

        staff_name = staff.user.full_name if staff.user else staff.faculty_id
        student_count = len(section.students) if section.students else 0

        return {
            "id": offering.id,
            "subject_id": offering.subject_id,
            "subject_code": subject.code,
            "subject_title": subject.title,
            "staff_id": offering.staff_id,
            "staff_name": staff_name,
            "staff_faculty_id": staff.faculty_id,
            "section_id": offering.section_id,
            "section_name": section.name,
            "department_name": section.department.name if section.department else "Engineering",
            "student_count": student_count,
            "academic_year": offering.academic_year,
            "semester": offering.semester,
        }

    def delete_course_offering(self, offering_id: int) -> Dict[str, Any]:
        offering = self.db.query(CourseOffering).filter(CourseOffering.id == offering_id).first()
        if not offering:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course offering allocation with ID {offering_id} not found.",
            )
        self.db.delete(offering)
        self.db.commit()
        return {
            "success": True,
            "message": "Subject allocation unassigned successfully.",
            "deleted_offering_id": offering_id,
        }

    # =========================================================================
    # 3. Staff Workload (Assigned Faculty & Subject Workload) - Live DB Data
    # =========================================================================
    def get_staff_workload(self) -> List[Dict[str, Any]]:
        """
        Builds the live list of teaching faculty with all their assigned subjects,
        student headcounts, and room details directly from the relational database.
        """
        staff_members = (
            self.db.query(StaffProfile)
            .options(
                joinedload(StaffProfile.user),
                joinedload(StaffProfile.department),
            )
            .order_by(StaffProfile.id.asc())
            .all()
        )

        palette = [
            ("#dbeafe", "#003fb1"),
            ("#e0e7ff", "#4338ca"),
            ("#dcfce7", "#166534"),
            ("#fef3c7", "#92400e"),
            ("#f3e8ff", "#6b21a8"),
            ("#ffe4e6", "#be123c"),
        ]

        workload_list = []
        for idx, s in enumerate(staff_members):
            user = s.user
            if not user:
                continue

            # Fetch active course offerings for this staff
            offerings = (
                self.db.query(CourseOffering)
                .filter(CourseOffering.staff_id == s.id)
                .options(
                    joinedload(CourseOffering.subject),
                    joinedload(CourseOffering.section).joinedload(Section.students),
                    joinedload(CourseOffering.timetable_entries).joinedload(TimetableEntry.location),
                )
                .all()
            )

            subjects_list = []
            for o in offerings:
                sub = o.subject
                if not sub:
                    continue
                sec = o.section
                sub_type = "Practical Lab" if "Lab" in sub.title else "Core Theory"
                st_count = len(sec.students) if sec and sec.students else 0
                sec_disp = f"III Year {sec.department.code if sec and sec.department else 'Dept'} • {sec.name}" if sec else "Section A"

                # Check if scheduled in timetable for room info
                room_str = "Hall LH-204"
                if o.timetable_entries and len(o.timetable_entries) > 0:
                    first_entry = o.timetable_entries[0]
                    if first_entry.location:
                        room_str = first_entry.location.name

                subjects_list.append({
                    "offering_id": o.id,
                    "code": sub.code,
                    "title": sub.title,
                    "type": sub_type,
                    "credits": sub.credits,
                    "hours": f"{sub.credits + 1} hrs/week",
                    "classSection": sec_disp,
                    "room": room_str,
                    "student_count": st_count,
                })

            # Calculate initials
            name_parts = (user.full_name or "Faculty Member").split()
            initials = "".join([p[0].upper() for p in name_parts[:2]]) if len(name_parts) >= 2 else "FAC"
            color_bg, color_text = palette[idx % len(palette)]
            dept_name = s.department.name if s.department else "Engineering"

            workload_list.append({
                "id": s.id,
                "staffId": s.id,
                "userId": user.id,
                "facultyId": s.faculty_id,
                "name": user.full_name or s.faculty_id,
                "designation": s.designation or "Assistant Professor",
                "department": dept_name,
                "cabin": s.cabin_number or "Cabin 204 • Academic Block",
                "email": user.email,
                "phone": user.phone or "+91 98452 10839",
                "initials": initials,
                "avatarBg": color_bg,
                "avatarText": color_text,
                "subjects": subjects_list,
            })

        return workload_list

    # =========================================================================
    # 4. Academic Metadata (Dropdowns for frontend forms)
    # =========================================================================
    def get_metadata(self) -> Dict[str, Any]:
        departments = self.db.query(Department).all()
        sections = (
            self.db.query(Section)
            .options(joinedload(Section.department), joinedload(Section.students))
            .all()
        )
        staff = (
            self.db.query(StaffProfile)
            .options(joinedload(StaffProfile.user), joinedload(StaffProfile.department))
            .all()
        )
        subjects = (
            self.db.query(Subject)
            .options(joinedload(Subject.department))
            .all()
        )

        return {
            "departments": [
                {"id": d.id, "code": d.code, "name": d.name}
                for d in departments
            ],
            "sections": [
                {
                    "id": sec.id,
                    "name": sec.name,
                    "semester": sec.semester,
                    "department_id": sec.department_id,
                    "department_name": sec.department.name if sec.department else "Engineering",
                    "student_count": len(sec.students) if sec.students else 0,
                }
                for sec in sections
            ],
            "staff": [
                {
                    "id": st.id,
                    "faculty_id": st.faculty_id,
                    "name": st.user.full_name if st.user else st.faculty_id,
                    "designation": st.designation,
                    "department": st.department.name if st.department else "Engineering",
                }
                for st in staff
                if st.user
            ],
            "subjects": [
                {
                    "id": sub.id,
                    "code": sub.code,
                    "title": sub.title,
                    "credits": sub.credits,
                    "department_id": sub.department_id,
                    "department_name": sub.department.name if sub.department else "Engineering",
                }
                for sub in subjects
            ],
        }

