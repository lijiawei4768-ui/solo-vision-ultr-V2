@echo off
setlocal

cd /d "%~dp0"

echo.
echo ==========================================
echo   Solo Vision Ultra - Windows Repair
echo ==========================================
echo.
echo This will rebuild dependencies for native Windows use.
echo Recommended after switching back from WSL.
echo.
echo Project root:
echo %cd%
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] node is not available in PATH.
  echo Install Node.js 20 LTS on Windows first, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH.
  echo Install Node.js on Windows first, then run this file again.
  pause
  exit /b 1
)

echo [INFO] Detected versions:
node -v
npm -v
echo.

set /p CONFIRM=Continue with Windows cleanup and reinstall? [Y/N]:
if /I not "%CONFIRM%"=="Y" (
  echo Cancelled.
  exit /b 0
)

if exist "node_modules" (
  echo [INFO] Removing root node_modules...
  rmdir /s /q "node_modules"
)

if exist "build" (
  echo [INFO] Removing root build...
  rmdir /s /q "build"
)

echo [INFO] Installing root dependencies...
call npm install
if errorlevel 1 (
  echo [ERROR] Root npm install failed.
  pause
  exit /b 1
)

if exist "standalone-demo\launch\package.json" (
  echo.
  echo [INFO] Repairing standalone demo dependencies...
  pushd "standalone-demo\launch"

  if exist "node_modules" (
    echo [INFO] Removing standalone-demo\launch\node_modules...
    rmdir /s /q "node_modules"
  )

  if exist "dist" (
    echo [INFO] Removing standalone-demo\launch\dist...
    rmdir /s /q "dist"
  )

  call npm install
  if errorlevel 1 (
    echo [ERROR] standalone-demo\launch npm install failed.
    popd
    pause
    exit /b 1
  )

  popd
)

echo.
echo [OK] Windows environment rebuild completed.
echo Next steps:
echo 1. Double-click start-npm.bat for the main app
echo 2. Or double-click standalone-demo\launch\run-launch-demo.cmd
echo.
pause
exit /b 0
