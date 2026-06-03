import hmac
import hashlib
import json
import urllib.parse
from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.database import get_db
from src.models import UserMaster
from src.schemas import AuthRequest, TokenResponse, UserMasterResponse
from src.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

def verify_telegram_init_data(init_data: str, bot_token: str) -> dict | None:
    """
    Проверка подписи initData от Telegram WebApp.
    Если проверка успешна, возвращает словарь с данными пользователя.
    """
    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        if "hash" not in parsed_data:
            return None
        
        tg_hash = parsed_data.pop("hash")
        
        # Сортируем параметры по алфавиту
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))
        
        # Вычисляем секретный ключ на основе токена бота
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        # Вычисляем итоговый хэш строки параметров
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if calculated_hash != tg_hash:
            return None
            
        # Распаковываем JSON из поля user
        if "user" in parsed_data:
            return json.loads(parsed_data["user"])
        return None
    except Exception:
        return None

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Генерация JWT-токена доступа"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    # Кодируем строку с UUID мастера
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

@router.post("/telegram", response_model=TokenResponse)
async def auth_telegram(payload: AuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Эндпоинт авторизации. Проверяет данные Telegram, 
    регистрирует мастера (если новый) и выдает JWT.
    """
    # 1. Валидация данных через токен бота из нашего защищенного .env
    tg_user = verify_telegram_init_data(payload.init_data, settings.TELEGRAM_BOT_TOKEN)
    
    # СТРОГО ДЛЯ ТЕСТОВ: Если init_data равен "test", пускаем тестового юзера
    if not tg_user and payload.init_data == "test":
        tg_user = {
            "id": 999999,
            "username": "test_master",
            "first_name": "Тестовый",
            "last_name": "Мастер",
            "photo_url": None
        }
        
    if not tg_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные данные авторизации Telegram"
        )
        
    tg_id = tg_user["id"]
    username = tg_user.get("username")
    full_name = f"{tg_user.get('first_name', '')} {tg_user.get('last_name', '')}".strip() or "Мастер"
    avatar = tg_user.get("photo_url")

    # 2. Ищем мастера в базе данных по его telegram_id
    result = await db.execute(select(UserMaster).where(UserMaster.telegram_id == tg_id))
    master = result.scalar_one_or_none()

    # 3. Если такого мастера нет — регистрируем его (Авторегистрация)
    if not master:
        master = UserMaster(
            telegram_id=tg_id,
            username=username,
            name=full_name,
            avatar=avatar,
            bio=None,
            schedule=None
        )
        db.add(master)
        await db.commit()
        await db.refresh(master)

    # 4. Генерируем JWT токен. Внутрь payload зашиваем строку UUID мастера!
    token_data = {
        "sub": str(master.id),
        "telegram_id": master.telegram_id
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )
