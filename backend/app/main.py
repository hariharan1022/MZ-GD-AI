import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import router as api_router
from app.db.connection import db

app = FastAPI(
    title="AI Group Discussion Platform API",
    description="Backend API for AI Group Discussion Platform using FastAPI and Supabase",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await db.connect()
    try:
        from app.db.sync_students import sync_students_from_csv
        if db.pool:
            async with db.pool.acquire() as conn:
                await sync_students_from_csv(conn)
        elif db.sqlite_pool:
            conn = await db.sqlite_pool.acquire()
            await sync_students_from_csv(conn)
    except Exception as e:
        import logging
        logging.getLogger("app.main").error(f"Failed to sync students on startup: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await db.disconnect()

uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}
