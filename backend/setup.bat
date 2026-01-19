@echo off
chcp 65001 >nul
echo ========================================
echo Clinics Backend Setup Script
echo ========================================
echo.

REM Rubyのバージョン確認
echo Checking Ruby installation...
ruby --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Ruby is not installed or not in PATH
    echo Please install Ruby 3.2.0+ from https://rubyinstaller.org/
    echo.
    pause
    exit /b 1
)
ruby --version

REM Bundlerの確認
echo.
echo Checking Bundler installation...
bundle --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Bundler is not installed. Installing...
    gem install bundler
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install bundler
        pause
        exit /b 1
    )
)
bundle --version

REM 依存関係のインストール
echo.
echo ========================================
echo Installing dependencies...
echo ========================================
echo Note: Some gems may require MSYS2 for native extensions.
echo If installation fails, run 'ridk install' to install MSYS2.
echo.
bundle install
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Some dependencies may have failed to install.
    echo This is often due to missing MSYS2 for native extensions.
    echo.
    echo To fix this:
    echo 1. Run: ridk install
    echo 2. Then run: bundle install
    echo.
    echo Continuing anyway...
)

REM データベースの作成
echo.
echo ========================================
echo Creating database...
echo ========================================
bundle exec rails db:create
if %errorlevel% neq 0 (
    echo WARNING: Database creation failed. Make sure MySQL is running.
    echo You can skip this step if database already exists.
)

REM マイグレーションの実行
echo.
echo ========================================
echo Running migrations...
echo ========================================
bundle exec rails db:migrate
if %errorlevel% neq 0 (
    echo WARNING: Migration failed.
)

echo.
echo ========================================
echo Setup completed!
echo ========================================
echo.
echo To start the Rails server, run:
echo   bundle exec rails server
echo.
echo Or use the start script:
echo   start.bat
echo.
pause
