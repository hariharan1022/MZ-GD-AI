from fastapi import APIRouter, Depends, HTTPException, status, Body
from asyncpg import Connection
from app.db.connection import get_db
from app.api.dependencies import get_current_student
from typing import Optional, List
import random
import uuid

router = APIRouter()

@router.get("/students")
async def list_students(
    department_id: Optional[str] = None,
    year_id: Optional[str] = None,
    section_id: Optional[str] = None,
    current_student: dict = Depends(get_current_student),
    conn: Connection = Depends(get_db)
):
    dept_id = department_id or current_student.get("department_id")
    yr_id = year_id or current_student.get("year_id")
    sec_id = section_id or current_student.get("section_id")
    students = await conn.fetch("""
        SELECT id, roll_number, name, college_email, department_id, year_id, section_id
        FROM students
        WHERE department_id = $1 AND year_id = $2 AND section_id = $3
        ORDER BY name
    """, dept_id, yr_id, sec_id)
    return [{
        "id": str(r["id"]),
        "roll_number": r["roll_number"],
        "name": r["name"],
        "email": r["college_email"]
    } for r in students]

@router.get("/topics")
async def list_topics(conn: Connection = Depends(get_db)):
    topics = await conn.fetch("SELECT id, title, description, category FROM discussion_topics ORDER BY title")
    return [{
        "id": str(t["id"]),
        "title": t["title"],
        "description": t["description"],
        "category": t["category"]
    } for t in topics]

@router.post("/ai-start")
async def ai_start_discussion(
    body: dict = Body(...),
    current_student: dict = Depends(get_current_student),
    conn: Connection = Depends(get_db)
):
    from datetime import date, time, datetime

    student_ids = body.get("student_ids")
    count = body.get("count", 6)
    dept_id = body.get("department_id") or current_student.get("department_id")
    yr_id = body.get("year_id") or current_student.get("year_id")
    sec_id = body.get("section_id") or current_student.get("section_id")

    if student_ids and len(student_ids) > 0:
        rows = []
        for sid in student_ids:
            r = await conn.fetchrow("SELECT id, roll_number, name, college_email FROM students WHERE id = $1", sid)
            if r:
                rows.append(r)
    else:
        rows = await conn.fetch(
            "SELECT id, roll_number, name, college_email FROM students WHERE department_id = $1 AND year_id = $2 AND section_id = $3",
            dept_id, yr_id, sec_id
        )

    if len(rows) == 0:
        raise HTTPException(status_code=400, detail="No students found")

    random.shuffle(rows)
    selected = rows[:min(count, len(rows))]

    topics = await conn.fetch("SELECT id, title, description FROM discussion_topics")
    if topics:
        chosen_topic = random.choice(topics)
    else:
        chosen_topic = {"title": "General Discussion", "description": "Open topic discussion", "id": None}

    admin = await conn.fetchrow("SELECT id FROM admins LIMIT 1")
    if not admin:
        raise HTTPException(status_code=500, detail="No admin found")

    today_str = date.today().isoformat()
    now_str = datetime.now().strftime("%H:%M:%S")
    session_id = str(uuid.uuid4())
    await conn.execute("""
        INSERT INTO discussion_sessions (id, admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, preparation_time_minutes, discussion_duration_minutes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE')
    """, session_id, str(admin["id"]), dept_id, yr_id, sec_id, len(selected), today_str, now_str, 2, 15)

    group_id = str(uuid.uuid4())
    topic_id = str(chosen_topic["id"]) if chosen_topic["id"] else None
    room_name = f"AI-Group-{uuid.uuid4().hex[:8]}"
    await conn.execute("""
        INSERT INTO discussion_groups (id, session_id, topic_id, group_number, room_name, status)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
    """, group_id, session_id, topic_id, 1, room_name)

    member_list = []
    for i, s in enumerate(selected):
        member_id = str(uuid.uuid4())
        await conn.execute(
            "INSERT INTO group_members (id, group_id, student_id, joined_at, is_online) VALUES ($1, $2, $3, datetime('now'), 1)",
            member_id, group_id, str(s["id"])
        )
        member_list.append({
            "id": str(s["id"]),
            "name": s["name"],
            "roll_number": s["roll_number"]
        })

    return {
        "session": {
            "id": session_id,
            "status": "ACTIVE",
            "title": chosen_topic["title"],
            "date": today_str,
            "time": now_str,
            "groupSize": len(selected),
            "prepTime": 2,
            "duration": 15
        },
        "group": {
            "id": group_id,
            "group_number": 1,
            "room_name": room_name,
            "topic": chosen_topic["title"],
            "topic_description": chosen_topic.get("description", ""),
            "status": "ACTIVE"
        },
        "members": member_list,
        "total_available": len(rows)
    }


@router.get("/upcoming")
async def get_upcoming_discussions(department: str = 'Computer Science', section: str = 'A', conn: Connection = Depends(get_db)):
    sessions = await conn.fetch("""
        SELECT ds.id, ds.discussion_date, ds.discussion_time, ds.group_size,
               ds.preparation_time_minutes, ds.discussion_duration_minutes, ds.status,
               d.name as department_name, sec.name as section_name
        FROM discussion_sessions ds
        JOIN departments d ON ds.department_id = d.id
        JOIN sections sec ON ds.section_id = sec.id
        WHERE (d.name = $1 OR d.code = $1)
          AND (sec.name = $2 OR sec.name = 'Section ' || $2 OR 'Section ' || sec.name = $2)
          AND ds.status = 'SCHEDULED'
        ORDER BY ds.discussion_date ASC, ds.discussion_time ASC
    """, department, section)

    result = []
    for r in sessions:
        topic_title = "Topic will be generated by AI"
        group_row = await conn.fetchrow("""
            SELECT dt.title 
            FROM discussion_groups dg
            JOIN discussion_topics dt ON dg.topic_id = dt.id
            WHERE dg.session_id = $1 LIMIT 1
        """, r["id"])
        if group_row:
            topic_title = group_row["title"]

        result.append({
            "id": str(r["id"]),
            "status": r["status"],
            "title": topic_title,
            "topic": topic_title,
            "department": r["department_name"],
            "section": r["section_name"],
            "scheduled_time": f"{r['discussion_date']}T{r['discussion_time']}",
            "groupSize": r["group_size"],
            "prepTime": r["preparation_time_minutes"],
            "duration": r["discussion_duration_minutes"]
        })
    return result

@router.get("/active")
async def get_active_discussion(current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    student_id = current_student["id"]
    dept_id = current_student["department_id"]
    year_id = current_student["year_id"]
    section_id = current_student["section_id"]

    active_session = await conn.fetchrow("""
        SELECT ds.id, ds.discussion_date, ds.discussion_time, ds.group_size,
               ds.preparation_time_minutes, ds.discussion_duration_minutes, ds.status,
               d.name as department_name, y.year_level, sec.name as section_name
        FROM discussion_sessions ds
        JOIN departments d ON ds.department_id = d.id
        JOIN years y ON ds.year_id = y.id
        JOIN sections sec ON ds.section_id = sec.id
        WHERE ds.department_id = $1 AND ds.year_id = $2 AND ds.section_id = $3
          AND ds.status IN ('SCHEDULED', 'ACTIVE')
        ORDER BY ds.discussion_date ASC, ds.discussion_time ASC
        LIMIT 1
    """, dept_id, year_id, section_id)

    if not active_session:
        return None

    groups = await conn.fetch("""
        SELECT dg.id, dg.group_number, dg.room_name, dg.status as group_status,
               dt.title as topic_title, dt.description as topic_description,
               (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = dg.id) as member_count
        FROM discussion_groups dg
        LEFT JOIN discussion_topics dt ON dg.topic_id = dt.id
        WHERE dg.session_id = $1
        ORDER BY dg.group_number
    """, active_session["id"])

    my_membership = await conn.fetchrow("""
        SELECT dg.id as group_id, dg.group_number, dg.room_name, dg.status as group_status
        FROM group_members gm
        JOIN discussion_groups dg ON gm.group_id = dg.id
        WHERE gm.student_id = $1 AND dg.session_id = $2
        LIMIT 1
    """, student_id, active_session["id"])

    topic_title = "Topic will be generated by AI"
    if groups:
        topic_title = groups[0]["topic_title"] or topic_title

    return {
        "session": {
            "id": str(active_session["id"]),
            "status": active_session["status"],
            "title": topic_title,
            "department": active_session["department_name"],
            "year": f"Year {active_session['year_level']}",
            "section": active_session["section_name"],
            "date": active_session["discussion_date"],
            "time": active_session["discussion_time"],
            "groupSize": active_session["group_size"],
            "prepTime": active_session["preparation_time_minutes"],
            "duration": active_session["discussion_duration_minutes"]
        },
        "groups": [{
            "id": str(g["id"]),
            "group_number": g["group_number"],
            "room_name": g["room_name"],
            "status": g["group_status"],
            "topic": g["topic_title"] or topic_title,
            "topic_description": g["topic_description"],
            "member_count": g["member_count"]
        } for g in groups],
        "my_membership": {
            "group_id": str(my_membership["group_id"]),
            "group_number": my_membership["group_number"],
            "room_name": my_membership["room_name"],
            "status": my_membership["group_status"]
        } if my_membership else None
    }

@router.post("/join")
async def join_discussion(group_id: str = Body(..., embed=True), current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    student_id = current_student["id"]

    group = await conn.fetchrow("""
        SELECT dg.id, dg.session_id, dg.group_number, dg.status, ds.group_size,
               (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = dg.id) as member_count
        FROM discussion_groups dg
        JOIN discussion_sessions ds ON dg.session_id = ds.id
        WHERE dg.id = $1
    """, group_id)

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if group["member_count"] >= group["group_size"]:
        raise HTTPException(status_code=400, detail="Group is full")

    existing = await conn.fetchrow(
        "SELECT id FROM group_members WHERE group_id = $1 AND student_id = $2",
        group_id, student_id
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this group")

    await conn.execute(
        "INSERT INTO group_members (id, group_id, student_id, joined_at, is_online) VALUES ($1, $2, $3, datetime('now'), 1)",
        str(uuid.uuid4()), group_id, student_id
    )

    return {"message": "Joined group successfully", "group_number": group["group_number"], "room_name": f"Room {group['group_number']}"}

@router.get("/history")
async def get_discussion_history(student_id: Optional[str] = None, current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    # Prioritize authenticated student ID
    target_student_id = current_student["id"] if current_student else student_id
    if not target_student_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    history = await conn.fetch("""
        SELECT dg.id as group_id, ds.id as session_id, dg.group_number, ds.discussion_date, ds.discussion_time, ds.status,
               dt.title as topic_title,
               sc.grammar_score, sc.fluency_score, sc.confidence_score, sc.overall_score
        FROM group_members gm
        JOIN discussion_groups dg ON gm.group_id = dg.id
        JOIN discussion_sessions ds ON dg.session_id = ds.id
        LEFT JOIN discussion_topics dt ON dg.topic_id = dt.id
        LEFT JOIN student_scores sc ON dg.id = sc.group_id AND gm.student_id = sc.student_id
        WHERE gm.student_id = $1 AND ds.status = 'COMPLETED'
        ORDER BY ds.discussion_date DESC, ds.discussion_time DESC
    """, target_student_id)
    
    result = []
    for r in history:
        avg = float(r["overall_score"]) if r["overall_score"] is not None else None
        if avg is None and r["grammar_score"] is not None:
            avg = (float(r["grammar_score"]) + float(r["fluency_score"]) + float(r["confidence_score"])) / 3.0
            
        result.append({
            "id": str(r["session_id"]),
            "group": r["group_number"],
            "scheduled_time": f"{r['discussion_date']}T{r['discussion_time']}",
            "topic": r["topic_title"] or "Group Discussion",
            "grammar_score": round(avg) if avg is not None else None,
            "status": r["status"]
        })
    return result
