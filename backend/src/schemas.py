import uuid
from datetime import date, time, datetime
from pydantic import BaseModel, Field, ConfigDict

# СХЕМЫ АВТОРИЗАЦИИ
class AuthRequest(BaseModel):
    init_data: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# СХЕМЫ ДЛЯ МАСТЕРА
class UserMasterBase(BaseModel):
    telegram_id: int
    username: str | None = None
    name: str = Field(..., max_length=255)
    bio: str | None = None
    avatar: str | None = None
    schedule: list | None = None

class UserMasterCreate(UserMasterBase):
    pass

class UserMasterResponse(UserMasterBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


# СХЕМЫ ДЛЯ УСЛУГ
class ServiceCreate(BaseModel):
    title: str = Field(..., max_length=150)
    description: str | None = Field(None, max_length=500)
    price: int = Field(..., gt=0)      
    duration: int = Field(..., gt=0)

class ServiceUpdate(BaseModel):
    title: str | None = Field(None, max_length=150)
    description: str | None = Field(None, max_length=500)
    price: int | None = Field(None, gt=0)
    duration: int | None = Field(None, gt=0)


class ServiceResponse(ServiceCreate):
    id: uuid.UUID
    master_id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


# СХЕМЫ ДЛЯ ЗАПИСЕЙ КЛИЕНТОВ
class ClientAppointmentCreate(BaseModel):
    master_id: uuid.UUID
    service_title: str = Field(..., max_length=150)
    date: date
    time: time
    client_name: str = Field(..., max_length=255)
    client_phone: str = Field(..., max_length=50)

class ClientAppointmentResponse(ClientAppointmentCreate):
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)


# СХЕМЫ ДЛЯ ЧЕРНОГО СПИСКА
class BlockedClientCreate(BaseModel):
    client_phone: str = Field(..., max_length=50)

class BlockedClientResponse(BaseModel):
    id: uuid.UUID
    master_id: uuid.UUID
    client_phone: str
    created_at: date
    
    model_config = ConfigDict(from_attributes=True)
