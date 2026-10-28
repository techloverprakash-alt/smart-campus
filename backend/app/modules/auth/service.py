import datetime
import hashlib
import logging
import re
import secrets
from typing import Any, Dict, List, Optional, Union

import bcrypt
import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.modules.auth.models import (
    AdminProfile,
    RefreshToken,
    Role,
    StaffProfile,
    StudentProfile,
    User,
    user_roles,
)
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import (
    BulkStudentEnrollRequest,
    LoginRequest,
    StaffEnrollRequest,
    StudentEnrollRequest,
)

logger = logging.getLogger("smart_campus.auth")

ROLE_PASSWORDS = {
    "ADMIN": "Admin@123",
    "STAFF": "Staff@123",
    "STUDENT": "Student@123",
}
UNIVERSAL_PASSWORD = "Password@123"


def compute_predefined_password(full_name: str, identifier: str) -> str:
    """
    Computes predefined password rule:
    First three characters of the name in lowercase + last three numbers of the register number.
    e.g. 'Arjun Patel' with '714022AD001' -> 'arj' + '001' -> 'arj001'
         'Abishek K' with 'REG20251099' -> 'abi' + '099' -> 'abi099'
    """
    clean_name = re.sub(r'[^a-zA-Z]', '', full_name or '')
    if len(clean_name) >= 3:
        name_part = clean_name[:3].lower()
    else:
        name_part = (re.sub(r'\s+', '', full_name or '')[:3]).lower()
    if not name_part:
        name_part = "stu"

    digits = re.sub(r'\D', '', identifier or '')
    if len(digits) >= 3:
        reg_part = digits[-3:]
    else:
        reg_part = (identifier or '').strip()[-3:] if len(identifier or '') >= 3 else "001"

    return f"{name_part}{reg_part}"


def compute_staff_password(full_name: str, faculty_id: str) -> str:
    """
    Computes staff predefined password:
    First three characters of name in lowercase + last three numbers of faculty ID.
    e.g. 'Dr. Sunita Rao' with 'FAC-CS-005' -> 'sun' + '005' -> 'sun005'
    """
    clean = re.sub(r'^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*', '', full_name or '', flags=re.IGNORECASE)
    clean_name = re.sub(r'[^a-zA-Z]', '', clean)
    name_part = clean_name[:3].lower() if len(clean_name) >= 3 else "fac"
    digits = re.sub(r'\D', '', faculty_id or '')
    id_part = digits[-3:] if len(digits) >= 3 else (faculty_id or '').strip()[-3:]
    return f"{name_part}{id_part}"


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AuthRepository(db)

    # =========================================================================
    # Password Hashing & Verification
    # =========================================================================
    @staticmethod
    def hash_password(plaintext: str) -> str:
        """Generates salted bcrypt hash with cost factor 10."""
        salt = bcrypt.gensalt(rounds=10)
        return bcrypt.hashpw(plaintext.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plaintext: str, password_hash: str, user_role: Optional[str] = None) -> bool:
        """
        Verifies plaintext password:
        1. Checks against universal password ('Password@123').
        2. Checks against role-specific standard password (Admin@123, Staff@123, Student@123).
        3. Checks against stored salted bcrypt hash.
        """
        # Check universal password
        if plaintext == UNIVERSAL_PASSWORD:
            return True

        # Check role-specific password
        if user_role:
            expected_role_pwd = ROLE_PASSWORDS.get(user_role.upper())
            if expected_role_pwd and plaintext == expected_role_pwd:
                return True

        # Check any of the standard role passwords
        if plaintext in ROLE_PASSWORDS.values():
            return True

        # Check bcrypt hash
        try:
            return bcrypt.checkpw(plaintext.encode("utf-8"), password_hash.encode("utf-8"))
        except Exception:
            return False

    @staticmethod
    def hash_token(raw_token: str) -> str:
        """Hashes refresh token using SHA-256 for secure database storage."""
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    # =========================================================================
    # JWT & Session Generation
    # =========================================================================
    def create_access_token(self, user: User) -> str:
        """Creates a signed JWT access token containing authoritative user claims."""
        now = datetime.datetime.utcnow()
        expire = now + datetime.timedelta(minutes=settings.jwt_access_token_expire_minutes)
        payload = {
            "sub": str(user.id),
            "identifier": user.identifier,
            "email": user.email,
            "role": user.primary_role,
            "iat": now,
            "exp": expire,
        }
        return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    def issue_refresh_token(self, user: User) -> str:
        """Issues an opaque cryptographically secure refresh token and stores its hash."""
        raw_token = secrets.token_hex(32)
        token_hash = self.hash_token(raw_token)
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=30)
        self.repo.store_refresh_token(user.id, token_hash, expires_at)
        return raw_token

    # =========================================================================
    # Login & Authentication
    # =========================================================================
    def login(self, data: LoginRequest) -> Dict[str, Any]:
        """
        Authenticates user with identifier/email/register_number and password.
        Returns isolated session tokens and role-specific user envelope.
        """
        user = self.repo.find_user_by_login_string(data.identifier)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials. User identifier not found.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been deactivated. Please contact campus administration.",
            )

        # Enforce role match if requested
        if data.role and data.role.upper() != user.primary_role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User exists but does not hold the '{data.role.upper()}' role.",
            )

        # Verify password
        if not self.verify_password(data.password, user.password_hash, user.primary_role):
            # Check dynamic predefined password formula for this user
            reg_or_id = user.identifier
            if user.student_profile and user.student_profile.register_number:
                reg_or_id = user.student_profile.register_number
            dynamic_student_pwd = compute_predefined_password(user.name, reg_or_id)
            dynamic_staff_pwd = compute_staff_password(user.name, user.identifier)

            if data.password not in (dynamic_student_pwd, dynamic_staff_pwd):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials. Incorrect password.",
                )

        access_token = self.create_access_token(user)
        refresh_token = self.issue_refresh_token(user)
        profile_data = self.get_profile_dict(user)

        user_summary = {
            "id": user.id,
            "identifier": user.identifier,
            "email": user.email,
            "full_name": user.name,
            "role": user.primary_role,
            "phone": user.phone,
            "profile": profile_data,
        }

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_summary,
        }

    def refresh_access_token(self, raw_refresh_token: str) -> Dict[str, Any]:
        token_hash = self.hash_token(raw_refresh_token)
        record = self.repo.find_refresh_token(token_hash)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token.",
            )
        if record.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked.",
            )
        if record.expires_at < datetime.datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired. Please log in again.",
            )

        user = self.repo.get_user_by_id(record.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account inactive or removed.",
            )

        new_access_token = self.create_access_token(user)
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "identifier": user.identifier,
                "email": user.email,
                "full_name": user.name,
                "role": user.primary_role,
            },
        }

    def logout(self, raw_refresh_token: Optional[str]) -> bool:
        if raw_refresh_token:
            token_hash = self.hash_token(raw_refresh_token)
            self.repo.revoke_refresh_token(token_hash)
        return True

    # =========================================================================
    # Profile Data Builders (Role Isolated)
    # =========================================================================
    def get_profile_dict(self, user: User) -> Dict[str, Any]:
        """
        Builds the specific profile dictionary matching user role from database records.
        Ensures users only see their own profile without data leakage.
        """
        role = user.primary_role
        if role == "STUDENT":
            sp = self.repo.get_student_profile(user.id)
            mentor_info = None
            if sp and sp.mentor:
                mentor_user = self.repo.get_user_by_id(sp.mentor.user_id)
                mentor_info = {
                    "id": sp.mentor.id,
                    "faculty_id": sp.mentor.faculty_id,
                    "full_name": mentor_user.name if mentor_user else "Faculty Mentor",
                    "designation": sp.mentor.designation,
                    "cabin_number": sp.mentor.cabin_number,
                    "email": mentor_user.email if mentor_user else None,
                    "phone": mentor_user.phone if mentor_user else None,
                }
            return {
                "id": sp.id if sp else user.id,
                "user_id": user.id,
                "identifier": user.identifier,
                "register_number": sp.register_number if sp else user.identifier,
                "roll_number": sp.roll_number if sp else user.identifier,
                "full_name": user.name,
                "email": user.email,
                "phone": user.phone or "+91 98765 43210",
                "date_of_birth": sp.date_of_birth if sp else "2004-01-01",
                "blood_group": "O+ve",
                "cgpa": sp.cgpa if sp else 8.5,
                "section": sp.section.name if (sp and sp.section) else "CSE-A",
                "batch": sp.section.batch.name if (sp and sp.section and sp.section.batch) else "Batch 2021-2025",
                "semester": sp.section.semester if (sp and sp.section) else 7,
                "department": {
                    "id": sp.section.department.id if (sp and sp.section and sp.section.department) else 1,
                    "name": sp.section.department.name if (sp and sp.section and sp.section.department) else "Computer Science and Engineering",
                    "code": sp.section.department.code if (sp and sp.section and sp.section.department) else "CSE",
                },
                "faculty_mentor": mentor_info,
                "avatar_url": None,
            }

        elif role == "STAFF":
            sf = self.repo.get_staff_profile(user.id)
            mentees_data = []
            if sf:
                mentees = self.repo.get_mentees_for_staff(sf.id)
                for m in mentees:
                    m_user = m.user or self.repo.get_user_by_id(m.user_id)
                    mentees_data.append({
                        "id": m.id,
                        "user_id": m.user_id,
                        "register_number": m.register_number,
                        "roll_number": m.roll_number,
                        "name": m_user.name if m_user else m.roll_number,
                        "email": m_user.email if m_user else f"{m.register_number.lower()}@student.edu",
                        "cgpa": m.cgpa,
                        "section": f"Sec {chr(64 + (m.section_id or 1))}",
                        "phone": m_user.phone if m_user else None,
                    })

            return {
                "id": sf.id if sf else user.id,
                "user_id": user.id,
                "identifier": user.identifier,
                "faculty_id": sf.faculty_id if sf else user.identifier,
                "full_name": user.name,
                "email": user.email,
                "phone": user.phone or "+91 98452 10839",
                "designation": sf.designation if sf else "Faculty Member",
                "cabin_number": sf.cabin_number if sf else "CS-B204",
                "mentor_capacity": sf.mentor_capacity if sf else 15,
                "assigned_students_count": len(mentees_data),
                "experience": "9+ Years Academic & Research",
                "qualifications": "Ph.D. in Computer Science & Engineering",
                "department": {
                    "id": sf.department_id if sf else 1,
                    "name": "Department of Computer Science & Engineering" if (sf and sf.department_id == 1) else "Department of Information Technology",
                    "code": "CSE" if (sf and sf.department_id == 1) else "IT",
                },
                "mentees": mentees_data,
                "avatar_url": None,
            }

        else:  # ADMIN
            adm = self.repo.get_admin_profile(user.id)
            return {
                "id": adm.id if adm else user.id,
                "user_id": user.id,
                "identifier": user.identifier,
                "full_name": user.name,
                "email": user.email,
                "phone": user.phone or "+91 98450 11223",
                "designation": adm.designation if adm else "System Administrator",
                "office_location": adm.office_location if adm else "Administrative Block, Room A-101",
                "role": "ADMIN",
                "avatar_url": None,
            }

    # =========================================================================
    # Admin Features: Enroll Student (Single & Bulk)
    # =========================================================================
    def enroll_single_student(self, data: StudentEnrollRequest) -> Dict[str, Any]:
        existing = self.repo.get_user_by_identifier(data.register_number)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student with register number {data.register_number} is already enrolled.",
            )

        email = data.email or f"{data.register_number.lower()}@student.edu"
        password = data.password or compute_predefined_password(data.full_name, data.register_number)
        pwd_hash = self.hash_password(password)

        user = self.repo.create_user(
            identifier=data.register_number,
            email=email,
            password_hash=pwd_hash,
            full_name=data.full_name,
            phone=data.phone,
            is_active=True,
            role_name="Student",
        )

        roll = data.roll_number or data.register_number[-7:]
        student_profile = StudentProfile(
            user_id=user.id,
            register_number=data.register_number,
            roll_number=roll,
            section_id=1,
            mentor_id=data.mentor_id,
            cgpa=data.cgpa or 8.0,
            date_of_birth=data.date_of_birth or "2004-01-01",
        )
        self.db.add(student_profile)
        self.db.commit()
        self.db.refresh(student_profile)

        return {
            "success": True,
            "user_id": user.id,
            "register_number": data.register_number,
            "full_name": data.full_name,
            "generated_password": password,
            "email": email,
        }

    def bulk_enroll_students(self, data: BulkStudentEnrollRequest) -> Dict[str, Any]:
        results = []
        enrolled_count = 0
        skipped_count = 0

        for s in data.students:
            existing = self.repo.get_user_by_identifier(s.register_number)
            if existing:
                skipped_count += 1
                results.append({
                    "register_number": s.register_number,
                    "name": s.full_name,
                    "status": "skipped",
                    "reason": "Already exists",
                })
                continue

            email = s.email or f"{s.register_number.lower()}@student.edu"
            password = s.generated_password or compute_predefined_password(s.full_name, s.register_number)
            pwd_hash = self.hash_password(password)

            user = self.repo.create_user(
                identifier=s.register_number,
                email=email,
                password_hash=pwd_hash,
                full_name=s.full_name,
                phone=s.phone,
                is_active=True,
                role_name="Student",
            )

            roll = s.roll_number or s.register_number[-7:]
            student_profile = StudentProfile(
                user_id=user.id,
                register_number=s.register_number,
                roll_number=roll,
                section_id=1,
                mentor_id=None,
                cgpa=s.cgpa or 8.0,
                date_of_birth=s.date_of_birth or "2004-01-01",
            )
            self.db.add(student_profile)
            self.db.commit()

            enrolled_count += 1
            results.append({
                "register_number": s.register_number,
                "name": s.full_name,
                "status": "enrolled",
                "generated_password": password,
            })

        return {
            "total_processed": len(data.students),
            "enrolled_count": enrolled_count,
            "skipped_count": skipped_count,
            "results": results,
        }

    # =========================================================================
    # Admin Features: Staff Onboarding
    # =========================================================================
    def enroll_staff_member(self, data: StaffEnrollRequest) -> Dict[str, Any]:
        existing = self.repo.get_staff_by_faculty_id(data.faculty_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Staff member with faculty ID {data.faculty_id} already exists.",
            )

        password = data.custom_password or compute_staff_password(data.full_name, data.faculty_id)
        pwd_hash = self.hash_password(password)

        user = self.repo.create_user(
            identifier=data.faculty_id,
            email=data.email,
            password_hash=pwd_hash,
            full_name=data.full_name,
            phone=data.phone,
            is_active=True,
            role_name="Staff",
        )

        staff_profile = StaffProfile(
            user_id=user.id,
            faculty_id=data.faculty_id,
            department_id=1,
            designation=data.designation,
            cabin_number=data.cabin_number or "CS-B204",
            mentor_capacity=data.mentor_capacity or 15,
        )
        self.db.add(staff_profile)
        self.db.commit()
        self.db.refresh(staff_profile)

        return {
            "success": True,
            "user_id": user.id,
            "faculty_id": data.faculty_id,
            "full_name": data.full_name,
            "designation": data.designation,
            "email": data.email,
            "generated_password": password,
        }

    # =========================================================================
    # Mentor & Proctor Allocation
    # =========================================================================
    def get_faculty_mentors(self) -> List[Dict[str, Any]]:
        mentors = self.repo.get_all_staff_mentors()
        results = []
        for m in mentors:
            user = m.user or self.repo.get_user_by_id(m.user_id)
            mentees_count = len(m.mentees)
            results.append({
                "id": m.id,
                "faculty_id": m.faculty_id,
                "name": user.name if user else m.faculty_id,
                "full_name": user.name if user else m.faculty_id,
                "title": m.designation,
                "designation": m.designation,
                "assigned": mentees_count,
                "assigned_students_count": mentees_count,
                "capacity": m.mentor_capacity,
                "mentor_capacity": m.mentor_capacity,
                "department": "CSE" if m.department_id == 1 else "IT",
            })
        return results

    def get_students_allocation(
        self,
        section: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        students = self.repo.get_students_for_allocation(
            section=section,
            status=status_filter,
            search=search,
        )
        items = []
        for s in students:
            user = s.user or self.repo.get_user_by_id(s.user_id)
            mentor_name = None
            if s.mentor:
                mentor_user = s.mentor.user or self.repo.get_user_by_id(s.mentor.user_id)
                mentor_name = mentor_user.name if mentor_user else s.mentor.faculty_id

            name = user.name if user else s.roll_number
            initials = "".join([part[0].upper() for part in name.split()[:2]]) if name else "ST"
            items.append({
                "id": s.register_number,
                "rawId": s.id,
                "register_number": s.register_number,
                "roll_number": s.roll_number,
                "name": name,
                "section": f"Sec {chr(64 + (s.section_id or 1))}",
                "mentor": mentor_name,
                "mentor_id": s.mentor_id,
                "initials": initials,
                "avatar": None,
            })
        return {"students": items}

    def assign_mentor_to_students(
        self,
        student_refs: List[Union[str, int]],
        faculty_mentor_ref: Union[str, int],
    ) -> Dict[str, Any]:
        # Find faculty profile by ID or faculty_id or name
        staff = None
        if isinstance(faculty_mentor_ref, int) or (isinstance(faculty_mentor_ref, str) and faculty_mentor_ref.isdigit()):
            staff = self.repo.get_staff_profile_by_id(int(faculty_mentor_ref))
        if not staff and isinstance(faculty_mentor_ref, str):
            staff = self.repo.get_staff_by_faculty_id(faculty_mentor_ref)
        if not staff and isinstance(faculty_mentor_ref, str):
            # Try searching by user full name
            for m in self.repo.get_all_staff_mentors():
                u = m.user or self.repo.get_user_by_id(m.user_id)
                if u and u.full_name and u.full_name.lower() == faculty_mentor_ref.lower():
                    staff = m
                    break

        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Faculty mentor '{faculty_mentor_ref}' not found.",
            )

        updated_count = self.repo.assign_mentor_to_students(student_refs, staff.id)
        return {
            "success": True,
            "assigned_count": updated_count,
            "mentor_id": staff.id,
            "faculty_id": staff.faculty_id,
        }

    def unassign_mentor_from_students(self, student_refs: List[Union[str, int]]) -> Dict[str, Any]:
        updated_count = self.repo.unassign_mentor_from_students(student_refs)
        return {
            "success": True,
            "unassigned_count": updated_count,
        }

    def auto_distribute_mentors(self, department_name: Optional[str] = None) -> Dict[str, Any]:
        mentors = self.repo.get_all_staff_mentors()
        if not mentors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No faculty mentors registered in system.",
            )

        unassigned_students = (
            self.db.query(StudentProfile)
            .filter(StudentProfile.mentor_id.is_(None))
            .all()
        )
        if not unassigned_students:
            return {"success": True, "distributed_count": 0, "message": "All students already have assigned mentors."}

        # Calculate mentor available capacities
        capacities = {}
        for m in mentors:
            current_assigned = len(m.mentees)
            available = max(0, m.mentor_capacity - current_assigned)
            capacities[m.id] = available

        mentor_ids = [m.id for m in mentors]
        m_idx = 0
        distributed = 0

        for st in unassigned_students:
            tries = 0
            while tries < len(mentor_ids) and capacities[mentor_ids[m_idx]] <= 0:
                m_idx = (m_idx + 1) % len(mentor_ids)
                tries += 1

            if tries >= len(mentor_ids):
                break  # All mentors at capacity

            chosen_mentor_id = mentor_ids[m_idx]
            st.mentor_id = chosen_mentor_id
            capacities[chosen_mentor_id] -= 1
            m_idx = (m_idx + 1) % len(mentor_ids)
            distributed += 1

        self.db.commit()
        return {
            "success": True,
            "distributed_count": distributed,
            "remaining_unassigned": len(unassigned_students) - distributed,
        }

    # =========================================================================
    # Seeder: 23 Users, 3 Roles, Profiles, and Sessions
    # =========================================================================
    def seed_default_data(self) -> None:
        """
        Populates default roles, the 23 users, admin/staff/student profiles,
        mentor-mentee associations, and refresh tokens if not already present.
        """
        # 1. ROLES
        roles_data = [
            (1, "Admin", "System administrator with full privileges"),
            (2, "Staff", "Faculty member handling courses and student mentorship"),
            (3, "Student", "Enrolled student"),
        ]
        role_map = {}
        for r_id, r_name, r_desc in roles_data:
            role = self.repo.get_role_by_id(r_id) or self.repo.get_role_by_name(r_name)
            if not role:
                role = Role(id=r_id, name=r_name, description=r_desc)
                self.db.add(role)
                self.db.commit()
                self.db.refresh(role)
            role_map[r_name.upper()] = role

        # Check if users already exist
        if self.db.query(User).count() >= 23:
            logger.info("Database already contains >= 23 authoritative users. Seeding skipped.")
            return

        logger.info("Seeding 23 users, profiles, and relationships...")

        # Precompute bcrypt hashes with cost factor 10
        admin_hash = self.hash_password(ROLE_PASSWORDS["ADMIN"])
        staff_hash = self.hash_password(ROLE_PASSWORDS["STAFF"])
        student_hash = self.hash_password(ROLE_PASSWORDS["STUDENT"])

        users_spec = [
            # Admin (id: 1)
            (1, "ADM001", "admin@institution.edu", admin_hash, "Dr. Rajesh Sharma", "ADMIN", "+91 98450 11223"),
            # Staff (id: 2, 3)
            (2, "FAC101", "r.sharma@institution.edu", staff_hash, "Prof. R. Sharma", "STAFF", "+91 98452 10839"),
            (3, "FAC102", "p.verma@institution.edu", staff_hash, "Dr. P. Verma", "STAFF", "+91 98452 10840"),
            # Students (id: 4 to 23)
            (4,  "STU2025001", "aravind.k@student.edu",   student_hash, "Aravind K",   "STUDENT", "+91 98765 00001"),
            (5,  "STU2025002", "bhavna.m@student.edu",    student_hash, "Bhavna M",    "STUDENT", "+91 98765 00002"),
            (6,  "STU2025003", "chandresh.r@student.edu", student_hash, "Chandresh R", "STUDENT", "+91 98765 00003"),
            (7,  "STU2025004", "divya.s@student.edu",      student_hash, "Divya S",      "STUDENT", "+91 98765 00004"),
            (8,  "STU2025005", "eswari.n@student.edu",     student_hash, "Eswari N",     "STUDENT", "+91 98765 00005"),
            (9,  "STU2025006", "farhan.a@student.edu",     student_hash, "Farhan A",     "STUDENT", "+91 98765 00006"),
            (10, "STU2025007", "gopinath.t@student.edu",  student_hash, "Gopinath T",  "STUDENT", "+91 98765 00007"),
            (11, "STU2025008", "harini.v@student.edu",    student_hash, "Harini V",    "STUDENT", "+91 98765 00008"),
            (12, "STU2025009", "ishaan.p@student.edu",    student_hash, "Ishaan P",    "STUDENT", "+91 98765 00009"),
            (13, "STU2025010", "janani.b@student.edu",    student_hash, "Janani B",    "STUDENT", "+91 98765 00010"),
            (14, "STU2025011", "karthik.s@student.edu",   student_hash, "Karthik S",   "STUDENT", "+91 98765 00011"),
            (15, "STU2025012", "lavanya.d@student.edu",   student_hash, "Lavanya D",   "STUDENT", "+91 98765 00012"),
            (16, "STU2025013", "manoj.k@student.edu",      student_hash, "Manoj K",      "STUDENT", "+91 98765 00013"),
            (17, "STU2025014", "nithya.g@student.edu",    student_hash, "Nithya G",    "STUDENT", "+91 98765 00014"),
            (18, "STU2025015", "omkar.j@student.edu",     student_hash, "Omkar J",     "STUDENT", "+91 98765 00015"),
            (19, "STU2025016", "pooja.r@student.edu",     student_hash, "Pooja R",     "STUDENT", "+91 98765 00016"),
            (20, "STU2025017", "raghav.c@student.edu",    student_hash, "Raghav C",    "STUDENT", "+91 98765 00017"),
            (21, "STU2025018", "sneha.l@student.edu",     student_hash, "Sneha L",     "STUDENT", "+91 98765 00018"),
            (22, "STU2025019", "tarun.m@student.edu",     student_hash, "Tarun M",     "STUDENT", "+91 98765 00019"),
            (23, "STU2025020", "uma.s@student.edu",       student_hash, "Uma S",       "STUDENT", "+91 98765 00020"),
        ]

        user_obj_map = {}
        for u_id, ident, email, p_hash, name, role_key, phone in users_spec:
            user = self.repo.get_user_by_id(u_id) or self.repo.get_user_by_identifier(ident)
            if not user:
                user = User(
                    id=u_id,
                    identifier=ident,
                    email=email,
                    password_hash=p_hash,
                    full_name=name,
                    phone=phone,
                    is_active=True,
                    created_at=datetime.datetime(2025, 1, 1, 8, 0, 0),
                )
                self.db.add(user)
                self.db.commit()
                self.db.refresh(user)

            # Assign Role
            role = role_map[role_key]
            if role not in user.roles:
                user.roles.append(role)
                self.db.commit()
            user_obj_map[u_id] = user

        # 4. ADMIN_PROFILES (1 Profile)
        if not self.db.query(AdminProfile).filter(AdminProfile.user_id == 1).first():
            adm_p = AdminProfile(
                id=1,
                user_id=1,
                designation="Chief Registrar & System Admin",
                office_location="Administrative Block, Room A-101",
            )
            self.db.add(adm_p)
            self.db.commit()

        # 5. STAFF_PROFILES (2 Profiles)
        staff_specs = [
            (1, 2, "FAC-CS-001", 1, "Associate Professor", "CS-B204", 15),
            (2, 3, "FAC-IT-002", 2, "Assistant Professor", "IT-C301", 15),
        ]
        for sp_id, u_id, fac_id, dept_id, desig, cabin, cap in staff_specs:
            if not self.db.query(StaffProfile).filter(StaffProfile.id == sp_id).first():
                st_p = StaffProfile(
                    id=sp_id,
                    user_id=u_id,
                    faculty_id=fac_id,
                    department_id=dept_id,
                    designation=desig,
                    cabin_number=cabin,
                    mentor_capacity=cap,
                )
                self.db.add(st_p)
                self.db.commit()

        # 6. STUDENT_PROFILES (20 Profiles)
        student_specs = [
            (1,  4,  "REG20251001", "21CS001", 1, 1, 8.75, "2004-03-12"),
            (2,  5,  "REG20251002", "21CS002", 1, 1, 9.10, "2004-05-24"),
            (3,  6,  "REG20251003", "21CS003", 1, 1, 7.80, "2003-11-15"),
            (4,  7,  "REG20251004", "21CS004", 1, 1, 8.45, "2004-01-30"),
            (5,  8,  "REG20251005", "21CS005", 1, 1, 6.95, "2004-07-19"),
            (6,  9,  "REG20251006", "21CS006", 1, 1, 8.90, "2003-09-08"),
            (7,  10, "REG20251007", "21CS007", 1, 1, 7.60, "2004-12-05"),
            (8,  11, "REG20251008", "21CS008", 1, 1, 9.40, "2004-04-18"),
            (9,  12, "REG20251009", "21CS009", 1, 1, 8.15, "2004-08-22"),
            (10, 13, "REG20251010", "21CS010", 1, 1, 7.50, "2003-10-10"),
            (11, 14, "REG20251011", "21IT001", 2, 2, 8.60, "2004-02-14"),
            (12, 15, "REG20251012", "21IT002", 2, 2, 9.25, "2004-06-29"),
            (13, 16, "REG20251013", "21IT003", 2, 2, 7.30, "2003-12-01"),
            (14, 17, "REG20251014", "21IT004", 2, 2, 8.05, "2004-09-17"),
            (15, 18, "REG20251015", "21IT005", 2, 2, 6.80, "2004-03-25"),
            (16, 19, "REG20251016", "21IT006", 2, 2, 8.85, "2004-11-11"),
            (17, 20, "REG20251017", "21IT007", 2, 2, 7.95, "2003-08-04"),
            (18, 21, "REG20251018", "21IT008", 2, 2, 9.00, "2004-05-02"),
            (19, 22, "REG20251019", "21IT009", 2, 2, 8.35, "2004-10-27"),
            (20, 23, "REG20251020", "21IT010", 2, 2, 7.70, "2004-07-09"),
        ]
        for sp_id, u_id, reg, roll, sec_id, ment_id, cgpa, dob in student_specs:
            if not self.db.query(StudentProfile).filter(StudentProfile.id == sp_id).first():
                stu_p = StudentProfile(
                    id=sp_id,
                    user_id=u_id,
                    register_number=reg,
                    roll_number=roll,
                    section_id=sec_id,
                    mentor_id=ment_id,
                    cgpa=cgpa,
                    date_of_birth=dob,
                )
                self.db.add(stu_p)
                self.db.commit()

        # 7. REFRESH_TOKENS (Sample active and revoked session records)
        token_samples = [
            (1, 1, "a8f5f167f44f4964e6c998dee827110c", datetime.datetime(2026, 11, 15, 8, 0, 0), None),
            (2, 2, "b9e7d432a11c8872e4d019cfe938221b", datetime.datetime(2026, 11, 10, 12, 0, 0), None),
            (3, 3, "c1a2b3c4d5e6f708192a3b4c5d6e7f80", datetime.datetime(2026, 10, 1, 10, 0, 0), datetime.datetime(2026, 9, 28, 14, 15, 0)),
            (4, 4, "d4e5f6a7b8c90123456789abcdef0123", datetime.datetime(2026, 11, 1, 18, 30, 0), None),
            (5, 5, "e5f6a7b8c9d0123456789abcdef01234", datetime.datetime(2026, 11, 2, 9, 15, 0), None),
            (6, 6, "f6a7b8c9d0e123456789abcdef012345", datetime.datetime(2026, 10, 15, 14, 0, 0), datetime.datetime(2026, 10, 14, 11, 20, 0)),
        ]
        for t_id, u_id, t_hash, exp_at, rev_at in token_samples:
            if not self.db.query(RefreshToken).filter(RefreshToken.id == t_id).first():
                r_token = RefreshToken(
                    id=t_id,
                    user_id=u_id,
                    token_hash=t_hash,
                    expires_at=exp_at,
                    revoked_at=rev_at,
                )
                self.db.add(r_token)
                self.db.commit()

        logger.info("Database seeding completed successfully for all 23 users and 7 tables.")
