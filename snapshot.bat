@echo off
cd /d "%~dp0"

echo.
echo ================================
echo   Solo Vision Ultra - Snapshot
echo ================================
echo.

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
echo repomix-output.xml
) > .repomixignore

echo Generating snapshot...
npx repomix

echo.
echo ================================
echo  Done! Upload repomix-output.xml
echo  to Claude.
echo ================================
echo.
pause
