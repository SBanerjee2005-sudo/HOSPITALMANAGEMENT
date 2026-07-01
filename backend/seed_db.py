"""
seed_db.py – Seeds the MediSync database with 18 Kolkata hospitals,
             16 doctors and 10 patients from the frontend mock data.

Run from the backend directory:
    python seed_db.py
"""
import json
from sqlalchemy import create_engine, text
from app.database import DATABASE_URL as SQLALCHEMY_DATABASE_URL

CONNECT_ARGS = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

# SpecializationEnum values as stored in Postgres
SPEC_MAP = {
    "Cardiology":       "CARDIOLOGY",
    "Neurology":        "NEUROLOGY",
    "Orthopedics":      "ORTHOPEDICS",
    "General Medicine": "GENERAL",
    "Oncology":         "GENERAL",
    "Dermatology":      "GENERAL",
    "ENT":              "GENERAL",
    "Gynecology":       "GENERAL",
    "Psychiatry":       "GENERAL",
    "Urology":          "GENERAL",
    "Ophthalmology":    "GENERAL",
    "Pediatrics":       "GENERAL",
    "Nephrology":       "GENERAL",
    "Critical Care":    "GENERAL",
    "Emergency Care":   "GENERAL",
    "Gastroenterology": "GENERAL",
}

GENDER_MAP = {
    "Male":   "Male",
    "Female": "Female",
    "Other":  "Other",
}


def seed():
    print(f"Connecting to: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=CONNECT_ARGS)

    print("Loading extracted JSON data...")
    try:
        with open("hospitals.json", "r") as f:
            hospitals_data = json.load(f)
        with open("doctors.json", "r") as f:
            doctors_data = json.load(f)
        with open("patients.json", "r") as f:
            patients_data = json.load(f)
    except Exception as e:
        print(f"ERROR loading JSON files: {e}")
        return

    print(f"Found {len(hospitals_data)} hospitals, {len(doctors_data)} doctors, {len(patients_data)} patients.")

    with engine.begin() as conn:
        # ---- Ensure tables exist ----
        print("Ensuring tables exist...")
        # hospitals
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS hospitals (
                id SERIAL PRIMARY KEY,
                name TEXT,
                lat FLOAT,
                lng FLOAT,
                beds INTEGER,
                doctors INTEGER,
                ambulances INTEGER,
                district TEXT,
                open_time TEXT,
                close_time TEXT,
                rating FLOAT,
                address TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                contact_number TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                is_active BOOLEAN DEFAULT TRUE
            )
        """))

        # ---- HOSPITALS ----
        print("Upserting hospitals...")
        for h in hospitals_data:
            total_doctors = sum(d["doctorCount"] for d in h.get("departments", []))
            conn.execute(text("""
                INSERT INTO hospitals (id, name, district, city, state, lat, lng, beds, doctors, ambulances, is_active, rating)
                VALUES (:id, :name, :district, :city, :state, :lat, :lng, :beds, :doctors, :ambulances, :is_active, :rating)
                ON CONFLICT (id) DO UPDATE SET
                    name      = EXCLUDED.name,
                    district  = EXCLUDED.district,
                    city      = EXCLUDED.city,
                    state     = EXCLUDED.state,
                    lat       = EXCLUDED.lat,
                    lng       = EXCLUDED.lng,
                    beds      = EXCLUDED.beds,
                    doctors   = EXCLUDED.doctors,
                    ambulances = EXCLUDED.ambulances,
                    is_active = EXCLUDED.is_active,
                    rating    = EXCLUDED.rating,
                    updated_at = NOW()
            """), {
                "id":         h["id"],
                "name":       h["name"],
                "district":   h["location"],
                "city":       "Kolkata",
                "state":      "West Bengal",
                "lat":        h.get("lat"),
                "lng":        h.get("lng"),
                "beds":       h.get("bedsAvailable", 0),
                "doctors":    total_doctors,
                "ambulances": 3,
                "is_active":  h.get("isOpen", True),
                "rating":     h.get("rating", 4.0),
            })
        print(f"  OK - {len(hospitals_data)} hospitals upserted.")

        # ---- DOCTORS ----
        # Delete old doctors to avoid the broken enum values in DB
        print("Replacing doctors...")
        conn.execute(text("DELETE FROM doctors"))
        for d in doctors_data:
            dept = d.get("department", "General Medicine")
            spec = SPEC_MAP.get(dept, "GENERAL")
            conn.execute(text("""
                INSERT INTO doctors (id, name, "hospitalId", department, specialization, experience, availability, fees, phone, email)
                VALUES (:id, :name, :hospitalId, :department, :specialization, :experience, :availability, :fees, :phone, :email)
                ON CONFLICT (id) DO UPDATE SET
                    name           = EXCLUDED.name,
                    "hospitalId"   = EXCLUDED."hospitalId",
                    department     = EXCLUDED.department,
                    specialization = EXCLUDED.specialization,
                    experience     = EXCLUDED.experience,
                    availability   = EXCLUDED.availability,
                    fees           = EXCLUDED.fees,
                    phone          = EXCLUDED.phone,
                    email          = EXCLUDED.email
            """), {
                "id":             d["id"],
                "name":           d["name"],
                "hospitalId":     d["hospitalId"],
                "department":     dept,
                "specialization": spec,
                "experience":     d.get("experience", 5),
                "availability":   d.get("availability", "Available"),
                "fees":           d.get("fees", 500),
                "phone":          d.get("phone", ""),
                "email":          d.get("email", ""),
            })
        print(f"  OK - {len(doctors_data)} doctors inserted.")

        # ---- PATIENTS ----
        print("Upserting patients...")
        for i, p in enumerate(patients_data, start=1):
            gender = GENDER_MAP.get(p.get("gender", "Other"), "Other")
            conn.execute(text("""
                INSERT INTO patients (id, name, age, gender, diagnosis, status, "hospitalId")
                VALUES (:id, :name, :age, :gender, :diagnosis, :status, :hospitalId)
                ON CONFLICT (id) DO UPDATE SET
                    name      = EXCLUDED.name,
                    age       = EXCLUDED.age,
                    gender    = EXCLUDED.gender,
                    diagnosis = EXCLUDED.diagnosis,
                    status    = EXCLUDED.status,
                    "hospitalId" = EXCLUDED."hospitalId"
            """), {
                "id":         i,
                "name":       p["name"],
                "age":        p["age"],
                "gender":     gender,
                "diagnosis":  p.get("diagnosis", "General"),
                "status":     p.get("status", "Admitted"),
                "hospitalId": p.get("hospitalId"),
            })
        print(f"  OK - {len(patients_data)} patients upserted.")

    print("\nDatabase seeded successfully!")
    print(f"   Hospitals : {len(hospitals_data)}")
    print(f"   Doctors   : {len(doctors_data)}")
    print(f"   Patients  : {len(patients_data)}")


if __name__ == "__main__":
    seed()
