import os
import uuid
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from asyncpg import Connection
from app.db.connection import get_db
from app.api.dependencies import get_current_student
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

def fmt_date(val):
    if not val:
        return "TBD"
    if isinstance(val, str):
        try:
            return datetime.strptime(val, "%Y-%m-%d").strftime("%b %d, %Y")
        except:
            return val
    return val.strftime("%b %d, %Y")

def fmt_time(val):
    if not val:
        return "TBD"
    if isinstance(val, str):
        try:
            return datetime.strptime(val, "%H:%M:%S").strftime("%I:%M %p")
        except:
            return val
    return val.strftime("%I:%M %p")

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    spdNo: Optional[str] = None
    phone: Optional[str] = None
    photoUrl: Optional[str] = None

@router.get("/profile")
async def get_student_profile(current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    student_id = current_student["id"]
    student_record = await conn.fetchrow("""
        SELECT s.id, s.name, s.college_email, s.roll_number, s.spr_number, s.photo_url, s.phone_number,
               d.code as department_code, d.name as department_name, y.year_level, sec.name as section
        FROM students s
        JOIN departments d ON s.department_id = d.id
        JOIN years y ON s.year_id = y.id
        JOIN sections sec ON s.section_id = sec.id
        WHERE s.id = $1
    """, student_id)
    if not student_record:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    return {
        "id": str(student_record["id"]),
        "name": student_record["name"],
        "email": student_record["college_email"],
        "roll": student_record["roll_number"],
        "spdNo": student_record["spr_number"],
        "dept": student_record["department_code"],
        "deptName": student_record["department_name"],
        "year": f"Year {student_record['year_level']}",
        "section": student_record["section"],
        "phone": student_record["phone_number"] or "",
        "photoUrl": student_record["photo_url"] or ""
    }

@router.post("/profile")
async def update_student_profile(
    update_data: ProfileUpdate,
    current_student: dict = Depends(get_current_student),
    conn: Connection = Depends(get_db)
):
    student_id = current_student["id"]
    
    await conn.execute("""
        UPDATE students
        SET name = COALESCE($1, name),
            college_email = COALESCE($2, college_email),
            spr_number = COALESCE($3, spr_number),
            phone_number = COALESCE($4, phone_number),
            photo_url = COALESCE($5, photo_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
    """, update_data.name, update_data.email, update_data.spdNo, update_data.phone, update_data.photoUrl, student_id)
    
    return {"success": True, "message": "Profile updated successfully"}

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_student: dict = Depends(get_current_student),
    conn: Connection = Depends(get_db)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    filename = f"student_{current_student['id']}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    contents = await file.read()
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, lambda: open(filepath, "wb").write(contents))
    photo_url = f"/uploads/{filename}"
    await conn.execute("UPDATE students SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", photo_url, current_student["id"])
    return {"photoUrl": photo_url, "message": "Photo uploaded successfully"}

@router.get("/leaderboard")
async def get_department_leaderboard(current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    department_id = current_student["department_id"]
    
    query = """
        SELECT s.id as student_id, s.name as student_name, s.roll_number, d.name as department_name, 
               COALESCE(AVG(ss.overall_score), 0) as avg_score, 
               COUNT(ss.id) as sessions_attended
        FROM students s
        JOIN departments d ON s.department_id = d.id
        LEFT JOIN student_scores ss ON s.id = ss.student_id
        WHERE s.department_id = $1
        GROUP BY s.id, d.name, s.name, s.roll_number
        ORDER BY avg_score DESC, s.name ASC
        LIMIT 100
    """
    rows = await conn.fetch(query, department_id)
    
    leaderboard_data = []
    for index, r in enumerate(rows):
        avg = round(float(r['avg_score']), 1)
        leaderboard_data.append({
            "rank": index + 1,
            "name": r["student_name"],
            "score": avg,
            "roll": r["roll_number"],
            "sessions": r["sessions_attended"]
        })
        
    return leaderboard_data

@router.get("/analytics")
async def get_student_analytics(current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    student_id = current_student["id"]
    
    query = """
        SELECT ds.discussion_date, ds.discussion_time,
               dt.title as topic,
               sc.grammar_score, sc.fluency_score, sc.confidence_score, sc.overall_score
        FROM group_members gm
        JOIN discussion_groups dg ON gm.group_id = dg.id
        JOIN discussion_sessions ds ON dg.session_id = ds.id
        LEFT JOIN discussion_topics dt ON dg.topic_id = dt.id
        JOIN student_scores sc ON dg.id = sc.group_id AND gm.student_id = sc.student_id
        WHERE gm.student_id = $1 AND ds.status = 'COMPLETED'
        ORDER BY ds.discussion_date ASC, ds.discussion_time ASC
    """
    rows = await conn.fetch(query)
    
    performance_history = []
    for r in rows:
        performance_history.append({
            "date": fmt_date(r["discussion_date"]),
            "topic": r["topic"] or "Group Discussion",
            "overall": float(r["overall_score"] or 0),
            "grammar": float(r["grammar_score"] or 0),
            "fluency": float(r["fluency_score"] or 0),
            "confidence": float(r["confidence_score"] or 0)
        })
        
    return {
        "history": performance_history
    }

@router.get("/reports")
async def get_student_reports(current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    student_id = current_student["id"]
    
    query = """
        SELECT fr.id, fr.strengths, fr.weaknesses, fr.suggestions, fr.created_at,
               dt.title as topic, sc.overall_score
        FROM feedback_reports fr
        JOIN student_scores sc ON fr.score_id = sc.id
        JOIN discussion_groups dg ON sc.group_id = dg.id
        LEFT JOIN discussion_topics dt ON dg.topic_id = dt.id
        WHERE fr.student_id = $1
        ORDER BY fr.created_at DESC
    """
    rows = await conn.fetch(query)
    
    reports = []
    for r in rows:
        reports.append({
            "id": str(r["id"]),
            "topic": r["topic"] or "Group Discussion",
            "score": float(r["overall_score"] or 0),
            "strengths": r["strengths"],
            "weaknesses": r["weaknesses"],
            "suggestions": r["suggestions"],
            "date": r["created_at"].strftime("%Y-%m-%d") if r["created_at"] else "N/A"
        })
        
    return reports

@router.get("/dashboard")
async def get_student_dashboard(current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    import json
    student_id = current_student["id"]

    # 1. Fetch User Details with joins
    student_record = await conn.fetchrow("""
        SELECT s.name, s.college_email, s.roll_number, s.spr_number,
               s.department_id, s.year_id, s.section_id,
               d.name as department, y.year_level, sec.name as section
        FROM students s
        JOIN departments d ON s.department_id = d.id
        JOIN years y ON s.year_id = y.id
        JOIN sections sec ON s.section_id = sec.id
        WHERE s.id = $1
    """, student_id)

    first_name = "Student"
    last_name = ""
    if student_record and student_record["name"]:
        parts = student_record["name"].split(' ', 1)
        first_name = parts[0]
        if len(parts) > 1:
            last_name = parts[1]
            
    student_data = {
        "first_name": first_name,
        "last_name": last_name,
        "department": student_record["department"] if student_record else "IT",
        "year": f"Year {student_record['year_level']}" if student_record else "Year 3",
        "section": student_record["section"] if student_record else "Section A"
    }

    # 2. Fetch Gamification Stats
    stats = await conn.fetchrow("""
        SELECT xp, current_level, daily_streak, badges
        FROM gamification 
        WHERE student_id = $1
    """, student_id)
    
    badges = []
    if stats and stats['badges']:
        try:
            badges = json.loads(stats['badges']) if isinstance(stats['badges'], str) else stats['badges']
        except:
            pass
            
    gamification_data = dict(stats) if stats else {"xp": 0, "current_level": 1, "daily_streak": 0}

    # 3. Upcoming Sessions (Scheduled)
    upcoming_records = await conn.fetch("""
        SELECT ds.id, ds.discussion_date, ds.discussion_time, ds.group_size,
               ds.preparation_time_minutes, ds.discussion_duration_minutes, ds.status,
               d.name as department_name, sec.name as section_name
        FROM discussion_sessions ds
        JOIN departments d ON ds.department_id = d.id
        JOIN sections sec ON ds.section_id = sec.id
        WHERE ds.department_id = $1 AND ds.section_id = $2 AND ds.status = 'SCHEDULED'
        ORDER BY ds.discussion_date ASC, ds.discussion_time ASC
        LIMIT 3
    """, student_record["department_id"] if student_record else None, student_record["section_id"] if student_record else None)

    upcoming_sessions = []
    for r in upcoming_records:
        topic_title = "Topic will be generated by AI"
        group_row = await conn.fetchrow("""
            SELECT dt.title 
            FROM discussion_groups dg
            JOIN discussion_topics dt ON dg.topic_id = dt.id
            WHERE dg.session_id = $1 LIMIT 1
        """, r["id"])
        if group_row:
            topic_title = group_row["title"]
            
        upcoming_sessions.append({
            "id": str(r["id"]),
            "topic": topic_title,
            "date": fmt_date(r["discussion_date"]),
            "time": fmt_time(r["discussion_time"]),
            "scheduled_time": f"{r['discussion_date']}T{r['discussion_time']}",
            "group": f"{r['department_name']} - {r['section_name']}",
            "prepTime": r["preparation_time_minutes"],
            "duration": r["discussion_duration_minutes"],
            "groupSize": r["group_size"]
        })

    # 4. Recent Discussions & Analytics
    recent_records = await conn.fetch("""
        SELECT ds.id as session_id, ds.discussion_date, ds.discussion_time,
               dt.title as topic_title,
               sc.grammar_score, sc.fluency_score, sc.confidence_score, sc.overall_score,
               fr.strengths, fr.weaknesses, fr.suggestions
        FROM group_members gm
        JOIN discussion_groups dg ON gm.group_id = dg.id
        JOIN discussion_sessions ds ON dg.session_id = ds.id
        LEFT JOIN discussion_topics dt ON dg.topic_id = dt.id
        JOIN student_scores sc ON dg.id = sc.group_id AND gm.student_id = sc.student_id
        LEFT JOIN feedback_reports fr ON sc.id = fr.score_id
        WHERE gm.student_id = $1 AND ds.status = 'COMPLETED'
        ORDER BY ds.discussion_date DESC, ds.discussion_time DESC
        LIMIT 5
    """, student_id)

    recent_discussions = []
    total_grammar = 0
    total_fluency = 0
    total_confidence = 0
    total_score_overall = 0
    
    for r in recent_records:
        avg = float(r["overall_score"]) if r["overall_score"] is not None else 0.0
        if avg == 0.0:
            avg = (float(r["grammar_score"] or 0) + float(r["fluency_score"] or 0) + float(r["confidence_score"] or 0)) / 3.0
            
        grade = "A+" if avg >= 90 else "A" if avg >= 80 else "B+" if avg >= 70 else "B" if avg >= 60 else "C"
        
        recent_discussions.append({
            "topic": r["topic_title"] or "Group Discussion",
            "date": fmt_date(r["discussion_date"]),
            "score": f"{round(avg)}/100",
            "grade": grade,
            "raw_avg": avg
        })
        
        total_grammar += float(r["grammar_score"]) if r["grammar_score"] is not None else 0.0
        total_fluency += float(r["fluency_score"]) if r["fluency_score"] is not None else 0.0
        total_confidence += float(r["confidence_score"]) if r["confidence_score"] is not None else 0.0
        total_score_overall += avg

    count = len(recent_records)
    avg_score = round(total_score_overall / count) if count > 0 else 0
    avg_grammar = round(total_grammar / count) if count > 0 else 0
    avg_fluency = round(total_fluency / count) if count > 0 else 0
    avg_confidence = round(total_confidence / count) if count > 0 else 0

    # 5. Advanced Stats
    total_discussions = await conn.fetchval("""
        SELECT COUNT(DISTINCT dg.session_id)
        FROM group_members gm
        JOIN discussion_groups dg ON gm.group_id = dg.id
        WHERE gm.student_id = $1
    """, student_id)

    best_score_record = await conn.fetchval("""
        SELECT MAX(sc.overall_score)
        FROM group_members gm
        JOIN student_scores sc ON gm.group_id = sc.group_id AND gm.student_id = sc.student_id
        WHERE gm.student_id = $1
    """, student_id)
    best_score = round(float(best_score_record)) if best_score_record is not None else 0

    # Rankings lookup
    rank_row = await conn.fetchrow("""
        SELECT department_rank, section_rank
        FROM rankings
        WHERE student_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    """, student_id)
    dept_rank = rank_row["department_rank"] if (rank_row and rank_row["department_rank"]) else 12
    section_rank = rank_row["section_rank"] if (rank_row and rank_row["section_rank"]) else 3

    # 6. AI Insights
    insights = []
    if count >= 2:
        recent_avg = recent_discussions[0]["raw_avg"]
        past_avg = recent_discussions[1]["raw_avg"]
        diff = recent_avg - past_avg
        if diff > 0:
            insights.append({"type": "positive", "text": f"Overall performance improved by {round(diff)}% recently.", "icon": "TrendingUp", "color": "emerald"})
        elif diff < 0:
            insights.append({"type": "warning", "text": f"Overall performance dropped by {round(abs(diff))}%. Keep practicing!", "icon": "AlertCircle", "color": "amber"})

    if avg_grammar > 85:
        insights.append({"type": "positive", "text": "Grammar is excellent. You use complex sentence structures well.", "icon": "TrendingUp", "color": "emerald"})
    else:
        insights.append({"type": "warning", "text": "Work on subject-verb agreement to improve grammar.", "icon": "AlertCircle", "color": "amber"})
        
    if avg_fluency > 80:
        insights.append({"type": "positive", "text": "Your speaking pace is steady and natural.", "icon": "Star", "color": "indigo"})
    else:
        insights.append({"type": "warning", "text": "Try to reduce filler words (like, umm) to sound more fluent.", "icon": "AlertCircle", "color": "amber"})

    # Fetch one feedback note for insight
    for r in recent_records:
        if r["suggestions"]:
            insights.append({"type": "info", "text": f"AI Suggestion: {r['suggestions']}", "icon": "MessageSquare", "color": "indigo"})
            break

    return {
        "student": student_data,
        "gamification": gamification_data,
        "badges": badges,
        "communication_score": avg_score,
        "best_score": best_score,
        "dept_rank": dept_rank,
        "section_rank": section_rank,
        "total_discussions": total_discussions or 0,
        "upcoming_sessions": upcoming_sessions,
        "recent_discussions": recent_discussions,
        "areas_to_improve": [
            {"name": "Grammar", "value": avg_grammar, "color": "bg-emerald-500"},
            {"name": "Vocabulary", "value": avg_fluency, "color": "bg-indigo-500"},
            {"name": "Confidence", "value": avg_confidence, "color": "bg-amber-500"}
        ],
        "insights": insights
    }
