@echo off
chcp 65001 >nul
echo ========================================
echo Building Frontend for Docker
echo ========================================
echo.

cd frontend

echo Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo Frontend build completed!
echo ========================================
echo Build files are in: frontend\build
echo.
echo You can now run: docker-compose up -d --build
echo.
pause
