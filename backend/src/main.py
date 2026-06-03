from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.routers import auth, services, appointments

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Высокопроизводительный бэкенд для Telegram Mini App автоматизации онлайн-записи",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров
app.include_router(auth.router, prefix="/api/v1")
app.include_router(services.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1")

@app.get("/healthcheck", tags=["System Control"])
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
