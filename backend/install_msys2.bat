@echo off
chcp 65001 >nul
echo ========================================
echo MSYS2 Installation Script
echo ========================================
echo.
echo This script will install MSYS2 which is required for
echo building native extensions for Ruby gems.
echo.
echo When prompted, select option [1,3] (default) and press ENTER.
echo.
pause
echo.
ridk install
echo.
echo ========================================
echo MSYS2 Installation Complete
echo ========================================
echo.
echo After MSYS2 is installed, run:
echo   bundle install
echo.
pause
