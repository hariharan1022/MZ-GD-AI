import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run_sql():
    db_url = os.getenv("SUPABASE_DB_URL")
    print(f"Connecting to {db_url.split('@')[1]}...")
    conn = await asyncpg.connect(db_url)
    
    try:
        # Drop all tables in public schema to ensure a clean reset
        print("Dropping all tables to clean up old SERIAL schemas...")
        await conn.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """)
        
        # Re-run schema.sql
        print("Running schema.sql...")
        with open('../database/schema.sql', 'r') as f:
            schema_sql = f.read()
        await conn.execute(schema_sql)
        
        print("Schema updated successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_sql())
