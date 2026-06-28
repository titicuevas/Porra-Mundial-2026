@echo off
cd /d "%~dp0"
echo.
echo  Porra Mundial 2026 - servidor local
echo  Abre: http://localhost:8765
echo.
echo  Edita index.html y js/*
echo  Antes de subir a Vercel: preparar-deploy.bat
echo.
start "" "http://localhost:8765/"
python -m http.server 8765
