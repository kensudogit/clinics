@echo off
echo Starting Clinics Application Deployment...

REM Set production environment
set NODE_ENV=production
set RAILS_ENV=production

echo.
echo ========================================
echo Building Frontend Application
echo ========================================
cd /d C:\devlop\clinics\frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    exit /b 1
)

echo.
echo ========================================
echo Frontend Build Completed Successfully
echo ========================================
echo Build files are located in: C:\devlop\clinics\frontend\build

echo.
echo ========================================
echo Starting Static File Server for Frontend
echo ========================================
cd /d C:\devlop\clinics\frontend
echo Installing serve globally if not already installed...
call npm install -g serve
echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "serve -s build -l 3000"

echo.
echo ========================================
echo Deployment Summary
echo ========================================
echo Frontend: http://localhost:3000
echo Backend: Not configured (requires Ruby/Rails setup)
echo.
echo To complete the deployment:
echo 1. Install Ruby 3.2.0+ and Rails 7.0+
echo 2. Install MySQL database
echo 3. Install Redis server
echo 4. Run: cd backend && bundle install
echo 5. Run: rails db:create db:migrate
echo 6. Run: rails server -p 3001
echo.
echo Frontend is now running in production mode!
pause
