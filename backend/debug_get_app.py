import traceback
from app.database import SessionLocal
from app.routers.appointments import get_appointments

db = SessionLocal()
try:
    get_appointments(db)
except Exception as e:
    traceback.print_exc()
