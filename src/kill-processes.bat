@echo off
echo ==========================================
echo   Stopping backend services...
echo ==========================================

REM Kill processes if running (suppress errors if not found)
taskkill /f /im nginx.exe >nul 2>&1
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im php-cgi.exe >nul 2>&1
taskkill /f /im java.exe >nul 2>&1
taskkill /f /im dotnet.exe >nul 2>&1

echo All specified services have been terminated.
echo ==========================================
pause
