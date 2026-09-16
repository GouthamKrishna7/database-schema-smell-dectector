@echo off
echo ============================================================
echo   Database Schema Smell Detector - Starting Application
echo ============================================================
echo.

cd /d "%~dp0backend"
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found. Please run: py -3.10 -m venv venv ^&^& .\venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

echo [*] Activating Python Virtual Environment...
call venv\Scripts\activate.bat

echo [*] Launching Web Application on http://localhost:8000 ...
start "" "http://localhost:8000"

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause