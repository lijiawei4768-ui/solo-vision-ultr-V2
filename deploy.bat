@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ================================
echo   Solo Vision Ultra - deploying
echo ================================
echo.
echo [诊断] 当前运行目录:
echo %cd%
echo.
echo [诊断] Git 状态:
git status
echo.
echo [诊断] 改动文件列表:
git diff --name-only
git diff --staged --name-only
echo.

git diff --quiet 2>nul
set DIFF1=%errorlevel%
git diff --staged --quiet 2>nul
set DIFF2=%errorlevel%

if %DIFF1%==1 goto COMMIT
if %DIFF2%==1 goto COMMIT
echo No changes detected, skipping commit.
goto PUSH

:COMMIT
echo Staging all changes...
git add -A
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set dt=%%I
set MSG=update %dt:~4,2%/%dt:~6,2% %dt:~8,2%:%dt:~10,2%
echo Committing: %MSG%
git commit -m "%MSG%"

:PUSH
echo.
echo Pushing to GitHub...
git push
echo.
echo ================================
echo   Done!
echo ================================
echo.
pause
