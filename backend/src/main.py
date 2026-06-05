from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.routers import auth, services, appointments, schedule, master, crm

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Бэкенд для Telegram Mini App автоматизации онлайн-записи",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.serveo.net",
    "https://master-vitrina.vercel.app",
]

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    # allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров
app.include_router(auth.router, prefix="/api/v1")
app.include_router(services.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")
app.include_router(master.router, prefix="/api/v1")
app.include_router(crm.router, prefix="/api/v1")

@app.get("/healthcheck", tags=["System Control"])
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
