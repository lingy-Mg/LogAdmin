@echo off
chcp 65001 >nul
echo ========================================
echo    LogAdmin 一键打包脚本
echo ========================================
echo.

echo [1/4] 清理旧文件...
call npm run clean
if errorlevel 1 (
    echo ❌ 清理失败
    pause
    exit /b 1
)
echo.

echo [2/4] 构建前端...
call npm run build:frontend
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo.

echo [3/4] 复制构建文件到后端...
call npm run copy:dist
if errorlevel 1 (
    echo ❌ 复制文件失败
    pause
    exit /b 1
)
echo.

echo [4/4] 打包完成！
echo.
echo ========================================
echo    ✅ 打包成功！
echo ========================================
echo.
echo 📦 构建产物位置: backend\public
echo.
echo 运行方式：
echo   1. cd backend
echo   2. npm start
echo   3. 访问 http://localhost:3000
echo.
pause
