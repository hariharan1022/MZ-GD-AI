from fastapi import APIRouter
from app.api.routes import auth, admin_management, admin_analytics, admin_gamification, admin_system_ops, student, discussions, dashboard, practice

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(admin_management.router, prefix="/admin", tags=["Admin Management"])
router.include_router(admin_analytics.router, prefix="/admin", tags=["Admin Analytics"])
router.include_router(admin_gamification.router, prefix="/admin", tags=["Admin Gamification"])
router.include_router(admin_system_ops.router, prefix="/admin", tags=["Admin System Ops"])
router.include_router(student.router, prefix="/student", tags=["Student Profile"])
router.include_router(discussions.router, prefix="/discussions", tags=["Discussions"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(practice.router, prefix="/student", tags=["Practice"])

@router.get("/")
async def api_root():
    return {"message": "AI Group Discussion Platform API"}

