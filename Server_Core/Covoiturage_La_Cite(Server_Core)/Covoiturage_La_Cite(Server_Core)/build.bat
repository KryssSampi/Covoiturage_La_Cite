@echo off
cd /d "%~dp0"
echo ========================================
echo Building Covoiturage La Cite Server...
echo ========================================
dotnet build
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build succeeded!
    echo.
    pause
) else (
    echo.
    echo ❌ Build failed!
    echo.
    pause
)
