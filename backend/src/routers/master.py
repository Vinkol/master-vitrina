import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.database import get_db
from src.models import UserMaster
from src.schemas import MasterProfileUpdate, MasterProfileResponse
from src.dependencies import get_current_master

router = APIRouter(prefix="/master/profile", tags=["Master Profile"])

@router.get("", response_model=MasterProfileResponse)
async def get_master_profile(
    current_master: UserMaster = Depends(get_current_master)
):
    """Эндпоинт получения данных текущего авторизованного мастера"""
    return current_master

@router.patch("", response_model=MasterProfileResponse)
async def update_master_profile(
    payload: MasterProfileUpdate,
    current_master: UserMaster = Depends(get_current_master),
    db: AsyncSession = Depends(get_db)
):
    """
    Эндпоинт частичного редактирования текстового профиля мастера.
    Обновляет только переданные поля (name и/или bio).
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
