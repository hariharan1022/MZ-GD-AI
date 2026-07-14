from asyncpg import Connection
from typing import List, Dict, Any, Optional

# Departments
async def create_department(conn: Connection, name: str, code: str, hod: Optional[str] = None, status: str = "Active") -> Dict[str, Any]:
    query = """
        INSERT INTO departments (name, code, hod, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, code, hod, status;
    """
    row = await conn.fetchrow(query, name, code, hod, status)
    return dict(row)

async def get_departments(conn: Connection) -> List[Dict[str, Any]]:
    # Join with students to get count
    query = """
        SELECT d.id, d.name, d.code, d.hod, d.status,
               (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) as students
        FROM departments d
        ORDER BY d.created_at ASC;
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def update_department(conn: Connection, dept_id: str, name: Optional[str] = None, code: Optional[str] = None, hod: Optional[str] = None, status: Optional[str] = None) -> Dict[str, Any]:
    # Dynamic update query
    updates = []
    values = []
    idx = 1
    if name is not None:
        updates.append(f"name = ${idx}")
        values.append(name)
        idx += 1
    if code is not None:
        updates.append(f"code = ${idx}")
        values.append(code)
        idx += 1
    if hod is not None:
        updates.append(f"hod = ${idx}")
        values.append(hod)
        idx += 1
    if status is not None:
        updates.append(f"status = ${idx}")
        values.append(status)
        idx += 1
        
    if not updates:
        # Just return the current row if nothing to update
        return await conn.fetchrow("SELECT * FROM departments WHERE id = $1", dept_id)
        
    values.append(dept_id)
    query = f"""
        UPDATE departments
        SET {', '.join(updates)}
        WHERE id = ${idx}
        RETURNING id, name, code, hod, status;
    """
    row = await conn.fetchrow(query, *values)
    if row:
        return dict(row)
    return None

async def delete_department(conn: Connection, dept_id: str) -> bool:
    query = "DELETE FROM departments WHERE id = $1 RETURNING id;"
    row = await conn.fetchrow(query, dept_id)
    return row is not None


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
    query = """
        SELECT y.id, y.department_id, y.year_level,
               (SELECT COUNT(*) FROM sections s WHERE s.year_id = y.id) as sections_count
        FROM years y
        WHERE y.department_id = $1
        ORDER BY y.year_level ASC;
    """
    rows = await conn.fetch(query, department_id)
    return [dict(row) for row in rows]

async def update_year(conn: Connection, year_id: str, year_level: int) -> Dict[str, Any]:
    query = """
        UPDATE years SET year_level = $1 WHERE id = $2 RETURNING id, department_id, year_level;
    """
    row = await conn.fetchrow(query, year_level, year_id)
    return dict(row) if row else None

async def delete_year(conn: Connection, year_id: str) -> bool:
    query = "DELETE FROM years WHERE id = $1 RETURNING id;"
    row = await conn.fetchrow(query, year_id)
    return row is not None


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
    query = """
        SELECT s.id, s.year_id, s.name,
               (SELECT COUNT(*) FROM students st WHERE st.section_id = s.id) as students_count
        FROM sections s
        WHERE s.year_id = $1
        ORDER BY s.name ASC;
    """
    rows = await conn.fetch(query, year_id)
    return [dict(row) for row in rows]

async def update_section(conn: Connection, section_id: str, name: str) -> Dict[str, Any]:
    query = """
        UPDATE sections SET name = $1 WHERE id = $2 RETURNING id, year_id, name;
    """
    row = await conn.fetchrow(query, name, section_id)
    return dict(row) if row else None

async def delete_section(conn: Connection, section_id: str) -> bool:
    query = "DELETE FROM sections WHERE id = $1 RETURNING id;"
    row = await conn.fetchrow(query, section_id)
    return row is not None


# Students (leaving as is to avoid breaking existing code)
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
        SELECT s.id, s.roll_number, s.spr_number, s.name, s.college_email, 
               s.department_id, s.year_id, s.section_id, s.status,
               d.name as department_name, y.year_level, sec.name as section_name
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN years y ON s.year_id = y.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        ORDER BY s.created_at DESC
        LIMIT $1 OFFSET $2;
    """
    rows = await conn.fetch(query, limit, offset)
    return [dict(row) for row in rows]

async def delete_student(conn: Connection, student_id: str) -> bool:
    query = "DELETE FROM students WHERE id = $1 RETURNING id;"
    row = await conn.fetchrow(query, student_id)
    return row is not None

async def create_audit_log(conn: Connection, action: str, details: str, admin_id: Optional[str] = None) -> str:
    query = """
        INSERT INTO audit_logs (admin_id, action, details)
        VALUES ($1, $2, $3)
        RETURNING id::varchar;
    """
    return await conn.fetchval(query, admin_id, action, details)

async def create_student_bulk(conn: Connection, students_data: List[Dict[str, Any]], default_password_hash: str) -> Dict[str, int]:
    inserted_count = 0
    updated_count = 0
    
    # 1. Fetch existing departments, years, sections to build in-memory cache
    dept_rows = await conn.fetch("SELECT id, name, code FROM departments")
    dept_cache = {}
    for r in dept_rows:
        dept_cache[r['name'].lower()] = r['id']
        dept_cache[r['code'].lower()] = r['id']
        
    year_rows = await conn.fetch("SELECT id, department_id, year_level FROM years")
    year_cache = {}
    for r in year_rows:
        year_cache[(r['department_id'], r['year_level'])] = r['id']
        
    sec_rows = await conn.fetch("SELECT id, year_id, name FROM sections")
    sec_cache = {}
    for r in sec_rows:
        sec_cache[(r['year_id'], r['name'].lower())] = r['id']
        
    # 2. Pre-determine inserted vs updated count in a single query
    rolls = [s.get("roll") for s in students_data if s.get("roll")]
    existing_rolls = set()
    if rolls:
        try:
            rows = await conn.fetch("SELECT roll_number FROM students WHERE roll_number = ANY($1)", rolls)
            existing_rolls = {r['roll_number'] for r in rows}
        except Exception:
            # Fallback for SQLite
            placeholders = ",".join("?" for _ in rolls)
            rows = await conn.fetch(f"SELECT roll_number FROM students WHERE roll_number IN ({placeholders})", *rolls)
            existing_rolls = {r['roll_number'] for r in rows}
            
    for s in students_data:
        roll = s.get("roll")
        if roll:
            if roll in existing_rolls:
                updated_count += 1
            else:
                inserted_count += 1

    upsert_args = []
    async with conn.transaction():
        # Process each student inside transaction to resolve/create references
        for s in students_data:
            roll = s.get("roll")
            name = s.get("name")
            dept_name = s.get("dept", "CSE")
            year_name = s.get("year", "Year 1")
            sec_name = s.get("section", "Section A")
            
            # Prioritize provided email from spreadsheet
            email = s.get("email")
            if not email:
                email = f"{roll.lower()}@mountzion.ac.in" if roll else ""
            
            # 1. Get or create Department (using cache)
            dept_key = dept_name.lower()
            if dept_key in dept_cache:
                dept_id = dept_cache[dept_key]
            else:
                dept_row = await conn.fetchrow(
                    "INSERT INTO departments (name, code, status) VALUES ($1, $2, 'Active') RETURNING id",
                    dept_name, dept_name[:50]
                )
                dept_id = dept_row['id']
                dept_cache[dept_key] = dept_id
                dept_cache[dept_name[:50].lower()] = dept_id
            
            # 2. Get or create Year (using cache)
            try:
                year_level = int(''.join(filter(str.isdigit, year_name)))
            except ValueError:
                year_level = 1
            year_level = max(1, min(year_level, 5))
            
            year_key = (dept_id, year_level)
            if year_key in year_cache:
                year_id = year_cache[year_key]
            else:
                year_row = await conn.fetchrow(
                    "INSERT INTO years (department_id, year_level) VALUES ($1, $2) RETURNING id",
                    dept_id, year_level
                )
                year_id = year_row['id']
                year_cache[year_key] = year_id
            
            # 3. Get or create Section (using cache)
            sec_key = (year_id, sec_name.lower())
            if sec_key in sec_cache:
                sec_id = sec_cache[sec_key]
            else:
                sec_row = await conn.fetchrow(
                    "INSERT INTO sections (year_id, name) VALUES ($1, $2) RETURNING id",
                    year_id, sec_name
                )
                sec_id = sec_row['id']
                sec_cache[sec_key] = sec_id
            
            spr_number = f"SPR{roll}"
            upsert_args.append((roll, spr_number, name, email, default_password_hash, dept_id, year_id, sec_id))
            
        # 4. Perform single bulk upsert query using executemany
        query = """
            INSERT INTO students (roll_number, spr_number, name, college_email, password_hash, department_id, year_id, section_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (roll_number) DO UPDATE
            SET name = EXCLUDED.name, college_email = EXCLUDED.college_email, password_hash = EXCLUDED.password_hash, department_id = EXCLUDED.department_id, year_id = EXCLUDED.year_id, section_id = EXCLUDED.section_id;
        """
        await conn.executemany(query, upsert_args)
                
    return {"inserted": inserted_count, "updated": updated_count}


# --- Discussion Topics ---
async def create_topic(conn: Connection, title: str, description: Optional[str] = None, category: Optional[str] = None, is_custom: bool = False) -> Dict[str, Any]:
    query = """
        INSERT INTO discussion_topics (title, description, category, is_custom)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, description, category, is_custom, created_at;
    """
    row = await conn.fetchrow(query, title, description, category, is_custom)
    return dict(row)

async def get_topics(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT id, title, description, category, is_custom, created_at
        FROM discussion_topics
        ORDER BY created_at DESC;
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def update_topic(conn: Connection, topic_id: str, title: Optional[str] = None, description: Optional[str] = None, category: Optional[str] = None, is_custom: Optional[bool] = None) -> Dict[str, Any]:
    updates = []
    values = []
    idx = 1
    if title is not None:
        updates.append(f"title = ${idx}")
        values.append(title)
        idx += 1
    if description is not None:
        updates.append(f"description = ${idx}")
        values.append(description)
        idx += 1
    if category is not None:
        updates.append(f"category = ${idx}")
        values.append(category)
        idx += 1
    if is_custom is not None:
        updates.append(f"is_custom = ${idx}")
        values.append(is_custom)
        idx += 1
        
    if not updates:
        return await conn.fetchrow("SELECT * FROM discussion_topics WHERE id = $1", topic_id)
        
    values.append(topic_id)
    query = f"""
        UPDATE discussion_topics
        SET {', '.join(updates)}
        WHERE id = ${idx}
        RETURNING id, title, description, category, is_custom, created_at;
    """
    row = await conn.fetchrow(query, *values)
    return dict(row) if row else None

async def delete_topic(conn: Connection, topic_id: str) -> bool:
    query = "DELETE FROM discussion_topics WHERE id = $1 RETURNING id;"
    row = await conn.fetchrow(query, topic_id)
    return row is not None

# --- Discussion Sessions ---
async def create_session(conn: Connection, admin_id: str, department_id: str, year_id: str, section_id: str, group_size: int, discussion_date: str, discussion_time: str, preparation_time_minutes: int, discussion_duration_minutes: int, status: str) -> Dict[str, Any]:
    query = """
        INSERT INTO discussion_sessions (admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, preparation_time_minutes, discussion_duration_minutes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, preparation_time_minutes, discussion_duration_minutes, status, created_at;
    """
    row = await conn.fetchrow(query, admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, preparation_time_minutes, discussion_duration_minutes, status)
    return dict(row)

async def get_sessions(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT id, admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, preparation_time_minutes, discussion_duration_minutes, status, created_at
        FROM discussion_sessions
        ORDER BY discussion_date DESC, discussion_time DESC;
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def update_session_status(conn: Connection, session_id: str, status: str) -> Dict[str, Any]:
    query = """
        UPDATE discussion_sessions
        SET status = $1
        WHERE id = $2
        RETURNING id, admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, preparation_time_minutes, discussion_duration_minutes, status, created_at;
    """
    row = await conn.fetchrow(query, status, session_id)
    return dict(row) if row else None

# --- Discussion Groups ---
async def get_groups(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT id, session_id, topic_id, group_number, room_name, status, started_at, completed_at
        FROM discussion_groups
        ORDER BY created_at DESC;
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def update_group_status(conn: Connection, group_id: str, status: str) -> Dict[str, Any]:
    query = """
        UPDATE discussion_groups
        SET status = $1
        WHERE id = $2
        RETURNING id, session_id, topic_id, group_number, room_name, status, started_at, completed_at;
    """
    row = await conn.fetchrow(query, status, group_id)
    return dict(row) if row else None

