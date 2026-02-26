@echo off
setlocal enabledelayedexpansion

echo Adding environment variables to Vercel (without trailing newlines)...
echo.

for /f "usebackq tokens=1,* delims==" %%A in ("d:\Petbuddy-App\petbuddy-app\.env.vercel") do (
    echo Adding %%A...
    <nul set /p "=%%B" | npx vercel env add %%A production --yes >nul 2>&1
    if !errorlevel! equ 0 (
        echo   ✓ %%A added
    ) else (
        echo   ✗ %%A failed - may already exist
    )
)

echo.
echo Done! All variables added.
