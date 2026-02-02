@echo off
echo Starting AccuDocs locally...

echo Starting Backend...
start "AccuDocs Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start "AccuDocs Frontend" cmd /k "cd frontend && npm start"

echo.
echo Application execution initiated.
echo Frontend: http://localhost:4200
echo Backend: http://localhost:3000
echo.
echo Default Admin Credentials:
echo Mobile: +919999999999
echo Password: Admin@123
echo.
echo Note: Backend is using SQLite and Mock Redis. No Docker required.
pause
