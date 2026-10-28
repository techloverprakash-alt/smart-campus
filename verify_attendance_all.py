import sys
sys.path.insert(0, r"d:\smart-campus\backend")

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.modules.auth.models import StudentProfile, StaffProfile
from app.modules.auth.service import AuthService

db = SessionLocal()
auth_service = AuthService(db)

# Pre-fetch user tokens and close DB session to prevent SQLite transaction locking
student_profile = db.query(StudentProfile).first()
student_user = student_profile.user
student_email = student_user.email
student_roll = student_profile.roll_number
student_id = student_user.id
student_token = auth_service.create_access_token(student_user)

staff_profile = db.query(StaffProfile).first()
staff_user = staff_profile.user
staff_email = staff_user.email
staff_fac_id = staff_profile.faculty_id
staff_token = auth_service.create_access_token(staff_user)

db.close()

client = TestClient(app)

print("=" * 60)
print("RUNNING END-TO-END VERIFICATION TESTS")
print("=" * 60)

# 1. Test Student Login & Attendance Summary (Verify OD added to present days)
print(f"\n1. Testing Student: {student_email} (Roll: {student_roll}, ID: {student_id})")
headers_student = {"Authorization": f"Bearer {student_token}"}

res = client.get("/api/v1/attendance/student/summary", headers=headers_student)
print(f"Status: {res.status_code}")
assert res.status_code == 200, res.text
data = res.json()
print("Attendance Summary Data:")
print(f"  - Total Sessions/Days: {data['total_sessions']}")
print(f"  - Actual Present Sessions: {data['actual_present_days']}")
print(f"  - On-Duty Sessions: {data['od_sessions']}")
print(f"  - Effective Present Days (Present + OD): {data['present_days']}")
print(f"  - Effective Present Sessions: {data['present_sessions']}")
print(f"  - Total Attended Hours: {data['total_attended_hours']}")
print(f"  - Overall Percentage: {data['overall_percentage']}%")
print(f"  - Subjects count: {len(data['subjects'])}")
for s in data['subjects']:
    print(f"    * {s['course_code']} ({s['course_name']}): Attended={s['attended_hours']}/{s['total_hours']} (OD={s['od_hours']}) -> {s['percentage']}%")

# Verify OD is added to present days
assert data['present_days'] == data['actual_present_days'] + data['od_sessions'], "OD not added to present_days!"
assert data['total_attended_hours'] == data['actual_present_days'] + data['od_sessions'], "OD not added to attended_hours!"
print(">>> [PASS] OD is properly added to present days and attended hours!")

# 2. Test Staff Login, Timetable & Today Schedule
print(f"\n2. Testing Staff: {staff_email} (Faculty ID: {staff_fac_id})")
headers_staff = {"Authorization": f"Bearer {staff_token}"}

res_today = client.get("/api/v1/timetable/today", headers=headers_staff)
print(f"Today Timetable Status: {res_today.status_code}")
assert res_today.status_code == 200, res_today.text
today_data = res_today.json()
print(f"  - Active Day: {today_data['day']}")
print(f"  - Total slots for staff: {len(today_data['schedule'])}")
for slot in today_data['schedule']:
    print(f"    * {slot['period']}: {slot['course_code']} ({slot['title']}) at {slot['time']} in {slot['room']}")
assert len(today_data['schedule']) > 0, "Staff today schedule is empty!"
print(">>> [PASS] Staff today schedule fetched from DB!")

# 3. Test Staff Weekly Timetable
res_weekly = client.get("/api/v1/timetable/weekly", headers=headers_staff)
print(f"\n3. Testing Weekly Timetable Status: {res_weekly.status_code}")
assert res_weekly.status_code == 200, res_weekly.text
weekly_data = res_weekly.json()
print(f"  - Department: {weekly_data['department']}, Section: {weekly_data['section']}")
print(f"  - Weekly Grid rows count: {len(weekly_data['weeklySchedule'])}")
for row in weekly_data['weeklySchedule']:
    print(f"    * Time {row['time']}: Mon={row['mon']}, Tue={row['tue']}, Wed={row['wed']}, Thu={row['thu']}, Fri={row['fri']}")
assert len(weekly_data['weeklySchedule']) > 0, "Staff weekly grid is empty!"
print(">>> [PASS] Staff weekly timetable dynamically built from DB!")

# 4. Test Session Roster for Mark Attendance
first_entry_id = int(today_data['schedule'][0]['id'])
print(f"\n4. Testing Session Roster for Entry ID: {first_entry_id}")
res_roster = client.get(f"/api/v1/attendance/session/students?timetable_entry_id={first_entry_id}", headers=headers_staff)
print(f"Roster Status: {res_roster.status_code}")
assert res_roster.status_code == 200, res_roster.text
roster_data = res_roster.json()
print(f"  - Course: {roster_data['course_code']} - {roster_data['course_name']}")
print(f"  - Section: {roster_data['section_name']}, Room: {roster_data['room_name']}")
print(f"  - Students count: {len(roster_data['students'])}")
for st in roster_data['students'][:3]:
    print(f"    * Student: {st['full_name']} (Roll: {st['roll_no']}, Status: {st['existing_status']})")
assert len(roster_data['students']) > 0, "No students in roster!"
print(">>> [PASS] Session roster fetched from DB!")

# Also test calling roster without timetable_entry_id (auto-resolve)
res_auto_roster = client.get("/api/v1/attendance/session/students", headers=headers_staff)
assert res_auto_roster.status_code == 200, res_auto_roster.text
print(">>> [PASS] Auto-resolved roster without timetable_entry_id works!")

# 5. Test Submit Attendance
print(f"\n5. Testing Submit Attendance for Entry ID: {first_entry_id}")
submit_payload = {
    "timetable_entry_id": first_entry_id,
    "marking_date": "2026-10-28",
    "records": [
        {"student_id": st["student_id"], "status": "PRESENT" if idx % 2 == 0 else "OD"}
        for idx, st in enumerate(roster_data['students'])
    ]
}
res_submit = client.post("/api/v1/attendance/submit", json=submit_payload, headers=headers_staff)
print(f"Submit Status: {res_submit.status_code}")
assert res_submit.status_code == 200, res_submit.text
sub_data = res_submit.json()
print(f"  - Response: {sub_data}")
session_id = sub_data['session_id']
print(">>> [PASS] Attendance submitted successfully!")

# 6. Test Attendance History & Review
print(f"\n6. Testing Attendance History Log")
res_hist = client.get("/api/v1/attendance/history", headers=headers_staff)
print(f"History Status: {res_hist.status_code}")
assert res_hist.status_code == 200, res_hist.text
hist_data = res_hist.json()
sessions_list = hist_data.get('data') or hist_data.get('sessions') or []
print(f"  - Sessions count: {len(sessions_list)}")
assert len(sessions_list) > 0, "No sessions found in history!"
latest_session = sessions_list[0]
print(f"  - Latest: ID={latest_session['id']}, Course={latest_session['course']}, Date={latest_session['date']}, Status={latest_session['status']}")
print(">>> [PASS] Attendance history fetched!")

# 7. Test Attendance Review Action (Approve / Reject)
print(f"\n7. Testing Attendance Review (Approve session {session_id})")
res_rev = client.post(f"/api/v1/attendance/session/{session_id}/review?action=approved", headers=headers_staff)
print(f"Review Status: {res_rev.status_code}")
assert res_rev.status_code == 200, res_rev.text
print(f"  - Response: {res_rev.json()}")
assert res_rev.json()['status'] == 'approved'
print(">>> [PASS] Attendance session review action approved successfully!")

print("\n" + "=" * 60)
print("ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
print("=" * 60)
