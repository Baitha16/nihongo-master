@echo off
title 日本語マスター - Belajar Kosakata Jepang
color 0A

echo ========================================
echo    本語マスター - Belajar Kosakata Jepang
echo ========================================
echo.
echo  Memulai server...
echo.

cd /d "%~dp0"

start "" http://localhost:8080

python -m http.server 8080
