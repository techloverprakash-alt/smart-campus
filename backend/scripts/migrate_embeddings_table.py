import sys
sys.path.insert(0, 'd:/smart-campus/backend')
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # 1. Create item_embeddings table
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS item_embeddings (
            id SERIAL PRIMARY KEY,
            report_type VARCHAR(16) NOT NULL,
            lost_report_id INTEGER REFERENCES lost_reports(id) ON DELETE CASCADE,
            found_report_id INTEGER REFERENCES found_reports(id) ON DELETE CASCADE,
            modality VARCHAR(16) DEFAULT 'text' NOT NULL,
            model_name VARCHAR(64) DEFAULT 'jina-clip-v2' NOT NULL,
            vector_dim INTEGER DEFAULT 1024 NOT NULL,
            vector_json TEXT NOT NULL,
            qdrant_point_id VARCHAR(64),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_item_embeddings_lost_report_id ON item_embeddings(lost_report_id);
        CREATE INDEX IF NOT EXISTS ix_item_embeddings_found_report_id ON item_embeddings(found_report_id);
        CREATE INDEX IF NOT EXISTS ix_item_embeddings_report_type ON item_embeddings(report_type);
    """))

    # 2. Add embedding_json column to lost_reports and found_reports if not exist
    conn.execute(text("""
        ALTER TABLE lost_reports ADD COLUMN IF NOT EXISTS embedding_json TEXT;
        ALTER TABLE found_reports ADD COLUMN IF NOT EXISTS embedding_json TEXT;
    """))
    conn.commit()
    print("Successfully created item_embeddings table and added embedding columns to lost_reports and found_reports!")

