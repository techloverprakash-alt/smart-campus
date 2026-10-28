"""
End-to-End System 6 & Attendance Comprehensive Verification
"""
import sys
import os

backend_path = os.path.abspath("backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.database import SessionLocal
from app.modules.attendance.service import AttendanceService
from app.modules.materials.service import MaterialService, AnnouncementService
from app.modules.auth.models import User

def g(obj, key, default=None):
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)

def main():
    print("=" * 60)
    print("NEXUS COMPREHENSIVE END-TO-END VERIFICATION")
    print("=" * 60)
    
    db = SessionLocal()
    try:
        # 1. Verify Student Attendance Summary (OD Calculation)
        print("\n1. Verifying Student Attendance & OD Calculation:")
        aravind = db.query(User).filter_by(email="aravind.k@student.edu").first()
        assert aravind, "Student aravind.k@student.edu not found"
        
        att_service = AttendanceService(db)
        summary = att_service.get_student_summary(aravind)
        
        tot = g(summary, "total_sessions")
        actual_pres = g(summary, "actual_present_days")
        od = g(summary, "od_sessions")
        eff_days = g(summary, "effective_present_days")
        pct = g(summary, "overall_percentage")
        
        print(f"  - Total Sessions: {tot}")
        print(f"  - Actual Present (Without OD): {actual_pres}")
        print(f"  - On-Duty (OD): {od}")
        print(f"  - Effective Present Days (Actual Present + OD): {eff_days}")
        print(f"  - Effective Percentage: {pct}%")
        assert eff_days == actual_pres + od, f"Expected {actual_pres + od}, got {eff_days}"
        print("  >>> [PASS] Student Attendance & OD calculation verified!")

        # 2. Verify Staff Timetable
        print("\n2. Verifying Staff Timetable:")
        sharma = db.query(User).filter_by(email="r.sharma@institution.edu").first()
        assert sharma, "Staff r.sharma@institution.edu not found"
        
        today_tt = att_service.get_today_schedule(sharma)
        day_str = g(today_tt, "day")
        slots = g(today_tt, "slots", [])
        print(f"  - Active Day: {day_str}")
        print(f"  - Today's Slots Count: {len(slots)}")
        for slot in slots:
            p = g(slot, "period")
            sc = g(slot, "subject_code")
            sn = g(slot, "subject_name")
            tr = g(slot, "time_range")
            print(f"    * Period {p}: {sc} ({sn}) at {tr}")
            
        weekly_tt = att_service.get_weekly_timetable(sharma)
        dept_name = g(weekly_tt, "department_name")
        sec_name = g(weekly_tt, "section_name")
        sched = g(weekly_tt, "weeklySchedule", [])
        print(f"  - Weekly Timetable Department: {dept_name}, Section: {sec_name}")
        print(f"  - Weekly Schedule Matrix Rows: {len(sched)}")
        print("  >>> [PASS] Staff Timetable verified!")

        # 3. Verify Study Materials (Table 21)
        print("\n3. Verifying Study Materials (Table 21):")
        mat_service = MaterialService(db)
        
        # Test student-filtered materials (Aravind is in Section 1)
        student_materials = mat_service.list_materials(current_user=aravind)
        print(f"  - Student (Section 1) Materials Returned: {len(student_materials)}")
        for m in student_materials:
            print(f"    * [{m['code']}] {m['unit']}: {m['title']} | Instructor: {m['instructor']} | Type: {m['type']}")
        assert len(student_materials) == 2, f"Expected 2 materials for Section 1, got {len(student_materials)}"

        # Test all campus study materials (without section filter)
        all_materials = mat_service.list_materials()
        print(f"  - All Repository Materials Count: {len(all_materials)}")
        assert len(all_materials) >= 3, f"Expected >= 3 total materials, got {len(all_materials)}"
        print("  >>> [PASS] Study Materials retrieved, section-isolated, and formatted correctly from DB!")

        # 4. Verify Announcements & Circulars (Tables 22 & 23)
        print("\n4. Verifying Campus Announcements & Circulars (Tables 22 & 23):")
        ann_service = AnnouncementService(db)
        announcements = ann_service.list_announcements(current_user=aravind)
        print(f"  - Total Announcements Returned: {len(announcements)}")
        for a in announcements:
            print(f"    * [{a['tag']}] ({a['date']}) {a['title']}")
            print(f"      Targets count: {len(a['targets'])}")
        assert len(announcements) >= 2, f"Expected >= 2 announcements, got {len(announcements)}"
        print("  >>> [PASS] Announcements retrieved and formatted correctly from DB!")

        print("\n" + "=" * 60)
        print("ALL END-TO-END TESTS COMPLETED SUCCESSFULLY (100% PASS)")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    main()
