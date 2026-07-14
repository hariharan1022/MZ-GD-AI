import asyncio
from app.db.connection import db
from app.core.security import hash_password
import json
from datetime import date, time, datetime, timedelta

async def seed_data():
    try:
        await db.connect()
        async with db.pool.acquire() as conn:
            print("Connected to database. Starting seeding...")

            # 1. Insert Admins
            admin_pw_hash = hash_password("admin123")
            admin_id = await conn.fetchval("""
                INSERT INTO admins (email, password_hash, name)
                VALUES ('admin@mz.com', $1, 'System Admin')
                ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
                RETURNING id;
            """, admin_pw_hash)
            print(f"Admin seeded with ID: {admin_id}")

            # 2. Insert Departments
            dept_id = await conn.fetchval("""
                INSERT INTO departments (name, code, hod, status)
                VALUES ('Information Technology', 'IT', 'Dr. John Doe', 'Active')
                ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code
                RETURNING id;
            """)
            print(f"Department IT seeded with ID: {dept_id}")

            # 3. Insert Years
            year_id = await conn.fetchval("""
                INSERT INTO years (department_id, year_level)
                VALUES ($1, 3)
                ON CONFLICT (department_id, year_level) DO UPDATE SET year_level = EXCLUDED.year_level
                RETURNING id;
            """, dept_id)
            print(f"Year 3 seeded with ID: {year_id}")

            # 4. Insert Sections
            section_id = await conn.fetchval("""
                INSERT INTO sections (year_id, name)
                VALUES ($1, 'Section A')
                ON CONFLICT (year_id, name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id;
            """, year_id)
            print(f"Section A seeded with ID: {section_id}")

            # 5. Insert Student
            student_pw_hash = hash_password("password123")
            student_id = await conn.fetchval("""
                INSERT INTO students (roll_number, spr_number, name, college_email, password_hash, department_id, year_id, section_id, status)
                VALUES ('911724205019', 'SPR911724205019', 'HARIHARAN S', 'hariharan9665@mountzion.ac.in', $1, $2, $3, $4, 'ACTIVE')
                ON CONFLICT (roll_number) DO UPDATE SET password_hash = EXCLUDED.password_hash
                RETURNING id;
            """, student_pw_hash, dept_id, year_id, section_id)
            print(f"Student Hariharan S seeded with ID: {student_id}")

            # 6. Insert Gamification stats
            badges_json = json.dumps(["Best Speaker", "Super Active"])
            await conn.execute("""
                INSERT INTO gamification (student_id, xp, current_level, daily_streak, badges)
                VALUES ($1, 1500, 3, 5, $2::jsonb)
                ON CONFLICT (student_id) DO UPDATE SET xp = EXCLUDED.xp, current_level = EXCLUDED.current_level, daily_streak = EXCLUDED.daily_streak, badges = EXCLUDED.badges;
            """, student_id, badges_json)
            print("Gamification stats seeded successfully.")

            # 7. Insert Discussion Topics
            topic_1 = await conn.fetchval("""
                INSERT INTO discussion_topics (title, description, category, is_custom)
                VALUES ('The Future of AI', 'Discuss the impact of generative artificial intelligence on software engineering careers.', 'Technology', FALSE)
                RETURNING id;
            """)
            topic_2 = await conn.fetchval("""
                INSERT INTO discussion_topics (title, description, category, is_custom)
                VALUES ('Renewable Energy Tech', 'Analyze the viability of solar and wind power in industrial regions.', 'Environment', FALSE)
                RETURNING id;
            """)
            topic_3 = await conn.fetchval("""
                INSERT INTO discussion_topics (title, description, category, is_custom)
                VALUES ('Cloud Computing Models', 'Evaluate the differences between hybrid cloud and multi-cloud strategies.', 'Infrastructure', FALSE)
                RETURNING id;
            """)
            print("Discussion topics seeded.")

            # 8. Insert Discussion Sessions
            today = date.today()
            t_time = time(10, 0, 0)
            
            session_1 = await conn.fetchval("""
                INSERT INTO discussion_sessions (admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, status)
                VALUES ($1, $2, $3, $4, 4, $5, $6, 'COMPLETED')
                RETURNING id;
            """, admin_id, dept_id, year_id, section_id, today - timedelta(days=5), t_time)

            session_2 = await conn.fetchval("""
                INSERT INTO discussion_sessions (admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, status)
                VALUES ($1, $2, $3, $4, 4, $5, $6, 'COMPLETED')
                RETURNING id;
            """, admin_id, dept_id, year_id, section_id, today - timedelta(days=2), t_time)

            session_3 = await conn.fetchval("""
                INSERT INTO discussion_sessions (admin_id, department_id, year_id, section_id, group_size, discussion_date, discussion_time, status)
                VALUES ($1, $2, $3, $4, 4, $5, $6, 'SCHEDULED')
                RETURNING id;
            """, admin_id, dept_id, year_id, section_id, today + timedelta(days=1), t_time)
            print("Discussion sessions seeded.")

            # 9. Insert Discussion Groups
            group_1 = await conn.fetchval("""
                INSERT INTO discussion_groups (session_id, topic_id, group_number, room_name, status)
                VALUES ($1, $2, 1, 'Room-A101', 'COMPLETED')
                ON CONFLICT (session_id, group_number) DO UPDATE SET topic_id = EXCLUDED.topic_id
                RETURNING id;
            """, session_1, topic_3)

            group_2 = await conn.fetchval("""
                INSERT INTO discussion_groups (session_id, topic_id, group_number, room_name, status)
                VALUES ($1, $2, 1, 'Room-A102', 'COMPLETED')
                ON CONFLICT (session_id, group_number) DO UPDATE SET topic_id = EXCLUDED.topic_id
                RETURNING id;
            """, session_2, topic_2)

            group_3 = await conn.fetchval("""
                INSERT INTO discussion_groups (session_id, topic_id, group_number, room_name, status)
                VALUES ($1, $2, 1, 'Room-A103', 'WAITING')
                ON CONFLICT (session_id, group_number) DO UPDATE SET topic_id = EXCLUDED.topic_id
                RETURNING id;
            """, session_3, topic_1)
            print("Discussion groups seeded.")

            # 10. Insert Group Members
            await conn.execute("""
                INSERT INTO group_members (group_id, student_id, joined_at, is_online)
                VALUES ($1, $2, NOW(), FALSE)
                ON CONFLICT (group_id, student_id) DO NOTHING;
            """, group_1, student_id)
            
            await conn.execute("""
                INSERT INTO group_members (group_id, student_id, joined_at, is_online)
                VALUES ($1, $2, NOW(), FALSE)
                ON CONFLICT (group_id, student_id) DO NOTHING;
            """, group_2, student_id)

            await conn.execute("""
                INSERT INTO group_members (group_id, student_id, joined_at, is_online)
                VALUES ($1, $2, NOW(), TRUE)
                ON CONFLICT (group_id, student_id) DO NOTHING;
            """, group_3, student_id)
            print("Group members seeded.")

            # 11. Insert Student Scores
            score_1 = await conn.fetchval("""
                INSERT INTO student_scores (group_id, student_id, grammar_score, pronunciation_score, fluency_score, vocabulary_score, confidence_score, participation_score, leadership_score, listening_score, overall_score)
                VALUES ($1, $2, 85, 80, 88, 82, 90, 85, 80, 85, 85)
                ON CONFLICT (group_id, student_id) DO UPDATE SET overall_score = EXCLUDED.overall_score
                RETURNING id;
            """, group_1, student_id)

            score_2 = await conn.fetchval("""
                INSERT INTO student_scores (group_id, student_id, grammar_score, pronunciation_score, fluency_score, vocabulary_score, confidence_score, participation_score, leadership_score, listening_score, overall_score)
                VALUES ($1, $2, 90, 85, 92, 88, 95, 90, 85, 90, 90)
                ON CONFLICT (group_id, student_id) DO UPDATE SET overall_score = EXCLUDED.overall_score
                RETURNING id;
            """, group_2, student_id)
            print("Student scores seeded.")

            # 12. Insert Feedback Reports
            await conn.execute("""
                INSERT INTO feedback_reports (score_id, student_id, strengths, weaknesses, suggestions)
                VALUES ($1, $2, 'Excellent technical vocabulary and confidence during cloud infrastructure comparisons.', 'Try working on sentence pauses when switching points.', 'Practice reading summaries out loud to smooth transitions.')
                ON CONFLICT (score_id) DO NOTHING;
            """, score_1, student_id)

            await conn.execute("""
                INSERT INTO feedback_reports (score_id, student_id, strengths, weaknesses, suggestions)
                VALUES ($1, $2, 'Incredible fluency and overall leadership in directing the discussion group.', 'A few minor subject-verb agreement errors.', 'Review agreement rules for complex plural forms.')
                ON CONFLICT (score_id) DO NOTHING;
            """, score_2, student_id)
            print("Feedback reports seeded.")

            print("\nDatabase seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_data())
