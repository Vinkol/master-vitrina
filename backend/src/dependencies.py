import uuid
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.database import get_db
from src.models import UserMaster
from src.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/telegram")

async def get_current_master(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> UserMaster:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось валидировать токен доступа",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        master_id_str: str = payload.get("sub")
        if master_id_str is None:
            raise credentials_exception
        # Превращаем строку обратно в объект UUID для запроса к Postgres
        master_id = uuid.UUID(master_id_str)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception
        
    result = await db.execute(select(UserMaster).where(UserMaster.id == master_id))
    master = result.scalar_one_or_none()
    if master is None:
        raise credentials_exception
    return master
