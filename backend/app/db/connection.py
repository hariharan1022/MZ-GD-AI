import asyncpg
from typing import Optional
from app.core.config import settings
from app.db.sqlite_db import SQLitePool
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self.sqlite_pool: Optional[SQLitePool] = None

    async def connect(self):
        if settings.SUPABASE_DB_URL and "example" not in settings.SUPABASE_DB_URL:
            try:
                self.pool = await asyncpg.create_pool(
                    dsn=settings.SUPABASE_DB_URL,
                    min_size=1,
                    max_size=10,
                    command_timeout=60,
                )
                logger.info("Successfully connected to Supabase PostgreSQL database.")
                return
            except Exception as e:
                logger.error(f"Failed to connect to the database: {e}")
                raise e
        
        logger.warning("No valid SUPABASE_DB_URL found. Using local SQLite database.")
        self.sqlite_pool = SQLitePool()
        await self.sqlite_pool.connect()
        logger.info("SQLite database initialized with seed data.")

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
        if self.sqlite_pool:
            await self.sqlite_pool.close()

db = DatabaseManager()

async def get_db():
    if db.pool:
        async with db.pool.acquire() as connection:
            yield connection
    elif db.sqlite_pool:
        yield await db.sqlite_pool.acquire()
    else:
        raise Exception("Database is not connected.")
