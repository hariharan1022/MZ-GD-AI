from fastapi import APIRouter, Depends, HTTPException, status
from asyncpg import Connection
from typing import List

from app.db.connection import get_db
from app.models.admin_management import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse,
    YearCreate, YearUpdate, YearResponse,
    SectionCreate, SectionUpdate, SectionResponse,
    StudentCreate, StudentResponse, BulkStudentItem, BulkStudentResponse,
    TopicCreate, TopicUpdate, TopicResponse,
    SessionCreate, SessionUpdate, SessionResponse,
    GroupResponse
)
from app.db.queries.admin_management_queries import (
    create_department, get_departments, update_department, delete_department,
    create_year, get_years_by_department, update_year, delete_year,
    create_section, get_sections_by_year, update_section, delete_section,
    create_student, get_students, delete_student, create_student_bulk,
    create_topic, get_topics, update_topic, delete_topic,
    create_session, get_sessions, update_session_status,
    get_groups, update_group_status
)
from app.core.security import hash_password

router = APIRouter()

# --- Departments ---
@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def api_create_department(dept: DepartmentCreate, conn: Connection = Depends(get_db)):
    try:
        return await create_department(conn, dept.name, dept.code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/departments", response_model=List[DepartmentResponse])
async def api_get_departments(conn: Connection = Depends(get_db)):
    return await get_departments(conn)

@router.put("/departments/{dept_id}", response_model=DepartmentResponse)
async def api_update_department(dept_id: str, dept: DepartmentUpdate, conn: Connection = Depends(get_db)):
    try:
        updated = await update_department(conn, dept_id, dept.name, dept.code, dept.hod, dept.status)
        if not updated:
            raise HTTPException(status_code=404, detail="Department not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/departments/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def api_delete_department(dept_id: str, conn: Connection = Depends(get_db)):
    deleted = await delete_department(conn, dept_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Department not found")
    return None


# --- Years ---
@router.post("/years", response_model=YearResponse, status_code=status.HTTP_201_CREATED)
async def api_create_year(year: YearCreate, conn: Connection = Depends(get_db)):
    try:
        return await create_year(conn, year.department_id, year.year_level)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/departments/{department_id}/years", response_model=List[YearResponse])
async def api_get_years(department_id: str, conn: Connection = Depends(get_db)):
    return await get_years_by_department(conn, department_id)

@router.put("/years/{year_id}", response_model=YearResponse)
async def api_update_year(year_id: str, year: YearUpdate, conn: Connection = Depends(get_db)):
    try:
        updated = await update_year(conn, year_id, year.year_level)
        if not updated:
            raise HTTPException(status_code=404, detail="Year not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/years/{year_id}", status_code=status.HTTP_204_NO_CONTENT)
async def api_delete_year(year_id: str, conn: Connection = Depends(get_db)):
    deleted = await delete_year(conn, year_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Year not found")
    return None


# --- Sections ---
@router.post("/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def api_create_section(section: SectionCreate, conn: Connection = Depends(get_db)):
    try:
        return await create_section(conn, section.year_id, section.name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/years/{year_id}/sections", response_model=List[SectionResponse])
async def api_get_sections(year_id: str, conn: Connection = Depends(get_db)):
    return await get_sections_by_year(conn, year_id)

@router.put("/sections/{section_id}", response_model=SectionResponse)
async def api_update_section(section_id: str, section: SectionUpdate, conn: Connection = Depends(get_db)):
    try:
        updated = await update_section(conn, section_id, section.name)
        if not updated:
            raise HTTPException(status_code=404, detail="Section not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def api_delete_section(section_id: str, conn: Connection = Depends(get_db)):
    deleted = await delete_section(conn, section_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Section not found")
    return None


# --- Students ---
@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def api_create_student(student: StudentCreate, conn: Connection = Depends(get_db)):
    try:
        hashed_pw = hash_password(student.password)
        return await create_student(
            conn, student.roll_number, student.spr_number, student.name, 
            student.college_email, hashed_pw, student.department_id, 
            student.year_id, student.section_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/students", response_model=List[StudentResponse])
async def api_get_students(limit: int = 100, offset: int = 0, conn: Connection = Depends(get_db)):
    return await get_students(conn, limit, offset)

@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def api_delete_student(student_id: str, conn: Connection = Depends(get_db)):
    deleted = await delete_student(conn, student_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Student not found")
    return None

@router.post("/students/bulk", response_model=BulkStudentResponse, status_code=status.HTTP_201_CREATED)
async def api_create_student_bulk(students: List[BulkStudentItem], conn: Connection = Depends(get_db)):
    try:
        # Default password hashed
        hashed_pw = hash_password("MZCET")
        students_data = [s.dict() for s in students]
        imported_count = await create_student_bulk(conn, students_data, hashed_pw)
        return BulkStudentResponse(
            success=True, 
            imported_count=imported_count, 
            message=f"Successfully imported {imported_count} students"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



# --- Topics ---
@router.post("/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def api_create_topic(topic: TopicCreate, conn: Connection = Depends(get_db)):
    try:
        return await create_topic(conn, topic.title, topic.description, topic.category, topic.is_custom)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/topics", response_model=List[TopicResponse])
async def api_get_topics(conn: Connection = Depends(get_db)):
    return await get_topics(conn)

@router.put("/topics/{topic_id}", response_model=TopicResponse)
async def api_update_topic(topic_id: str, topic: TopicUpdate, conn: Connection = Depends(get_db)):
    try:
        updated = await update_topic(conn, topic_id, topic.title, topic.description, topic.category, topic.is_custom)
        if not updated:
            raise HTTPException(status_code=404, detail="Topic not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def api_delete_topic(topic_id: str, conn: Connection = Depends(get_db)):
    deleted = await delete_topic(conn, topic_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Topic not found")
    return None


# --- Sessions ---
@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def api_create_session(session: SessionCreate, conn: Connection = Depends(get_db)):
    try:
        admin = await conn.fetchrow("SELECT id FROM admins LIMIT 1")
        if not admin:
            admin = await conn.fetchrow("INSERT INTO admins (email, password_hash, name) VALUES ('admin@mz.com', 'dummy', 'Admin') RETURNING id")
        admin_id = admin['id']

        return await create_session(
            conn, admin_id, session.department_id, session.year_id, session.section_id,
            session.group_size, session.discussion_date, session.discussion_time,
            session.preparation_time_minutes, session.discussion_duration_minutes, session.status
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions", response_model=List[SessionResponse])
async def api_get_sessions(conn: Connection = Depends(get_db)):
    return await get_sessions(conn)

@router.put("/sessions/{session_id}/status", response_model=SessionResponse)
async def api_update_session_status(session_id: str, session_update: SessionUpdate, conn: Connection = Depends(get_db)):
    try:
        updated = await update_session_status(conn, session_id, session_update.status)
        if not updated:
            raise HTTPException(status_code=404, detail="Session not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Groups ---
@router.get("/groups", response_model=List[GroupResponse])
async def api_get_groups(conn: Connection = Depends(get_db)):
    return await get_groups(conn)

@router.put("/groups/{group_id}/status", response_model=GroupResponse)
async def api_update_group_status(group_id: str, group_update: SessionUpdate, conn: Connection = Depends(get_db)):
    try:
        updated = await update_group_status(conn, group_id, group_update.status)
        if not updated:
            raise HTTPException(status_code=404, detail="Group not found")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
