import re
import uuid
from datetime import date, time
from pydantic import BaseModel, Field, ConfigDict, field_validator

# СХЕМЫ АВТОРИЗАЦИИ
class AuthRequest(BaseModel):
    init_data: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# СХЕМЫ ДЛЯ МАСТЕРА
class UserMasterBase(BaseModel):
    telegram_id: int | None = None
    username: str | None = None
    name: str = Field(..., max_length=255)
    bio: str | None = None
    avatar: str | None = None
    schedule: list = []

class MasterProfileResponse(BaseModel):
    id: uuid.UUID
    telegram_id: int
    username: str | None
    name: str
    bio: str | None
    avatar: str | None
    
    class Config:
        from_attributes = True

class MasterProfileUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    bio: str | None = Field(None, max_length=1000)
    avatar: str | None = None

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
    master_id: str
    service_id: str
    date: date
    time: str
    client_name: str = Field(..., max_length=255)
    client_phone: str = Field(..., max_length=50)

class ClientAppointmentResponse(BaseModel):
    id: uuid.UUID
    master_id: uuid.UUID
    service_id: uuid.UUID | None
    service_title: str | None
    date: date
    time: time           
    client_name: str
    client_phone: str | None = None

    model_config = ConfigDict(from_attributes=True)


# СХЕМЫ ДЛЯ ЧЕРНОГО СПИСКА
class CRMClientResponse(BaseModel):
    master_id: uuid.UUID
    client_name: str
    client_phone: str
    visits_count: int
    last_visit_date: str | None = None
    is_blocked: bool = False
    has_future_appointment: bool = False

class ClientBlockPayload(BaseModel):
    master_id: uuid.UUID
    client_phone: str
    
    model_config = ConfigDict(from_attributes=True)

class BetaRequestCreate(BaseModel):
    tg_username: str = Field(..., min_length=5, max_length=32, description="Никнейм в Telegram")
    plan_name: str = Field(..., max_length=50, description="Название выбранного тарифа")

    @field_validator("tg_username")
    @classmethod
    def validate_tg_username(cls, v: str) -> str:
        clean_username = v.replace("@", "").strip()

        if not re.match(r"^[a-zA-Z0-9_]+$", clean_username):
            raise ValueError("Никнейм должен содержать только латинские буквы, цифры и символ подчеркивания")
            
        if len(clean_username) < 5:
            raise ValueError("Никнейм должен быть не короче 5 символов")
            
        return clean_username

class BetaRequestResponse(BaseModel):
    id: int
    tg_username: str
    plan_name: str
    
    model_config = ConfigDict(from_attributes=True) 