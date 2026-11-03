import os
import sys
from pathlib import Path
import psycopg2
from sqlalchemy import text

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Load .env
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\""))

print("=" * 60)
print("1. TESTING DIRECT POSTGRESQL POOLER CONNECTION")
print("=" * 60)

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

sanitized_url = db_url.split("@")[-1] if "@" in db_url else db_url
print(f"Connecting to host: {sanitized_url}")

try:
    conn = psycopg2.connect(db_url, connect_timeout=10)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    ver = cur.fetchone()[0]
    print(f"Connection Successful! PostgreSQL Version:\n  {ver}\n")

    # Check complaints columns
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'complaints'
        ORDER BY ordinal_position;
    """)
    cols = [r[0] for r in cur.fetchall()]
    print(f"Complaints table columns in Supabase: {cols}")

    # Add title and admin_remarks if not present in Supabase
    if "title" not in cols:
        print("Adding 'title' column to Supabase complaints table...")
        cur.execute("ALTER TABLE public.complaints ADD COLUMN title VARCHAR(255);")
        conn.commit()
        print("  Added 'title' column.")
    if "admin_remarks" not in cols:
        print("Adding 'admin_remarks' column to Supabase complaints table...")
        cur.execute("ALTER TABLE public.complaints ADD COLUMN admin_remarks TEXT;")
        conn.commit()
        print("  Added 'admin_remarks' column.")

    conn.close()
except Exception as e:
    print(f"Direct connection failed: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("2. TESTING SQLALCHEMY SESSION & ORM MODELS")
print("=" * 60)

from app.database import SessionLocal, engine
from app.modules.auth.models import User, StudentProfile, StaffProfile, AdminProfile
from app.modules.complaints.models import Complaint, IssueCategory
from app.modules.lost_and_found.models import LostReport, FoundReport, ItemMatch
from app.modules.attendance.models import AttendanceRecord, AttendanceSession

db = SessionLocal()
try:
    # Test User counts & roles
    user_count = db.query(User).count()
    student_count = db.query(StudentProfile).count()
    staff_count = db.query(StaffProfile).count()
    admin_count = db.query(AdminProfile).count()
    print(f"Users in DB: {user_count} total")
    print(f"  - Students: {student_count}")
    print(f"  - Staff: {staff_count}")
    print(f"  - Admin: {admin_count}")

    # Test sample user retrieval
    admin_user = db.query(User).filter(User.identifier == "ADM001").first()
    if admin_user:
        print(f"Admin Found: {admin_user.name} ({admin_user.email}) - Role: {admin_user.primary_role}")

    # Test Lost & Found
    lost_count = db.query(LostReport).count()
    found_count = db.query(FoundReport).count()
    match_count = db.query(ItemMatch).count()
    print(f"Lost & Found in DB: {lost_count} lost reports, {found_count} found reports, {match_count} matches")

    # Test Attendance
    att_rec = db.query(AttendanceRecord).count()
    att_sess = db.query(AttendanceSession).count()
    print(f"Attendance in DB: {att_sess} sessions, {att_rec} records")

    # Test Complaints
    cat_count = db.query(IssueCategory).count()
    comp_count = db.query(Complaint).count()
    print(f"Complaints in DB: {cat_count} categories, {comp_count} complaints")

    # Seed categories if missing in Supabase
    if cat_count == 0:
        print("Seeding default categories into Supabase...")
        default_cats = [
            ("Personal & Grievance", "Personal welfare, student/staff grievances, safety, and discrimination concerns", "HIGH"),
            ("Academic & Examination", "Course matters, lecture hall AV, lab accessibility, marks/evaluations, faculty queries", "MEDIUM"),
            ("Hostel & Mess Facilities", "Hostel rooms, water supply, washrooms, mess hygiene, and meal amenities", "MEDIUM"),
            ("Electrical & Lighting", "Classroom lighting, switchboards, ceiling fans, power sockets, UPS failure", "HIGH"),
            ("HVAC & Air Conditioning", "AC cooling failure, thermostat issues, ventilation, server room AC", "MEDIUM"),
            ("IT & Lab Equipment", "Lab desktops, network ports, Wi-Fi connectivity, projectors, smartboards", "HIGH"),
            ("Plumbing & Sanitation", "Restroom leaks, taps, drinking water coolers, sanitation supplies", "HIGH"),
            ("Administrative & Workplace", "Faculty cabins, administrative office logistics, furniture, supply requisitions", "MEDIUM"),
            ("General Campus Maintenance", "Campus grounds, building paint, signage, doors, windows, cleanliness", "LOW"),
        ]
        for name, desc, prio in default_cats:
            db.add(IssueCategory(name=name, description=desc, default_priority=prio))
        db.commit()
        print(f"  Seeded {len(default_cats)} categories successfully.")

    # Test listing complaints
    comps = db.query(Complaint).all()
    for c in comps[:3]:
        submitter = c.reporter.name if c.reporter else "Unknown"
        role = c.reporter.primary_role if c.reporter else "Unknown"
        print(f"  - [{c.ticket_number}] {c.title or c.description[:40]} | By: {submitter} ({role}) | Status: {c.status}")

    print("\nBackend ORM fetch tested successfully!")
finally:
    db.close()

