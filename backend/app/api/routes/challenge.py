from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.dependencies import get_current_student
from app.db.connection import get_db
from asyncpg import Connection
import httpx
import logging
import uuid
import re
import math

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

FEEDBACK_PROMPT = """Give 2-3 sentences of feedback on this student speech. Mention what was good and how to improve.

Topic: {topic}
Speech: "{text}"

Feedback:"""

COMMON_MISTAKES = {
    "done": ("did", "past tense of 'do'"),
    "went": ("gone", "past participle of 'go'"),
    "goed": ("went", "past tense of 'go'"),
    "seed": ("saw", "past tense of 'see'"),
    "wented": ("went", "past tense of 'go'"),
    "buyed": ("bought", "past tense of 'buy'"),
    "thinked": ("thought", "past tense of 'think'"),
    "telled": ("told", "past tense of 'tell'"),
    "speaked": ("spoke", "past tense of 'speak'"),
    "knowed": ("knew", "past tense of 'know'"),
    "putted": ("put", "past tense of 'put'"),
    "breaked": ("broke", "past tense of 'break'"),
    "bringed": ("brought", "past tense of 'bring'"),
    "builded": ("built", "past tense of 'build'"),
    "catched": ("caught", "past tense of 'catch'"),
    "drawed": ("drew", "past tense of 'draw'"),
    "drinked": ("drank", "past tense of 'drink'"),
    "eated": ("ate", "past tense of 'eat'"),
    "feeled": ("felt", "past tense of 'feel'"),
    "fighted": ("fought", "past tense of 'fight'"),
    "finded": ("found", "past tense of 'find'"),
    "flyed": ("flew", "past tense of 'fly'"),
    "forgeted": ("forgot", "past tense of 'forget'"),
    "gived": ("gave", "past tense of 'give'"),
    "growed": ("grew", "past tense of 'grow'"),
    "hided": ("hid", "past tense of 'hide'"),
    "holded": ("held", "past tense of 'hold'"),
    "keeped": ("kept", "past tense of 'keep'"),
    "leaded": ("led", "past tense of 'lead'"),
    "leaved": ("left", "past tense of 'leave'"),
    "lended": ("lent", "past tense of 'lend'"),
    "lighted": ("lit", "past tense of 'light'"),
    "meaned": ("meant", "past tense of 'mean'"),
    "meeted": ("met", "past tense of 'meet'"),
    "payed": ("paid", "past tense of 'pay'"),
    "runned": ("ran", "past tense of 'run'"),
    "sayed": ("said", "past tense of 'say'"),
    "showed": ("shown", "past participle of 'show'"),
    "sleeped": ("slept", "past tense of 'sleep'"),
    "standed": ("stood", "past tense of 'stand'"),
    "swimmed": ("swam", "past tense of 'swim'"),
    "taked": ("took", "past tense of 'take'"),
    "teached": ("taught", "past tense of 'teach'"),
    "thincked": ("thought", "past tense of 'think'"),
    "thinked": ("thought", "past tense of 'think'"),
    "waked": ("woke", "past tense of 'wake'"),
    "writed": ("wrote", "past tense of 'write'"),
}

PATTERN_MISTAKES = [
    (r'\bhe don\'?t\b', "Use 'doesn't' instead of 'don't' after 'he/she/it'"),
    (r'\bshe don\'?t\b', "Use 'doesn't' instead of 'don't' after 'he/she/it'"),
    (r'\bit don\'?t\b', "Use 'doesn't' instead of 'don't' after 'it'"),
    (r'\bpeoples\b', "'people' is already plural"),
    (r'\bchilds\b', "'children' is the plural of 'child'"),
    (r'\bmens\b', "'men' is already plural"),
    (r'\bwomens\b', "'women' is already plural"),
    (r'\bmore better\b', "Use 'better' instead of 'more better'"),
    (r'\bmore bigger\b', "Use 'bigger' instead of 'more bigger'"),
    (r'\bhave went\b', "Use 'have gone' instead of 'have went'"),
    (r'\bhas went\b', "Use 'has gone' instead of 'has went'"),
    (r'\bhave did\b', "Use 'have done' instead of 'have did'"),
    (r'\bhas did\b', "Use 'has done' instead of 'has did'"),
    (r'\bhave saw\b', "Use 'have seen' instead of 'have saw'"),
    (r'\bhas saw\b', "Use 'has seen' instead of 'has saw'"),
    (r'\bhave came\b', "Use 'have come' instead of 'have came'"),
    (r'\bhave wrote\b', "Use 'have written' instead of 'have wrote'"),
    (r'\bhas wrote\b', "Use 'has written' instead of 'has wrote'"),
    (r'\bhave spoke\b', "Use 'have spoken' instead of 'have spoke'"),
    (r'\bhas spoke\b', "Use 'has spoken' instead of 'has spoke'"),
    (r'\bhave broke\b', "Use 'have broken' instead of 'have broke'"),
    (r'\bhas broke\b', "Use 'has broken' instead of 'has broke'"),
    (r'\bhave took\b', "Use 'have taken' instead of 'have took'"),
    (r'\bhas took\b', "Use 'has taken' instead of 'has took'"),
]

def find_mistakes(text: str) -> list:
    issues = []
    lower = text.lower()
    words = lower.split()
    for i, w in enumerate(words):
        clean = w.strip(".,!?;:'\"")
        if clean in COMMON_MISTAKES:
            fix, reason = COMMON_MISTAKES[clean]
            issues.append(f"Used '{clean}' instead of '{fix}' ({reason})")
    for pattern, msg in PATTERN_MISTAKES:
        if re.search(pattern, lower):
            issues.append(msg)
    return issues[:5]

def calc_fluency(text: str) -> int:
    words = len(text.split())
    if words < 5: return 10
    if words < 10: return 25
    if words < 20: return 45
    if words < 30: return 60
    if words < 40: return 75
    return min(95, 75 + (words - 40) // 2)

def calc_grammar(text: str) -> int:
    mistakes = find_mistakes(text)
    score = 100 - (len(mistakes) * 15)
    return max(10, score)

def calc_vocabulary(text: str) -> int:
    words = text.lower().split()
    unique = len(set(w.strip(".,!?;:'\"") for w in words))
    total = len(words)
    if total == 0: return 10
    ratio = unique / total
    base = int(ratio * 60)
    if total < 10:
        base = max(base, 20)
    bonus = min(30, total // 3)
    return min(95, max(10, base + bonus))

def calc_confidence(text: str) -> int:
    words = len(text.split())
    if words < 10: return max(10, words * 5)
    sentences = len(re.findall(r'[.!?]+', text))
    has_structure = bool(re.search(r'\b(i think|in my opinion|first|second|finally|because|therefore|however)\b', text.lower()))
    base = min(80, 40 + words // 2)
    if sentences >= 3: base += 10
    if has_structure: base += 10
    return min(95, base)

def check_strengths(text: str) -> list:
    s = []
    words = len(text.split())
    if words >= 30: s.append("Spoke at good length with detailed points")
    elif words >= 15: s.append("Expressed ideas clearly")
    else: s.append("Attempted to answer the topic")
    sentences = len(re.findall(r'[.!?]+', text))
    if sentences >= 3: s.append("Organized speech into multiple sentences")
    if re.search(r'\b(because|therefore|however|although|for example)\b', text.lower()):
        s.append("Connected ideas with transition words")
    if re.search(r'\b(i think|in my opinion|i believe)\b', text.lower()):
        s.append("Good opening statement")
    if re.search(r'\b(in conclusion|overall|finally|that\'?s why)\b', text.lower()):
        s.append("Good concluding statement")
    return s[:3]

def check_vocabulary(text: str) -> list:
    suggestions = []
    basic = {
        "good": "excellent/remarkable/outstanding",
        "bad": "poor/inadequate/detrimental",
        "big": "significant/substantial",
        "small": "minor/negligible",
        "nice": "pleasant/delightful",
        "important": "crucial/essential/vital",
        "very": "extremely/remarkably",
        "think": "believe/consider",
        "said": "stated/remarked",
        "thing": "aspect/element/factor",
    }
    lower = text.lower()
    for w, alt in basic.items():
        if re.search(r'\b' + w + r'\b', lower):
            suggestions.append(f"Replace '{w}' with stronger word like '{alt}'")
    return suggestions[:2]

def suggest_improvements(text: str) -> list:
    tips = []
    words = len(text.split())
    if words < 20:
        tips.append("Speak longer with more detailed examples")
    sentences = len(re.findall(r'[.!?]+', text))
    if sentences < 2:
        tips.append("Structure with introduction, body, and conclusion")
    if not re.search(r'\b(i think|first|second|finally|in conclusion)\b', text.lower()):
        tips.append("Use transition words like 'firstly', 'secondly', 'in conclusion'")
    filler = re.findall(r'\b(um|uh|like|basically|actually|you know|sort of)\b', text.lower())
    if filler:
        tips.append("Reduce filler words like 'um', 'like', 'basically'")
    return tips[:3]

def generate_corrected(text: str) -> str:
    result = text
    for w, (fix, _) in COMMON_MISTAKES.items():
        result = re.sub(r'\b' + w + r'\b', fix, result, flags=re.IGNORECASE)
    for pattern, _ in PATTERN_MISTAKES:
        result = re.sub(pattern, '', result)
    result = re.sub(r'\bpeoples\b', 'people', result)
    result = re.sub(r'\bchilds\b', 'children', result)
    result = re.sub(r'\bhave went\b', 'have gone', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhas went\b', 'has gone', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave did\b', 'have done', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhas did\b', 'has done', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave saw\b', 'have seen', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhas saw\b', 'has seen', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave came\b', 'have come', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave wrote\b', 'have written', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhas wrote\b', 'has written', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave spoke\b', 'have spoken', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave broke\b', 'have broken', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhave took\b', 'have taken', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhas took\b', 'has taken', result, flags=re.IGNORECASE)
    return result if result != text else ""

async def call_ollama(prompt: str, max_tokens: int = 200, timeout: int = 60) -> str:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.3, "max_tokens": max_tokens}
        })
        if resp.status_code != 200:
            return ""
        return resp.json().get("response", "").strip()

@router.post("/challenge/analyze")
async def analyze_challenge(req: AnalyzeRequest, current_student: dict = Depends(get_current_student), conn: Connection = Depends(get_db)):
    text = req.text.strip()
    word_count = len(text.split())

    FALLBACK_PHRASE = "i shared my thoughts on the topic"
    if word_count < 5 or FALLBACK_PHRASE in text.lower():
        return {
            "fluency": 10, "grammar": 10, "vocabulary": 10, "confidence": 10,
            "xp_earned": 1, "streak_days": 1,
            "feedback": "You didn't speak enough. Try to speak for at least 30 seconds explaining your thoughts in detail.",
            "grammar_issues": [], "vocabulary_suggestions": [], "strengths": [],
            "improvement_tips": ["Speak for at least 30 seconds next time"],
            "corrected_version": "", "total_xp": 0, "level": 1
        }

    feedback_text = ""
    try:
        fb_raw = await call_ollama(FEEDBACK_PROMPT.format(text=text, topic=req.topic), 200, 60)
        if fb_raw:
            feedback_text = fb_raw.split("Feedback:", 1)[-1].strip() if "Feedback:" in fb_raw else fb_raw
    except:
        pass

    if feedback_text:
        feedback_text = re.sub(r'^\d+[\.\)]\s*', '', feedback_text, flags=re.MULTILINE)
        feedback_text = feedback_text[:300]
    else:
        mistakes = find_mistakes(text)
        if mistakes:
            feedback_text = f"Your speech had some grammar errors: {'; '.join(mistakes[:2])}. Keep practicing to improve!"
        elif word_count >= 30:
            feedback_text = "Good effort! You spoke at a good length. Try using more varied vocabulary and connecting words."
        elif word_count >= 15:
            feedback_text = "Good start! Expand your speech with more examples and reasons to make it more engaging."
        else:
            feedback_text = "Try to speak more next time. Explain your ideas with examples and reasons."

    result = {
        "fluency": calc_fluency(text),
        "grammar": calc_grammar(text),
        "vocabulary": calc_vocabulary(text),
        "confidence": calc_confidence(text),
        "xp_earned": min(50, max(5, word_count // 2 + 5)),
        "streak_days": 1,
        "feedback": feedback_text,
        "grammar_issues": find_mistakes(text),
        "vocabulary_suggestions": check_vocabulary(text),
        "strengths": check_strengths(text),
        "improvement_tips": suggest_improvements(text),
        "corrected_version": generate_corrected(text),
    }

    student_id = current_student["id"]
    xp_earned = result["xp_earned"]
    existing = await conn.fetchrow("SELECT xp, current_level FROM gamification WHERE student_id = $1", student_id)
    if existing:
        new_xp = existing["xp"] + xp_earned
        new_level = calc_level(new_xp)
        await conn.execute("UPDATE gamification SET xp = $1, current_level = $2, updated_at = datetime('now') WHERE student_id = $3", new_xp, new_level, student_id)
    else:
        new_level = calc_level(xp_earned)
        await conn.execute("INSERT INTO gamification (id, student_id, xp, current_level) VALUES ($1, $2, $3, $4)", str(uuid.uuid4()), student_id, xp_earned, new_level)
        new_xp = xp_earned

    result["total_xp"] = new_xp
    result["level"] = new_level
    return result
