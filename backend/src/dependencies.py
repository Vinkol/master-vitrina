import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.database import get_db
from src.models import UserMaster
from src.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/telegram")

def get_current_telegram_id(token: str = Depends(oauth2_scheme)) -> int:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        tg_id: int = payload.get("telegram_id")
        
        if tg_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Невалидный токен: отсутствует идентификатор пользователя"
            )
        return tg_id
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Неверный, поврежденный или просроченный токен авторизации"
        )

async def get_current_master(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> UserMaster:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        tg_id: int = payload.get("telegram_id")
        
        if tg_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Невалидный токен: отсутствует идентификатор пользователя"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Неверный, поврежденный или просроченный токен авторизации"
        )

    result = await db.execute(select(UserMaster).where(UserMaster.telegram_id == tg_id))
    master = result.scalar_one_or_none()
    
    if not master:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Доступ запрещен. Профиль мастера не найден, завершите регистрацию."
        )
        
    return master
