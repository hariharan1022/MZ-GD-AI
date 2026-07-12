import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "MZ GD AI Platform"
    SUPABASE_DB_URL: str = os.getenv("SUPABASE_DB_URL", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_mz_gd_key_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

settings = Settings()
