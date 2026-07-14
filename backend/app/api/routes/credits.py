from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_student
from app.db.connection import get_db
from asyncpg import Connection
import json

router = APIRouter()

LEVELS = [
    {"level": 1, "title": "Novice", "batch": "Bronze", "min_xp": 0, "max_xp": 99},
    {"level": 2, "title": "Apprentice", "batch": "Bronze Star", "min_xp": 100, "max_xp": 299},
    {"level": 3, "title": "Practitioner", "batch": "Silver", "min_xp": 300, "max_xp": 599},
    {"level": 4, "title": "Achiever", "batch": "Silver Star", "min_xp": 600, "max_xp": 999},
    {"level": 5, "title": "Advanced", "batch": "Gold", "min_xp": 1000, "max_xp": 1499},
    {"level": 6, "title": "Expert", "batch": "Gold Star", "min_xp": 1500, "max_xp": 2099},
    {"level": 7, "title": "Master", "batch": "Platinum", "min_xp": 2100, "max_xp": 2799},
    {"level": 8, "title": "Grandmaster", "batch": "Platinum Star", "min_xp": 2800, "max_xp": 3599},
    {"level": 9, "title": "Elite", "batch": "Diamond", "min_xp": 3600, "max_xp": 4499},
    {"level": 10, "title": "Legend", "batch": "Legendary", "min_xp": 4500, "max_xp": 99999},
]

def get_level_info(xp: int):
    for lvl in reversed(LEVELS):
        if xp >= lvl["min_xp"]:
            return lvl
    return LEVELS[0]

def get_next_level_info(current_level: int):
    for lvl in LEVELS:
        if lvl["level"] == current_level + 1:
            return lvl
    return None

@router.get("/credits")
async def get_credits(current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    student_id = current_student["id"]
    
    stats = await conn.fetchrow(
        "SELECT xp, current_level, daily_streak, badges FROM gamification WHERE student_id = $1",
        student_id
    )
    
    xp = stats["xp"] if stats else 0
    current_level = stats["current_level"] if stats else 1
    badges = []
    if stats and stats["badges"]:
        try:
            badges = json.loads(stats["badges"]) if isinstance(stats["badges"], str) else stats["badges"]
        except:
            pass

    current_level_info = get_level_info(xp)
    next_level = get_next_level_info(current_level_info["level"])
    
    xp_in_level = xp - current_level_info["min_xp"]
    xp_needed = current_level_info["max_xp"] - current_level_info["min_xp"]
    progress_pct = round((xp_in_level / xp_needed) * 100) if xp_needed > 0 else 100
    
    total_discussions = await conn.fetchval("""
        SELECT COUNT(DISTINCT dg.session_id)
        FROM group_members gm
        JOIN discussion_groups dg ON gm.group_id = dg.id
        WHERE gm.student_id = $1
    """, student_id)
    
    return {
        "xp": xp,
        "current_level": current_level_info["level"],
        "level_title": current_level_info["title"],
        "batch": current_level_info["batch"],
        "progress_in_level": progress_pct,
        "xp_in_level": xp_in_level,
        "xp_needed_for_level": xp_needed,
        "next_level": next_level,
        "badges": badges,
        "total_discussions": total_discussions or 0,
        "daily_streak": stats["daily_streak"] if stats else 0,
    }
