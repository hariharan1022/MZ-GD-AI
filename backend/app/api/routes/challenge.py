from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2:0.5b"

class AnalyzeRequest(BaseModel):
    text: str
    topic: str

ANALYSIS_PROMPT = """You are an AI communication coach evaluating a student's speech. Analyze their response and provide scores (0-100) and feedback.

Topic: {topic}
Student's speech: {text}

Return your analysis in this EXACT format (no markdown, just plain text):
Fluency: [score]/100
Grammar: [score]/100
Vocabulary: [score]/100
Confidence: [score]/100
XP_Earned: [number]
Feedback: [2-3 sentence constructive feedback with specific strengths and areas to improve]
Streak_Days: [number]"""

@router.post("/challenge/analyze")
async def analyze_challenge(req: AnalyzeRequest):
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

    return result
