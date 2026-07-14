from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2:0.5b"

IRREGULAR = {
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
    "breaked": ("broke", "past tense of 'break'"),
    "catched": ("caught", "past tense of 'catch'"),
    "drinked": ("drank", "past tense of 'drink'"),
    "eated": ("ate", "past tense of 'eat'"),
    "fighted": ("fought", "past tense of 'fight'"),
    "finded": ("found", "past tense of 'find'"),
    "gived": ("gave", "past tense of 'give'"),
    "growed": ("grew", "past tense of 'grow'"),
    "leaved": ("left", "past tense of 'leave'"),
    "runned": ("ran", "past tense of 'run'"),
    "sayed": ("said", "past tense of 'say'"),
    "sleeped": ("slept", "past tense of 'sleep'"),
    "standed": ("stood", "past tense of 'stand'"),
    "swimmed": ("swam", "past tense of 'swim'"),
    "taked": ("took", "past tense of 'take'"),
    "teached": ("taught", "past tense of 'teach'"),
    "writed": ("wrote", "past tense of 'write'"),
}

PAST_VERBS = {'go','come','do','say','make','take','give','see','know','think','find','get','tell','buy','bring','build','catch','draw','drink','eat','feel','fight','fly','forget','grow','hide','hold','keep','lead','leave','lend','mean','meet','pay','run','sleep','stand','swim','teach'}

SV_VERBS = {'like','read','write','go','do','say','make','take','come','know','think','give','find','tell','work','play','study','run','eat','speak','love','want','need','use','learn','help','keep','start','look','live','believe','call','ask','try','seem','put','get','set','bring','hold','buy','pay','show','hear','watch','walk','talk','sit','stand','win','grow','build','meet','lead','leave','cut','create','move','open','close','turn','teach','fight'}

ADVERBS = ['monthly','weekly','daily','yearly','always','often','usually','sometimes','never','rarely','seldom','frequently','occasionally']

SUPERLATIVES = ['best','most','worst','largest','smallest','greatest','biggest','highest','lowest','fastest','slowest','oldest','newest','longest','shortest','easiest','hardest']

SINGULAR_NOW = {'week','month','year','place','person','thing','day','hour','minute','second','book','car','house','room','table','chair','city','town','village','country','state','area','region'}

COMMON_NOUNS = {'week','month','year','place','person','thing','day','hour','minute','second','book','car','house','room','table','chair','city','town','village','country','state','area','region','tamilnadu','india','school','college','university','office','company','hospital','bank','shop','market','park','garden','beach','river','mountain','forest','temple','church','mosque','hotel','restaurant','airport','station','bus','train','plane','bicycle','phone','computer','laptop','friend','family','mother','father','brother','sister','teacher','student','doctor','engineer','manager'}

PAST_MARKERS = ['yesterday','ago','last week','last month','last year','last night','last monday','last tuesday','last wednesday','last thursday','last friday','last saturday','last sunday','before','earlier','previously','in the past']

def find_mistakes(text: str) -> list:
    issues = []
    lower = text.lower().strip()
    words = lower.split()
    if not words:
        return issues

    if text[0].isalpha() and text[0].islower():
        issues.append("Capitalize the first letter of your sentence")

    for i, w in enumerate(words):
        clean = w.strip(".,!?;:'\"")
        if clean in IRREGULAR:
            fix, reason = IRREGULAR[clean]
            issues.append(f"Use '{fix}' instead of '{clean}' ({reason})")

    # Subject-verb agreement (he/she/it + base verb)
    for sv in ['he', 'she', 'it']:
        m = re.search(r'\b' + sv + r'\s+(' + '|'.join(SV_VERBS) + r')\b', lower)
        if m:
            v = m.group(1)
            es = v + ('es' if v.endswith(('o','s','x','z','ch','sh')) else 's')
            issues.append(f"Subject-verb: use '{sv} {es}' not '{sv} {v}' (add -s/-es for he/she/it)")

    # they is
    if re.search(r'\bthey is\b', lower):
        issues.append("Use 'they are' instead of 'they is'")

    # don't/doesn't + verb with -s
    m = re.search(r"\b(don't|doesn't)\s+(\w+s)\b", lower)
    if m:
        issues.append(f"After '{m.group(1)}', use base verb '{m.group(2)[:-1]}' not '{m.group(2)}'")

    # Past tense check
    for marker in ['yesterday','last week','last month','last year','ago']:
        if marker in lower:
            for j, w in enumerate(words):
                c = w.strip(".,!?;:'\"")
                if c in PAST_VERBS:
                    issues.append(f"Past tense: use past form of '{c}' (with time '{marker}')")
                    break

    # Missing 'to' after want/need
    for w in ['want', 'need']:
        m2 = re.search(r'\b' + w + r'\s+(\w+)\b', lower)
        if m2 and m2.group(1) not in ('to','a','an','the','in','on','at','for','with','by','from','and','or','but','i','you','he','she','it','we','they'):
            issues.append(f"Use '{w} to {m2.group(1)}' (missing 'to')")

    # Repeated words
    repeats = re.findall(r'\b(\w+)\s+\1\b', lower)
    for rpt in repeats[:1]:
        issues.append(f"Repeated word '{rpt}' — try to avoid filler repetition")

    # Adverb placement: "monthly go" -> "go monthly" or "Every month"
    for adv in ADVERBS:
        m = re.search(r'\b' + adv + r'\s+(' + '|'.join(SV_VERBS) + r')\b', lower)
        if m:
            issues.append(f"Word order: put '{adv}' after the verb (e.g. 'I go {adv}')")

    # Number + singular noun: "2 place", "5 book"
    m = re.search(r'\b(\d+)\s+(\w+)\b', lower)
    if m:
        num = int(m.group(1))
        noun = m.group(2).strip(".,!?;:'\"")
        if num > 1 and noun in SINGULAR_NOW:
            issues.append(f"Plural: '{num} {noun}' should be '{num} {noun}s'")

    # "a best", "a most" -> "the best", "the most"
    for sup in SUPERLATIVES:
        m = re.search(r'\ba\s+' + sup + r'\b', lower)
        if m:
            issues.append(f"Use 'the {sup}' instead of 'a {sup}' (superlative needs 'the')")
            break

    # "its" used where "it's" (it is) is needed
    m = re.search(r"\bits\s+(a|an|the|is|was|will|has|have|had|very|really|quite|so|one|also|not|my|our|their|his|her|its)\b", lower)
    if m:
        issues.append("Use 'it's' (with apostrophe) for 'it is' — 'its' is possessive")

    # Future tense with past time marker: "will go ... before/ago/yesterday"
    has_future = bool(re.search(r"\b(will|shall|'ll|going to|gonna)\b", lower))
    has_past_marker = any(marker in lower for marker in PAST_MARKERS)
    if has_future and has_past_marker:
        issues.append("Use past tense instead of future tense when referring to a past time")

    # Missing article before singular countable noun after verb
    # e.g. "go to place" -> "go to the place"
    prep_articles = {'a','an','the','my','our','your','his','her','its','their','this','that','every','each','some','any','no','one','two'}
    prepositions_etc = {'to','in','on','at','for','with','by','from','into','onto','upon','toward','towards','through','across','around','about','between','among','after','before','above','below','under','over','near','behind','beside','without','against','during','since','until'}
    for i, w in enumerate(words):
        if w in prepositions_etc and i + 1 < len(words):
            next_w = words[i + 1].strip(".,!?;:'\"")
            if next_w in COMMON_NOUNS and (i + 2 >= len(words) or words[i + 2].strip(".,!?;:'\"") not in prep_articles):
                issues.append(f"Missing article before '{next_w}' (use 'a/an/the')")

    # Plural: "2 week" pattern in corrections too
    m = re.search(r'\b(\d+)\s+(week|month|year|day|hour|minute|place|person)\b', lower)
    if m:
        num_val = int(m.group(1))
        if num_val > 1:
            issues.append(f"Plural: '{m.group(1)} {m.group(2)}' should be '{m.group(1)} {m.group(2)}s'")

    return issues[:6]


def generate_correction(text: str) -> str:
    result = text

    for w, (fix, _) in IRREGULAR.items():
        result = re.sub(r'\b' + w + r'\b', fix, result, flags=re.IGNORECASE)
    result = re.sub(r'\bpeoples\b', 'people', result)
    result = re.sub(r'\bchilds\b', 'children', result)
    result = re.sub(r'\b(have|has)\s+went\b', r'\1 gone', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(have|has)\s+did\b', r'\1 done', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(have|has)\s+saw\b', r'\1 seen', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(have|has)\s+came\b', r'\1 come', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(have|has)\s+wrote\b', r'\1 written', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(have|has)\s+broke\b', r'\1 broken', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(have|has)\s+took\b', r'\1 taken', result, flags=re.IGNORECASE)

    for sup in SUPERLATIVES:
        result = re.sub(r'\ba\s+' + sup + r'\b', 'the ' + sup, result, flags=re.IGNORECASE)

    result = re.sub(r"\bits\s+(a|an|the)", lambda m: "it's " + m.group(1), result, flags=re.IGNORECASE)

    result = re.sub(r'\bmonthly\s+(' + '|'.join(SV_VERBS) + r')\b', r'\1 monthly', result, flags=re.IGNORECASE)

    result = re.sub(r'\b(\d+)\s+(week|month|year|day|hour|minute|place|person|thing)\b',
                    lambda m: f"{m.group(1)} {m.group(2)}s" if int(m.group(1)) > 1 else m.group(0),
                    result, flags=re.IGNORECASE)

    result = re.sub(r'\bthey is\b', 'they are', result, flags=re.IGNORECASE)

    result = re.sub(r'\bi\b', 'I', result)

    result = re.sub(r'\bwill\s+(\w+)\s+before\s+(\d+)\s+(week|month|year)s?\b',
                    lambda m: 'went ' + m.group(2) + ' ' + m.group(3) + 's ago',
                    result, flags=re.IGNORECASE)

    if result and result[0].islower():
        result = result[0].upper() + result[1:]

    return result if result != text else ""


class StartPracticeRequest(BaseModel):
    topic: str

class ChatRequest(BaseModel):
    topic: str
    message: str
    history: list[dict] = []

COACH_PROMPT = """You are a friendly English communication coach. Your goals:
1. Respond naturally to the student's message
2. Gently correct any grammar mistakes — explain the rule briefly
3. Encourage them with positive feedback
4. Ask a follow-up question to keep the conversation going

Keep responses 2-3 sentences. Be encouraging and supportive.

Topic: {topic}
Student: {message}
Coach:"""

async def call_ollama(prompt: str, max_tokens: int = 200, timeout: int = 60) -> str:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7, "max_tokens": max_tokens}
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Ollama API error")
        return resp.json().get("response", "").strip()

@router.post("/practice/start")
async def start_practice(req: StartPracticeRequest):
    prompt = f"You are a friendly English communication coach. Greet the student warmly and ask for their first thoughts on this topic: '{req.topic}'. Keep it 2 sentences."
    try:
        response = await call_ollama(prompt, 150, 60)
        return {"response": response}
    except:
        return {"response": f"Welcome to the Practice Room! Let's discuss: '{req.topic}'. What are your initial thoughts on this topic?"}

@router.post("/practice/chat")
async def practice_chat(req: ChatRequest):
    prompt = COACH_PROMPT.format(topic=req.topic, message=req.message)
    try:
        response = await call_ollama(prompt, 200, 60)
    except:
        response = f"That's an interesting point! Could you elaborate more on why you think that way about {req.topic}?"

    mistakes = find_mistakes(req.message)
    correction = generate_correction(req.message) if mistakes else ""

    return {
        "response": response,
        "grammar_issues": mistakes,
        "corrected_version": correction,
    }
