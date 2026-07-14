from fastapi import APIRouter, Depends, HTTPException, status
from asyncpg import Connection
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.db.connection import get_db
from app.db.queries.admin_gamification_queries import (
    get_leaderboard,
    get_achievements,
    get_notifications,
    create_notification,
    delete_notification
)

router = APIRouter()

class NotificationCreate(BaseModel):
    title: str
    message: str
    student_id: Optional[str] = None

@router.get("/gamification/leaderboard")
async def api_get_leaderboard(conn: Connection = Depends(get_db)):
    try:
        return await get_leaderboard(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gamification/achievements")
async def api_get_achievements(conn: Connection = Depends(get_db)):
    try:
        return await get_achievements(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gamification/notifications")
async def api_get_notifications(conn: Connection = Depends(get_db)):
    try:
        return await get_notifications(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gamification/notifications", status_code=status.HTTP_201_CREATED)
async def api_create_notification(payload: NotificationCreate, conn: Connection = Depends(get_db)):
    try:
        await create_notification(conn, payload.title, payload.message, payload.student_id)
        return {"status": "success", "message": "Notification created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/gamification/notifications/{notification_id}")
async def api_delete_notification(notification_id: str, conn: Connection = Depends(get_db)):
    try:
        await delete_notification(conn, notification_id)
        return {"status": "success", "message": "Notification deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
