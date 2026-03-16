@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ==========================================
echo   Solo Vision Ultra - Enhanced Deploy
echo ==========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    goto END
)

if not exist ".git" (
    echo [ERROR] Current folder is not a Git repo root:
    echo %cd%
    echo Put deploy.bat in the project root.
    goto END
)

echo [OK] Current folder:
echo %cd%
echo.

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set BRANCH=%%i

if "%BRANCH%"=="" (
    echo [ERROR] Cannot detect current branch.
    goto END
)

echo [INFO] Current branch: %BRANCH%
echo.

echo [INFO] Git status before staging:
git status --short
echo.

echo [INFO] Staging all changes...
git add -A
if errorlevel 1 (
    echo [ERROR] git add failed.
    goto END
)

echo.
echo [INFO] Git status after staging:
git status --short
echo.

git diff --cached --quiet 2>nul
if %errorlevel%==0 (
    echo [INFO] No staged changes found.
    echo [INFO] No new commit will be created.
    goto END
)

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set NOW=%%i
set MSG=update %NOW%

echo [INFO] Commit message:
echo %MSG%
echo.

echo [INFO] Creating commit...
git commit -m "%MSG%"
if errorlevel 1 (
    echo [ERROR] git commit failed.
    echo Possible causes:
    echo 1. Git user.name / user.email not configured
    echo 2. A hook blocked the commit
    echo 3. No actual changes to commit
    goto END
)

echo.
echo [INFO] Latest commit:
git log -1 --oneline
echo.

echo [INFO] Pushing to origin/%BRANCH% ...
git push origin %BRANCH%
if errorlevel 1 (
    echo [ERROR] git push failed.
    echo Possible causes:
    echo 1. Network problem
    echo 2. GitHub auth/token expired
    echo 3. Remote branch missing
    echo 4. Remote has new commits, pull first
    goto END
)

echo.
echo ==========================================
echo   Push completed successfully
echo ==========================================
echo [INFO] GitHub must receive a new commit before Vercel redeploys.
echo [INFO] If Vercel still does not deploy, check:
echo        1. This repo is connected to Vercel
echo        2. Vercel watches branch %BRANCH%
echo        3. GitHub actually shows the new commit
echo.

:END
echo.
pause
endlocal