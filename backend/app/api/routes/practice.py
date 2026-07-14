from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2:0.5b"

class StartPracticeRequest(BaseModel):
    topic: str

class ChatRequest(BaseModel):
    topic: str
    message: str
    history: list[dict] = []

SYSTEM_PROMPT = """You are a friendly AI moderator for a group discussion practice session. Your role:
- Ask engaging follow-up questions to help the student improve their communication skills
- Give brief, constructive feedback on their points
- Keep the conversation flowing naturally
- Be encouraging and supportive
- Responses should be 2-3 sentences max"""

@router.post("/practice/start")
async def start_practice(req: StartPracticeRequest):
    prompt = f"{SYSTEM_PROMPT}\n\nThe student wants to practice discussing: '{req.topic}'\n\nStart the practice session with a welcoming message and an initial prompt related to the topic."
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7, "max_tokens": 150}
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Ollama API error")
        data = resp.json()
        return {"response": data.get("response", "").strip()}

@router.post("/practice/chat")
async def practice_chat(req: ChatRequest):
    history_text = ""
    for msg in req.history:
        role = "Student" if msg["role"] == "student" else "AI Moderator"
        history_text += f"{role}: {msg['text']}\n"

    prompt = f"{SYSTEM_PROMPT}\n\nTopic: {req.topic}\n\nDiscussion history:\n{history_text}Student: {req.message}\n\nAI Moderator:"

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7, "max_tokens": 150}
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Ollama API error")
        data = resp.json()
        return {"response": data.get("response", "").strip()}
