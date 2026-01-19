@echo off
chcp 65001 >nul
REM Railsコマンドのラッパースクリプト
REM Usage: rails_commands.bat [command] [args...]
REM Example: rails_commands.bat db:create
REM Example: rails_commands.bat db:migrate
REM Example: rails_commands.bat server

if "%1"=="" (
    echo Usage: rails_commands.bat [command] [args...]
    echo.
    echo Examples:
    echo   rails_commands.bat db:create
    echo   rails_commands.bat db:migrate
    echo   rails_commands.bat db:seed
    echo   rails_commands.bat server
    echo   rails_commands.bat console
    echo.
    exit /b 1
)

bundle exec rails %*
