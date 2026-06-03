from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.database import get_db
from src.models import User, UserRole
from src.schemas import AuthRequest, TokenResponse, UserResponse, UserUpdateRole
from src.auth import verify_telegram_init_data, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/telegram", response_model=TokenResponse)
async def auth_telegram_user(payload: AuthRequest, db: AsyncSession = Depends(get_db)):
    tg_user = verify_telegram_init_data(payload.init_data)
    tg_id = tg_user["id"]
    
    result = await db.execute(select(User).where(User.telegram_id == tg_id))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            telegram_id=tg_id, 
            username=tg_user.get("username"), 
            full_name=f"{tg_user.get('first_name', '')} {tg_user.get('last_name', '')}".strip() or f"User {tg_id}",
            role=UserRole.CLIENT
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    token = create_access_token(user_id=user.id, telegram_id=user.telegram_id, role=user.role.value)
    return {"access_token": token, "token_type": "bearer", "role": user.role}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/toggle-role", response_model=UserResponse)
async def toggle_role(payload: UserUpdateRole, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.role = payload.role
    await db.commit()
    await db.refresh(current_user)
    return current_user
