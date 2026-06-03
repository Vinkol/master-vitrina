import hmac
import hashlib
import json
from urllib.parse import parse_qs
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, status, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.config import settings
from src.database import get_db
from src.models import User, UserRole

def verify_telegram_init_data(init_data: str) -> dict:
    try:
        parsed_data = parse_qs(init_data)
        if "hash" not in parsed_data:
            raise HTTPException(status_code=400, detail="Missing hash parameter")
        
        received_hash = parsed_data["hash"][0]
        
        filtered_params = {k: v[0] for k, v in parsed_data.items() if k != "hash"}
        data_check_arr = [f"{k}={v}" for k, v in sorted(filtered_params.items())]
        data_check_string = "\n".join(data_check_arr)
        
        secret_key = hmac.new(b"WebAppData", settings.TELEGRAM_BOT_TOKEN.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if calculated_hash != received_hash:
            raise HTTPException(status_code=401, detail="Invalid Telegram signature")
        
        return json.loads(filtered_params["user"])
    except Exception:
        raise HTTPException(status_code=401, detail="Telegram auth failed")

def create_access_token(user_id: int, telegram_id: int, role: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "telegram_id": telegram_id, "role": role, "exp": expire}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: int = int(payload.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_master_role(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.MASTER:
        raise HTTPException(status_code=403, detail="Master role required")
    return current_user
