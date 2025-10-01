from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    ENV: str = "dev"
    JWT_SECRET: str = "CHANGE_ME_SUPER_SECRET"
    JWT_EXPIRE_MIN: int = 120
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "finance"
    POSTGRES_USER: str = "app"
    POSTGRES_PASSWORD: str = "app123"
    DATABASE_URL: str | None = None
    RECEIPTS_DIR: str = "/data/receipts"
    OCR_LANG: str = "por"
    TZ: str = "America/Sao_Paulo"
    REDIS_URL: str = "redis://redis:6379/0"
    RQ_OCR_QUEUE: str = "ocr_queue"
    DEMO_EMAIL: str = "admin@example.com"
    DEMO_PASSWORD: str = "admin123"
    # Banco (preencher pelo usuário)
    BANK_NUMBER: str = "001"
    BANK_AGENCY: str = "1234"
    BANK_ACCOUNT: str = "123456-7"
    class Config:
        env_file = ".env"

settings = Settings()
