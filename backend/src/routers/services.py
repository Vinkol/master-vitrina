import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.database import get_db
from src.models import Service, UserMaster
from src.schemas import ServiceCreate, ServiceResponse, ServiceUpdate
from src.dependencies import get_current_master

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    payload: ServiceCreate, 
    master: UserMaster = Depends(get_current_master),
    db: AsyncSession = Depends(get_db)
):
    """Создание новой услуги для текущего мастера"""
    service = Service(**payload.model_dump(), master_id=master.id)
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service

@router.patch("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: uuid.UUID,
    payload: ServiceUpdate,
    master: UserMaster = Depends(get_current_master),
    db: AsyncSession = Depends(get_db)
):
    """
    Редактирование услуги. 
    Мастер может изменить название, цену, описание или длительность.
    """
    # 1. Ищем услугу в базе и проверяем права владения
    result = await db.execute(
        select(Service).where(Service.id == service_id, Service.master_id == master.id)
    )
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Услуга не найдена или у вас нет прав на её изменение"
        )

    # 2. Превращаем пришедшие данные в словарь, исключая те поля, которые фронтенд не прислал (None)
    update_data = payload.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не передано ни одного поля для обновления"
        )

    # 3. Накатываем новые значения на объект SQLAlchemy
    for key, value in update_data.items():
        setattr(service, key, value)

    try:
        db.add(service)
        await db.commit()
        await db.refresh(service)
        return service
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении услуги в базе данных: {str(e)}"
        )


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: uuid.UUID,
    master: UserMaster = Depends(get_current_master),
    db: AsyncSession = Depends(get_db)
):
    """Удаление услуги. Мастер может удалить только свою услугу"""
    result = await db.execute(
        select(Service).where(Service.id == service_id, Service.master_id == master.id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Услуга не найдена или у вас нет прав на её управление"
        )
    await db.delete(service)
    await db.commit()

@router.get("/master/{master_id}", response_model=list[ServiceResponse])
async def get_master_services(
    master_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Получение всех услуг конкретного мастера (доступно клиентам)"""
    result = await db.execute(select(Service).where(Service.master_id == master_id))
    return result.scalars().all()
