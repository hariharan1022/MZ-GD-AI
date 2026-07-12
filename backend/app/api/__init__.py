from fastapi import APIRouter
from app.api.routes import auth, admin_management

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(admin_management.router, prefix="/admin", tags=["Admin Management"])

@router.get("/")
async def api_root():
    return {"message": "AI Group Discussion Platform API"}

