@echo off
echo Starting Insurance Management Backend Server...
echo.

echo Checking environment variables...
if not exist .env (
    echo ERROR: .env file not found!
    echo Creating .env file...
    echo MONGO_URI=mongodb://localhost:27017/insurance_management > .env
    echo JWT_SECRET=your_super_secure_jwt_secret_key_here_change_in_production >> .env
    echo JWT_EXPIRES_IN=7d >> .env
    echo PORT=5000 >> .env
    echo NODE_ENV=development >> .env
    echo .env file created!
)

echo.
echo Testing connection...
node test-connection.js

echo.
echo Starting server...
npm run dev


