import csv
from io import StringIO
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from asyncpg import Connection
from typing import Dict, Any

from app.db.connection import get_db
from app.db.queries.admin_system_ops_queries import (
    get_settings,
    update_settings,
    export_students,
    export_analytics
)

router = APIRouter()

@router.get("/settings")
async def api_get_settings():
    try:
        return await get_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings")
async def api_update_settings(settings: Dict[str, Any]):
    try:
        await update_settings(settings)
        return {"status": "success", "message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ops/export/students")
async def api_export_students(conn: Connection = Depends(get_db)):
    try:
        records = await export_students(conn)
        if not records:
            return PlainTextResponse("No student records found", media_type="text/csv")
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=records[0].keys())
        writer.writeheader()
        for row in records:
            writer.writerow(row)
            
        headers = {
            "Content-Disposition": "attachment; filename=students_export.csv"
        }
        return PlainTextResponse(output.getvalue(), media_type="text/csv", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ops/export/analytics")
async def api_export_analytics(conn: Connection = Depends(get_db)):
    try:
        records = await export_analytics(conn)
        if not records:
            return PlainTextResponse("No analytics records found", media_type="text/csv")
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=records[0].keys())
        writer.writeheader()
        for row in records:
            writer.writerow(row)
            
        headers = {
            "Content-Disposition": "attachment; filename=analytics_export.csv"
        }
        return PlainTextResponse(output.getvalue(), media_type="text/csv", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
