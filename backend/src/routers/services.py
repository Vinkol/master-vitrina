from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.database import get_db
from src.models import Service, User
from src.schemas import ServiceCreate, ServiceResponse
from src.auth import require_master_role

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(payload: ServiceCreate, master: User = Depends(require_master_role), db: AsyncSession = Depends(get_db)):
    service = Service(**payload.model_dump(), master_id=master.id)
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service

@router.get("/master/{master_id}", response_model=list[ServiceResponse])
async def get_master_services(master_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.master_id == master_id))
    return result.scalars().all()

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, master: User = Depends(require_master_role), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == service_id, Service.master_id == master.id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    await db.delete(service)
    await db.commit()
