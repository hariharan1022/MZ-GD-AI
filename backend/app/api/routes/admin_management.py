from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from asyncpg import Connection
from typing import List, Optional
import logging
import io
import csv
import re
import openpyxl
import asyncio

from app.db.connection import get_db
from app.models.admin_management import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse,
    YearCreate, YearUpdate, YearResponse,
    SectionCreate, SectionUpdate, SectionResponse,
    StudentCreate, StudentResponse, BulkStudentItem, BulkStudentResponse,
    TopicCreate, TopicUpdate, TopicResponse,
    SessionCreate, SessionUpdate, SessionResponse,
    GroupResponse, ExcelImportResponse, ExcelImportCounts
)
from app.db.queries.admin_management_queries import (
    create_department, get_departments, update_department, delete_department,
    create_year, get_years_by_department, update_year, delete_year,
    create_section, get_sections_by_year, update_section, delete_section,
    create_student, get_students, delete_student, create_student_bulk,
    create_topic, get_topics, update_topic, delete_topic,
    create_session, get_sessions, update_session_status,
    get_groups, update_group_status, create_audit_log
)
from app.core.security import hash_password

router = APIRouter()
logger = logging.getLogger("app.api.routes.admin_management")

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
    print("LOG: Excel file / student data received at POST /api/admin/students/bulk")
    
    rows_parsed = len(students)
    print(f"LOG: Number of rows parsed: {rows_parsed}")
    
    # Fetch student count before import
    count_before = await conn.fetchval("SELECT COUNT(*) FROM students")
    print(f"LOG: Student count before import: {count_before}")
    print("LOG: Database table used: students")
    
    try:
        # Default password hashed
        hashed_pw = hash_password("MZCET")
        students_data = [s.dict() for s in students]
        
        result = await create_student_bulk(conn, students_data, hashed_pw)
        inserted_count = result["inserted"]
        updated_count = result["updated"]
        
        print(f"LOG: Number of rows inserted: {inserted_count}")
        print(f"LOG: Number of rows updated: {updated_count}")
        
        # Fetch student count after import
        count_after = await conn.fetchval("SELECT COUNT(*) FROM students")
        print(f"LOG: Student count after import: {count_after}")
        
        # Write to audit_logs
        await create_audit_log(
            conn, 
            action="Student Bulk Import", 
            details=f"Imported {inserted_count} new and updated {updated_count} students from Excel/CSV."
        )
        
        response = BulkStudentResponse(
            success=True, 
            imported_count=inserted_count + updated_count, 
            message=f"Successfully imported {inserted_count} new students and updated {updated_count} existing students."
        )
        print(f"LOG: API response: {response.dict()}")
        return response
    except Exception as e:
        print(f"LOG ERROR: Error during bulk student import transaction: {e}")
        raise HTTPException(status_code=400, detail=str(e))



@router.post("/students/import-excel", response_model=ExcelImportResponse, status_code=status.HTTP_200_OK)
async def api_import_students_excel(file: UploadFile = File(...), conn: Connection = Depends(get_db)):
    print(f"LOG: Excel file received at POST /api/admin/students/import-excel, filename={file.filename}")
    
    try:
        contents = await file.read()
        filename = (file.filename or "").lower()
        
        rows = []
        if filename.endswith('.csv'):
            try:
                content_str = contents.decode('utf-8')
            except UnicodeDecodeError:
                content_str = contents.decode('latin-1')
            csv_reader = csv.reader(io.StringIO(content_str))
            for r in csv_reader:
                rows.append(r)
        else:
            # Excel
            wb = openpyxl.load_workbook(io.BytesIO(contents), data_only=True)
            sheet = wb.active if wb.active else wb.worksheets[0]
            for row in sheet.iter_rows(values_only=True):
                rows.append(list(row))
        
        if not rows:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        
        # 1. Identify the header row
        header_idx = -1
        for idx, row in enumerate(rows[:10]):
            if not row:
                continue
            row_str = [str(cell).lower().strip() for cell in row if cell is not None]
            matches = 0
            if any("name" in s for s in row_str):
                matches += 1
            if any(any(k in s for k in ["roll", "reg", "spr", "number"]) for s in row_str):
                matches += 1
            if any(any(k in s for k in ["email", "mail"]) for s in row_str):
                matches += 1
            if any(any(k in s for k in ["dept", "department", "branch"]) for s in row_str):
                matches += 1
            if matches >= 3:
                header_idx = idx
                break

        if header_idx == -1:
            header_idx = 0

        header_row = rows[header_idx]
        headers = [str(c).lower().strip() if c is not None else "" for c in header_row]

        col_first_name = -1
        col_last_name = -1
        col_name = -1
        col_roll = -1
        col_spr = -1
        col_email = -1
        col_dept = -1
        col_year = -1
        col_sec = -1

        for i, h in enumerate(headers):
            if "first name" in h or h == "firstname":
                col_first_name = i
            elif "last name" in h or h == "lastname":
                col_last_name = i
            elif "name" in h or h == "student name" or h == "studentname":
                col_name = i
            elif any(k == h or k in h for k in ["spr number", "spr no", "spr", "spr_number"]):
                col_spr = i
            elif any(k == h or k in h for k in ["roll number", "roll no", "roll", "register number", "reg no", "registration number", "register_number", "reg_no", "registration_number"]):
                col_roll = i
            elif any(k in h for k in ["email", "college email", "email address", "mail"]):
                col_email = i
            elif any(k in h for k in ["department", "dept", "branch"]):
                col_dept = i
            elif any(k in h for k in ["year", "year level", "year_level"]):
                col_year = i
            elif any(k in h for k in ["section", "sec"]):
                col_sec = i

        missing_cols = []
        if col_name == -1 and col_first_name == -1:
            missing_cols.append("Name/First Name")
        if col_roll == -1:
            missing_cols.append("Roll Number")
        if col_email == -1:
            missing_cols.append("Email")

        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns in spreadsheet: {', '.join(missing_cols)}."
            )

        # 2. Build local caches for lookup queries to prevent database network timeout (n+1 problem)
        dept_rows = await conn.fetch("SELECT id, name, code FROM departments")
        dept_cache = {}
        for r in dept_rows:
            dept_id = str(r["id"])
            if r["name"]:
                dept_cache[r["name"].lower()] = dept_id
            if r["code"]:
                dept_cache[r["code"].lower()] = dept_id

        year_rows = await conn.fetch("SELECT id, department_id, year_level FROM years")
        year_cache = {}
        for r in year_rows:
            year_cache[(str(r["department_id"]), r["year_level"])] = str(r["id"])

        sec_rows = await conn.fetch("SELECT id, year_id, name FROM sections")
        sec_cache = {}
        for r in sec_rows:
            sec_cache[(str(r["year_id"]), r["name"].lower())] = str(r["id"])

        student_rows = await conn.fetch("SELECT id, roll_number, spr_number, college_email FROM students")
        roll_to_id = {}
        spr_to_roll = {}
        email_to_roll = {}
        for r in student_rows:
            roll = r["roll_number"]
            roll_to_id[roll] = str(r["id"])
            if r["spr_number"]:
                spr_to_roll[r["spr_number"]] = roll
            if r["college_email"]:
                email_to_roll[r["college_email"]] = roll

        # Resolve caching database defaults to prevent failures if Department, Year, Section are missing
        default_dept_id = None
        default_year_id = None
        default_sec_id = None
        
        if dept_cache:
            default_dept_id = list(dept_cache.values())[0]
        else:
            default_dept_id = await conn.fetchval("SELECT id FROM departments LIMIT 1")
            
        if default_dept_id:
            for (d_id, y_lvl), y_id in year_cache.items():
                if d_id == default_dept_id:
                    default_year_id = y_id
                    break
            if not default_year_id:
                default_year_id = await conn.fetchval("SELECT id FROM years WHERE department_id = $1 LIMIT 1", default_dept_id)
                
        if default_year_id:
            for (y_id, s_name), s_id in sec_cache.items():
                if y_id == default_year_id:
                    default_sec_id = s_id
                    break
            if not default_sec_id:
                default_sec_id = await conn.fetchval("SELECT id FROM sections WHERE year_id = $1 LIMIT 1", default_year_id)

        # 3. Process rows & validate, lookup UUIDs via cache, pre-hash password
        inserted_count = 0
        updated_count = 0
        skipped_count = 0
        failed_count = 0
        errors = []
        
        prepared_operations = []
        seen_rolls = set()
        seen_emails = set()
        
        def parse_year_level(val: str) -> Optional[int]:
            digits = re.findall(r'\d+', val)
            if digits:
                return int(digits[0])
            val_lower = val.lower()
            if "first" in val_lower or "1st" in val_lower: return 1
            if "second" in val_lower or "2nd" in val_lower: return 2
            if "third" in val_lower or "3rd" in val_lower: return 3
            if "fourth" in val_lower or "4th" in val_lower: return 4
            if "fifth" in val_lower or "5th" in val_lower: return 5
            return None

        for row_idx, row in enumerate(rows[header_idx + 1:], start=header_idx + 2):
            if not row or all(c is None or str(c).strip() == "" for c in row):
                skipped_count += 1
                continue
                
            def get_cell(col_idx):
                if col_idx != -1 and col_idx < len(row):
                    val = row[col_idx]
                    if val is not None:
                        if isinstance(val, float) and val.is_integer():
                            return str(int(val)).strip()
                        return str(val).strip()
                return ""

            if col_name != -1:
                name_val = get_cell(col_name)
            else:
                first = get_cell(col_first_name)
                last = get_cell(col_last_name)
                name_val = f"{first} {last}".strip()
                
            if not name_val:
                errors.append(f"Row {row_idx}: Missing Student Name.")
                failed_count += 1
                continue
                
            roll_val = get_cell(col_roll)
            if roll_val.endswith('.0'):
                roll_val = roll_val[:-2]
                
            if not roll_val:
                errors.append(f"Row {row_idx}: Missing Roll Number.")
                failed_count += 1
                continue
                
            if roll_val in seen_rolls:
                skipped_count += 1
                continue
            seen_rolls.add(roll_val)
            
            email_val = get_cell(col_email)
            if not email_val:
                errors.append(f"Row {row_idx}: Missing Email.")
                failed_count += 1
                continue
            if email_val in seen_emails:
                errors.append(f"Row {row_idx}: Email '{email_val}' is duplicated in the uploaded file.")
                failed_count += 1
                continue
            seen_emails.add(email_val)
                
            # Department Resolution
            dept_id = None
            if col_dept != -1:
                dept_val = get_cell(col_dept)
                if dept_val:
                    dept_id = dept_cache.get(dept_val.lower())
            if not dept_id:
                dept_id = default_dept_id
            if not dept_id:
                errors.append(f"Row {row_idx}: Department not specified and no default department found in database.")
                failed_count += 1
                continue
                
            # Year Resolution
            year_id = None
            if col_year != -1:
                year_val = get_cell(col_year)
                if year_val:
                    year_level = parse_year_level(year_val)
                    if year_level is not None:
                        year_id = year_cache.get((dept_id, year_level))
            if not year_id:
                if dept_id == default_dept_id:
                    year_id = default_year_id
                else:
                    for (d_id, y_lvl), y_id in year_cache.items():
                        if d_id == dept_id:
                            year_id = y_id
                            break
            if not year_id:
                errors.append(f"Row {row_idx}: Year not found for department.")
                failed_count += 1
                continue
                
            # Section Resolution
            sec_id = None
            if col_sec != -1:
                sec_val = get_cell(col_sec)
                if sec_val:
                    sec_variations = [
                        sec_val.lower(),
                        f"section {sec_val.lower()}",
                        sec_val.lower().replace("section ", "")
                    ]
                    for var in sec_variations:
                        sec_id = sec_cache.get((year_id, var))
                        if sec_id:
                            break
            if not sec_id:
                if year_id == default_year_id:
                    sec_id = default_sec_id
                else:
                    for (y_id, s_name), s_id in sec_cache.items():
                        if y_id == year_id:
                            sec_id = s_id
                            break
            if not sec_id:
                errors.append(f"Row {row_idx}: Section not found for year.")
                failed_count += 1
                continue
                
            spr_number = ""
            if col_spr != -1:
                spr_number = get_cell(col_spr)
            if not spr_number:
                spr_number = f"SPR{roll_val}"

            existing_spr_roll = spr_to_roll.get(spr_number)
            if existing_spr_roll and existing_spr_roll != roll_val:
                errors.append(f"Row {row_idx}: SPR number '{spr_number}' is already taken by student (Roll: {existing_spr_roll}).")
                failed_count += 1
                continue
                
            existing_email_roll = email_to_roll.get(email_val)
            if existing_email_roll and existing_email_roll != roll_val:
                errors.append(f"Row {row_idx}: Email '{email_val}' is already taken by student (Roll: {existing_email_roll}).")
                failed_count += 1
                continue
                
            existing_student_id = roll_to_id.get(roll_val)
            
            if existing_student_id:
                prepared_operations.append({
                    "type": "UPDATE",
                    "student_id": existing_student_id,
                    "roll_number": roll_val,
                    "spr_number": spr_number,
                    "name": name_val,
                    "college_email": email_val,
                    "password_hash": None,
                    "department_id": dept_id,
                    "year_id": year_id,
                    "section_id": sec_id
                })
            else:
                prepared_operations.append({
                    "type": "INSERT",
                    "roll_number": roll_val,
                    "spr_number": spr_number,
                    "name": name_val,
                    "college_email": email_val,
                    "password_hash": None,
                    "department_id": dept_id,
                    "year_id": year_id,
                    "section_id": sec_id
                })
                
        # Hash all passwords concurrently in parallel threads to bypass GIL and utilize multi-core CPU
        if prepared_operations:
            async def hash_op_password(op):
                # The default password is the SPR number (e.g. 9665) if available, otherwise roll_number
                default_password = op["spr_number"] if op["spr_number"] else op["roll_number"]
                op["password_hash"] = await asyncio.to_thread(hash_password, default_password)
            await asyncio.gather(*(hash_op_password(op) for op in prepared_operations))
            
        # 4. Perform database operations in a single transaction
        if prepared_operations:
            if hasattr(conn, "transaction"):
                async with conn.transaction():
                    for op in prepared_operations:
                        if op["type"] == "INSERT":
                            await conn.execute(
                                """
                                INSERT INTO students (
                                    roll_number, spr_number, name, college_email, password_hash, 
                                    department_id, year_id, section_id, status, first_login
                                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', TRUE)
                                """,
                                op["roll_number"], op["spr_number"], op["name"], op["college_email"], 
                                op["password_hash"], op["department_id"], op["year_id"], op["section_id"]
                            )
                            inserted_count += 1
                        elif op["type"] == "UPDATE":
                            await conn.execute(
                                """
                                UPDATE students 
                                SET name = $1, college_email = $2, password_hash = $3, 
                                    department_id = $4, year_id = $5, section_id = $6, 
                                    spr_number = $7, status = 'ACTIVE', first_login = TRUE, updated_at = CURRENT_TIMESTAMP
                                WHERE id = $8
                                """,
                                op["name"], op["college_email"], op["password_hash"], 
                                op["department_id"], op["year_id"], op["section_id"], op["spr_number"], op["student_id"]
                            )
                            updated_count += 1
            else:
                # SQLite fallback transaction handling
                await conn.execute("BEGIN TRANSACTION")
                try:
                    for op in prepared_operations:
                        if op["type"] == "INSERT":
                            await conn.execute(
                                """
                                INSERT INTO students (
                                    roll_number, spr_number, name, college_email, password_hash, 
                                    department_id, year_id, section_id, status, first_login
                                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', 1)
                                """,
                                op["roll_number"], op["spr_number"], op["name"], op["college_email"], 
                                op["password_hash"], op["department_id"], op["year_id"], op["section_id"]
                            )
                            inserted_count += 1
                        elif op["type"] == "UPDATE":
                            await conn.execute(
                                """
                                UPDATE students 
                                SET name = $1, college_email = $2, password_hash = $3, 
                                    department_id = $4, year_id = $5, section_id = $6, 
                                    spr_number = $7, status = 'ACTIVE', first_login = 1, updated_at = CURRENT_TIMESTAMP
                                WHERE id = $8
                                """,
                                op["name"], op["college_email"], op["password_hash"], 
                                op["department_id"], op["year_id"], op["section_id"], op["spr_number"], op["student_id"]
                            )
                            updated_count += 1
                    await conn.execute("COMMIT")
                except Exception as db_err:
                    await conn.execute("ROLLBACK")
                    raise db_err

            await create_audit_log(
                conn, 
                action="Student Excel Import", 
                details=f"Successfully imported {inserted_count} new students and updated {updated_count} students from Excel."
            )
            
        return ExcelImportResponse(
            success=True,
            message=f"Excel import completed: {inserted_count} inserted, {updated_count} updated, {skipped_count} skipped, {failed_count} failed.",
            counts=ExcelImportCounts(
                inserted=inserted_count,
                updated=updated_count,
                skipped=skipped_count,
                failed=failed_count
            ),
            errors=errors
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"LOG ERROR: Error processing Excel file: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to process Excel file: {str(e)}")



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
