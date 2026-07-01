import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import engine
from sqlalchemy import text

def fix_db():
    tables = ["hospitals", "patients", "appointments", "doctors"]
    queries = []
    
    # Hospital specific missing columns
    queries.extend([
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS address VARCHAR;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS city VARCHAR;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS state VARCHAR;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS zip_code VARCHAR;",
        "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS contact_number VARCHAR;"
    ])
    
    # Common columns
    for t in tables:
        queries.extend([
            f"ALTER TABLE {t} ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
            f"ALTER TABLE {t} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
            f"ALTER TABLE {t} ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"
        ])

    with engine.connect() as conn:
        for q in queries:
            try:
                conn.execute(text(q))
                conn.commit()
            except Exception as e:
                print(f"Error executing {q}: {e}")

if __name__ == "__main__":
    fix_db()
    print("Database columns fixed.")
