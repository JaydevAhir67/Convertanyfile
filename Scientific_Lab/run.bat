@echo off
title ConvertAnyFile - Scientific Computing Lab
cd /d "%~dp0"

echo ===================================================
echo     ConvertAnyFile - Scientific Computing Lab
echo ===================================================
echo.

if exist ".venv\Scripts\python.exe" (
    echo [INFO] Activating virtual environment (.venv)...
    call .venv\Scripts\activate.bat
    python main.py
) else (
    echo [WARNING] .venv not found! Trying system Python...
    python main.py
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] An error occurred while running the Scientific Lab.
)

echo.
echo ===================================================
echo Session finished. Press any key to exit.
echo ===================================================
pause >nul
