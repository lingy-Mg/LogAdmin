@echo off
chcp 65001 > nul
echo ========================================
echo    LogAdmin 全自动部署脚本
echo ========================================
echo.

node scripts/deploy-auto.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 部署失败！
    pause
    exit /b 1
)

echo.
pause

