import datetime
from typing import List, Optional, Union
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.modules.auth.models import (
    AdminProfile,
    RefreshToken,
    Role,
    StaffProfile,
    StudentProfile,
    User,
    user_roles,
)


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------------------------------
    # User Lookups
    # -------------------------------------------------------------------------
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return (
            self.db.query(User)
            .options(
                joinedload(User.roles),
                joinedload(User.student_profile),
                joinedload(User.staff_profile),
                joinedload(User.admin_profile),
            )
            .filter(User.id == user_id)
            .first()
        )

    def get_user_by_identifier(self, identifier: str) -> Optional[User]:
        return (
            self.db.query(User)
            .options(
                joinedload(User.roles),
                joinedload(User.student_profile),
                joinedload(User.staff_profile),
                joinedload(User.admin_profile),
            )
            .filter(User.identifier.ilike(identifier.strip()))
            .first()
        )

    def get_user_by_email(self, email: str) -> Optional[User]:
        return (
            self.db.query(User)
            .options(
                joinedload(User.roles),
                joinedload(User.student_profile),
                joinedload(User.staff_profile),
                joinedload(User.admin_profile),
            )
            .filter(User.email.ilike(email.strip()))
            .first()
        )

    def find_user_by_login_string(self, login_str: str) -> Optional[User]:
        """Matches either identifier, email, student register_number, or faculty_id."""
        cleaned = login_str.strip()
        user = (
            self.db.query(User)
            .options(
                joinedload(User.roles),
                joinedload(User.student_profile),
                joinedload(User.staff_profile),
                joinedload(User.admin_profile),
            )
            .filter(
                or_(
                    User.identifier.ilike(cleaned),
                    User.email.ilike(cleaned),
                )
            )
            .first()
        )
        if user:
            return user

        # Check student register number
        student = (
            self.db.query(StudentProfile)
            .filter(
                or_(
                    StudentProfile.register_number.ilike(cleaned),
                    StudentProfile.roll_number.ilike(cleaned),
                )
            )
            .first()
        )
        if student:
            return self.get_user_by_id(student.user_id)

        # Check faculty ID
        staff = (
            self.db.query(StaffProfile)
            .filter(StaffProfile.faculty_id.ilike(cleaned))
            .first()
        )
        if staff:
            return self.get_user_by_id(staff.user_id)

        return None

    # -------------------------------------------------------------------------
    # Role Lookups & Assignments
    # -------------------------------------------------------------------------
    def get_role_by_name(self, name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name.ilike(name.strip())).first()

    def get_role_by_id(self, role_id: int) -> Optional[Role]:
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_all_roles(self) -> List[Role]:
        return self.db.query(Role).all()

    def assign_role_to_user(self, user: User, role: Role) -> None:
        if role not in user.roles:
            user.roles.append(role)
            self.db.commit()
            self.db.refresh(user)

    # -------------------------------------------------------------------------
    # User Creation
    # -------------------------------------------------------------------------
    def create_user(
        self,
        identifier: str,
        email: str,
        password_hash: str,
        full_name: Optional[str] = None,
        phone: Optional[str] = None,
        is_active: bool = True,
        role_name: str = "Student",
    ) -> User:
        user = User(
            identifier=identifier.strip(),
            email=email.strip().lower(),
            password_hash=password_hash,
            full_name=full_name.strip() if full_name else None,
            phone=phone.strip() if phone else None,
            is_active=is_active,
            created_at=datetime.datetime.utcnow(),
        )
        role = self.get_role_by_name(role_name)
        if role:
            user.roles.append(role)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    # -------------------------------------------------------------------------
    # Profile Lookups & Mutations
    # -------------------------------------------------------------------------
    def get_student_profile(self, user_id: int) -> Optional[StudentProfile]:
        return (
            self.db.query(StudentProfile)
            .options(joinedload(StudentProfile.mentor), joinedload(StudentProfile.user))
            .filter(StudentProfile.user_id == user_id)
            .first()
        )

    def get_staff_profile(self, user_id: int) -> Optional[StaffProfile]:
        return (
            self.db.query(StaffProfile)
            .options(
                joinedload(StaffProfile.mentees).joinedload(StudentProfile.user),
                joinedload(StaffProfile.user),
            )
            .filter(StaffProfile.user_id == user_id)
            .first()
        )

    def get_admin_profile(self, user_id: int) -> Optional[AdminProfile]:
        return (
            self.db.query(AdminProfile)
            .options(joinedload(AdminProfile.user))
            .filter(AdminProfile.user_id == user_id)
            .first()
        )

    def get_staff_by_faculty_id(self, faculty_id: str) -> Optional[StaffProfile]:
        return (
            self.db.query(StaffProfile)
            .options(
                joinedload(StaffProfile.mentees),
                joinedload(StaffProfile.user),
            )
            .filter(StaffProfile.faculty_id.ilike(faculty_id.strip()))
            .first()
        )

    def get_staff_profile_by_id(self, staff_id: int) -> Optional[StaffProfile]:
        return (
            self.db.query(StaffProfile)
            .options(
                joinedload(StaffProfile.mentees),
                joinedload(StaffProfile.user),
            )
            .filter(StaffProfile.id == staff_id)
            .first()
        )

    def get_all_staff_mentors(self) -> List[StaffProfile]:
        return (
            self.db.query(StaffProfile)
            .options(
                joinedload(StaffProfile.mentees),
                joinedload(StaffProfile.user),
            )
            .all()
        )

    def get_mentees_for_staff(self, staff_profile_id: int) -> List[StudentProfile]:
        return (
            self.db.query(StudentProfile)
            .options(joinedload(StudentProfile.user))
            .filter(StudentProfile.mentor_id == staff_profile_id)
            .all()
        )

    def get_students_for_allocation(
        self,
        section: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[StudentProfile]:
        q = self.db.query(StudentProfile).options(
            joinedload(StudentProfile.user),
            joinedload(StudentProfile.mentor).joinedload(StaffProfile.user),
        )

        if status == "assigned":
            q = q.filter(StudentProfile.mentor_id.isnot(None))
        elif status == "unassigned":
            q = q.filter(StudentProfile.mentor_id.is_(None))

        students = q.all()

        if search:
            term = search.strip().lower()
            students = [
                s
                for s in students
                if (
                    term in s.register_number.lower()
                    or term in s.roll_number.lower()
                    or (s.user and s.user.full_name and term in s.user.full_name.lower())
                )
            ]

        return students

    def assign_mentor_to_students(
        self,
        student_refs: List[Union[str, int]],
        staff_profile_id: int,
    ) -> int:
        updated = 0
        for ref in student_refs:
            q = self.db.query(StudentProfile)
            if isinstance(ref, int) or (isinstance(ref, str) and ref.isdigit()):
                student = q.filter(
                    or_(
                        StudentProfile.id == int(ref),
                        StudentProfile.register_number == str(ref),
                    )
                ).first()
            else:
                student = q.filter(
                    or_(
                        StudentProfile.register_number.ilike(str(ref)),
                        StudentProfile.roll_number.ilike(str(ref)),
                    )
                ).first()

            if student:
                student.mentor_id = staff_profile_id
                updated += 1

        self.db.commit()
        return updated

    def unassign_mentor_from_students(
        self,
        student_refs: List[Union[str, int]],
    ) -> int:
        updated = 0
        for ref in student_refs:
            q = self.db.query(StudentProfile)
            if isinstance(ref, int) or (isinstance(ref, str) and ref.isdigit()):
                student = q.filter(
                    or_(
                        StudentProfile.id == int(ref),
                        StudentProfile.register_number == str(ref),
                    )
                ).first()
            else:
                student = q.filter(
                    or_(
                        StudentProfile.register_number.ilike(str(ref)),
                        StudentProfile.roll_number.ilike(str(ref)),
                    )
                ).first()

            if student:
                student.mentor_id = None
                updated += 1

        self.db.commit()
        return updated

    # -------------------------------------------------------------------------
    # Refresh Tokens
    # -------------------------------------------------------------------------
    def store_refresh_token(
        self,
        user_id: int,
        token_hash: str,
        expires_at: datetime.datetime,
    ) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            revoked_at=None,
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def find_refresh_token(self, token_hash: str) -> Optional[RefreshToken]:
        return (
            self.db.query(RefreshToken)
            .filter(RefreshToken.token_hash == token_hash)
            .first()
        )

    def revoke_refresh_token(self, token_hash: str) -> bool:
        rec = self.find_refresh_token(token_hash)
        if rec and not rec.revoked_at:
            rec.revoked_at = datetime.datetime.utcnow()
            self.db.commit()
            return True
        return False
