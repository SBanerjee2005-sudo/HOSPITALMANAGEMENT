from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, verify_admin_key
from app.models import Hospital, Patient, Doctor, Appointment
from app.schemas import HospitalUpdate, BroadcastUpdate, StaffDashboard
from app.websocket import manager
import json

router = APIRouter()

import random

# Rich metadata keyed by hospital ID for the 18 seeded Kolkata hospitals.
# This provides realistic bedInventory and departments since the DB only stores totals.
HOSPITAL_META = {
    1:  {"specialties": ["Cardiology", "Neurology", "Orthopedics"],
         "bedInventory": [{"type": "ICU", "available": 4, "busy": 9, "unavailable": 1},
                          {"type": "General Ward", "available": 7, "busy": 14, "unavailable": 2},
                          {"type": "Private Room", "available": 5, "busy": 6, "unavailable": 1},
                          {"type": "Emergency", "available": 2, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 5, "availability": "Available"},
                         {"name": "Neurology", "doctorCount": 4, "availability": "Limited"},
                         {"name": "Orthopedics", "doctorCount": 3, "availability": "Available"}]},
    2:  {"specialties": ["Cardiology", "Dermatology", "ENT"],
         "bedInventory": [{"type": "ICU", "available": 1, "busy": 6, "unavailable": 1},
                          {"type": "General Ward", "available": 3, "busy": 12, "unavailable": 2},
                          {"type": "Private Room", "available": 2, "busy": 5, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 4, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 4, "availability": "Limited"},
                         {"name": "Dermatology", "doctorCount": 3, "availability": "Available"},
                         {"name": "ENT", "doctorCount": 2, "availability": "Available"}]},
    3:  {"specialties": ["Pediatrics", "Neurology", "General Medicine"],
         "bedInventory": [{"type": "ICU", "available": 0, "busy": 2, "unavailable": 4},
                          {"type": "General Ward", "available": 0, "busy": 4, "unavailable": 6},
                          {"type": "Private Room", "available": 0, "busy": 1, "unavailable": 2},
                          {"type": "Emergency", "available": 0, "busy": 1, "unavailable": 2}],
         "departments": [{"name": "Pediatrics", "doctorCount": 4, "availability": "Available"},
                         {"name": "Neurology", "doctorCount": 2, "availability": "Limited"},
                         {"name": "General Medicine", "doctorCount": 4, "availability": "Busy"}]},
    4:  {"specialties": ["Oncology", "Cardiology", "General Medicine"],
         "bedInventory": [{"type": "ICU", "available": 2, "busy": 7, "unavailable": 1},
                          {"type": "General Ward", "available": 5, "busy": 10, "unavailable": 2},
                          {"type": "Private Room", "available": 3, "busy": 5, "unavailable": 1},
                          {"type": "Emergency", "available": 2, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Oncology", "doctorCount": 4, "availability": "Available"},
                         {"name": "Cardiology", "doctorCount": 3, "availability": "Limited"},
                         {"name": "General Medicine", "doctorCount": 5, "availability": "Available"}]},
    5:  {"specialties": ["Nephrology", "Pediatrics", "ENT"],
         "bedInventory": [{"type": "ICU", "available": 1, "busy": 5, "unavailable": 1},
                          {"type": "General Ward", "available": 4, "busy": 11, "unavailable": 2},
                          {"type": "Private Room", "available": 3, "busy": 4, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Nephrology", "doctorCount": 3, "availability": "Available"},
                         {"name": "Pediatrics", "doctorCount": 4, "availability": "Limited"},
                         {"name": "ENT", "doctorCount": 3, "availability": "Available"}]},
    6:  {"specialties": ["Critical Care", "Neurology", "Orthopedics"],
         "bedInventory": [{"type": "ICU", "available": 5, "busy": 10, "unavailable": 1},
                          {"type": "General Ward", "available": 8, "busy": 16, "unavailable": 2},
                          {"type": "Private Room", "available": 5, "busy": 6, "unavailable": 1},
                          {"type": "Emergency", "available": 3, "busy": 4, "unavailable": 0}],
         "departments": [{"name": "Critical Care", "doctorCount": 4, "availability": "Available"},
                         {"name": "Neurology", "doctorCount": 5, "availability": "Available"},
                         {"name": "Orthopedics", "doctorCount": 4, "availability": "Limited"}]},
    7:  {"specialties": ["Cardiology", "Neurology", "General Medicine"],
         "bedInventory": [{"type": "ICU", "available": 8, "busy": 12, "unavailable": 2},
                          {"type": "General Ward", "available": 15, "busy": 30, "unavailable": 3},
                          {"type": "Private Room", "available": 7, "busy": 8, "unavailable": 1},
                          {"type": "Emergency", "available": 5, "busy": 6, "unavailable": 1}],
         "departments": [{"name": "Cardiology", "doctorCount": 8, "availability": "Available"},
                         {"name": "Neurology", "doctorCount": 6, "availability": "Available"},
                         {"name": "General Medicine", "doctorCount": 10, "availability": "Busy"}]},
    8:  {"specialties": ["Orthopedics", "General Medicine", "Pediatrics"],
         "bedInventory": [{"type": "ICU", "available": 3, "busy": 10, "unavailable": 1},
                          {"type": "General Ward", "available": 10, "busy": 25, "unavailable": 3},
                          {"type": "Private Room", "available": 5, "busy": 7, "unavailable": 1},
                          {"type": "Emergency", "available": 4, "busy": 5, "unavailable": 0}],
         "departments": [{"name": "Orthopedics", "doctorCount": 5, "availability": "Available"},
                         {"name": "General Medicine", "doctorCount": 8, "availability": "Busy"},
                         {"name": "Pediatrics", "doctorCount": 4, "availability": "Available"}]},
    9:  {"specialties": ["Cardiology", "Oncology", "Neurology"],
         "bedInventory": [{"type": "ICU", "available": 3, "busy": 8, "unavailable": 1},
                          {"type": "General Ward", "available": 6, "busy": 14, "unavailable": 2},
                          {"type": "Private Room", "available": 4, "busy": 6, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 5, "availability": "Available"},
                         {"name": "Oncology", "doctorCount": 4, "availability": "Limited"},
                         {"name": "Neurology", "doctorCount": 4, "availability": "Available"}]},
    10: {"specialties": ["Cardiology", "Dermatology", "Orthopedics"],
         "bedInventory": [{"type": "ICU", "available": 2, "busy": 6, "unavailable": 1},
                          {"type": "General Ward", "available": 5, "busy": 12, "unavailable": 2},
                          {"type": "Private Room", "available": 3, "busy": 5, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 5, "availability": "Available"},
                         {"name": "Dermatology", "doctorCount": 3, "availability": "Available"},
                         {"name": "Orthopedics", "doctorCount": 4, "availability": "Limited"}]},
    11: {"specialties": ["Cardiology", "Neurology", "General Medicine"],
         "bedInventory": [{"type": "ICU", "available": 4, "busy": 7, "unavailable": 1},
                          {"type": "General Ward", "available": 7, "busy": 15, "unavailable": 2},
                          {"type": "Private Room", "available": 4, "busy": 6, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 6, "availability": "Available"},
                         {"name": "Neurology", "doctorCount": 5, "availability": "Available"},
                         {"name": "General Medicine", "doctorCount": 7, "availability": "Busy"}]},
    12: {"specialties": ["Oncology", "Orthopedics", "Cardiology"],
         "bedInventory": [{"type": "ICU", "available": 5, "busy": 9, "unavailable": 1},
                          {"type": "General Ward", "available": 8, "busy": 15, "unavailable": 2},
                          {"type": "Private Room", "available": 5, "busy": 7, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Oncology", "doctorCount": 4, "availability": "Available"},
                         {"name": "Orthopedics", "doctorCount": 5, "availability": "Available"},
                         {"name": "Cardiology", "doctorCount": 5, "availability": "Limited"}]},
    13: {"specialties": ["Cardiology", "Neurology", "Nephrology"],
         "bedInventory": [{"type": "ICU", "available": 5, "busy": 10, "unavailable": 1},
                          {"type": "General Ward", "available": 9, "busy": 16, "unavailable": 2},
                          {"type": "Private Room", "available": 5, "busy": 7, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 7, "availability": "Available"},
                         {"name": "Neurology", "doctorCount": 5, "availability": "Available"},
                         {"name": "Nephrology", "doctorCount": 4, "availability": "Limited"}]},
    14: {"specialties": ["Gynecology", "Pediatrics", "General Medicine"],
         "bedInventory": [{"type": "ICU", "available": 3, "busy": 7, "unavailable": 1},
                          {"type": "General Ward", "available": 6, "busy": 12, "unavailable": 2},
                          {"type": "Private Room", "available": 3, "busy": 5, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Gynecology", "doctorCount": 5, "availability": "Available"},
                         {"name": "Pediatrics", "doctorCount": 4, "availability": "Available"},
                         {"name": "General Medicine", "doctorCount": 4, "availability": "Busy"}]},
    15: {"specialties": ["Dermatology", "ENT", "Ophthalmology"],
         "bedInventory": [{"type": "ICU", "available": 1, "busy": 5, "unavailable": 1},
                          {"type": "General Ward", "available": 4, "busy": 10, "unavailable": 2},
                          {"type": "Private Room", "available": 2, "busy": 4, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "Dermatology", "doctorCount": 3, "availability": "Available"},
                         {"name": "ENT", "doctorCount": 3, "availability": "Available"},
                         {"name": "Ophthalmology", "doctorCount": 3, "availability": "Limited"}]},
    16: {"specialties": ["Cardiology", "Orthopedics", "Gastroenterology"],
         "bedInventory": [{"type": "ICU", "available": 2, "busy": 6, "unavailable": 1},
                          {"type": "General Ward", "available": 4, "busy": 10, "unavailable": 2},
                          {"type": "Private Room", "available": 3, "busy": 5, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 2, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 4, "availability": "Available"},
                         {"name": "Orthopedics", "doctorCount": 4, "availability": "Available"},
                         {"name": "General Medicine", "doctorCount": 5, "availability": "Busy"}]},
    17: {"specialties": ["Cardiology", "Nephrology", "Neurology"],
         "bedInventory": [{"type": "ICU", "available": 6, "busy": 11, "unavailable": 1},
                          {"type": "General Ward", "available": 11, "busy": 18, "unavailable": 2},
                          {"type": "Private Room", "available": 6, "busy": 8, "unavailable": 1},
                          {"type": "Emergency", "available": 2, "busy": 4, "unavailable": 0}],
         "departments": [{"name": "Cardiology", "doctorCount": 7, "availability": "Available"},
                         {"name": "Nephrology", "doctorCount": 5, "availability": "Limited"},
                         {"name": "Neurology", "doctorCount": 5, "availability": "Available"}]},
    18: {"specialties": ["Emergency Care", "General Medicine", "Orthopedics"],
         "bedInventory": [{"type": "ICU", "available": 3, "busy": 7, "unavailable": 1},
                          {"type": "General Ward", "available": 7, "busy": 14, "unavailable": 2},
                          {"type": "Private Room", "available": 4, "busy": 6, "unavailable": 1},
                          {"type": "Emergency", "available": 1, "busy": 3, "unavailable": 0}],
         "departments": [{"name": "General Medicine", "doctorCount": 6, "availability": "Available"},
                         {"name": "Orthopedics", "doctorCount": 4, "availability": "Available"},
                         {"name": "Cardiology", "doctorCount": 3, "availability": "Limited"}]},
}


@router.get("/hospitals")
def get_hospitals(db: Session = Depends(get_db)):
    """Get all hospitals with dynamically generated metrics"""
    hospitals = db.query(Hospital).all()
    result = []
    for h in hospitals:
        meta = HOSPITAL_META.get(h.id)
        if meta:
            bed_inventory = meta["bedInventory"]
            departments   = meta["departments"]
            specialties   = meta["specialties"]
        else:
            # Fallback for hospitals not in the metadata table (e.g. OSM-sourced)
            beds = h.beds or 0
            bed_inventory = [
                {"type": "ICU",          "available": max(0, beds // 6), "busy": max(0, beds // 3), "unavailable": max(0, beds - beds // 6 - beds // 3)},
                {"type": "General Ward", "available": max(0, beds // 2), "busy": max(0, beds // 4), "unavailable": 0},
                {"type": "Private Room", "available": max(0, beds // 8), "busy": max(0, beds // 6), "unavailable": 0},
                {"type": "Emergency",    "available": max(0, beds // 10), "busy": max(0, beds // 10), "unavailable": 0},
            ]
            departments = [
                {"name": "Cardiology",      "doctorCount": max(1, (h.doctors or 4) // 4), "availability": "Available"},
                {"name": "General Medicine", "doctorCount": max(1, (h.doctors or 4) // 3), "availability": "Busy"},
            ]
            specialties = ["Emergency Care", "General Medicine", "Surgery"]

        result.append({
            "id":              h.id,
            "name":            h.name,
            "location":        h.district or h.city or "Kolkata",
            "specialties":     specialties,
            "rating":          h.rating or 4.0,
            "isOpen":          h.is_active,
            "bedsAvailable":   h.beds or 0,
            "emergencyStatus": "Active" if (h.beds and h.beds > 0) else "Busy",
            "bedInventory":    bed_inventory,
            "departments":     departments,
            "lat":             h.lat,
            "lng":             h.lng,
        })
    return result


@router.put("/hospitals/{hospital_id}")
async def update_hospital(hospital_id: int, data: HospitalUpdate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Update a hospital by ID - Requires x-api-key header"""
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()

    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    hospital.beds = data.beds
    hospital.doctors = data.doctors
    hospital.ambulances = data.ambulances

    db.commit()
    db.refresh(hospital)

    # send live update to frontend
    await manager.broadcast("hospital_updated")

    return {"success": True, "message": "Hospital updated successfully"}

@router.post("/broadcast/hospital-update")
async def broadcast_hospital_update(update: BroadcastUpdate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Update hospital and broadcast to WebSocket clients - Requires x-api-key header"""
    try:
        hospital = db.query(Hospital).filter(Hospital.id == update.hospital_id).first()
        
        if not hospital:
            return {
                "success": False,
                "message": "Hospital not found"
            }
        
        # Update hospital data
        hospital.beds = update.beds_available
        hospital.ambulances = update.ambulances_available
        db.commit()
        
        # Broadcast update to WebSocket clients
        broadcast_message = {
            "type": "hospital_update",
            "hospital_id": update.hospital_id,
            "beds_available": update.beds_available,
            "ambulances_available": update.ambulances_available
        }
        await manager.broadcast(json.dumps(broadcast_message))
        
        return {
            "success": True,
            "message": "Hospital updated and broadcasted successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to update hospital: {str(e)}"
        }

@router.get("/staff/dashboard", response_model=StaffDashboard)
def get_staff_dashboard(db: Session = Depends(get_db)):
    """Get staff dashboard statistics"""
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    
    hospitals = db.query(Hospital).all()
    available_beds = sum(h.beds for h in hospitals)
    available_ambulances = sum(h.ambulances for h in hospitals)
    
    return StaffDashboard(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_appointments=total_appointments,
        available_beds=available_beds,
        ambulances_available=available_ambulances
    )
