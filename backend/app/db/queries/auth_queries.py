from asyncpg import Connection
from typing import Optional, Dict, Any

async def get_admin_by_email(conn: Connection, email: str) -> Optional[Dict[str, Any]]:
    query = """
        SELECT id, email, password_hash, name, created_at, updated_at
        FROM admins
        WHERE email = $1;
    """
    row = await conn.fetchrow(query, email)
    return dict(row) if row else None

async def get_student_by_roll_number(conn: Connection, roll_number: str) -> Optional[Dict[str, Any]]:
    query = """
        SELECT id, roll_number, spr_number, name, college_email, password_hash, 
               department_id, year_id, section_id, status, first_login
        FROM students
        WHERE roll_number = $1;
    """
    row = await conn.fetchrow(query, roll_number)
    return dict(row) if row else None

async def log_user_login(conn: Connection, admin_id: Optional[str] = None, student_id: Optional[str] = None, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
    query = """
        INSERT INTO login_history (admin_id, student_id, ip_address, user_agent)
        VALUES ($1, $2, $3, $4);
    """
    await conn.execute(query, admin_id, student_id, ip_address, user_agent)
