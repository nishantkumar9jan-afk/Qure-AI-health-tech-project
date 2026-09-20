from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Hospital(Base):
    __tablename__ = 'hospitals'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, index=True)
    city = Column(String(100), default='New Delhi')
    departments = Column(String(255), default='General Medicine,Cardiology,Pediatrics,Orthopedics,ENT')
    created_at = Column(DateTime, default=datetime.utcnow)

    doctors = relationship('Doctor', back_populates='hospital', cascade='all, delete-orphan')

class Doctor(Base):
    __tablename__ = 'doctors'

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey('hospitals.id'), nullable=False)
    name = Column(String(120), nullable=False)
    department = Column(String(80), nullable=False, index=True)
    room_number = Column(String(30), nullable=False)
    avg_consultation_time = Column(Float, default=12.0)  # in minutes
    experience_years = Column(Integer, default=8)
    is_available = Column(Boolean, default=True)
    status = Column(String(30), default='AVAILABLE')  # AVAILABLE, CONSULTING, ON_BREAK, OFF_DUTY
    current_token_id = Column(Integer, nullable=True)

    hospital = relationship('Hospital', back_populates='doctors')
    tokens = relationship('Token', back_populates='doctor')
    queue_history = relationship('QueueHistory', back_populates='doctor')

class Patient(Base):
    __tablename__ = 'patients'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), default='Other')
    created_at = Column(DateTime, default=datetime.utcnow)

    tokens = relationship('Token', back_populates='patient')

class Token(Base):
    __tablename__ = 'tokens'

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String(30), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    doctor_id = Column(Integer, ForeignKey('doctors.id'), nullable=False)
    department = Column(String(80), nullable=False)
    priority = Column(String(20), default='NORMAL')  # NORMAL, SENIOR, EMERGENCY
    status = Column(String(30), default='WAITING')  # WAITING, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
    estimated_wait_minutes = Column(Float, default=0.0)
    registered_at = Column(DateTime, default=datetime.utcnow)
    consultation_started_at = Column(DateTime, nullable=True)
    consultation_ended_at = Column(DateTime, nullable=True)
    qr_code_data = Column(Text, nullable=True)

    patient = relationship('Patient', back_populates='tokens')
    doctor = relationship('Doctor', back_populates='tokens')
    appointment = relationship('Appointment', back_populates='token', uselist=False)

class Appointment(Base):
    __tablename__ = 'appointments'

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey('tokens.id'), nullable=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    doctor_id = Column(Integer, ForeignKey('doctors.id'), nullable=False)
    scheduled_time = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default='CONFIRMED')

    token = relationship('Token', back_populates='appointment')

class QueueHistory(Base):
    __tablename__ = 'queue_history'

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, ForeignKey('doctors.id'), nullable=False)
    wait_time_actual = Column(Float, nullable=False)  # in minutes
    consultation_duration = Column(Float, nullable=False)  # in minutes
    queue_length_at_arrival = Column(Integer, default=0)
    hour_of_day = Column(Integer, default=9)
    day_of_week = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.utcnow)

    doctor = relationship('Doctor', back_populates='queue_history')
