import asyncio
import httpx
import aiosqlite
from app.core.security import create_access_token

async def test():
    # 1. Look up student in database
    conn = await aiosqlite.connect("C:\\Users\\vishal6385\\AppData\\Local\\Temp\\mz_gd_ai.db")
    conn.row_factory = aiosqlite.Row
    cursor = await conn.execute("SELECT * FROM students WHERE roll_number = '911724205019'")
    student = await cursor.fetchone()
    await conn.close()
    
    if not student:
        print("Student 911724205019 not found in DB!")
        return
        
    student = dict(student)
    print(f"Found student in DB: {student['name']}, ID: {student['id']}")
    
    # 2. Make JWT token
    token = create_access_token(data={
        "sub": str(student["id"]), 
        "role": "student", 
        "first_login": student["first_login"],
        "department_id": str(student["department_id"]),
        "year_id": str(student["year_id"]),
        "section_id": str(student["section_id"])
    })
    print(f"Generated Token: {token[:30]}...")

    # 3. Call local API endpoint
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = await client.get("http://localhost:8003/api/student/dashboard", headers=headers)
            print(f"HTTP Status: {resp.status_code}")
            print(f"Response: {resp.text}")
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())
