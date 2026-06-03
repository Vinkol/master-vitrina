from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MASTER VI API"
    DATABASE_URL: str = "postgresql+asyncpg://beauty_user:beauty_secure_pass_2026@localhost:5432/beauty_twa_db"
    TELEGRAM_BOT_TOKEN: str = "123456:FAKE_TOKEN"
    JWT_SECRET: str = "super-secret-key-1234567890-secure"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
