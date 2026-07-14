from asyncpg import Connection
from typing import List, Dict, Any, Optional

async def get_leaderboard(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT s.id as student_id, s.name as student_name, s.roll_number, d.name as department_name, 
               COALESCE(AVG(ss.overall_score), 0) as avg_score, 
               COUNT(ss.id) as sessions_attended
        FROM students s
        JOIN departments d ON s.department_id = d.id
        JOIN student_scores ss ON s.id = ss.student_id
        GROUP BY s.id, d.name
        ORDER BY avg_score DESC
        LIMIT 100
    """
    rows = await conn.fetch(query)
    return [
        {
            **dict(row),
            "avg_score": round(float(row['avg_score']), 1),
            "rank": index + 1
        }
        for index, row in enumerate(rows)
    ]

async def get_achievements(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT r.id as ranking_id, s.name as student_name, s.roll_number, d.name as department_name, 
               r.badge, r.created_at
        FROM rankings r
        JOIN students s ON r.student_id = s.id
        JOIN departments d ON s.department_id = d.id
        WHERE r.badge IS NOT NULL
        ORDER BY r.created_at DESC
        LIMIT 100
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def get_notifications(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT n.id, s.name as student_name, s.roll_number, n.title, n.message, n.is_read, n.created_at
        FROM notifications n
        LEFT JOIN students s ON n.student_id = s.id
        ORDER BY n.created_at DESC
        LIMIT 100
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def create_notification(conn: Connection, title: str, message: str, student_id: Optional[str] = None):
    query = """
        INSERT INTO notifications (student_id, title, message)
        VALUES ($1, $2, $3)
    """
    await conn.execute(query, student_id, title, message)

async def delete_notification(conn: Connection, notification_id: str):
    query = """
        DELETE FROM notifications WHERE id = $1
    """
    await conn.execute(query, notification_id)
