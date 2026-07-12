-- Supabase PostgreSQL Schema for AI Group Discussion Platform
-- Execute this in the Supabase SQL Editor

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Years
CREATE TABLE IF NOT EXISTS years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    year_level INTEGER NOT NULL CHECK (year_level >= 1 AND year_level <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, year_level)
);

-- 3. Sections
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_id UUID NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year_id, name)
);

-- 4. Admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Students
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(100) NOT NULL UNIQUE,
    spr_number VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    college_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    year_id UUID NOT NULL REFERENCES years(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast student lookup
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_spr_number ON students(spr_number);
CREATE INDEX idx_students_section ON students(section_id);

-- 6. Discussion Sessions (Created by Admin)
CREATE TABLE IF NOT EXISTS discussion_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    year_id UUID NOT NULL REFERENCES years(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    group_size INTEGER NOT NULL CHECK (group_size IN (4, 5)),
    discussion_date DATE NOT NULL,
    discussion_time TIME NOT NULL,
    preparation_time_minutes INTEGER DEFAULT 2,
    discussion_duration_minutes INTEGER DEFAULT 10,
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Discussion Topics (Custom topics uploaded by admin or AI generated history)
CREATE TABLE IF NOT EXISTS discussion_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Discussion Groups
CREATE TABLE IF NOT EXISTS discussion_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES discussion_sessions(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES discussion_topics(id), -- Assigned topic
    group_number INTEGER NOT NULL,
    room_name VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'PREPARING', 'DISCUSSING', 'COMPLETED')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, group_number)
);

-- 9. Group Members
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES discussion_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, student_id)
);

-- 10. Discussion Transcripts
CREATE TABLE IF NOT EXISTS discussion_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES discussion_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    start_time NUMERIC(10, 3) NOT NULL, -- Relative to discussion start in seconds
    end_time NUMERIC(10, 3) NOT NULL,
    spoken_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Speaker Logs (Raw Voice Activity from pyannote)
CREATE TABLE IF NOT EXISTS speaker_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES discussion_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    start_time NUMERIC(10, 3) NOT NULL,
    end_time NUMERIC(10, 3) NOT NULL,
    duration NUMERIC(10, 3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Student Scores (AI Evaluated)
CREATE TABLE IF NOT EXISTS student_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES discussion_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    grammar_score NUMERIC(5, 2) NOT NULL CHECK (grammar_score >= 0 AND grammar_score <= 100),
    pronunciation_score NUMERIC(5, 2) NOT NULL CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
    fluency_score NUMERIC(5, 2) NOT NULL CHECK (fluency_score >= 0 AND fluency_score <= 100),
    vocabulary_score NUMERIC(5, 2) NOT NULL CHECK (vocabulary_score >= 0 AND vocabulary_score <= 100),
    confidence_score NUMERIC(5, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    participation_score NUMERIC(5, 2) NOT NULL CHECK (participation_score >= 0 AND participation_score <= 100),
    leadership_score NUMERIC(5, 2) NOT NULL CHECK (leadership_score >= 0 AND leadership_score <= 100),
    listening_score NUMERIC(5, 2) NOT NULL CHECK (listening_score >= 0 AND listening_score <= 100),
    overall_score NUMERIC(5, 2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, student_id)
);

-- 13. Feedback Reports (AI Generated)
CREATE TABLE IF NOT EXISTS feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score_id UUID NOT NULL REFERENCES student_scores(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    strengths TEXT NOT NULL,      -- Stored as JSON/Array or Markdown
    weaknesses TEXT NOT NULL,     -- Stored as JSON/Array or Markdown
    suggestions TEXT NOT NULL,    -- Stored as JSON/Array or Markdown
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(score_id)
);

-- 14. Rankings
CREATE TABLE IF NOT EXISTS rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES discussion_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    overall_rank INTEGER,
    department_rank INTEGER,
    year_rank INTEGER,
    section_rank INTEGER,
    group_rank INTEGER,
    badge VARCHAR(100), -- E.g. 'Best Speaker', 'Most Improved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Login History
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (student_id IS NOT NULL OR admin_id IS NOT NULL)
);

-- 17. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_department_modtime BEFORE UPDATE ON departments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_admin_modtime BEFORE UPDATE ON admins FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_student_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_session_modtime BEFORE UPDATE ON discussion_sessions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
