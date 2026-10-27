@echo off
title CivicConnect Citizen Dashboard
echo ========================================================
echo Starting CivicConnect Citizen Dashboard Local Server...
echo ========================================================
start http://localhost:3000
node server.js
pause
