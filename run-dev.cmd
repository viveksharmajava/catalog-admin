@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 set "PATH=C:\Program Files\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node 20 LTS or add it to PATH.
  echo Expected location: C:\Program Files\nodejs
  exit /b 1
)
cd /d "%~dp0"
call npm run dev
