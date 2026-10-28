import sys
from pathlib import Path

backend_dir = Path("d:/smart-campus/backend")
sys.path.insert(0, str(backend_dir))

from app.database import engine, Base
import app.modules.auth.models
import app.modules.academic.models
import app.modules.attendance.models
import app.modules.materials.models
import app.modules.complaints.models
import app.modules.lost_and_found.models
import app.modules.notifications.models

from sqlalchemy.schema import CreateTable

out_path = backend_dir / "migrations" / "004_full_schema_supabase.sql"

with open(out_path, "w", encoding="utf-8") as f:
    f.write("-- =====================================================================\n")
    f.write("-- NEXUS SMART CAMPUS: FULL CANONICAL POSTGRESQL SCHEMA (ALL 44 TABLES)\n")
    f.write("-- Target: Supabase / PostgreSQL 14+\n")
    f.write("-- =====================================================================\n\n")
    f.write('CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n')

    # Iterate in dependency order from metadata
    for table in Base.metadata.sorted_tables:
        f.write(f"-- Table: {table.name}\n")
        ddl = str(CreateTable(table).compile(engine))
        f.write(ddl.strip() + ";\n\n")

print(f"Generated complete DDL migration at {out_path}")

