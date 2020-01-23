@echo off
start npx ngrok http 3000
start npx tsc -w
start npx nodemon -w dist dist/index.js
