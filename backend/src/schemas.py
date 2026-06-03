from pydantic import BaseModel, Field
from datetime import datetime
from src.models import UserRole, AppointmentStatus

class AuthRequest(BaseModel):
    init_data: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: UserRole

class UserResponse(BaseModel):
    id: int
    telegram_id: int
    username: str | None
    full_name: str
    role: UserRole
    avatar_base64: str | None
    
    class Config:
        from_attributes = True

class UserUpdateRole(BaseModel):
    role: UserRole

class ServiceCreate(BaseModel):
    title: str = Field(..., max_length=150)
    description: str | None = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    duration_minutes: int = Field(..., gt=0)

class ServiceResponse(ServiceCreate):
    id: int
    master_id: int

    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    master_id: int
    service_id: int
    start_time: datetime

class AppointmentResponse(BaseModel):
    id: int
    client_id: int
    master_id: int
    service_id: int
    start_time: datetime
    status: AppointmentStatus
    created_at: datetime

    class Config:
        from_attributes = True
