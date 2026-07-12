import asyncio
import os
import logging
from app.db.connection import db

logger = logging.getLogger(__name__)

async def init_db():
    await db.connect()
    
    if not db.pool:
        logger.error("Could not connect to database. Aborting schema initialization.")
        return

    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    try:
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        async with db.pool.acquire() as connection:
            await connection.execute(schema_sql)
            logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to execute schema.sql: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_db())
