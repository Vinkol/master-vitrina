import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.database import get_db
from src.models import UserMaster, Service
from src.schemas import MasterProfileUpdate, MasterProfileResponse, UserMasterCreate, UserMasterResponse
from src.dependencies import get_current_master, get_current_telegram_id

router = APIRouter(prefix="/master", tags=["Master Profile"])

@router.post("/register", response_model=UserMasterResponse, status_code=status.HTTP_201_CREATED)
async def register_master(
    payload: UserMasterCreate, 
    db: AsyncSession = Depends(get_db),
    tg_id: int = Depends(get_current_telegram_id)
):
    """
    Создание профиля мастера.
    
    """
    result = await db.execute(select(UserMaster).where(UserMaster.telegram_id == tg_id))
    existing_master = result.scalar_one_or_none()
    if existing_master:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Профиль мастера для данного Telegram аккаунта уже существует"
        )

    new_master = UserMaster(
        telegram_id=tg_id,
        username=payload.username,
        name=payload.name,
        bio=payload.bio,
        avatar=payload.avatar,
        schedule=payload.schedule
    )
    
    db.add(new_master)
    await db.commit()
    await db.refresh(new_master)
    
    return new_master

@router.get("/profile", response_model=UserMasterResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    tg_id: int = Depends(get_current_telegram_id)
):
    """Эндпоинт получения текущего профиля для фронтенда"""
    result = await db.execute(select(UserMaster).where(UserMaster.telegram_id == tg_id))
    master = result.scalar_one_or_none()
    if not master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Профиль не найден")
    return master

@router.patch("/profile", response_model=MasterProfileResponse)
async def update_master_profile(
    payload: MasterProfileUpdate,
    current_master: UserMaster = Depends(get_current_master),
    db: AsyncSession = Depends(get_db)
):
    """
    Эндпоинт частичного редактирования текстового профиля мастера.
    Обновляет только переданные поля (name и/или bio и/или avatar).
    """
    update_data = payload.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Не передано ни одного поля для обновления"
        )
        
    for key, value in update_data.items():
        setattr(current_master, key, value)
        
    try:
        db.add(current_master)
        await db.commit()
        await db.refresh(current_master)
        return current_master
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Ошибка обновления профиля в базе данных: {str(e)}"
        )


@router.get("/public/master/{master_id}")
async def get_public_profile(master_id: str, db: AsyncSession = Depends(get_db)):
    """Отдает данные мастера (имя, био, аватар, расписание) любому клиенту"""
    from src.models import UserMaster
    result = await db.execute(select(UserMaster).where(UserMaster.id == master_id))
    master = result.scalar_one_or_none()
    if not master:
        raise HTTPException(status_code=404, detail="Master not found")
    return {
        "name": master.name,
        "bio": master.bio,
        "avatar": master.avatar,
        "schedule": master.schedule
    }

@router.get("/public/master/{master_id}/services")
async def get_public_services(master_id: str, db: AsyncSession = Depends(get_db)):
    """Отдает прайс-лист конкретного мастера для витрины записи"""
    result = await db.execute(select(Service).where(Service.master_id == master_id))
    return result.scalars().all()