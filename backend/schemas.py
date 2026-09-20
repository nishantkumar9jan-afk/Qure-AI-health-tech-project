from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class HospitalBase(BaseModel):
    name: str
    code: str
    city: str
    departments: str

class HospitalResponse(HospitalBase):
    id: int
    class Config:
        from_attributes = True

class DoctorBase(BaseModel):
    name: str
    department: str
    room_number: str
    avg_consultation_time: float
    experience_years: int
    is_available: bool = True
    status: str = 'AVAILABLE'

class DoctorResponse(DoctorBase):
    id: int
    hospital_id: int
    current_token_id: Optional[int] = None
    class Config:
        from_attributes = True

class PatientRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    age: int = Field(..., ge=1, le=120)
    gender: str = 'Other'
    doctor_id: int
    department: Optional[str] = None
    priority: str = 'NORMAL'  # NORMAL, SENIOR, EMERGENCY

class TokenDetail(BaseModel):
    id: int
    token_number: str
    patient_id: int
    patient_name: str
    patient_age: int
    doctor_id: int
    doctor_name: str
    department: str
    room_number: str
    priority: str
    status: str
    estimated_wait_minutes: float
    registered_at: datetime
    patients_ahead: int
    qr_code_data: Optional[str] = None

class WaitingTimeResponse(BaseModel):
    token_number: str
    patient_name: str
    doctor_name: str
    department: str
    room_number: str
    priority: str
    status: str
    patients_ahead: int
    estimated_wait_minutes: float
    min_wait_minutes: float
    max_wait_minutes: float
    is_next: bool
    current_serving_token: Optional[str] = None
    doctor_status: str

class QueueStatusDoctor(BaseModel):
    doctor_id: int
    doctor_name: str
    department: str
    room_number: str
    doctor_status: str
    avg_consultation_time: float
    current_token: Optional[TokenDetail] = None
    waiting_count: int
    waiting_list: List[TokenDetail]

class DoctorActionRequest(BaseModel):
    doctor_id: int
    token_id: Optional[int] = None

class DoctorBreakRequest(BaseModel):
    doctor_id: int
    status: str = 'ON_BREAK'  # AVAILABLE or ON_BREAK

class NotificationRequest(BaseModel):
    token_number: str
    channel: str = 'whatsapp'  # sms or whatsapp
    phone: str
    message: Optional[str] = None

class NotificationResponse(BaseModel):
    success: bool
    channel: str
    phone: str
    token_number: str
    message: str
    timestamp: datetime

class DoctorPerformanceMetric(BaseModel):
    doctor_id: int
    doctor_name: str
    department: str
    patients_seen: int
    avg_consultation_duration: float
    on_time_percentage: float

class AnalyticsDashboardResponse(BaseModel):
    total_patients_today: int
    patients_served_today: int
    patients_waiting_now: int
    avg_wait_time_minutes: float
    peak_hour: str
    accuracy_rate: float
    hourly_wait_times: Dict[str, float]
    hourly_patient_flow: Dict[str, int]
    department_distribution: Dict[str, int]
    doctor_performance: List[DoctorPerformanceMetric]
