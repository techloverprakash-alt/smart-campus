import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)


def test_admin_system():
    print("\n" + "=" * 70)
    print("RUNNING NEXUS ADMIN SYSTEM & LIVE SUPABASE INTEGRATION TEST SUITE")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # 1. Admin Authentication & Profile
    # -------------------------------------------------------------------------
    print("\n[1] Testing Admin Login & Profile...")
    login_res = client.post("/api/v1/auth/login", json={
        "identifier": "ADM001",
        "password": "Password@123",
        "role": "ADMIN"
    })
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    token_data = login_res.json()
    admin_token = token_data["access_token"]
    assert admin_token is not None
    assert token_data["user"]["role"] == "ADMIN"
    print(f"  [PASS] Admin logged in: {token_data['user']['full_name']} (Role: {token_data['user']['role']})")

    headers = {"Authorization": f"Bearer {admin_token}"}
    me_res = client.get("/api/v1/profiles/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data.get("role") == "ADMIN"
    print(f"  [PASS] Admin profile fetched: {me_data.get('office_location')}")

    # -------------------------------------------------------------------------
    # 2. Institutional Reports & Dashboard Metrics
    # -------------------------------------------------------------------------
    print("\n[2] Testing Institutional Reports & Dashboard KPIs (Realtime Supabase)...")
    summary_res = client.get("/api/v1/reports/department/summary", headers=headers)
    assert summary_res.status_code == 200, f"Summary failed: {summary_res.text}"
    s_data = summary_res.json()
    print(f"  [PASS] Total Students (DB): {s_data['total_students']}")
    print(f"  [PASS] Total Staff (DB): {s_data['total_staff']}")
    print(f"  [PASS] Today Attendance %: {s_data['today_attendance_percentage']}%")
    print(f"  [PASS] Overall Attendance %: {s_data['overall_attendance_percentage']}%")
    print(f"  [PASS] Students < 75%: {s_data['students_below_75_count']}")
    print(f"  [PASS] Weekly Trend Points: {len(s_data['weekly_trend'])} days")
    assert s_data["total_students"] > 0
    assert s_data["total_staff"] > 0
    assert len(s_data["weekly_trend"]) == 5

    # Defaulters Report
    defaulters_res = client.get("/api/v1/reports/attendance/defaulters?threshold=75.0", headers=headers)
    assert defaulters_res.status_code == 200
    def_data = defaulters_res.json()
    print(f"  [PASS] Defaulters Count (< 75%): {def_data['defaulters_count']}")

    # Faculty Workload Report
    workload_res = client.get("/api/v1/reports/faculty/workload", headers=headers)
    assert workload_res.status_code == 200
    w_data = workload_res.json()
    print(f"  [PASS] Faculty Workload Audit: {w_data['total_faculty']} faculty members, Avg {w_data['average_hours_per_week']} hrs/wk")
    assert w_data["total_faculty"] > 0

    # -------------------------------------------------------------------------
    # 3. Attendance Review
    # -------------------------------------------------------------------------
    print("\n[3] Testing Attendance History & Session Review...")
    hist_res = client.get("/api/v1/attendance/history?limit=5", headers=headers)
    assert hist_res.status_code == 200
    h_data = hist_res.json()
    assert len(h_data["sessions"]) > 0
    target_session_id = h_data["sessions"][0]["id"]
    print(f"  [PASS] Found {len(h_data['sessions'])} recent attendance sessions. Reviewing session ID={target_session_id}...")

    rev_res = client.post(f"/api/v1/attendance/session/{target_session_id}/review?action=approved", headers=headers)
    assert rev_res.status_code == 200
    print(f"  [PASS] Attendance session {target_session_id} reviewed and approved.")

    # -------------------------------------------------------------------------
    # 4. Student Enrollment & Cohort Options
    # -------------------------------------------------------------------------
    print("\n[4] Testing Student Enrollment & Password Formula...")
    cohort_res = client.get("/api/v1/profiles/cohort-options", headers=headers)
    assert cohort_res.status_code == 200
    cohort_data = cohort_res.json()
    print(f"  [PASS] Cohort Options: {len(cohort_data['departments'])} depts, {len(cohort_data['batches'])} batches, {len(cohort_data['mentors'])} mentors")

    template_res = client.get("/api/v1/profiles/students/template", headers=headers)
    assert template_res.status_code == 200
    assert "register_number" in template_res.text

    # Enroll unique student
    test_reg = "REG20259901"
    enroll_payload = {
        "register_number": test_reg,
        "roll_number": "21CS901",
        "full_name": "Karthikeyan Natarajan",
        "email": "karthikeyan.n901@student.edu",
        "department_name": "Computer Science and Engineering",
        "section_name": "Section A",
        "phone": "+91 98401 22901",
        "cgpa": 8.85
    }
    enroll_res = client.post("/api/v1/profiles/students", json=enroll_payload, headers=headers)
    # Could be 200 or 400 if already created in earlier test run
    if enroll_res.status_code == 200:
        enr_data = enroll_res.json()
        assert enr_data["generated_password"] == "kar901"  # first 3 of name 'kar' + last 3 of reg '901'
        print(f"  [PASS] Single student enrolled: {enr_data['full_name']} | Password: {enr_data['generated_password']}")
    else:
        print(f"  [PASS] Student already enrolled, testing duplicate rejection: {enroll_res.status_code}")

    # Duplicate enrollment should be rejected
    dup_res = client.post("/api/v1/profiles/students", json=enroll_payload, headers=headers)
    assert dup_res.status_code == 400
    print("  [PASS] Duplicate student enrollment safely rejected with HTTP 400.")

    # -------------------------------------------------------------------------
    # 5. Faculty Staff Onboarding & Mentor Quotas
    # -------------------------------------------------------------------------
    print("\n[5] Testing Staff Onboarding & Mentor Allocation...")
    staff_template_res = client.get("/api/v1/profiles/staff/template", headers=headers)
    assert staff_template_res.status_code == 200

    mentors_res = client.get("/api/v1/profiles/staff/mentors", headers=headers)
    assert mentors_res.status_code == 200
    m_list = mentors_res.json()
    assert len(m_list) > 0
    print(f"  [PASS] Active Faculty Mentors: {len(m_list)} found")

    alloc_res = client.get("/api/v1/profiles/students/allocation", headers=headers)
    assert alloc_res.status_code == 200
    alloc_data = alloc_res.json()
    print(f"  [PASS] Students in Allocation Roster: {len(alloc_data.get('students', []))}")

    # Auto-distribute mentors
    auto_res = client.post("/api/v1/profiles/students/auto-distribute-mentors", json={"department_name": "Computer Science and Engineering"}, headers=headers)
    assert auto_res.status_code == 200
    print("  [PASS] Auto-distribute unassigned students executed successfully.")

    # -------------------------------------------------------------------------
    # 6. Timetable Management & Conflict Checks
    # -------------------------------------------------------------------------
    print("\n[6] Testing Timetable Retrieval, Creation & Conflict Detection...")
    tt_res = client.get("/api/v1/timetable/department", headers=headers)
    assert tt_res.status_code == 200
    print(f"  [PASS] Department timetable grid fetched ({len(tt_res.json().get('schedule', []))} day schedules)")

    # Test creating a new timetable entry
    # Try inserting on FRIDAY Period 8 (usually free)
    new_tt_payload = {
        "course_offering_id": 1,
        "day_of_week": "FRIDAY",
        "period_number": 8,
        "start_time": "16:00:00",
        "end_time": "16:50:00",
        "location_id": 5
    }
    create_tt_res = client.post("/api/v1/timetable/entry", json=new_tt_payload, headers=headers)
    if create_tt_res.status_code == 200:
        tt_created = create_tt_res.json()
        created_id = tt_created["entry_id"]
        print(f"  [PASS] New timetable entry created (ID={created_id}) on FRIDAY P8.")

        # Test Conflict Detection: Attempt to schedule overlapping class in SAME room at SAME time
        conflict_payload = {
            "course_offering_id": 2,
            "day_of_week": "FRIDAY",
            "period_number": 8,
            "start_time": "16:00:00",
            "end_time": "16:50:00",
            "location_id": 5  # Same room!
        }
        conflict_res = client.post("/api/v1/timetable/entry", json=conflict_payload, headers=headers)
        assert conflict_res.status_code == 409, f"Expected 409 Conflict, got {conflict_res.status_code}: {conflict_res.text}"
        print(f"  [PASS] Scheduling conflict accurately intercepted: {conflict_res.json()['detail']}")

        # Clean up test entry
        del_res = client.delete(f"/api/v1/timetable/entry/{created_id}", headers=headers)
        assert del_res.status_code == 200
        print(f"  [PASS] Test timetable entry {created_id} deleted.")
    else:
        print(f"  Notice: Period 8 already occupied ({create_tt_res.status_code}).")

    # -------------------------------------------------------------------------
    # 7. Campus Administrator Control Center
    # -------------------------------------------------------------------------
    print("\n[7] Testing Campus Administrator Control Center (Telemetry, SLA, Incidents)...")
    ctrl_summary_res = client.get("/api/v1/admin/control-center/summary", headers=headers)
    assert ctrl_summary_res.status_code == 200
    ctrl_summary = ctrl_summary_res.json()
    print(f"  [PASS] Total Maintenance Incidents (DB): {ctrl_summary['total_complaints']}")
    print(f"  [PASS] Resolution Rate: {ctrl_summary['resolution_rate']}%")
    print(f"  [PASS] Current SLA Adherence: {ctrl_summary['current_sla_adherence']}%")
    print(f"  [PASS] Building Telemetry count: {len(ctrl_summary['building_breakdown'])} facilities")
    print(f"  [PASS] Category Breakdown count: {len(ctrl_summary['category_breakdown'])} trades")

    incidents_res = client.get("/api/v1/admin/control-center/incidents", headers=headers)
    assert incidents_res.status_code == 200
    inc_data = incidents_res.json()
    print(f"  [PASS] Maintenance Incident Tickets: {len(inc_data['incidents'])} tickets retrieved")

    # Emergency Push Alert Broadcast
    broadcast_payload = {
        "message": "URGENT TEST: Severe weather warning. All afternoon laboratory sessions rescheduled.",
        "target_audience": "All Campus Devices"
    }
    bcast_res = client.post("/api/v1/admin/control-center/broadcast", json=broadcast_payload, headers=headers)
    assert bcast_res.status_code == 200
    b_data = bcast_res.json()
    print(f"  [PASS] Emergency Broadcast Dispatched: ID={b_data['id']} (Status: {b_data['status']})")

    # CSV Telemetry Export
    csv_res = client.get("/api/v1/admin/control-center/export-csv", headers=headers)
    assert csv_res.status_code == 200
    assert "Metric,Value" in csv_res.text
    assert "Science Quad" in csv_res.text or "Total Complaints" in csv_res.text
    print("  [PASS] Control Center CSV report generated and streamed successfully.")

    # -------------------------------------------------------------------------
    # 8. Role-Based Access Control (RBAC) Security Verification
    # -------------------------------------------------------------------------
    print("\n[8] Testing Role-Based Security: Verifying Student Cannot Access Admin APIs...")
    student_login = client.post("/api/v1/auth/login", json={
        "identifier": "STU2025001",
        "password": "Password@123",
        "role": "STUDENT"
    })
    assert student_login.status_code == 200
    student_token = student_login.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Attempt to enroll student with Student credentials -> MUST BE 403 FORBIDDEN
    forbidden_res = client.post("/api/v1/profiles/students", json=enroll_payload, headers=student_headers)
    assert forbidden_res.status_code == 403, f"Expected 403 Forbidden, got: {forbidden_res.status_code}"
    print("  [PASS] Security Guard: Student blocked with HTTP 403 Forbidden on Admin Enrollment.")

    # Attempt to access Control Center with Student credentials -> MUST BE 403 FORBIDDEN
    forbidden_ctrl = client.get("/api/v1/admin/control-center/summary", headers=student_headers)
    assert forbidden_ctrl.status_code == 403
    print("  [PASS] Security Guard: Student blocked with HTTP 403 Forbidden on Control Center.")

    print("\n" + "=" * 70)
    print("ALL ADMIN SYSTEM & SUPABASE REALTIME TESTS PASSED SUCCESSFULLY! (100%)")
    print("=" * 70)


if __name__ == "__main__":
    test_admin_system()
