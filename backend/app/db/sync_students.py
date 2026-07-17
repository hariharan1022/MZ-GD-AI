import os
import csv
import logging
import re
import uuid
from app.core.security import hash_password

logger = logging.getLogger(__name__)

def parse_year_level(val: str) -> int:
    digits = re.findall(r'\d+', val)
    if digits:
        return int(digits[0])
    val_lower = val.lower()
    if "first" in val_lower or "1st" in val_lower: return 1
    if "second" in val_lower or "2nd" in val_lower: return 2
    if "third" in val_lower or "3rd" in val_lower: return 3
    if "fourth" in val_lower or "4th" in val_lower: return 4
    if "fifth" in val_lower or "5th" in val_lower: return 5
    return 1

async def sync_students_from_csv(conn):
    # Determine the path for student_data_to_import.csv
    possible_paths = [
        "student_data_to_import.csv",
        "../student_data_to_import.csv",
        "../../student_data_to_import.csv",
        os.path.join(os.path.dirname(__file__), "../../../student_data_to_import.csv"),
        os.path.join(os.path.dirname(__file__), "../../student_data_to_import.csv"),
        os.path.join(os.path.dirname(__file__), "../student_data_to_import.csv"),
    ]
    
    csv_path = None
    for p in possible_paths:
        abs_p = os.path.abspath(p)
        if os.path.exists(abs_p):
            csv_path = abs_p
            break
            
    if not csv_path:
        fallback = "C:\\Users\\vishal6385\\Desktop\\mz gd ai\\student_data_to_import.csv"
        if os.path.exists(fallback):
            csv_path = fallback
            
    if not csv_path:
        logger.error("Could not find student_data_to_import.csv in any expected paths. Skipping sync.")
        return
        
    logger.info(f"Syncing students from CSV file: {csv_path}")
    
    try:
        with open(csv_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    except Exception as e:
        logger.error(f"Failed to read CSV file: {e}")
        return
        
    logger.info(f"Loaded {len(rows)} records from CSV.")
    
    for row in rows:
        spr_number = row.get("spr_number", "").strip() if row.get("spr_number") is not None else ""
        roll_number = row.get("roll_number", "").strip() if row.get("roll_number") is not None else ""
        name = row.get("name", "").strip() if row.get("name") is not None else ""
        college_email = row.get("college_email", "").strip() if row.get("college_email") is not None else ""
        dept_val = row.get("department_id", "IT").strip() if row.get("department_id") is not None else "IT"
        year_val = row.get("year_id", "3 YEAR").strip() if row.get("year_id") is not None else "3 YEAR"
        sec_val = row.get("section_id", "SECTION A").strip() if row.get("section_id") is not None else "SECTION A"
        
        if not spr_number or not roll_number or not name:
            logger.warning(f"Skipping incomplete row: {row}")
            continue
            
        # 1. Resolve department
        dept_code = dept_val.upper()
        dept_name = "Information Technology" if dept_code == "IT" else dept_val
        dept_id = await conn.fetchval("SELECT id FROM departments WHERE code = $1", dept_code)
        if not dept_id:
            dept_id = str(uuid.uuid4())
            await conn.execute(
                "INSERT INTO departments (id, name, code, status) VALUES ($1, $2, $3, 'Active')",
                dept_id, dept_name, dept_code
            )
            
        # 2. Resolve year
        year_level = parse_year_level(year_val)
        year_id = await conn.fetchval("SELECT id FROM years WHERE department_id = $1 AND year_level = $2", dept_id, year_level)
        if not year_id:
            year_id = str(uuid.uuid4())
            await conn.execute(
                "INSERT INTO years (id, department_id, year_level) VALUES ($1, $2, $3)",
                year_id, dept_id, year_level
            )
            
        # 3. Resolve section
        sec_name = sec_val.strip()
        if sec_name.upper().startswith("SECTION "):
            sec_name = "Section " + sec_name[8:].strip().upper()
        sec_id = await conn.fetchval("SELECT id FROM sections WHERE year_id = $1 AND name = $2", year_id, sec_name)
        if not sec_id:
            sec_id = str(uuid.uuid4())
            await conn.execute(
                "INSERT INTO sections (id, year_id, name) VALUES ($1, $2, $3)",
                sec_id, year_id, sec_name
            )
            
        # 4. Hash password (spr_number is the login password)
        password_hash = hash_password(spr_number)
        
        # 5. Check if student exists by roll number
        student_id = await conn.fetchval("SELECT id FROM students WHERE roll_number = $1", roll_number)
        
        if student_id:
            # Update existing student details
            await conn.execute(
                """
                UPDATE students 
                SET spr_number = $1, name = $2, college_email = $3, password_hash = $4,
                    department_id = $5, year_id = $6, section_id = $7, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
                """,
                spr_number, name, college_email, password_hash, dept_id, year_id, sec_id, student_id
            )
        else:
            # Insert new student
            student_id = str(uuid.uuid4())
            await conn.execute(
                """
                INSERT INTO students (
                    id, roll_number, spr_number, name, college_email, password_hash, 
                    department_id, year_id, section_id, status, first_login
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', 1)
                """,
                student_id, roll_number, spr_number, name, college_email, password_hash, dept_id, year_id, sec_id
            )
            
        # 6. Ensure gamification table record exists
        gamification_id = await conn.fetchval("SELECT id FROM gamification WHERE student_id = $1", student_id)
        if not gamification_id:
            await conn.execute(
                """
                INSERT INTO gamification (id, student_id, xp, current_level, daily_streak, badges)
                VALUES ($1, $2, 0, 1, 0, '[]')
                """,
                str(uuid.uuid4()), student_id
            )
            
    logger.info("Student CSV sync completed successfully.")
