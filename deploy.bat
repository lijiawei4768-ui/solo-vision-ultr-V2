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

set NEED_COMMIT=1
git diff --cached --quiet 2>nul
if %errorlevel%==0 set NEED_COMMIT=0

if "%NEED_COMMIT%"=="1" (
    REM Use %date% and %time% directly - works on all Windows locales
    set NOW=%date:~0,4%-%date:~5,2%-%date:~8,2% %time:~0,2%:%time:~3,2%:%time:~6,2%
    set MSG=update !NOW!

    echo [INFO] Commit message:
    echo !MSG!
    echo.

    echo [INFO] Creating commit...
    git commit -m "!MSG!"
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
) else (
    echo [INFO] No staged changes found.
    echo [INFO] No new commit will be created.
    echo.
)

echo [INFO] Checking whether local branch is ahead of origin/%BRANCH% ...
git fetch origin %BRANCH% >nul 2>nul

set AHEAD_COUNT=
for /f %%i in ('git rev-list --count origin/%BRANCH%..HEAD 2^>nul') do set AHEAD_COUNT=%%i

if "%AHEAD_COUNT%"=="" (
    echo [WARN] Cannot compare with origin/%BRANCH%.
    echo [INFO] Will still try to push current branch.
    echo.
) else (
    if "%AHEAD_COUNT%"=="0" (
        echo [INFO] No unpushed commits detected.
        echo [INFO] Local branch is already synced with origin/%BRANCH%.
        goto SUCCESS
    ) else (
        echo [INFO] Local branch is ahead of origin/%BRANCH% by %AHEAD_COUNT% commit^(s^).
        echo.
    )
)

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

:SUCCESS
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
