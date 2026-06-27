import httpx
import json
from src.config import settings

async def send_telegram_notification(chat_id: int, text: str, client_phone: str | None = None):
    """Безопасная фоновая отправка сообщения мастеру через HTTPS Telegram Bot API"""
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    # кнопки
    keyboard = { "inline_keyboard": [] }
    if client_phone and client_phone.startswith('+'):
        clean_phone = client_phone.replace(" ", "").replace("-", "")
        keyboard["inline_keyboard"].append([
            {
                "text": "💬 Написать клиенту", 
                "url": f"https://t.me/{clean_phone}"
            }
        ])
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": json.dumps(keyboard)
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            response.raise_for_status()
    except Exception as e:
        print(f"Ошибка отправки уведомления в TG: {e}")
