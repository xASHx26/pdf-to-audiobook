@echo off
echo 🚀 Setting up PDF to Audio Converter Frontend...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Navigate to frontend directory
cd frontend

echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.

echo 🎨 Setting up Tailwind CSS...
echo.

echo 🔧 Creating environment file...
echo REACT_APP_API_URL=http://127.0.0.1:8000 > .env
echo REACT_APP_VERSION=1.0.0 >> .env

echo ✅ Environment configured
echo.

echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Make sure your FastAPI backend is running on http://127.0.0.1:8000
echo 2. Run 'npm start' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🚀 To start the development server now, run:
echo    cd frontend
echo    npm start
echo.

pause
