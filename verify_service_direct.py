import sys
sys.path.insert(0, r"d:\smart-campus\backend")

from app.database import SessionLocal
from app.modules.auth.models import StudentProfile, StaffProfile, User
from app.modules.attendance.service import AttendanceService
from app.modules.attendance.schemas import AttendanceSubmitRequest, RecordSubmitItem

db = SessionLocal()
service = AttendanceService(db)

print("=" * 60)
print("DIRECT ATTENDANCE SERVICE TESTS (100% In-Process)")
print("=" * 60)

# 1. Test Student Summary & OD in Present Days
student = db.query(StudentProfile).first()
student_user = student.user
print(f"\n1. Testing Student Summary for: {student_user.email} (Roll: {student.roll_number})")
summary = service.get_student_summary(student_user)
print(f"  - Total Sessions: {summary['total_sessions']}")
print(f"  - Actual Present Sessions: {summary['actual_present_days']}")
print(f"  - OD Sessions: {summary['od_sessions']}")
print(f"  - Effective Present Days: {summary['present_days']}")
print(f"  - Total Attended Hours: {summary['total_attended_hours']}")
print(f"  - Percentage: {summary['overall_percentage']}%")

assert summary['present_days'] == summary['actual_present_days'] + summary['od_sessions'], "OD not added to present_days!"
assert summary['total_attended_hours'] == summary['actual_present_days'] + summary['od_sessions'], "OD not added to total_attended_hours!"
print(">>> [PASS] OD is added to present days and attended hours!")

# 2. Test Staff Today Schedule
staff = db.query(StaffProfile).first()
staff_user = staff.user
print(f"\n2. Testing Staff Today Schedule for: {staff_user.email} (Faculty ID: {staff.faculty_id})")
today_sched = service.get_today_schedule(staff_user)
print(f"  - Day: {today_sched['day']}")
print(f"  - Total Slots: {len(today_sched['schedule'])}")
for s in today_sched['schedule']:
    print(f"    * {s['period']}: {s['course_code']} ({s['title']}) | Room: {s['room_name']} | Marked: {s['attendance_marked']}")
assert len(today_sched['schedule']) > 0, "Staff today schedule is empty!"
print(">>> [PASS] Staff today schedule working from DB!")

# 3. Test Staff Weekly Timetable Grid
print(f"\n3. Testing Staff Weekly Timetable for: {staff_user.email}")
weekly = service.get_weekly_timetable(staff_user)
print(f"  - Dept: {weekly['department']}, Section: {weekly['section']}")
print(f"  - Weekly rows count: {len(weekly['weeklySchedule'])}")
for r in weekly['weeklySchedule']:
    print(f"    * {r['time']}: Mon={r['mon']} Tue={r['tue']} Wed={r['wed']} Thu={r['thu']} Fri={r['fri']}")
assert len(weekly['weeklySchedule']) > 0, "Staff weekly grid is empty!"
print(">>> [PASS] Staff weekly timetable matrix dynamically generated!")

# 4. Test Session Roster for Mark Attendance
target_entry_id = int(today_sched['schedule'][0]['id'])
print(f"\n4. Testing Session Roster for Timetable Entry: {target_entry_id}")
roster = service.get_session_roster(target_entry_id, None, staff_user)
print(f"  - Course: {roster['course_code']} - {roster['course_name']}")
print(f"  - Section: {roster['section_name']}, Room: {roster['room_name']}")
print(f"  - Enrolled Students: {len(roster['students'])}")
assert len(roster['students']) > 0, "No students in roster!"
print(">>> [PASS] Session roster fetched from DB!")

# Test auto-resolving roster without entry_id
auto_roster = service.get_session_roster(None, None, staff_user)
assert len(auto_roster['students']) > 0
print(">>> [PASS] Auto-resolving roster without entry_id works!")

# 5. Test Submit Attendance
print(f"\n5. Testing Submit Attendance for Entry: {target_entry_id}")
records = [
    RecordSubmitItem(student_id=st['student_id'], status="PRESENT" if idx % 2 == 0 else "OD")
    for idx, st in enumerate(roster['students'])
]
submit_payload = AttendanceSubmitRequest(
    timetable_entry_id=target_entry_id,
    marking_date="2026-10-28",
    records=records
)
sub_res = service.submit_attendance(staff_user, submit_payload)
print(f"  - Result: {sub_res}")
session_id = sub_res['session_id']
assert sub_res['success'] is True
print(">>> [PASS] Attendance submitted successfully!")

# 6. Test History Log
print(f"\n6. Testing Attendance History Log for Staff")
hist = service.get_history(staff_user, limit=15)
print(f"  - Total History Sessions: {len(hist['data'])}")
assert len(hist['data']) > 0, "History is empty!"
latest = hist['data'][0]
print(f"  - Latest Session: ID={latest['id']}, Course={latest['course']}, Status={latest['status']}, Present={latest['present']}/{latest['total']}")
print(">>> [PASS] Attendance history working with unified fields!")

# 7. Test Review Session
print(f"\n7. Testing Review Session (Approve session {session_id})")
rev_res = service.review_session(session_id, "approved", staff_user)
print(f"  - Review Result: {rev_res}")
assert rev_res['status'] == "approved"
print(">>> [PASS] Review action approved successfully!")

print("\n" + "=" * 60)
print("ALL DIRECT ATTENDANCE SERVICE TESTS PASSED 100%!")
print("=" * 60)

db.close()

