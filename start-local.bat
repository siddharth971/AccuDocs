@echo off
echo Starting AccuDocs locally...

echo Starting Backend...
start "AccuDocs Backend" cmd /k "cd backend && set NODE_ENV=development && set DB_DIALECT=sqlite && set DB_STORAGE=./database.sqlite && set REDIS_ENABLED=false && set WHATSAPP_ENABLED=false && npm run dev"

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
echo Note: Backend is using SQLite + Mock Redis + WhatsApp disabled. No Docker required.
pause
