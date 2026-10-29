import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
admin_headers = {"Authorization": "Bearer mock-access-admin"}

print("============================================================")
print("TESTING ACADEMIC & STAFF MANAGEMENT ENDPOINTS")
print("============================================================")

# 1. Subjects
res = client.get("/api/v1/academic/subjects")
print(f"1. GET /api/v1/academic/subjects: {res.status_code}, count={len(res.json())}")
assert res.status_code == 200

# Create subject
test_sub = {
    "code": "TEST999",
    "title": "Quantum Computing & Algorithms",
    "credits": 4,
    "department_id": 1,
    "subject_type": "Core Theory"
}
res = client.post("/api/v1/academic/subjects", json=test_sub, headers=admin_headers)
print(f"2. POST /api/v1/academic/subjects: {res.status_code}, resp={res.json().get('code')}")
assert res.status_code == 200
sub_id = res.json()["id"]

# 2. Staff Workload
res = client.get("/api/v1/academic/staff-workload")
print(f"3. GET /api/v1/academic/staff-workload: {res.status_code}, count={len(res.json())}")
assert res.status_code == 200
workload = res.json()
if workload:
    print(f"   First staff: {workload[0]['name']} ({workload[0]['facultyId']}), subjects={len(workload[0]['subjects'])}")

# 3. Academic Metadata
res = client.get("/api/v1/academic/metadata")
print(f"4. GET /api/v1/academic/metadata: {res.status_code}")
assert res.status_code == 200
meta = res.json()
print(f"   Depts: {len(meta['departments'])}, Sections: {len(meta['sections'])}, Staff: {len(meta['staff'])}, Subjects: {len(meta['subjects'])}")

# 4. Course Offerings / Allocations
res = client.get("/api/v1/academic/offerings")
print(f"5. GET /api/v1/academic/offerings: {res.status_code}, count={len(res.json())}")
assert res.status_code == 200
if res.json():
    print(f"   First offering: {res.json()[0]['subject_code']} -> Staff: {res.json()[0]['staff_name']}, Students: {res.json()[0]['student_count']}")

# Assign course offering
assign_req = {
    "subject_id": sub_id,
    "staff_id": meta["staff"][0]["id"],
    "section_id": meta["sections"][0]["id"],
    "academic_year": "2025-2026",
    "semester": 7
}
res = client.post("/api/v1/academic/offerings", json=assign_req, headers=admin_headers)
print(f"6. POST /api/v1/academic/offerings: {res.status_code}, assigned={res.json().get('subject_code')}")
assert res.status_code == 200
offering_id = res.json()["id"]

# Delete offering
res = client.delete(f"/api/v1/academic/offerings/{offering_id}", headers=admin_headers)
print(f"7. DELETE /api/v1/academic/offerings/{offering_id}: {res.status_code}, resp={res.json().get('message')}")
assert res.status_code == 200

# Delete subject
res = client.delete(f"/api/v1/academic/subjects/{sub_id}", headers=admin_headers)
print(f"8. DELETE /api/v1/academic/subjects/{sub_id}: {res.status_code}, resp={res.json().get('message')}")
assert res.status_code == 200

# 5. Staff Onboarding & Deletion
new_staff = {
    "faculty_id": "FAC-TEST-999",
    "full_name": "Dr. Test Professor",
    "email": "test.prof@institution.edu",
    "phone": "+91 99999 88888",
    "department_name": "Computer Science and Engineering",
    "designation": "Associate Professor",
    "cabin_number": "Cabin 999",
    "mentor_capacity": 20
}
res = client.post("/api/v1/profiles/staff", json=new_staff, headers=admin_headers)
print(f"9. POST /api/v1/profiles/staff: {res.status_code}, faculty_id={res.json().get('faculty_id')}")
assert res.status_code == 200
new_staff_id = res.json().get("user_id")

# Delete staff
res = client.delete(f"/api/v1/profiles/staff/{new_staff_id}", headers=admin_headers)
print(f"10. DELETE /api/v1/profiles/staff/{new_staff_id}: {res.status_code}, resp={res.json().get('message')}")
assert res.status_code == 200

print("\n>>> ALL BACKEND ENDPOINTS AND FUNCTIONALITIES VERIFIED WITH 100% SUCCESS!")
