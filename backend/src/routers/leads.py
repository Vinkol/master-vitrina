import httpx
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.config import settings  
from src.schemas import BetaRequestCreate, BetaRequestResponse  
from src.models import BetaRequest

router = APIRouter(tags=["Beta Requests"])

async def send_admin_notification(username: str, plan: str):
    """Фоновая функция для мгновенной отправки лида админу в TG"""
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    text = f"🔥 **Новая заявка на бета-тест!**\n\n👤 Мастер: @{username}\n💎 Выбранный тариф: {plan}"
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json={"chat_id": settings.ADMIN_TELEGRAM_ID, "text": text, "parse_mode": "Markdown"})
        except Exception as e:
            print(f"Ошибка отправки уведомления админу: {e}")

@router.post("/leads", response_model=BetaRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_beta_lead(
    payload: BetaRequestCreate, 
    db: AsyncSession = Depends(get_db)
):
    new_lead = BetaRequest(
        tg_username=payload.tg_username,
        plan_name=payload.plan_name
    )
    
    db.add(new_lead)
    await db.commit()
    await db.refresh(new_lead)
    await send_admin_notification(new_lead.tg_username, new_lead.plan_name)
    
    return new_lead

