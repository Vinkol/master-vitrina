from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.database import get_db
from src.models import Appointment, Service, User, UserRole, AppointmentStatus
from src.schemas import AppointmentCreate, AppointmentResponse
from src.auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(payload: AppointmentCreate, client: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service_result = await db.execute(select(Service).where(Service.id == payload.service_id))
    if not service_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Service not found")

    overlap = await db.execute(select(Appointment).where(
        Appointment.master_id == payload.master_id,
        Appointment.start_time == payload.start_time,
        Appointment.status == AppointmentStatus.BOOKED
    ))
    if overlap.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slot already booked")

    appointment = Appointment(
        client_id=client.id, master_id=payload.master_id,
        service_id=payload.service_id, start_time=payload.start_time,
        status=AppointmentStatus.BOOKED
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    return appointment

@router.get("/journal", response_model=list[AppointmentResponse])
async def get_journal(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role == UserRole.MASTER:
        query = select(Appointment).where(Appointment.master_id == current_user.id)
    else:
        query = select(Appointment).where(Appointment.client_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()
