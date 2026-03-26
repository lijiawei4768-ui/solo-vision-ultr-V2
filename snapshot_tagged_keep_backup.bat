@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ================================
echo   Solo Vision Ultra - Snapshot
echo ================================
echo.

:: Ensure snapshots folder exists
if not exist "snapshots" mkdir "snapshots"

:: Ask for optional tag
set "TAG="
set /p TAG=Enter snapshot tag (e.g. fix-toprail, optional): 

:: Get stable timestamp via PowerShell
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmmss"') do set "STAMP=%%i"

:: Sanitize tag: spaces -> -, remove common invalid filename chars
if not "%TAG%"=="" (
    set "TAG=%TAG: =-%"
    set "TAG=%TAG:/=-%"
    set "TAG=%TAG:\=-%"
    set "TAG=%TAG::=-%"
    set "TAG=%TAG:*=-%"
    set "TAG=%TAG:?=-%"
    set "TAG=%TAG:"=-%"
    set "TAG=%TAG:<=-%"
    set "TAG=%TAG:>=-%"
    set "TAG=%TAG:|=-%"
    set "OUTFILE=snapshots\repomix-output_%STAMP%_%TAG%.xml"
) else (
    set "OUTFILE=snapshots\repomix-output_%STAMP%.xml"
)

:: Write .repomixignore
(
echo node_modules/
echo build/
echo .git/
echo .cursor/
echo public/
echo scripts/
echo *.bat
echo *.md
echo package-lock.json
echo repomix-output*.xml
echo snapshots/
) > .repomixignore

echo Generating snapshot...
npx repomix --output "%OUTFILE%"

if errorlevel 1 (
    echo.
    echo [ERROR] repomix generation failed.
    pause
    exit /b 1
)

echo.
echo ================================
echo  Done!
echo  Output: %OUTFILE%
echo ================================
echo.
pause
