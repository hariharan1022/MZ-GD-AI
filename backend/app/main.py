from fastapi import FastAPI
from app.api import router as api_router
from app.db.connection import connect_to_db, close_db_connection

app = FastAPI(
    title="AI Group Discussion Platform API",
    description="Backend API for AI Group Discussion Platform using FastAPI and Supabase",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    await connect_to_db(app)

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_connection(app)

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}
