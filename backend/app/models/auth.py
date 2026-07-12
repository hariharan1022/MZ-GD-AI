from pydantic import BaseModel, EmailStr

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class StudentLogin(BaseModel):
    roll_number: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AdminResponse(BaseModel):
    id: str
    email: str
    name: str

class StudentResponse(BaseModel):
    id: str
    roll_number: str
    name: str
    department_id: str
    first_login: bool
