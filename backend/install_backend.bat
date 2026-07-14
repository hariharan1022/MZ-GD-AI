@echo off
echo Installing Backend Core and Data Processing Packages...
call pip install fastapi uvicorn python-dotenv asyncpg psycopg2-binary bcrypt python-jose[cryptography] passlib[bcrypt] python-multipart websockets httpx pydantic pydantic-settings aiofiles PyJWT email-validator openpyxl pandas reportlab xlsxwriter

echo Installing AI and Audio Processing Packages...
call pip install openai-whisper faster-whisper pyannote.audio torch torchaudio language-tool-python sounddevice soundfile pydub librosa ffmpeg-python sentence-transformers transformers accelerate numpy scipy aiortc

echo Backend setup complete!
