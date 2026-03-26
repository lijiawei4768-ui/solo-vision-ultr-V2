@echo off
setlocal

cd /d "%~dp0"

if not exist "package.json" (
  echo [ERROR] package.json not found in:
  echo %cd%
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH.
  echo Please install Node.js and make sure npm is available in Command Prompt.
  pause
  exit /b 1
)

echo Starting app from:
echo %cd%
echo.

set "HOST=127.0.0.1"
set "PORT=3000"
set "BROWSER=none"
set "WDS_SOCKET_HOST=127.0.0.1"

echo Windows stable mode:
echo HOST=%HOST%
echo PORT=%PORT%
echo BROWSER=%BROWSER%
echo WDS_SOCKET_HOST=%WDS_SOCKET_HOST%
echo.

call npm start
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo npm start exited with code %EXIT_CODE%.
  echo.
  echo If you just switched from WSL, run repair-windows-env.bat once first.
  pause
)

exit /b %EXIT_CODE%
