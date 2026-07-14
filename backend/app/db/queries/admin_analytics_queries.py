from asyncpg import Connection
from typing import List, Dict, Any

async def get_analytics_summary(conn: Connection) -> Dict[str, Any]:
    # Avg Score
    avg_score_row = await conn.fetchrow("SELECT COALESCE(AVG(overall_score), 0) as avg FROM student_scores")
    avg_score = float(avg_score_row['avg'])

    # Top Department
    top_dept_query = """
        SELECT d.name, AVG(ss.overall_score) as avg_score 
        FROM student_scores ss 
        JOIN students s ON ss.student_id = s.id 
        JOIN departments d ON s.department_id = d.id 
        GROUP BY d.id 
        ORDER BY avg_score DESC LIMIT 1
    """
    top_dept_row = await conn.fetchrow(top_dept_query)
    top_department = top_dept_row['name'] if top_dept_row else "N/A"
    top_department_score = float(top_dept_row['avg_score']) if top_dept_row else 0

    # Active Participants
    total_students_row = await conn.fetchrow("SELECT COUNT(*) FROM students")
    total_students = total_students_row['count']
    
    active_students_row = await conn.fetchrow("SELECT COUNT(DISTINCT student_id) FROM group_members")
    active_students = active_students_row['count']
    
    active_percentage = (active_students / total_students * 100) if total_students > 0 else 0

    return {
        "avg_college_score": round(avg_score, 1),
        "top_department": top_department,
        "top_department_score": round(top_department_score, 1),
        "active_participants_percentage": round(active_percentage, 1)
    }

async def get_department_comparison(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT d.name, COALESCE(AVG(ss.overall_score), 0) as avg_score 
        FROM departments d
        LEFT JOIN students s ON s.department_id = d.id
        LEFT JOIN student_scores ss ON ss.student_id = s.id
        GROUP BY d.id, d.name
        ORDER BY d.name
    """
    rows = await conn.fetch(query)
    return [{"name": row['name'], "score": round(float(row['avg_score']), 1)} for row in rows]

async def get_monthly_trends(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT TO_CHAR(created_at, 'Mon') as month, AVG(overall_score) as avg_score 
        FROM student_scores 
        GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
        ORDER BY EXTRACT(MONTH FROM created_at)
    """
    rows = await conn.fetch(query)
    return [{"month": row['month'], "score": round(float(row['avg_score']), 1)} for row in rows]

async def get_student_reports(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT ss.id as score_id, s.name as student_name, s.roll_number, d.name as department_name, 
               ss.overall_score, ss.created_at,
               fr.strengths, fr.weaknesses
        FROM student_scores ss 
        JOIN students s ON ss.student_id = s.id 
        JOIN departments d ON s.department_id = d.id
        LEFT JOIN feedback_reports fr ON ss.id = fr.score_id 
        ORDER BY ss.created_at DESC
        LIMIT 100
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def get_attendance_records(conn: Connection) -> List[Dict[str, Any]]:
    query = """
        SELECT gm.id, s.name as student_name, s.roll_number, d.name as department_name, 
               g.room_name, gm.joined_at, gm.is_online, g.started_at, g.status as group_status
        FROM group_members gm 
        JOIN students s ON gm.student_id = s.id 
        JOIN departments d ON s.department_id = d.id
        JOIN discussion_groups g ON gm.group_id = g.id 
        ORDER BY gm.joined_at DESC NULLS LAST
        LIMIT 100
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]
