@echo off
cd /d "%~dp0"
echo.
echo  Porra Mundial 2026 - servidor local
echo  Abre: http://localhost:8765
echo  Pulsa Ctrl+C para cerrar
echo.
start "" "http://localhost:8765/"
python -m http.server 8765
