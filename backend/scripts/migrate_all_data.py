import csv
import sqlite3
import os
from pathlib import Path
import psycopg

PG_URL = "postgresql://postgres:VmJAuSEGo94YbYAi@db.svxpszxdzlmceiahtqmj.supabase.co:5432/postgres"
SQLITE_PATH = Path("d:/smart-campus/backend/campus_lost_found.db")
CSV_DIR = Path("d:/smart-campus/backend/db")

TABLES = [
    # Phase 1: Foundation
    ("roles", "02_roles.csv"),
    ("departments", "08_departments.csv"),
    ("academic_batches", "09_academic_batches.csv"),
    ("campus_locations", "14_campus_locations.csv"),
    ("item_categories", "34_item_categories.csv"),
    ("issue_categories", "24_issue_categories.csv"),
    ("spare_parts", "30_spare_parts.csv"),

    # Phase 2: Users & Profiles
    ("users", "01_users.csv"),
    ("user_roles", "03_user_roles.csv"),
    ("refresh_tokens", "07_refresh_tokens.csv"),
    ("admin_profiles", "06_admin_profiles.csv"),
    ("staff_profiles", "05_staff_profiles.csv"),
    ("media_attachments", "15_media_attachments.csv"),

    # Phase 3: Academic
    ("sections", "10_sections.csv"),
    ("student_profiles", "04_student_profiles.csv"),
    ("mentor_allocations", "11_mentor_allocations.csv"),
    ("enrollment_imports", "12_enrollment_imports.csv"),
    ("enrollment_import_rows", "13_enrollment_import_rows.csv"),

    # Phase 4: Attendance & Timetable
    ("subjects", "16_subjects.csv"),
    ("course_offerings", "17_course_offerings.csv"),
    ("timetable_entries", "18_timetable_entries.csv"),
    ("attendance_sessions", "19_attendance_sessions.csv"),
    ("attendance_records", "20_attendance_records.csv"),

    # Phase 5: Materials & Notices
    ("study_materials", "21_study_materials.csv"),
    ("announcements", "22_announcements.csv"),
    ("announcement_targets", "23_announcement_targets.csv"),

    # Phase 6: Complaints & Facilities
    ("complaints", "25_complaints.csv"),
    ("complaint_assignments", "26_complaint_assignments.csv"),
    ("work_orders", "27_work_orders.csv"),
    ("work_order_media", "28_work_order_media.csv"),
    ("complaint_status_history", "29_complaint_status_history.csv"),
    ("part_requisitions", "31_part_requisitions.csv"),
    ("part_requisition_items", "32_part_requisition_items.csv"),
    ("complaint_upvotes", "33_complaint_upvotes.csv"),

    # Phase 7: Lost & Found
    ("lost_reports", "35_lost_reports.csv"),
    ("found_reports", "36_found_reports.csv"),
    ("report_media", "37_report_media.csv"),
    ("item_matches", "38_item_matches.csv"),
    ("match_verifications", "39_match_verifications.csv"),
    ("item_claims", "40_item_claims.csv"),
    ("item_handovers", "41_item_handovers.csv"),

    # Phase 8: Notifications
    ("notifications", "42_notifications.csv"),
    ("emergency_broadcasts", "43_emergency_broadcasts.csv"),
    ("notification_deliveries", "44_notification_deliveries.csv"),
]

BOOLEAN_COLS = {"is_active", "is_read", "has_image"}

def clean_val(col, val):
    if val == "" or val is None:
        return None
    if col in BOOLEAN_COLS:
        if isinstance(val, bool):
            return val
        if isinstance(val, (int, float)):
            return bool(val)
        return str(val).strip().lower() in ("true", "1", "t")
    return val

def migrate():
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_cur = sqlite_conn.cursor()

    pg_conn = psycopg.connect(PG_URL, autocommit=False)
    pg_cur = pg_conn.cursor()

    print("=== Starting Full Data Migration to Supabase PostgreSQL ===")
    
    # 1. Disable triggers and foreign keys temporarily for clean insertion
    pg_cur.execute("SET session_replication_role = 'replica';")
    
    # Truncate all tables first to guarantee idempotent rerun
    print("\nTruncating existing tables in public schema...")
    for tbl, _ in reversed(TABLES):
        pg_cur.execute(f"TRUNCATE TABLE public.{tbl} CASCADE;")
    pg_conn.commit()

    # Check existing tables in SQLite
    sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    sqlite_tables = {r[0] for r in sqlite_cur.fetchall()}

    for tbl, csv_filename in TABLES:
        print(f"\nProcessing table '{tbl}'...")

        # Determine source: SQLite if table exists and has rows, else CSV
        source = None
        if tbl in sqlite_tables:
            sqlite_cur.execute(f"SELECT count(*) FROM {tbl};")
            cnt = sqlite_cur.fetchone()[0]
            if cnt > 0:
                source = "sqlite"

        if source == "sqlite":
            sqlite_cur.execute(f"PRAGMA table_info({tbl});")
            col_info = sqlite_cur.fetchall()
            col_names = [c[1] for c in col_info]
            
            sqlite_cur.execute(f"SELECT * FROM {tbl};")
            rows = sqlite_cur.fetchall()
            print(f"  Source: SQLite ({len(rows)} rows, columns: {col_names})")
            
            cols_clause = ", ".join(col_names)
            placeholders = ", ".join(["%s"] * len(col_names))
            insert_sql = f"INSERT INTO public.{tbl} ({cols_clause}) VALUES ({placeholders}) ON CONFLICT DO NOTHING;"
            
            clean_rows = []
            for r in rows:
                clean_r = [clean_val(col_names[i], r[i]) for i in range(len(col_names))]
                clean_rows.append(clean_r)
            
            pg_cur.executemany(insert_sql, clean_rows)
            print(f"  Inserted {len(clean_rows)} rows into public.{tbl}")

        else:
            csv_path = CSV_DIR / csv_filename
            print(f"  Source: CSV '{csv_filename}'")
            if not csv_path.exists():
                print(f"  WARNING: CSV file {csv_path} not found!")
                continue

            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                rows = list(reader)

            if not rows:
                print(f"  No rows in CSV for {tbl}")
                continue

            col_names = list(rows[0].keys())
            cols_clause = ", ".join(col_names)
            placeholders = ", ".join(["%s"] * len(col_names))
            insert_sql = f"INSERT INTO public.{tbl} ({cols_clause}) VALUES ({placeholders}) ON CONFLICT DO NOTHING;"

            clean_rows = []
            for r in rows:
                clean_r = [clean_val(col, r[col]) for col in col_names]
                clean_rows.append(clean_r)

            pg_cur.executemany(insert_sql, clean_rows)
            print(f"  Inserted {len(clean_rows)} rows into public.{tbl}")

    # 2. Re-enable foreign key checks and triggers
    pg_cur.execute("SET session_replication_role = 'origin';")
    pg_conn.commit()
    print("\nAll data committed successfully!")

    # 3. Reset PostgreSQL sequences to max(id)
    print("\nResetting PostgreSQL serial sequences...")
    pg_cur.execute("""
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (
            SELECT c.table_name, c.column_name, pg_get_serial_sequence(c.table_name, c.column_name) AS seq_name
            FROM information_schema.columns c
            WHERE c.table_schema = 'public' 
              AND pg_get_serial_sequence(c.table_name, c.column_name) IS NOT NULL
        ) LOOP
            EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I), 1), true)', r.seq_name, r.column_name, r.table_name);
        END LOOP;
    END $$;
    """)
    pg_conn.commit()
    print("Sequences reset complete!")

    # 4. Verification: Print row counts for all 44 tables
    print("\n" + "=" * 60)
    print(f"{'#':<3} | {'Table Name':<30} | {'Rows':<8} | {'Status':<10}")
    print("=" * 60)
    total_rows = 0
    idx = 1
    for tbl, _ in TABLES:
        pg_cur.execute(f"SELECT count(*) FROM public.{tbl};")
        cnt = pg_cur.fetchone()[0]
        total_rows += cnt
        status = "OK" if cnt > 0 else "EMPTY"
        print(f"{idx:<3} | {tbl:<30} | {cnt:<8} | {status:<10}")
        idx += 1
    print("=" * 60)
    print(f"TOTAL ROWS MIGRATED: {total_rows}")

    sqlite_conn.close()
    pg_conn.close()

if __name__ == "__main__":
    migrate()
