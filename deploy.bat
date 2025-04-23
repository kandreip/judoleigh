@echo off
echo Starting JudoLeigh deployment...

:: Create application directory
mkdir %USERPROFILE%\judoleigh
cd %USERPROFILE%\judoleigh

:: Clone the repository
git clone https://github.com/yourusername/judoleigh.git .

:: Install dependencies
echo Installing dependencies...
npm install
cd client
npm install
npm run build
cd ..

:: Install PM2 if not already installed
echo Installing PM2...
npm install -g pm2

:: Start the backend server
echo Starting backend server...
cd server
npm install
pm2 start server.js --name "judoleigh-backend"

:: Create frontend server
echo Creating frontend server...
cd ..
echo const express = require('express'); > frontend-server.js
echo const path = require('path'); >> frontend-server.js
echo const app = express(); >> frontend-server.js
echo const port = 3000; >> frontend-server.js
echo. >> frontend-server.js
echo app.use(express.static(path.join(__dirname, 'client/build'))); >> frontend-server.js
echo. >> frontend-server.js
echo app.get('*', (req, res) => { >> frontend-server.js
echo   res.sendFile(path.join(__dirname, 'client/build', 'index.html')); >> frontend-server.js
echo }); >> frontend-server.js
echo. >> frontend-server.js
echo app.listen(port, () => { >> frontend-server.js
echo   console.log(`Frontend server running at http://localhost:${port}`); >> frontend-server.js
echo }); >> frontend-server.js

:: Start the frontend server
echo Starting frontend server...
pm2 start frontend-server.js --name "judoleigh-frontend"

:: Save PM2 process list
pm2 save

echo Deployment completed!
echo.
echo The application should now be running at:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo.
echo To check the status of your servers, run: pm2 status
echo To view logs, run: pm2 logs 