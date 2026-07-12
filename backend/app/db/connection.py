import asyncpg
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if not settings.SUPABASE_DB_URL or "example" in settings.SUPABASE_DB_URL:
            logger.warning("No valid SUPABASE_DB_URL found. Please update backend/.env with your real Supabase URL.")
            return
            
        try:
            self.pool = await asyncpg.create_pool(
                dsn=settings.SUPABASE_DB_URL,
                min_size=1,
                max_size=10,
                command_timeout=60,
            )
            logger.info("Successfully connected to Supabase PostgreSQL database.")
        except Exception as e:
            logger.error(f"Failed to connect to the database: {e}")
            raise e

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            logger.info("Database connection closed.")

db = DatabaseManager()

# Dependency for FastAPI endpoints
async def get_db():
    if not db.pool:
        raise Exception("Database is not connected. Did you set SUPABASE_DB_URL in .env?")
    async with db.pool.acquire() as connection:
        yield connection
