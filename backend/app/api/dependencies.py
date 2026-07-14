from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from asyncpg import Connection
from app.db.connection import get_db
from app.core.security import decode_access_token

security = HTTPBearer()

async def get_current_student(credentials: HTTPAuthorizationCredentials = Depends(security), conn: Connection = Depends(get_db)) -> dict:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = payload.get("role")
    if role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: student role required"
        )
        
    student_id = payload.get("sub")
    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid: missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Check if student exists in DB
    student = await conn.fetchrow("SELECT * FROM students WHERE id = $1", student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
        
    return dict(student)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), conn: Connection = Depends(get_db)) -> dict:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = payload.get("role")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: admin role required"
        )
        
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid: missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    admin = await conn.fetchrow("SELECT * FROM admins WHERE id = $1", admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
        
    return dict(admin)
