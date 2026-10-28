import csv
import sqlite3
from pathlib import Path

db_path = Path("d:/smart-campus/backend/campus_lost_found.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

csv_dir = Path("d:/smart-campus/backend/db")
for cf in sorted(csv_dir.glob("*.csv")):
    tbl = cf.stem.split("_", 1)[1]
    with open(cf, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        csv_count = sum(1 for _ in reader)
    
    cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name=?;", (tbl,))
    exists = cur.fetchone()[0]
    sqlite_count = None
    if exists:
        cur.execute(f"SELECT count(*) FROM {tbl};")
        sqlite_count = cur.fetchone()[0]
    
    print(f"{cf.name:32} | CSV: {csv_count:4} | SQLite: {sqlite_count}")

conn.close()

