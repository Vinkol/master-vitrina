from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import UserMaster
from src.dependencies import get_current_master

router = APIRouter(prefix="/master/schedule", tags=["schedule"])

@router.put("")
async def save_master_schedule(
    payload: list,
    current_master: UserMaster = Depends(get_current_master),
    db: AsyncSession = Depends(get_db)
):
    """
    Эндпоинт для сохранения или обновления расписания мастера.
    Автоматически определяет мастера по его JWT-токену.
    """
    try:
        current_master.schedule = payload
        
        db.add(current_master)
        await db.commit()
        await db.refresh(current_master)
        
        return {"status": "success", "message": "Расписание успешно сохранено", "schedule": current_master.schedule}
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при сохранении расписания: {str(e)}"
        )

@router.get("")
async def get_master_schedule(
    current_master: UserMaster = Depends(get_current_master)
):
    """Эндпоинт для получения текущего расписания мастера"""
    return {"schedule": current_master.schedule or {}}
