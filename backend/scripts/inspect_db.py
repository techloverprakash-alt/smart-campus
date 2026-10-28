import sqlite3
from pathlib import Path

db_path = Path("d:/smart-campus/backend/campus_lost_found.db")
if not db_path.exists():
    print(f"Database file not found: {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = cur.fetchall()
    print(f"Total tables found: {len(tables)}")
    for name, sql in tables:
        if name.startswith("sqlite_"):
            continue
        cur.execute(f"SELECT count(*) FROM {name};")
        cnt = cur.fetchone()[0]
        print(f"- {name}: {cnt} rows")
    conn.close()

