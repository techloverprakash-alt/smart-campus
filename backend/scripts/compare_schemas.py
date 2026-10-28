import csv
import sqlite3
from pathlib import Path

db_path = Path("d:/smart-campus/backend/campus_lost_found.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

csv_dir = Path("d:/smart-campus/backend/db")
csv_files = sorted(csv_dir.glob("*.csv"))

print("=== Comparing CSV columns with SQLite columns ===")
for cf in csv_files:
    # table name is after number and underscore: e.g. 01_users.csv -> users
    tbl_name = cf.stem.split("_", 1)[1]
    with open(cf, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        csv_cols = next(reader, [])
    
    cur.execute(f"PRAGMA table_info({tbl_name});")
    sqlite_cols_info = cur.fetchall()
    sqlite_cols = [c[1] for c in sqlite_cols_info]
    
    if sqlite_cols:
        missing_in_csv = set(sqlite_cols) - set(csv_cols)
        missing_in_sqlite = set(csv_cols) - set(sqlite_cols)
        print(f"Table '{tbl_name}':")
        print(f"  CSV cols:    {csv_cols}")
        print(f"  SQLite cols: {sqlite_cols}")
        if missing_in_csv:
            print(f"  -> In SQLite but NOT in CSV: {missing_in_csv}")
        if missing_in_sqlite:
            print(f"  -> In CSV but NOT in SQLite: {missing_in_sqlite}")
    else:
        print(f"Table '{tbl_name}' NOT FOUND in local SQLite. CSV cols: {csv_cols}")

conn.close()

