from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from src.config import settings

IS_DEVELOPMENT = getattr(settings, "DEBUG", True)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=IS_DEVELOPMENT,
    
    # ПУЛ СОЕДИНЕНИЙ
    pool_size=20,
    max_overflow=10,
    
    # ЗАЩИТА ОТ ТАЙМАУТОВ И МЕРТВЫХ КОННЕКТОВ
    pool_recycle=1800,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
