@echo off
chcp 65001 >nul
echo ========================================
echo Starting Rails Server
echo ========================================
echo.

REM 依存関係がインストールされているか確認
if not exist "Gemfile.lock" (
    echo Gemfile.lock not found. Running bundle install...
    bundle install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Railsサーバーを起動
echo Starting Rails server on port 3001...
echo.
bundle exec rails server -p 3001
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start Rails server
    echo.
    echo Make sure:
    echo 1. Ruby 3.2.0+ is installed
    echo 2. Dependencies are installed (run setup.bat)
    echo 3. MySQL database is running
    echo 4. Database is created (run: bundle exec rails db:create)
    echo.
    pause
    exit /b 1
)
