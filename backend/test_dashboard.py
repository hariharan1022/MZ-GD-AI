import asyncio
import logging
import sys
from app.db.connection import db
from app.api.routes.student import get_student_dashboard

logging.basicConfig(level=logging.INFO)

async def test():
    # 1. Connect to DB
    await db.connect()
    if not db.sqlite_pool:
        print("Database not connected to SQLite. Exiting.")
        return
        
    conn = await db.sqlite_pool.acquire()
    try:
        # Get a student from the DB
        student = await conn.fetchrow("SELECT id FROM students LIMIT 1")
        if not student:
            print("No students in database!")
            return
            
        student_id = student["id"]
        print(f"Testing dashboard for student ID: {student_id}")
        
        current_student = {"id": student_id, "department_id": "", "year_id": "", "section_id": ""}
        
        # We call get_student_dashboard
        res = await get_student_dashboard(current_student=current_student, conn=conn)
        print("SUCCESS! Dashboard response:")
        import json
        print(json.dumps(res, indent=2))
        
    except Exception as e:
        print("ERROR OCCURRED:", file=sys.stderr)
        import traceback
        traceback.print_exc()
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(test())
