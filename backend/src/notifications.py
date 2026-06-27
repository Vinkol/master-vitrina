import httpx
from src.config import settings

async def send_telegram_notification(chat_id: int, text: str):
    """Безопасная фоновая отправка сообщения мастеру через HTTPS Telegram Bot API"""
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            response.raise_for_status()
    except Exception as e:
        # Логируем ошибку, чтобы бэкенд не падал при сбоях сети у Telegram
        print(f"Ошибка отправки уведомления в TG: {e}")
