from fastapi import APIRouter, Depends, HTTPException, status
from asyncpg import Connection
from typing import List

from app.db.connection import get_db_connection
from app.models.admin_management import (
    DepartmentCreate, DepartmentResponse,
    YearCreate, YearResponse,
    SectionCreate, SectionResponse,
    StudentCreate, StudentResponse
)
from app.db.queries.admin_management_queries import (
    create_department, get_departments,
    create_year, get_years_by_department,
    create_section, get_sections_by_year,
    create_student, get_students
)
from app.core.security import hash_password

router = APIRouter()

# --- Departments ---
@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def api_create_department(dept: DepartmentCreate, conn: Connection = Depends(get_db_connection)):
    try:
        return await create_department(conn, dept.name, dept.code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/departments", response_model=List[DepartmentResponse])
async def api_get_departments(conn: Connection = Depends(get_db_connection)):
    return await get_departments(conn)


# --- Years ---
@router.post("/years", response_model=YearResponse, status_code=status.HTTP_201_CREATED)
async def api_create_year(year: YearCreate, conn: Connection = Depends(get_db_connection)):
    try:
        return await create_year(conn, year.department_id, year.year_level)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/departments/{department_id}/years", response_model=List[YearResponse])
async def api_get_years(department_id: str, conn: Connection = Depends(get_db_connection)):
    return await get_years_by_department(conn, department_id)


# --- Sections ---
@router.post("/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def api_create_section(section: SectionCreate, conn: Connection = Depends(get_db_connection)):
    try:
        return await create_section(conn, section.year_id, section.name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/years/{year_id}/sections", response_model=List[SectionResponse])
async def api_get_sections(year_id: str, conn: Connection = Depends(get_db_connection)):
    return await get_sections_by_year(conn, year_id)


# --- Students ---
@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def api_create_student(student: StudentCreate, conn: Connection = Depends(get_db_connection)):
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
async def api_get_students(limit: int = 100, offset: int = 0, conn: Connection = Depends(get_db_connection)):
    return await get_students(conn, limit, offset)
