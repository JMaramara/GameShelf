# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/boardgamedb")
    secret_key: str = os.getenv("SECRET_KEY", "-TL-ebQFKVorcvfLHwrOp9l9AvxYJiXc5ve33Meq_VE")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

settings = Settings()
