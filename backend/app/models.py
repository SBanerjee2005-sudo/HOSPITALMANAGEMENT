import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime, Boolean
from app.database import Base, engine
from sqlalchemy.sql import func

# ================== HOSPITAL MODEL ==================

# Enums for realistic schema
class GenderEnum(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class SpecializationEnum(str, enum.Enum):
    CARDIOLOGY = "Cardiology"
    NEUROLOGY = "Neurology"
    ORTHOPEDICS = "Orthopedics"
    GENERAL = "General"

class AppointmentStatusEnum(str, enum.Enum):
    SCHEDULED = "Scheduled"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    beds = Column(Integer)
    doctors = Column(Integer)
    ambulances = Column(Integer)
    district = Column(String, nullable=True)
    open_time = Column(String, nullable=True)
    close_time = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

# ================== PATIENT MODEL ==================
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String, nullable=True)
    diagnosis = Column(String, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    hospitalId = Column(Integer, ForeignKey("hospitals.id"), nullable=True)

# ================== DOCTOR MODEL ==================
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialization = Column(String, nullable=True)
    hospitalId = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    department = Column(String, nullable=True)
    experience = Column(Integer, nullable=True)
    availability = Column(String, nullable=True)
    fees = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

# ================== APPOINTMENT MODEL ==================
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patientId = Column(Integer, ForeignKey("patients.id"), nullable=True)
    doctorId = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    hospitalId = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    patientName = Column("patientName", String, nullable=True)
    doctorName = Column("doctorName", String, nullable=True)
    date = Column(String, nullable=True)
    time = Column(String, nullable=True)
    type = Column(String, nullable=True)
    mode = Column(String, nullable=True)
    status = Column(String, nullable=True, default="Scheduled")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

# ================== BILLING MODEL ==================
class Billing(Base):
    __tablename__ = "billing"

    id = Column(Integer, primary_key=True, index=True)
    patient = Column(String)
    amount = Column(Integer)
    paid_at = Column(DateTime, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

# ================== USER MODEL ==================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    displayName = Column(String, nullable=True)
    role = Column(String, default="patient")
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    verification_status = Column(String, default="APPROVED")
    doctorId = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    hospitalId = Column(Integer, ForeignKey("hospitals.id"), nullable=True)

# ================== PAST APPOINTMENT MODEL ==================
class PastAppointment(Base):
    __tablename__ = "past_appointments"

    id = Column(Integer, primary_key=True, index=True)
    patientId = Column("patientId", Integer, nullable=True)
    doctorId = Column("doctorId", Integer, nullable=True)
    hospitalId = Column("hospitalId", Integer, nullable=True)
    patientName = Column("patientName", String, nullable=True)
    doctorName = Column("doctorName", String, nullable=True)
    date = Column(String, nullable=True)
    time = Column(String, nullable=True)
    type = Column(String, nullable=True)
    mode = Column(String, nullable=True)
    status = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    completionOrCancellationDate = Column("completionOrCancellationDate", String, nullable=True)

# ================== PRESCRIPTION MODEL ==================
class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    doctorId = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    doctorName = Column("doctorName", String, nullable=True)
    hospitalId = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    patientId = Column("patientId", Integer, nullable=True)
    patientName = Column("patientName", String, nullable=True)
    medicineName = Column("medicineName", String, nullable=True)
    dosage = Column("dosage", String, nullable=True)
    timing = Column("timing", String, nullable=True)
    durationDays = Column("durationDays", String, nullable=True)
    testsRecommended = Column("testsRecommended", String, nullable=True)
    followUpDate = Column("followUpDate", String, nullable=True)
    notes = Column("notes", String, nullable=True)
    createdAt = Column("createdAt", String, nullable=True)


# Base.metadata.create_all(bind=engine)

# Additional models for realistic hospital management
class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    is_occupied = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)


