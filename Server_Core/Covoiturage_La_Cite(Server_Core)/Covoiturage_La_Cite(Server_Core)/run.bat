@echo off
cd /d "%~dp0"
echo ========================================
echo Starting Covoiturage La Cite Server...
echo ========================================
echo.
echo Server will start on:
echo   http://localhost:5000
echo   https://localhost:5001
echo.
echo Swagger: http://localhost:5000/swagger
echo.
dotnet run
