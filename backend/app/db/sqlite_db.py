import aiosqlite
import uuid
import json
import re
from datetime import datetime, date, time, timedelta
from typing import Optional, Any
from app.core.security import hash_password

DB_PATH = "C:\\Users\\vishal6385\\AppData\\Local\\Temp\\mz_gd_ai.db"


class SQLiteConnection:
    def __init__(self, conn):
        self._conn = conn

    async def fetchrow(self, query: str, *args):
        query = re.sub(r'\$(\d+)', '?', query)
        cursor = await self._conn.execute(query, args)
        row = await cursor.fetchone()
        if row:
            columns = [d[0] for d in cursor.description]
            return dict(zip(columns, row))
        return None

    async def fetch(self, query: str, *args):
        query = re.sub(r'\$(\d+)', '?', query)
        cursor = await self._conn.execute(query, args)
        rows = await cursor.fetchall()
        columns = [d[0] for d in cursor.description]
        return [dict(zip(columns, row)) for row in rows]

    async def execute(self, query: str, *args):
        query = re.sub(r'\$(\d+)', '?', query)
        cursor = await self._conn.execute(query, args)
        await self._conn.commit()
        return cursor

    async def fetchval(self, query: str, *args):
        query = re.sub(r'\$(\d+)', '?', query)
        cursor = await self._conn.execute(query, args)
        row = await cursor.fetchone()
        return row[0] if row else None


class SQLitePool:
    def __init__(self):
        self._conn: Optional[aiosqlite.Connection] = None

    async def connect(self):
        self._conn = await aiosqlite.connect(DB_PATH)
        self._conn.row_factory = aiosqlite.Row
        await self._conn.execute("PRAGMA journal_mode=WAL")
        await self._conn.execute("PRAGMA foreign_keys=OFF")
        await self._create_tables()
        await self._seed_data()

    async def _create_tables(self):
        schema = """
        CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL UNIQUE,
            hod TEXT, status TEXT DEFAULT 'Active',
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS years (
            id TEXT PRIMARY KEY, department_id TEXT NOT NULL REFERENCES departments(id),
            year_level INTEGER NOT NULL CHECK (year_level >= 1 AND year_level <= 5),
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(department_id, year_level)
        );
        CREATE TABLE IF NOT EXISTS sections (
            id TEXT PRIMARY KEY, year_id TEXT NOT NULL REFERENCES sections(id),
            name TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(year_id, name)
        );
        CREATE TABLE IF NOT EXISTS admins (
            id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
            name TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY, roll_number TEXT NOT NULL UNIQUE, spr_number TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL, college_email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
            department_id TEXT NOT NULL, year_id TEXT NOT NULL, section_id TEXT NOT NULL,
            status TEXT DEFAULT 'ACTIVE', first_login INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS discussion_sessions (
            id TEXT PRIMARY KEY, admin_id TEXT NOT NULL, department_id TEXT NOT NULL,
            year_id TEXT NOT NULL, section_id TEXT NOT NULL, group_size INTEGER NOT NULL,
            discussion_date TEXT NOT NULL, discussion_time TEXT NOT NULL,
            preparation_time_minutes INTEGER DEFAULT 2, discussion_duration_minutes INTEGER DEFAULT 10,
            status TEXT DEFAULT 'SCHEDULED',
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS discussion_topics (
            id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
            category TEXT, is_custom INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS discussion_groups (
            id TEXT PRIMARY KEY, session_id TEXT NOT NULL, topic_id TEXT,
            group_number INTEGER NOT NULL, room_name TEXT NOT NULL UNIQUE,
            status TEXT DEFAULT 'WAITING', started_at TEXT, completed_at TEXT,
            created_at TEXT DEFAULT (datetime('now')), UNIQUE(session_id, group_number)
        );
        CREATE TABLE IF NOT EXISTS group_members (
            id TEXT PRIMARY KEY, group_id TEXT NOT NULL, student_id TEXT NOT NULL,
            joined_at TEXT, is_online INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(group_id, student_id)
        );
        CREATE TABLE IF NOT EXISTS login_history (
            id TEXT PRIMARY KEY, student_id TEXT, admin_id TEXT, ip_address TEXT,
            user_agent TEXT, login_time TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS student_scores (
            id TEXT PRIMARY KEY, group_id TEXT NOT NULL, student_id TEXT NOT NULL,
            grammar_score REAL NOT NULL, pronunciation_score REAL NOT NULL,
            fluency_score REAL NOT NULL, vocabulary_score REAL NOT NULL,
            confidence_score REAL NOT NULL, participation_score REAL NOT NULL,
            leadership_score REAL NOT NULL, listening_score REAL NOT NULL,
            overall_score REAL NOT NULL, created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(group_id, student_id)
        );
        CREATE TABLE IF NOT EXISTS feedback_reports (
            id TEXT PRIMARY KEY, score_id TEXT NOT NULL, student_id TEXT NOT NULL,
            strengths TEXT NOT NULL, weaknesses TEXT NOT NULL, suggestions TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')), UNIQUE(score_id)
        );
        CREATE TABLE IF NOT EXISTS gamification (
            id TEXT PRIMARY KEY, student_id TEXT NOT NULL UNIQUE,
            xp INTEGER DEFAULT 0, current_level INTEGER DEFAULT 1,
            daily_streak INTEGER DEFAULT 0, last_practice_date TEXT,
            badges TEXT DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS rankings (
            id TEXT PRIMARY KEY, session_id TEXT NOT NULL, student_id TEXT NOT NULL,
            overall_rank INTEGER, department_rank INTEGER, year_rank INTEGER,
            section_rank INTEGER, group_rank INTEGER, badge TEXT,
            created_at TEXT DEFAULT (datetime('now')), UNIQUE(session_id, student_id)
        );
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY, student_id TEXT NOT NULL, title TEXT NOT NULL,
            message TEXT NOT NULL, is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS discussion_transcripts (
            id TEXT PRIMARY KEY, group_id TEXT NOT NULL, student_id TEXT NOT NULL,
            start_time REAL NOT NULL, end_time REAL NOT NULL, spoken_text TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS speaker_logs (
            id TEXT PRIMARY KEY, group_id TEXT NOT NULL, student_id TEXT NOT NULL,
            start_time REAL NOT NULL, end_time REAL NOT NULL, duration REAL NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY, admin_id TEXT, action TEXT NOT NULL, details TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        """
        for statement in schema.split(';'):
            stmt = statement.strip()
            if stmt:
                await self._conn.execute(stmt)
        await self._conn.commit()

    async def _seed_data(self):
        cursor = await self._conn.execute("SELECT COUNT(*) FROM admins")
        count = (await cursor.fetchone())[0]
        if count > 0:
            return

        admin_pw = hash_password("admin123")
        student_pw = hash_password("MZCET")

        admin_id = str(uuid.uuid4())
        dept_id = str(uuid.uuid4())
        year_id = str(uuid.uuid4())
        section_id = str(uuid.uuid4())
        student_id = str(uuid.uuid4())

        await self._conn.execute(
            "INSERT INTO admins (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
            (admin_id, "admin@mz.com", admin_pw, "System Admin")
        )
        await self._conn.execute(
            "INSERT INTO departments (id, name, code, hod) VALUES (?, ?, ?, ?)",
            (dept_id, "Information Technology", "IT", "Dr. John Doe")
        )
        await self._conn.execute(
            "INSERT INTO years (id, department_id, year_level) VALUES (?, ?, ?)",
            (year_id, dept_id, 3)
        )
        await self._conn.execute(
            "INSERT INTO sections (id, year_id, name) VALUES (?, ?, ?)",
            (section_id, year_id, "Section A")
        )
        await self._conn.execute(
            "INSERT INTO students (id, roll_number, spr_number, name, college_email, password_hash, department_id, year_id, section_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (student_id, "911724205019", "SPR911724205019", "HARIHARAN S", "hariharan9665@mountzion.ac.in", student_pw, dept_id, year_id, section_id)
        )

        more_students = [
            ("PRIYA K", "911724205020", "SPR911724205020", "priya@mountzion.ac.in"),
            ("RAHUL M", "911724205021", "SPR911724205021", "rahul@mountzion.ac.in"),
            ("ANITHA R", "911724205022", "SPR911724205022", "anitha@mountzion.ac.in"),
            ("VIGNESH S", "911724205023", "SPR911724205023", "vignesh@mountzion.ac.in"),
            ("DEEPIKA L", "911724205024", "SPR911724205024", "deepika@mountzion.ac.in"),
        ]
        for name, roll, spr, email in more_students:
            sid = str(uuid.uuid4())
            await self._conn.execute(
                "INSERT INTO students (id, roll_number, spr_number, name, college_email, password_hash, department_id, year_id, section_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (sid, roll, spr, name, email, student_pw, dept_id, year_id, section_id)
            )
            await self._conn.execute(
                "INSERT INTO gamification (id, student_id, xp, current_level, daily_streak, badges) VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), sid, 500, 1, 0, "[]")
            )

        topic_data = [
            ("Impact of AI on Modern Education", "Discuss how AI is transforming classrooms, assessments, and personalized learning.", "Technology"),
            ("Remote Work vs Office Work", "Compare the pros and cons of working from home versus working in an office.", "Lifestyle"),
            ("Climate Change and Individual Action", "What can individuals do to combat climate change in their daily lives?", "Environment"),
            ("Social Media and Mental Health", "Analyze the positive and negative effects of social media on mental wellbeing.", "Society"),
            ("The Role of Youth in Nation Building", "How can young people contribute to the development of their country?", "Society"),
            ("Should College Education Be Free?", "Debate the merits and drawbacks of making higher education free for all.", "Education"),
            ("Technology Addiction in Students", "Discuss the impact of smartphone and social media addiction on student life.", "Technology"),
            ("Women in Leadership Roles", "Examine the importance of gender diversity in leadership positions.", "Society"),
        ]
        for title, desc, cat in topic_data:
            await self._conn.execute(
                "INSERT INTO discussion_topics (id, title, description, category) VALUES (?, ?, ?, ?)",
                (str(uuid.uuid4()), title, desc, cat)
            )

        await self._conn.execute(
            "INSERT INTO gamification (id, student_id, xp, current_level, daily_streak, badges) VALUES (?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), student_id, 1500, 3, 5, json.dumps(["Best Speaker", "Super Active"]))
        )
        await self._conn.commit()

    async def acquire(self):
        if self._conn is None:
            await self.connect()
        return SQLiteConnection(self._conn)

    async def close(self):
        if self._conn:
            await self._conn.close()
            self._conn = None
