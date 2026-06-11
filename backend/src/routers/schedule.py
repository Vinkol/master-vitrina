import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import UserMaster
from src.dependencies import get_current_master

class BreakSchema(BaseModel):
    id: str = Field(..., description="UUID перерыва")
    start: str = Field(..., description="Время начала HH:MM")
    end: str = Field(..., description="Время окончания HH:MM")

class DayScheduleSchema(BaseModel):
    day_id: int = Field(..., ge=0, le=6, description="Индекс дня недели: 0 - Понедельник, 6 - Воскресенье")
    day_name: str = Field(..., description="Название дня недели, например 'Понедельник'")
    is_working: bool = Field(..., description="Работает ли мастер в этот день")
    
    start_time: Optional[str] = Field("09:00", description="Время начала работы в формате HH:MM")
    end_time: Optional[str] = Field("18:00", description="Время окончания работы в формате HH:MM")
 
    breaks: list[BreakSchema] = Field(default=[], description="Список перерывов внутри рабочего дня")
    break_start: Optional[str] = Field(None, description="Время начала перерыва")
    break_end: Optional[str] = Field(None, description="Время окончания перерыва")

    model_config = {
        "extra": "allow"
    }

router = APIRouter(prefix="/master/schedule", tags=["schedule"])

@router.put("")
async def save_master_schedule(
    payload: list[DayScheduleSchema],
    current_master: UserMaster = Depends(get_current_master),
    db: AsyncSession = Depends(get_db)
):
    """
    Эндпоинт для сохранения или обновления расписания мастера.
    """
    try:
        cleaned_schedule = [day.model_dump() for day in payload]
        
        current_master.schedule = cleaned_schedule
        
        db.add(current_master)
        await db.commit()
        
        return {
            "status": "success", 
            "message": "Расписание успешно сохранено", 
            "schedule": current_master.schedule
        }
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
    return {"schedule": current_master.schedule or []}
