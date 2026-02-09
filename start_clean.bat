@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe
echo.
echo Starting development server on port 3000...
npm run dev
pause
