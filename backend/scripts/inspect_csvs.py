import csv
from pathlib import Path

csv_dir = Path("d:/smart-campus/backend/db")
csv_files = sorted(csv_dir.glob("*.csv"))

print(f"Total CSV files found: {len(csv_files)}")
for cf in csv_files:
    with open(cf, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        row1 = next(reader, None)
        rows = 1 if row1 else 0
        for _ in reader:
            rows += 1
        print(f"\n{cf.name} ({rows} rows):")
        print(f"  Columns: {header}")
        if row1:
            print(f"  Sample row 1: {row1}")

