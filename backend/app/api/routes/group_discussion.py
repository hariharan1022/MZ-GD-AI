from fastapi import APIRouter, Depends, HTTPException, Body
from asyncpg import Connection
from app.db.connection import get_db
from app.api.dependencies import get_current_admin, get_current_student
from typing import Optional, List
import random
import uuid
import math
import logging

logger = logging.getLogger(__name__)
file_handler = logging.FileHandler(r'C:\Users\VISHAL~1\AppData\Local\Temp\gd_error.log')
file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
logger.addHandler(file_handler)
logger.setLevel(logging.DEBUG)
router = APIRouter()

# ─────────────────────────────────────────────
# Admin Endpoints
# ─────────────────────────────────────────────

@router.get("/gd/departments")
async def gd_list_departments(conn: Connection = Depends(get_db)):
    rows = await conn.fetch("SELECT id, name, code FROM departments ORDER BY name")
    return [{"id": str(r["id"]), "name": r["name"], "code": r["code"]} for r in rows]


@router.get("/gd/students")
async def gd_list_students(
    department_id: str,
    conn: Connection = Depends(get_db)
):
    students = await conn.fetch("""
        SELECT s.id, s.roll_number, s.name, s.department_id,
               COALESCE(g.xp, 0) as xp
        FROM students s
        LEFT JOIN gamification g ON g.student_id = s.id
        WHERE s.department_id = $1 AND s.status = 'ACTIVE'
        ORDER BY s.name
    """, department_id)

    result = []
    for s in students:
        sid = str(s["id"])
        score_row = await conn.fetchrow("""
            SELECT AVG(overall_score) as avg_score
            FROM student_scores WHERE student_id = $1
        """, sid)
        comm_score = round(float(score_row["avg_score"]), 1) if score_row and score_row["avg_score"] else None

        result.append({
            "id": sid,
            "roll_number": s["roll_number"],
            "name": s["name"],
            "xp": s["xp"] or 0,
            "communication_score": comm_score
        })
    return result


@router.post("/gd/generate")
async def gd_generate_groups(
    body: dict = Body(...),
    admin: dict = Depends(get_current_admin),
    conn: Connection = Depends(get_db)
):
    try:
        return await _generate_groups_impl(body, admin, conn)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Generation error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


async def _generate_groups_impl(body: dict, admin: dict, conn: Connection):
    department_id = body.get("department_id")
    group_size = body.get("group_size", 6)
    use_ai = body.get("use_ai", True)

    if not department_id:
        raise HTTPException(status_code=400, detail="department_id required")

    students = await conn.fetch("""
        SELECT s.id, s.roll_number, s.name,
               COALESCE(g.xp, 0) as xp
        FROM students s
        LEFT JOIN gamification g ON g.student_id = s.id
        WHERE s.department_id = $1 AND s.status = 'ACTIVE'
        ORDER BY s.name
    """, department_id)

    if len(students) == 0:
        raise HTTPException(status_code=400, detail="No active students found")

    # Clean up any stale DRAFT session for this department + leftover assignments
    stale = await conn.fetch("SELECT id FROM gd_sessions WHERE department_id = $1 AND status = 'DRAFT'", department_id)
    for s in stale:
        stale_groups = await conn.fetch("SELECT id FROM gd_groups WHERE session_id = $1", s["id"])
        for g in stale_groups:
            await conn.execute("DELETE FROM gd_assignments WHERE group_id = $1", g["id"])
        await conn.execute("DELETE FROM gd_groups WHERE session_id = $1", s["id"])
    await conn.execute("DELETE FROM gd_sessions WHERE department_id = $1 AND status = 'DRAFT'", department_id)
    for s in students:
        await conn.execute("DELETE FROM gd_assignments WHERE student_id = $1", str(s["id"]))

    total = len(students)
    num_groups = max(1, math.ceil(total / group_size))
    base_size = total // num_groups
    extra = total % num_groups

    # Build scored student list
    scored = []
    for s in students:
        sid = str(s["id"])
        score_row = await conn.fetchrow("""
            SELECT AVG(overall_score) as avg_score FROM student_scores WHERE student_id = $1
        """, sid)
        comm_score = float(score_row["avg_score"]) if score_row and score_row["avg_score"] else None
        if use_ai and comm_score is not None:
            score_val = comm_score
        elif use_ai:
            score_val = min(100, (s["xp"] or 0) / 10)
        else:
            score_val = random.uniform(0, 100)
        scored.append({
            "id": sid,
            "name": s["name"],
            "roll_number": s["roll_number"],
            "score": score_val
        })

    # Balanced assignment algorithm
    if use_ai:
        scored.sort(key=lambda x: x["score"], reverse=True)
        groups = [[] for _ in range(num_groups)]
        for i, student in enumerate(scored):
            groups[i % num_groups].append(student)
        groups = [sorted(g, key=lambda x: x["score"], reverse=True) for g in groups]
    else:
        random.shuffle(scored)
        groups = [[] for _ in range(num_groups)]
        for i, student in enumerate(scored):
            groups[i % num_groups].append(student)

    # Create session
    admin_id = str(admin["id"])
    session_id = str(uuid.uuid4())
    await conn.execute("""
        INSERT INTO gd_sessions (id, admin_id, department_id, group_size, total_students, total_groups, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
    """, session_id, admin_id, department_id, group_size, total, num_groups)

    group_records = []
    for g_idx, group_students in enumerate(groups):
        gid = str(uuid.uuid4())
        group_number = g_idx + 1
        member_count = len(group_students)
        await conn.execute("""
            INSERT INTO gd_groups (id, session_id, group_number, member_count, status)
            VALUES ($1, $2, $3, $4, 'ACTIVE')
        """, gid, session_id, group_number, member_count)
        for student in group_students:
            aid = str(uuid.uuid4())
            await conn.execute("""
                INSERT INTO gd_assignments (id, group_id, student_id, student_name, roll_number, score)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, aid, gid, student["id"], student["name"], student["roll_number"], round(student["score"], 1))
        group_records.append({
            "id": gid,
            "group_number": group_number,
            "member_count": member_count,
            "members": [{
                "id": s["id"], "name": s["name"],
                "roll_number": s["roll_number"], "score": round(s["score"], 1)
            } for s in group_students],
            "locked": 0
        })

    return {
        "session_id": session_id,
        "department_id": department_id,
        "total_students": total,
        "group_size": group_size,
        "num_groups": num_groups,
        "status": "DRAFT",
        "groups": group_records
    }


@router.put("/gd/groups/{group_id}/move")
async def gd_move_student(
    group_id: str,
    body: dict = Body(...),
    admin: dict = Depends(get_current_admin),
    conn: Connection = Depends(get_db)
):
    student_id = body.get("student_id")
    target_group_id = body.get("target_group_id")

    if not student_id or not target_group_id:
        raise HTTPException(status_code=400, detail="student_id and target_group_id required")

    # Check source group exists
    src = await conn.fetchrow("SELECT id, session_id FROM gd_groups WHERE id = $1", group_id)
    if not src:
        raise HTTPException(status_code=404, detail="Source group not found")

    # Check target group exists and same session
    tgt = await conn.fetchrow("SELECT id, session_id FROM gd_groups WHERE id = $1", target_group_id)
    if not tgt:
        raise HTTPException(status_code=404, detail="Target group not found")
    if str(src["session_id"]) != str(tgt["session_id"]):
        raise HTTPException(status_code=400, detail="Groups must be in the same session")

    # Check groups are not locked
    for gid in [group_id, target_group_id]:
        g = await conn.fetchrow("SELECT locked FROM gd_groups WHERE id = $1", gid)
        if g and g["locked"]:
            raise HTTPException(status_code=400, detail=f"Group {gid} is locked")

    # Check student is in source group
    assignment = await conn.fetchrow(
        "SELECT id FROM gd_assignments WHERE group_id = $1 AND student_id = $2",
        group_id, student_id
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Student not found in source group")

    # Move
    await conn.execute(
        "UPDATE gd_assignments SET group_id = $1 WHERE id = $2",
        target_group_id, assignment["id"]
    )
    # Update counts
    await conn.execute(
        "UPDATE gd_groups SET member_count = (SELECT COUNT(*) FROM gd_assignments WHERE group_id = $1) WHERE id = $1",
        group_id
    )
    await conn.execute(
        "UPDATE gd_groups SET member_count = (SELECT COUNT(*) FROM gd_assignments WHERE group_id = $1) WHERE id = $1",
        target_group_id
    )

    return {"message": "Student moved successfully"}


@router.post("/gd/groups/regenerate")
async def gd_regenerate_groups(
    body: dict = Body(...),
    admin: dict = Depends(get_current_admin),
    conn: Connection = Depends(get_db)
):
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    session = await conn.fetchrow("SELECT * FROM gd_sessions WHERE id = $1", session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["status"] == "LOCKED":
        raise HTTPException(status_code=400, detail="Cannot regenerate a locked session")

    # Delete existing groups and assignments
    groups = await conn.fetch("SELECT id FROM gd_groups WHERE session_id = $1", session_id)
    for g in groups:
        await conn.execute("DELETE FROM gd_assignments WHERE group_id = $1", g["id"])
    await conn.execute("DELETE FROM gd_groups WHERE session_id = $1", session_id)

    # Re-generate using the same logic
    body_copy = {
        "department_id": str(session["department_id"]),
        "group_size": session["group_size"],
        "use_ai": True
    }
    return await _generate_groups_impl(body_copy, admin, conn)


@router.post("/gd/lock")
async def gd_lock_groups(
    body: dict = Body(...),
    admin: dict = Depends(get_current_admin),
    conn: Connection = Depends(get_db)
):
    try:
        return await _lock_groups_impl(body, admin, conn)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Lock error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


async def _lock_groups_impl(body: dict, admin: dict, conn: Connection):
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    session = await conn.fetchrow("SELECT * FROM gd_sessions WHERE id = $1", session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await conn.execute("UPDATE gd_groups SET locked = 1 WHERE session_id = $1", session_id)
    await conn.execute("UPDATE gd_sessions SET status = 'LOCKED' WHERE id = $1", session_id)

    from datetime import date, datetime
    today_str = date.today().isoformat()
    now_str = datetime.now().strftime("%H:%M:%S")

    topic = await conn.fetchrow("SELECT id, title FROM discussion_topics ORDER BY RANDOM() LIMIT 1")
    topic_id = str(topic["id"]) if topic else None
    topic_title = topic["title"] if topic else "Group Discussion"

    ds_id = str(uuid.uuid4())
    dept_id = str(session["department_id"])
    year_row = await conn.fetchrow("SELECT id FROM years WHERE department_id = $1 LIMIT 1", dept_id)
    year_id = str(year_row["id"]) if year_row else dept_id
    section_row = await conn.fetchrow("SELECT id FROM sections WHERE year_id = $1 LIMIT 1", year_id)
    section_id = str(section_row["id"]) if section_row else year_id
    await conn.execute("""
        INSERT INTO discussion_sessions (id, admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, preparation_time_minutes, discussion_duration_minutes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 2, 15, 'ACTIVE')
    """, ds_id, str(admin["id"]), dept_id, year_id, section_id, session["group_size"], today_str, now_str)

    groups = await conn.fetch("SELECT id, group_number FROM gd_groups WHERE session_id = $1", session_id)
    for g in groups:
        dg_id = str(uuid.uuid4())
        room_name = f"GD-Room-{uuid.uuid4().hex[:6]}"
        await conn.execute("""
            INSERT INTO discussion_groups (id, session_id, topic_id, group_number, room_name, status)
            VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
        """, dg_id, ds_id, topic_id, g["group_number"], room_name)

        members = await conn.fetch(
            "SELECT student_id FROM gd_assignments WHERE group_id = $1", g["id"]
        )
        for m in members:
            mid = str(uuid.uuid4())
            await conn.execute("""
                INSERT INTO group_members (id, group_id, student_id, joined_at, is_online)
                VALUES ($1, $2, $3, datetime('now'), 1)
            """, mid, dg_id, str(m["student_id"]))

    return {
        "message": "Groups locked and discussion session created",
        "discussion_session_id": ds_id,
        "topic": topic_title,
        "status": "LOCKED"
    }


@router.get("/gd/sessions")
async def gd_list_sessions(
    admin: dict = Depends(get_current_admin),
    conn: Connection = Depends(get_db)
):
    rows = await conn.fetch("""
        SELECT gs.id, gs.department_id, d.name as dept_name, gs.group_size,
               gs.total_students, gs.total_groups, gs.status, gs.created_at
        FROM gd_sessions gs
        JOIN departments d ON d.id = gs.department_id
        ORDER BY gs.created_at DESC
    """)
    return [{
        "id": str(r["id"]),
        "department_id": str(r["department_id"]),
        "department_name": r["dept_name"],
        "group_size": r["group_size"],
        "total_students": r["total_students"],
        "total_groups": r["total_groups"],
        "status": r["status"],
        "created_at": r["created_at"]
    } for r in rows]


@router.get("/gd/sessions/{session_id}")
async def gd_get_session(
    session_id: str,
    admin: dict = Depends(get_current_admin),
    conn: Connection = Depends(get_db)
):
    session = await conn.fetchrow("""
        SELECT gs.*, d.name as dept_name
        FROM gd_sessions gs
        JOIN departments d ON d.id = gs.department_id
        WHERE gs.id = $1
    """, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    groups = await conn.fetch(
        "SELECT * FROM gd_groups WHERE session_id = $1 ORDER BY group_number", session_id
    )
    group_list = []
    for g in groups:
        members = await conn.fetch("""
            SELECT student_id, student_name, roll_number, score
            FROM gd_assignments WHERE group_id = $1 ORDER BY score DESC
        """, g["id"])
        group_list.append({
            "id": str(g["id"]),
            "group_number": g["group_number"],
            "member_count": g["member_count"],
            "locked": g["locked"],
            "members": [{
                "id": str(m["student_id"]),
                "name": m["student_name"],
                "roll_number": m["roll_number"],
                "score": m["score"]
            } for m in members]
        })

    return {
        "id": str(session["id"]),
        "department_id": str(session["department_id"]),
        "department_name": session["dept_name"],
        "group_size": session["group_size"],
        "total_students": session["total_students"],
        "total_groups": session["total_groups"],
        "status": session["status"],
        "created_at": session["created_at"],
        "groups": group_list
    }


# ─────────────────────────────────────────────
# Student Endpoints
# ─────────────────────────────────────────────

@router.get("/gd/my-group")
async def gd_my_group(
    current_student: dict = Depends(get_current_student),
    conn: Connection = Depends(get_db)
):
    student_id = current_student["id"]

    assignment = await conn.fetchrow("""
        SELECT ga.group_id, ga.student_name, ga.roll_number,
               gg.group_number, gg.session_id, gg.locked,
               gs.status as session_status, gs.department_id,
               d.name as dept_name
        FROM gd_assignments ga
        JOIN gd_groups gg ON gg.id = ga.group_id
        JOIN gd_sessions gs ON gs.id = gg.session_id
        JOIN departments d ON d.id = gs.department_id
        WHERE ga.student_id = $1
        ORDER BY gs.created_at DESC LIMIT 1
    """, student_id)

    if not assignment:
        return None

    # Get all members of this group
    members = await conn.fetch("""
        SELECT student_name, roll_number
        FROM gd_assignments
        WHERE group_id = $1
        ORDER BY score DESC
    """, assignment["group_id"])

    return {
        "session_id": str(assignment["session_id"]),
        "department": assignment["dept_name"],
        "session_status": assignment["session_status"],
        "group_number": assignment["group_number"],
        "locked": assignment["locked"],
        "my_name": assignment["student_name"],
        "my_roll": assignment["roll_number"],
        "members": [{"name": m["student_name"], "roll_number": m["roll_number"]} for m in members]
    }
