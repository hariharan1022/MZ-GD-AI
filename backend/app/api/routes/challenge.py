from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.dependencies import get_current_student
from app.db.connection import get_db
from asyncpg import Connection
import httpx
import logging
import uuid
import re

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

async def call_ollama(prompt: str, max_tokens: int = 300, timeout: int = 90) -> str:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.3, "max_tokens": max_tokens}
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Ollama API error")
        return resp.json().get("response", "").strip()

SCORE_PROMPT = """Rate this speech 0-100 and give feedback.

Speech: "{text}"
Topic: {topic}

Fluency: [0-100]
Grammar: [0-100]
Vocabulary: [0-100]
Confidence: [0-100]
XP_Earned: [1-50]
Streak_Days: [1-7]
Feedback: [2-3 sentences]"""

def extract_int(raw: str, prefix: str, default: int) -> int:
    for line in raw.split("\n"):
        if line.strip().lower().startswith(prefix.lower() + ":"):
            m = re.search(r'(\d+)', line.split(":", 1)[1])
            if m:
                return min(100, max(0, int(m.group(1))))
    return default

def extract_str(raw: str, prefix: str, default: str = "") -> str:
    for line in raw.split("\n"):
        if line.strip().lower().startswith(prefix.lower() + ":"):
            val = line.split(":", 1)[1].strip()
            if val:
                return val
    return default

COMMON_IRREGULAR = {
    "done": ("did", "past tense of 'do'"),
    "went": ("gone", "past participle of 'go'"),
    "goed": ("went", "past tense of 'go'"),
    "seed": ("saw", "past tense of 'see'"),
    "seen": ("saw", "past tense of 'see'"),
    "wented": ("went", "past tense of 'go'"),
    "buyed": ("bought", "past tense of 'buy'"),
    "thinked": ("thought", "past tense of 'think'"),
    "telled": ("told", "past tense of 'tell'"),
    "speaked": ("spoke", "past tense of 'speak'"),
    "knowed": ("knew", "past tense of 'know'"),
    "putted": ("put", "past tense of 'put'"),
}

GRAMMAR_MISTAKES = [
    (r'\bhe don\'?t\b', "'doesn't' instead of 'don't' with he/she/it"),
    (r'\bshe don\'?t\b', "'doesn't' instead of 'don't' with he/she/it"),
    (r'\bit don\'?t\b', "'doesn't' instead of 'don't' with it"),
    (r'\btheir is\b', "'there is' instead of 'their is'"),
    (r'\byour is\b', "'you're' or 'yours' instead of 'your is'"),
    (r'\bit\'?s is\b', "remove extra 'is' after 'it's'"),
    (r'\bpeoples\b', "'people' is already plural"),
    (r'\bchilds\b', "'children' is the plural of 'child'"),
    (r'\bmens\b', "'men' is already plural"),
    (r'\bwomens\b', "'women' is already plural"),
    (r'\bmore better\b', "use 'better' instead of 'more better'"),
    (r'\bmore bigger\b', "use 'bigger' instead of 'more bigger'"),
    (r'\bmore gooder\b', "use 'better' instead of 'more gooder'"),
    (r'\bcan able to\b', "use 'can' or 'is able to', not both"),
    (r'\bmuch more better\b', "use 'much better' instead"),
    (r'\bthe most best\b', "use 'best' instead of 'most best'"),
    (r'\bits a\b', "use 'it's a' with apostrophe"),
    (r'\bthis things\b', "'these things' for plural"),
    (r'\bthat things\b', "'those things' for plural"),
    (r'\bthis people\b', "'these people' for plural"),
    (r'\bhave went\b', "'have gone' instead of 'have went'"),
    (r'\bhas went\b', "'has gone' instead of 'has went'"),
    (r'\bhave did\b', "'have done' instead of 'have did'"),
    (r'\bhas did\b', "'has done' instead of 'has did'"),
    (r'\bhave saw\b', "'have seen' instead of 'have saw'"),
    (r'\bhas saw\b', "'has seen' instead of 'has saw'"),
    (r'\bhave came\b', "'have come' instead of 'have came'"),
    (r'\bhave ran\b', "'have run' instead of 'have ran'"),
    (r'\bhas ran\b', "'has run' instead of 'has ran'"),
    (r'\bhave wrote\b', "'have written' instead of 'have wrote'"),
    (r'\bhas wrote\b', "'has written' instead of 'has wrote'"),
    (r'\bhave spoke\b', "'have spoken' instead of 'have spoke'"),
    (r'\bhas spoke\b', "'has spoken' instead of 'has spoke'"),
    (r'\bhave broke\b', "'have broken' instead of 'have broke'"),
    (r'\bhas broke\b', "'has broken' instead of 'has broke'"),
    (r'\bhave took\b', "'have taken' instead of 'have took'"),
    (r'\bhas took\b', "'has taken' instead of 'has took'"),
    (r'\ba\s+[aeiou][a-z]*\b', "use 'an' instead of 'a' before vowel sounds"),
    (r'\ban\s+[^aeiou\s][a-z]*\b', "use 'a' instead of 'an' before consonant sounds"),
]

def find_grammar_issues(text: str) -> list:
    issues = []
    lower = text.lower()
    words = lower.split()
    for i, w in enumerate(words):
        clean = w.strip(".,!?;:'\"")
        if clean in COMMON_IRREGULAR:
            correction, reason = COMMON_IRREGULAR[clean]
            issues.append(f"Used '{clean}' instead of '{correction}' ({reason})")
    for pattern, msg in GRAMMAR_MISTAKES:
        if re.search(pattern, lower):
            issues.append(f"{msg} — found in your speech")
    if len(issues) > 5:
        issues = issues[:5]
    return issues

def check_strengths(text: str) -> list:
    strengths = []
    words = len(text.split())
    if words >= 30:
        strengths.append("Spoke at good length with detailed points")
    elif words >= 15:
        strengths.append("Expressed ideas clearly and concisely")
    else:
        strengths.append("Attempted to answer the topic")
    sentences = len(re.findall(r'[.!?]+', text))
    if sentences >= 3:
        strengths.append("Organized speech into multiple sentences")
    if re.search(r'\b(because|therefore|however|although|since|for example|such as)\b', text.lower()):
        strengths.append("Used connecting words to link ideas")
    has_opener = re.search(r'\b(i think|in my opinion|i believe|according to|from my perspective)\b', text.lower())
    has_closer = re.search(r'\b(in conclusion|to summarize|overall|finally|that\'?s why|so i)\b', text.lower())
    if has_opener:
        strengths.append("Good opening statement")
    if has_closer:
        strengths.append("Good concluding statement")
    return strengths[:3]

def check_vocabulary(text: str) -> list:
    suggestions = []
    basic_words = {
        "good": ("excellent", "remarkable", "outstanding"),
        "bad": ("poor", "inadequate", "detrimental"),
        "big": ("significant", "substantial", "massive"),
        "small": ("minor", "negligible", "trivial"),
        "nice": ("pleasant", "delightful", "admirable"),
        "important": ("crucial", "essential", "vital"),
        "very": ("extremely", "remarkably", "highly"),
        "think": ("believe", "consider", "suppose"),
        "said": ("stated", "remarked", "declared"),
        "thing": ("aspect", "element", "factor"),
    }
    lower = text.lower()
    for word, alternatives in basic_words.items():
        if re.search(r'\b' + word + r'\b', lower):
            suggestions.append(f"Consider replacing '{word}' with a stronger word like '{alternatives[0]}'")
    return suggestions[:2]

def suggest_improvements(text: str) -> list:
    tips = []
    words = len(text.split())
    if words < 20:
        tips.append("Try to speak for longer with more detailed examples")
    sentences = len(re.findall(r'[.!?]+', text))
    if sentences < 2:
        tips.append("Structure your speech with an introduction, body, and conclusion")
    if not re.search(r'\b(i think|in my opinion|i believe|first|second|finally|in conclusion)\b', text.lower()):
        tips.append("Use transition words like 'firstly', 'secondly', 'in conclusion' to organize your thoughts")
    filler = re.findall(r'\b(um|uh|like|basically|actually|you know|sort of|kind of)\b', text.lower())
    if filler:
        tips.append("Try to reduce filler words like 'um', 'like', 'basically'")
    return tips[:3]

def generate_corrected(text: str) -> str:
    result = text
    for w, (correction, _) in COMMON_IRREGULAR.items():
        result = re.sub(r'\b' + w + r'\b', correction, result, flags=re.IGNORECASE)
    result = re.sub(r'\bpeoples\b', 'people', result)
    result = re.sub(r'\bchilds\b', 'children', result)
    result = re.sub(r'\ba\s+([aeiou])', r'an \1', result, flags=re.IGNORECASE)
    result = re.sub(r'\bmore better\b', 'better', result)
    result = re.sub(r'\bmore bigger\b', 'bigger', result)
    result = re.sub(r'\bhave went\b', 'have gone', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave did\b', 'have done', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave saw\b', 'have seen', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave came\b', 'have come', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave wrote\b', 'have written', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave took\b', 'have taken', result, flags=re.IGNORECASE)
    return result if result != text else ""

@router.post("/challenge/analyze")
async def analyze_challenge(req: AnalyzeRequest, current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    prompt = SCORE_PROMPT.format(text=req.text, topic=req.topic)
    raw = await call_ollama(prompt, 300, 90)

    result = {
        "fluency": extract_int(raw, "Fluency", 75),
        "grammar": extract_int(raw, "Grammar", 70),
        "vocabulary": extract_int(raw, "Vocabulary", 70),
        "confidence": extract_int(raw, "Confidence", 70),
        "xp_earned": min(50, max(1, extract_int(raw, "XP_Earned", 30))),
        "streak_days": min(7, max(1, extract_int(raw, "Streak_Days", 1))),
        "feedback": extract_str(raw, "Feedback", "Good effort! Try to structure your points more clearly."),
        "grammar_issues": [],
        "vocabulary_suggestions": [],
        "strengths": [],
        "improvement_tips": [],
        "corrected_version": "",
    }

    text = req.text.strip()
    if len(text) > 5:
        result["grammar_issues"] = find_grammar_issues(text)
        result["vocabulary_suggestions"] = check_vocabulary(text)
        result["strengths"] = check_strengths(text)
        result["improvement_tips"] = suggest_improvements(text)
        corrected = generate_corrected(text)
        if corrected:
            result["corrected_version"] = corrected
            result["improvement_tips"].append(f"Practice saying: \"{corrected}\"")

    min_xp = max(1, len(text.split()) // 2)
    result["xp_earned"] = max(result["xp_earned"], min_xp)

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
