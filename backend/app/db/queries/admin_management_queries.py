from asyncpg import Connection
from typing import List, Dict, Any, Optional

# Departments
async def create_department(conn: Connection, name: str, code: str) -> Dict[str, Any]:
    query = """
        INSERT INTO departments (name, code)
        VALUES ($1, $2)
        RETURNING id, name, code;
    """
    row = await conn.fetchrow(query, name, code)
    return dict(row)

async def get_departments(conn: Connection) -> List[Dict[str, Any]]:
    query = "SELECT id, name, code FROM departments;"
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

# Years
async def create_year(conn: Connection, department_id: str, year_level: int) -> Dict[str, Any]:
    query = """
        INSERT INTO years (department_id, year_level)
        VALUES ($1, $2)
        RETURNING id, department_id, year_level;
    """
    row = await conn.fetchrow(query, department_id, year_level)
    return dict(row)

async def get_years_by_department(conn: Connection, department_id: str) -> List[Dict[str, Any]]:
    query = "SELECT id, department_id, year_level FROM years WHERE department_id = $1;"
    rows = await conn.fetch(query, department_id)
    return [dict(row) for row in rows]

# Sections
async def create_section(conn: Connection, year_id: str, name: str) -> Dict[str, Any]:
    query = """
        INSERT INTO sections (year_id, name)
        VALUES ($1, $2)
        RETURNING id, year_id, name;
    """
    row = await conn.fetchrow(query, year_id, name)
    return dict(row)

async def get_sections_by_year(conn: Connection, year_id: str) -> List[Dict[str, Any]]:
    query = "SELECT id, year_id, name FROM sections WHERE year_id = $1;"
    rows = await conn.fetch(query, year_id)
    return [dict(row) for row in rows]

# Students
async def create_student(conn: Connection, roll_number: str, spr_number: str, name: str, email: str, password_hash: str, dept_id: str, year_id: str, section_id: str) -> Dict[str, Any]:
    query = """
        INSERT INTO students (roll_number, spr_number, name, college_email, password_hash, department_id, year_id, section_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, roll_number, spr_number, name, college_email, department_id, year_id, section_id, status;
    """
    row = await conn.fetchrow(query, roll_number, spr_number, name, email, password_hash, dept_id, year_id, section_id)
    return dict(row)

async def get_students(conn: Connection, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    query = """
        SELECT id, roll_number, spr_number, name, college_email, department_id, year_id, section_id, status
        FROM students
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
    """
    rows = await conn.fetch(query, limit, offset)
    return [dict(row) for row in rows]
