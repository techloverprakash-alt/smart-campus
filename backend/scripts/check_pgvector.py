import sys
sys.path.insert(0, 'd:/smart-campus/backend')
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    res = conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector';")).fetchall()
    print('pgvector extension installed:', len(res) > 0)
    if len(res) == 0:
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
            print('Successfully enabled pgvector!')
        except Exception as e:
            print('Could not enable pgvector:', e)
    else:
        print('pgvector is already enabled:', res)

