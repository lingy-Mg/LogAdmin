@echo off
chcp 65001 >nul
echo ========================================
echo    LogAdmin 快速启动
echo ========================================
echo.

cd backend

if not exist "public\index.html" (
    echo ⚠️  检测到前端文件未构建
    echo.
    echo 请先运行 build.bat 进行打包
    echo 或者使用开发模式：
    echo   - 后端: npm run dev:backend
    echo   - 前端: npm run dev:frontend
    echo.
    pause
    exit /b 1
)

echo 🚀 启动服务器...
echo.
npm start
