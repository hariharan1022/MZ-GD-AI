from fastapi import APIRouter, Depends, HTTPException, status
from asyncpg import Connection
from typing import List, Dict, Any

from app.db.connection import get_db
from app.db.queries.admin_analytics_queries import (
    get_analytics_summary,
    get_department_comparison,
    get_monthly_trends,
    get_student_reports,
    get_attendance_records
)

router = APIRouter()

@router.get("/analytics/summary")
async def api_get_analytics_summary(conn: Connection = Depends(get_db)):
    try:
        return await get_analytics_summary(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/departments")
async def api_get_department_comparison(conn: Connection = Depends(get_db)):
    try:
        return await get_department_comparison(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/trends")
async def api_get_monthly_trends(conn: Connection = Depends(get_db)):
    try:
        return await get_monthly_trends(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
async def api_get_reports(conn: Connection = Depends(get_db)):
    try:
        # To handle serialization of dates/decimals easily, we can return raw dicts
        # FastAPI will handle the conversion of decimals and datetimes to JSON
        return await get_student_reports(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/attendance")
async def api_get_attendance(conn: Connection = Depends(get_db)):
    try:
        return await get_attendance_records(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
