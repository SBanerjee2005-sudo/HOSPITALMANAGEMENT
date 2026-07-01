import json
import os
import sys

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import Hospital, Doctor, Patient, Appointment, PastAppointment, Prescription

def seed_database():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(Hospital).count() > 0:
            print("Database already contains hospitals. Skipping seed.")
            return

        with open(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'seed_data.json'), 'r') as f:
            data = json.load(f)
            
        print("Seeding Hospitals...")
        for h in data.get("hospitals", []):
            hospital = Hospital(
                id=h["id"],
                name=h["name"],
                lat=h.get("lat"),
                lng=h.get("lng"),
                district=h.get("location"),
                rating=h.get("rating"),
                is_active=h.get("isOpen", True),
                beds=h.get("bedsAvailable", 0),
            )
            # Find doctors for this hospital
            dept_docs = sum([d.get("doctorCount", 0) for d in h.get("departments", [])])
            hospital.doctors = dept_docs
            db.add(hospital)
            
        print("Seeding Doctors...")
        for d in data.get("doctors", []):
            doctor = Doctor(
                id=d["id"],
                name=d["name"],
                hospitalId=d["hospitalId"],
                department=d["department"],
                experience=d["experience"],
                availability=d["availability"],
                fees=d["fees"],
                phone=d["phone"],
                email=d["email"]
            )
            # Simplistic mapping of department to specialization enum
            specialization = "General"
            dept_lower = doctor.department.lower() if doctor.department else ""
            if "cardio" in dept_lower: specialization = "Cardiology"
            elif "neuro" in dept_lower: specialization = "Neurology"
            elif "ortho" in dept_lower: specialization = "Orthopedics"
            
            doctor.specialization = specialization
            db.add(doctor)
            
        print("Seeding Patients...")
        patient_id_map = {} # Map string ID "P001" to numerical ID
        current_pid = 1
        for p in data.get("adminPatients", []):
            patient = Patient(
                id=current_pid,
                name=p["name"],
                age=p["age"],
                gender=p["gender"],
                diagnosis=p["diagnosis"],
                status=p["status"],
                hospitalId=p["hospitalId"]
            )
            patient_id_map[p["id"]] = current_pid
            db.add(patient)
            current_pid += 1
            
        print("Seeding Appointments...")
        for a in data.get("appointments", []):
            pid = patient_id_map.get(a["patientId"], 1)
            appointment = Appointment(
                patientId=pid,
                doctorId=a["doctorId"],
                hospitalId=a["hospitalId"],
                date=a["date"],
                time=a["time"],
                type=a["type"],
                mode=a["mode"],
                status=a["status"],
                notes=a["notes"]
            )
            db.add(appointment)
            
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
