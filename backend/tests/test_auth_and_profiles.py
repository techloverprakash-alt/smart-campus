import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.modules.auth.models import (
    AdminProfile,
    RefreshToken,
    Role,
    StaffProfile,
    StudentProfile,
    User,
)
from app.modules.auth.service import AuthService

# Use SQLite test database or local campus DB
TEST_DB_PATH = backend_dir / "test_auth_system.db"
if TEST_DB_PATH.exists():
    TEST_DB_PATH.unlink()

test_engine = create_engine(
    f"sqlite:///{TEST_DB_PATH}",
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create tables
Base.metadata.create_all(bind=test_engine)

# Seed default data
db = TestingSessionLocal()
try:
    auth_service = AuthService(db)
    auth_service.seed_default_data()
finally:
    db.close()


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_seed_integrity():
    print("\n--- Test 1: Seed Integrity (23 Users, 3 Roles, Profiles) ---")
    db = TestingSessionLocal()
    try:
        roles_count = db.query(Role).count()
        users_count = db.query(User).count()
        admin_count = db.query(AdminProfile).count()
        staff_count = db.query(StaffProfile).count()
        student_count = db.query(StudentProfile).count()

        print(f"Roles count: {roles_count} (Expected: 3)")
        print(f"Users count: {users_count} (Expected: 23)")
        print(f"Admin profiles: {admin_count} (Expected: 1)")
        print(f"Staff profiles: {staff_count} (Expected: 2)")
        print(f"Student profiles: {student_count} (Expected: 20)")

        assert roles_count == 3, f"Expected 3 roles, got {roles_count}"
        assert users_count == 23, f"Expected 23 users, got {users_count}"
        assert admin_count == 1, f"Expected 1 admin profile, got {admin_count}"
        assert staff_count == 2, f"Expected 2 staff profiles, got {staff_count}"
        assert student_count == 20, f"Expected 20 student profiles, got {student_count}"

        # Verify mentor assignments (first 10 to mentor 1, second 10 to mentor 2)
        mentor1_mentees = db.query(StudentProfile).filter(StudentProfile.mentor_id == 1).count()
        mentor2_mentees = db.query(StudentProfile).filter(StudentProfile.mentor_id == 2).count()
        print(f"Mentor 1 mentees: {mentor1_mentees} (Expected: 10)")
        print(f"Mentor 2 mentees: {mentor2_mentees} (Expected: 10)")
        assert mentor1_mentees == 10, f"Expected 10 mentees for mentor 1, got {mentor1_mentees}"
        assert mentor2_mentees == 10, f"Expected 10 mentees for mentor 2, got {mentor2_mentees}"
        print(">>> Seed Integrity: PASSED")
    finally:
        db.close()


def test_authentication_and_passwords():
    print("\n--- Test 2: Role-based Authentication & Password Verification ---")
    
    # 1. Admin login with role password
    res_admin = client.post("/api/v1/auth/login", json={
        "identifier": "ADM001",
        "password": "Admin@123",
        "role": "ADMIN"
    })
    assert res_admin.status_code == 200, f"Admin login failed: {res_admin.text}"
    admin_data = res_admin.json()
    assert "access_token" in admin_data
    assert admin_data["user"]["role"] == "ADMIN"
    print(f"Admin Login Success! Token generated. User: {admin_data['user']['identifier']}")

    # 2. Staff login with role password
    res_staff = client.post("/api/v1/auth/login", json={
        "identifier": "FAC101",
        "password": "Staff@123",
        "role": "STAFF"
    })
    assert res_staff.status_code == 200, f"Staff login failed: {res_staff.text}"
    staff_data = res_staff.json()
    assert staff_data["user"]["role"] == "STAFF"
    print(f"Staff Login Success! User: {staff_data['user']['identifier']}")

    # 3. Student login with role password
    res_student = client.post("/api/v1/auth/login", json={
        "identifier": "STU2025001",
        "password": "Student@123",
        "role": "STUDENT"
    })
    assert res_student.status_code == 200, f"Student login failed: {res_student.text}"
    student_data = res_student.json()
    assert student_data["user"]["role"] == "STUDENT"
    print(f"Student Login Success! User: {student_data['user']['identifier']}")

    # 4. Universal password login
    res_universal = client.post("/api/v1/auth/login", json={
        "identifier": "STU2025002",
        "password": "Password@123",
    })
    assert res_universal.status_code == 200, f"Universal password login failed: {res_universal.text}"
    print(f"Universal Password Login Success for STU2025002!")

    # 5. Invalid password rejection
    res_invalid = client.post("/api/v1/auth/login", json={
        "identifier": "ADM001",
        "password": "WrongPassword!999",
    })
    assert res_invalid.status_code == 401, f"Expected 401, got {res_invalid.status_code}"
    print("Invalid Password Rejection: PASSED (Returned 401 Unauthorized)")
    print(">>> Authentication & Password Verification: PASSED")


def test_session_isolation_and_profiles():
    print("\n--- Test 3: Session & Profile Isolation ---")

    # Log in as Student 1
    s_login = client.post("/api/v1/auth/login", json={"identifier": "STU2025001", "password": "Student@123"}).json()
    s_token = s_login["access_token"]
    
    # Get student profile
    s_res = client.get("/api/v1/profiles/me", headers={"Authorization": f"Bearer {s_token}"})
    assert s_res.status_code == 200, f"Student profile get failed: {s_res.text}"
    s_prof = s_res.json()
    assert s_prof["register_number"] == "REG20251001"
    assert s_prof["faculty_mentor"] is not None
    assert s_prof["faculty_mentor"]["faculty_id"] == "FAC-CS-001"
    print(f"Student Profile isolated successfully: {s_prof['full_name']} (Reg: {s_prof['register_number']}), Mentor: {s_prof['faculty_mentor']['full_name']}")

    # Log in as Staff 1
    staff_login = client.post("/api/v1/auth/login", json={"identifier": "FAC101", "password": "Staff@123"}).json()
    staff_token = staff_login["access_token"]

    # Get staff profile
    staff_res = client.get("/api/v1/profiles/me", headers={"Authorization": f"Bearer {staff_token}"})
    assert staff_res.status_code == 200, f"Staff profile get failed: {staff_res.text}"
    staff_prof = staff_res.json()
    assert staff_prof["faculty_id"] == "FAC-CS-001"
    assert "mentees" in staff_prof
    assert len(staff_prof["mentees"]) == 10
    print(f"Staff Profile isolated successfully: {staff_prof['full_name']} has {len(staff_prof['mentees'])} assigned student mentees.")

    # Log in as Admin
    admin_login = client.post("/api/v1/auth/login", json={"identifier": "ADM001", "password": "Admin@123"}).json()
    admin_token = admin_login["access_token"]

    # Get admin profile
    admin_res = client.get("/api/v1/profiles/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_res.status_code == 200
    admin_prof = admin_res.json()
    assert admin_prof["designation"] == "Chief Registrar & System Admin"
    print(f"Admin Profile isolated successfully: {admin_prof['full_name']} ({admin_prof['designation']})")
    print(">>> Session & Profile Isolation: PASSED")


def test_admin_enrollment_and_allocation():
    print("\n--- Test 4: Admin Enrollment & Proctor Allocation ---")
    admin_login = client.post("/api/v1/auth/login", json={"identifier": "ADM001", "password": "Admin@123"}).json()
    admin_token = admin_login["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Single student enrollment
    enroll_res = client.post("/api/v1/profiles/students", headers=admin_headers, json={
        "full_name": "Divyesh Patel",
        "register_number": "REG20251099",
        "email": "divyesh.p@student.edu",
        "department_code": "CSE",
        "batch_name": "2021-2025",
        "section_name": "Section A",
    })
    assert enroll_res.status_code == 200, f"Enroll student failed: {enroll_res.text}"
    print(f"Admin enrolled single student: {enroll_res.json()['full_name']} (Reg: {enroll_res.json()['register_number']})")

    # 2. Bulk student enrollment
    bulk_res = client.post("/api/v1/profiles/students/bulk", headers=admin_headers, json={
        "students": [
            {"register_number": "REG20251101", "full_name": "Alok Mishra", "email": "alok.m@student.edu"},
            {"register_number": "REG20251102", "full_name": "Geeta Raman", "email": "geeta.r@student.edu"},
        ],
        "default_department_code": "CSE",
    })
    assert bulk_res.status_code == 200, f"Bulk enroll failed: {bulk_res.text}"
    bulk_data = bulk_res.json()
    assert bulk_data["enrolled_count"] == 2
    print(f"Admin bulk enrolled {bulk_data['enrolled_count']} students.")

    # 3. Staff onboarding
    staff_onboard_res = client.post("/api/v1/profiles/staff", headers=admin_headers, json={
        "faculty_id": "FAC-CS-005",
        "full_name": "Dr. Sunita Rao",
        "email": "sunita.r@institution.edu",
        "department_name": "Computer Science and Engineering",
        "designation": "Associate Professor",
        "cabin_number": "CS-B208",
        "mentor_capacity": 20,
    })
    assert staff_onboard_res.status_code == 200, f"Staff onboarding failed: {staff_onboard_res.text}"
    print(f"Admin onboarded new faculty: {staff_onboard_res.json()['full_name']} ({staff_onboard_res.json()['faculty_id']})")

    # 4. Fetch faculty mentors
    mentors_res = client.get("/api/v1/profiles/staff/mentors", headers=admin_headers)
    assert mentors_res.status_code == 200
    mentors = mentors_res.json()
    print(f"Admin fetched {len(mentors)} active faculty mentors.")
    assert len(mentors) >= 3

    # 5. Assign newly enrolled student to new staff mentor
    assign_res = client.patch("/api/v1/profiles/students/assign-mentor", headers=admin_headers, json={
        "student_ids": ["REG20251099"],
        "faculty_mentor_id": "FAC-CS-005",
    })
    assert assign_res.status_code == 200, f"Mentor assign failed: {assign_res.text}"
    print("Admin successfully assigned student REG20251099 to mentor FAC-CS-005.")

    # 6. Verify allocation list
    alloc_res = client.get("/api/v1/profiles/students/allocation", headers=admin_headers)
    assert alloc_res.status_code == 200
    alloc_students = alloc_res.json()["students"]
    assigned_stu = next((s for s in alloc_students if s["id"] == "REG20251099"), None)
    assert assigned_stu is not None
    assert assigned_stu["mentor"] == "Dr. Sunita Rao"
    print(f"Verified allocation: Student REG20251099 is assigned to {assigned_stu['mentor']}.")
    print(">>> Admin Enrollment & Proctor Allocation: PASSED")


def test_role_authorization_enforcement():
    print("\n--- Test 5: Role Authorization & Protection ---")
    # Student attempts to enroll another student
    s_login = client.post("/api/v1/auth/login", json={"identifier": "STU2025001", "password": "Student@123"}).json()
    student_token = s_login["access_token"]

    unauth_res = client.post("/api/v1/profiles/students", headers={"Authorization": f"Bearer {student_token}"}, json={
        "full_name": "Hacker User",
        "register_number": "REG999999",
    })
    assert unauth_res.status_code == 403, f"Expected 403 Forbidden, got {unauth_res.status_code}"
    print(f"Unauthorized student enrollment blocked with 403 Forbidden: {unauth_res.json()['detail']}")

    # Unauthenticated request rejected
    no_auth_res = client.get("/api/v1/profiles/me")
    assert no_auth_res.status_code == 401
    print(f"Unauthenticated request blocked with 401: {no_auth_res.json()['detail']}")
    print(">>> Role Authorization & Protection: PASSED")


if __name__ == "__main__":
    test_seed_integrity()
    test_authentication_and_passwords()
    test_session_isolation_and_profiles()
    test_admin_enrollment_and_allocation()
    test_role_authorization_enforcement()
    print("\n=======================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (5/5 Test Suites)")
    print("=======================================================")
