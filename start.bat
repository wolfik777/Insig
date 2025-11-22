@echo off
echo Starting Insight Application...
echo.

echo Starting Backend...
start "Insight Backend" cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Insight Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause

