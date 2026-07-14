from pydantic import BaseModel, EmailStr
from typing import Optional, List, Union
from uuid import UUID
from datetime import date, time, datetime

class DepartmentCreate(BaseModel):
    name: str
    code: str
    hod: Optional[str] = None
    status: Optional[str] = "Active"

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    hod: Optional[str] = None
    status: Optional[str] = None

class DepartmentResponse(DepartmentCreate):
    id: Union[str, UUID]
    students: int = 0

class YearCreate(BaseModel):
    department_id: Union[str, UUID]
    year_level: int

class YearUpdate(BaseModel):
    year_level: int

class YearResponse(YearCreate):
    id: Union[str, UUID]
    sections_count: int = 0

class SectionCreate(BaseModel):
    year_id: Union[str, UUID]
    name: str

class SectionUpdate(BaseModel):
    name: str

class SectionResponse(SectionCreate):
    id: Union[str, UUID]
    students_count: int = 0

class StudentCreate(BaseModel):
    roll_number: str
    spr_number: str
    name: str
    college_email: EmailStr
    department_id: Union[str, UUID]
    year_id: Union[str, UUID]
    section_id: Union[str, UUID]
    password: str

class StudentResponse(BaseModel):
    id: Union[str, UUID]
    roll_number: str
    spr_number: str
    name: str
    college_email: str
    department_id: Union[str, UUID]
    year_id: Union[str, UUID]
    section_id: Union[str, UUID]
    status: str
    department_name: Optional[str] = None
    year_level: Optional[int] = None
    section_name: Optional[str] = None

# --- Topics ---
class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_custom: Optional[bool] = False

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_custom: Optional[bool] = None

class TopicResponse(TopicCreate):
    id: Union[str, UUID]
    created_at: Union[str, datetime]

# --- Sessions ---
class SessionCreate(BaseModel):
    department_id: Union[str, UUID]
    year_id: Union[str, UUID]
    section_id: Union[str, UUID]
    group_size: int
    discussion_date: Union[str, date]
    discussion_time: Union[str, time]
    preparation_time_minutes: int = 2
    discussion_duration_minutes: int = 10
    status: str = 'SCHEDULED'

class SessionUpdate(BaseModel):
    status: Optional[str] = None

class SessionResponse(SessionCreate):
    id: Union[str, UUID]
    admin_id: Union[str, UUID]
    
# --- Groups ---
class GroupResponse(BaseModel):
    id: Union[str, UUID]
    session_id: Union[str, UUID]
    topic_id: Optional[Union[str, UUID]] = None
    group_number: int
    room_name: str
    status: str
    started_at: Optional[Union[str, datetime]] = None
    completed_at: Optional[Union[str, datetime]] = None

# --- Bulk Students ---
class BulkStudentItem(BaseModel):
    roll: str
    name: str
    dept: str
    year: str
    section: str

class BulkStudentResponse(BaseModel):
    success: bool
    imported_count: int
    message: str
