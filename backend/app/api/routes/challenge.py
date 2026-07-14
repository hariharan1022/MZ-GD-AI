from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.dependencies import get_current_student
from app.db.connection import get_db
from asyncpg import Connection
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2:0.5b"

LEVELS = [
    {"level": 1, "min_xp": 0, "max_xp": 99},
    {"level": 2, "min_xp": 100, "max_xp": 299},
    {"level": 3, "min_xp": 300, "max_xp": 599},
    {"level": 4, "min_xp": 600, "max_xp": 999},
    {"level": 5, "min_xp": 1000, "max_xp": 1499},
    {"level": 6, "min_xp": 1500, "max_xp": 2099},
    {"level": 7, "min_xp": 2100, "max_xp": 2799},
    {"level": 8, "min_xp": 2800, "max_xp": 3599},
    {"level": 9, "min_xp": 3600, "max_xp": 4499},
    {"level": 10, "min_xp": 4500, "max_xp": 99999},
]

def calc_level(xp: int):
    for lvl in reversed(LEVELS):
        if xp >= lvl["min_xp"]:
            return lvl["level"]
    return 1

class AnalyzeRequest(BaseModel):
    text: str
    topic: str

ANALYSIS_PROMPT = """You are an AI communication coach evaluating a student's speech. Analyze their response thoroughly and provide detailed feedback.

Topic: {topic}
Student's speech: "{text}"

Return your analysis in this EXACT format (no markdown, just plain text). Be specific and constructive:

Fluency: [score 0-100]/100
Grammar: [score 0-100]/100
Vocabulary: [score 0-100]/100
Confidence: [score 0-100]/100
XP_Earned: [number 1-50 based on speech length and quality]
Streak_Days: [number 1-7]
Feedback: [2-3 sentence summary of overall performance with strengths and areas to improve]
Grammar_Issues: [list specific grammar mistakes found in the speech, e.g. "You used 'goes' instead of 'went' in past tense" or "None found"]
Vocabulary_Suggestions: [suggest 1-2 better words or phrases the student could have used, or "None"]
Strengths: [list 1-2 specific things the student did well]
Improvement_Tips: [1-2 specific actionable tips the student can practice]
Corrected_Version: [rewrite the student's speech fixing grammar errors while keeping their ideas]"""

@router.post("/challenge/analyze")
async def analyze_challenge(req: AnalyzeRequest, current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    prompt = ANALYSIS_PROMPT.format(topic=req.topic, text=req.text)
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.3, "max_tokens": 300}
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Ollama API error")
        data = resp.json()
        raw = data.get("response", "").strip()

    result = {
        "fluency": 75, "grammar": 70, "vocabulary": 70, "confidence": 70,
        "xp_earned": 30, "streak_days": 1,
        "feedback": "Good effort! Try to structure your points more clearly with an introduction, body, and conclusion."
    }

    for line in raw.split("\n"):
        line = line.strip()
        if line.startswith("Fluency:"):
            try:
                result["fluency"] = int(''.join(c for c in line.split(":")[1] if c.isdigit() or c == '/').split("/")[0])
            except:
                pass
        elif line.startswith("Grammar:"):
            try:
                result["grammar"] = int(''.join(c for c in line.split(":")[1] if c.isdigit() or c == '/').split("/")[0])
            except:
                pass
        elif line.startswith("Vocabulary:"):
            try:
                result["vocabulary"] = int(''.join(c for c in line.split(":")[1] if c.isdigit() or c == '/').split("/")[0])
            except:
                pass
        elif line.startswith("Confidence:"):
            try:
                result["confidence"] = int(''.join(c for c in line.split(":")[1] if c.isdigit() or c == '/').split("/")[0])
            except:
                pass
        elif line.startswith("XP_Earned:"):
            try:
                result["xp_earned"] = int(''.join(c for c in line.split(":")[1] if c.isdigit()))
            except:
                pass
        elif line.startswith("Streak_Days:"):
            try:
                result["streak_days"] = int(''.join(c for c in line.split(":")[1] if c.isdigit()))
            except:
                pass
        elif line.startswith("Feedback:"):
            result["feedback"] = line.split(":", 1)[1].strip()

    student_id = current_student["id"]
    xp_earned = result["xp_earned"]

    existing = await conn.fetchrow("SELECT xp, current_level FROM gamification WHERE student_id = $1", student_id)
    if existing:
        new_xp = existing["xp"] + xp_earned
        new_level = calc_level(new_xp)
        await conn.execute(
            "UPDATE gamification SET xp = $1, current_level = $2, updated_at = datetime('now') WHERE student_id = $3",
            new_xp, new_level, student_id
        )
    else:
        new_level = calc_level(xp_earned)
        await conn.execute(
            "INSERT INTO gamification (id, student_id, xp, current_level) VALUES ($1, $2, $3, $4)",
            str(uuid.uuid4()), student_id, xp_earned, new_level
        )
        new_xp = xp_earned

    result["total_xp"] = new_xp
    result["level"] = new_level

    return result

import uuid
