import sys
sys.path.insert(0, '.')
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='patients' ORDER BY ordinal_position"
    ))
    print("=== patients table columns ===")
    for row in result:
        print(f"  {row[0]}: {row[1]}")

    result2 = conn.execute(text(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='doctors' ORDER BY ordinal_position"
    ))
    print("\n=== doctors table columns ===")
    for row in result2:
        print(f"  {row[0]}: {row[1]}")
