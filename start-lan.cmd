@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-lan.ps1" -Build %*
exit /b %ERRORLEVEL%
