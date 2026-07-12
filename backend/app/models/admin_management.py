from pydantic import BaseModel, EmailStr
from typing import Optional, List

class DepartmentCreate(BaseModel):
    name: str
    code: str

class DepartmentResponse(DepartmentCreate):
    id: str

class YearCreate(BaseModel):
    department_id: str
    year_level: int

class YearResponse(YearCreate):
    id: str

class SectionCreate(BaseModel):
    year_id: str
    name: str

class SectionResponse(SectionCreate):
    id: str

class StudentCreate(BaseModel):
    roll_number: str
    spr_number: str
    name: str
    college_email: EmailStr
    department_id: str
    year_id: str
    section_id: str
    password: str

class StudentResponse(BaseModel):
    id: str
    roll_number: str
    spr_number: str
    name: str
    college_email: str
    department_id: str
    year_id: str
    section_id: str
    status: str
