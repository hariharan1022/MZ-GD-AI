@echo off
echo Pulling Ollama Models...
echo This will download tens of gigabytes of data and may take a long time.

echo Pulling llama3.1:8b...
call ollama pull llama3.1:8b

echo Pulling qwen2.5:7b...
call ollama pull qwen2.5:7b

echo Pulling gemma3...
call ollama pull gemma3

echo Pulling mistral...
call ollama pull mistral

echo Ollama models pulled successfully!
