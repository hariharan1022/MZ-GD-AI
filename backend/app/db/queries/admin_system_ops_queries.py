import json
import os
from asyncpg import Connection
from typing import List, Dict, Any

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), 'settings.json')

DEFAULT_SETTINGS = {
    "general": {
        "college_name": "Mount Zion College of Engineering and Technology",
        "academic_year": "2025-2026",
        "timezone": "Asia/Kolkata (IST)",
        "language": "English"
    },
    "ai": {
        "primary_model": "llama3.1:8b",
        "features": {
            "grammar_checking": True,
            "pronunciation_analysis": True,
            "vocabulary_analysis": True,
            "confidence_analysis": True,
            "enable_summary": True
        }
    }
}

async def get_settings() -> Dict[str, Any]:
    if not os.path.exists(SETTINGS_FILE):
        return DEFAULT_SETTINGS
    try:
        with open(SETTINGS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return DEFAULT_SETTINGS

async def update_settings(new_settings: Dict[str, Any]):
    current = await get_settings()
    current.update(new_settings)
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(current, f, indent=4)

async def export_students(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT s.roll_number, s.name as student_name, s.phone, d.name as department
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        ORDER BY s.roll_number
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def export_analytics(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT s.roll_number, s.name as student_name, d.name as department,
               ss.overall_score, ss.created_at
        FROM student_scores ss
        JOIN students s ON ss.student_id = s.id
        LEFT JOIN departments d ON s.department_id = d.id
        ORDER BY ss.created_at DESC
    """
    rows = await conn.fetch(query)
    return [
        {
            **dict(row),
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }
        for row in rows
    ]
