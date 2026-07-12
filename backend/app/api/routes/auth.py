from fastapi import APIRouter, Depends, HTTPException, status, Request
from asyncpg import Connection
from app.db.connection import get_db_connection
from app.models.auth import AdminLogin, StudentLogin, Token, AdminResponse, StudentResponse
from app.db.queries.auth_queries import get_admin_by_email, get_student_by_roll_number, log_user_login
from app.core.security import verify_password, create_access_token

router = APIRouter()

@router.post("/admin/login", response_model=Token)
async def login_admin(login_data: AdminLogin, request: Request, conn: Connection = Depends(get_db_connection)):
    admin = await get_admin_by_email(conn, login_data.email)
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Log the login
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    await log_user_login(conn, admin_id=admin["id"], ip_address=ip_address, user_agent=user_agent)

    access_token = create_access_token(data={"sub": str(admin["id"]), "role": "admin"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/student/login", response_model=Token)
async def login_student(login_data: StudentLogin, request: Request, conn: Connection = Depends(get_db_connection)):
    student = await get_student_by_roll_number(conn, login_data.roll_number)
    if not student or not verify_password(login_data.password, student["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect roll number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if student["status"] != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
        
    # Log the login
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    await log_user_login(conn, student_id=student["id"], ip_address=ip_address, user_agent=user_agent)

    access_token = create_access_token(data={
        "sub": str(student["id"]), 
        "role": "student", 
        "first_login": student["first_login"],
        "department_id": str(student["department_id"]),
        "year_id": str(student["year_id"]),
        "section_id": str(student["section_id"])
    })
    return {"access_token": access_token, "token_type": "bearer"}
