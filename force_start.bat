@echo off
echo ==========================================
echo   PINTEREST CLONE - FORCE START SCRIPT
echo ==========================================
echo.
echo 1. Stopping any stuck Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo    Done.
echo.
echo 2. Clearing Next.js cache...
if exist .next rmdir /s /q .next
echo    Done.
echo.
echo 3. Starting server on FRESH PORT 3002...
echo    Access the app at: http://localhost:3002
echo.
echo ==========================================
npm run dev -- -p 3002
pause
