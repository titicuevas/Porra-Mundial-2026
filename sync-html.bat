@echo off
cd /d "%~dp0"
copy /Y "porra-mundial-2026.html" "index.html" >nul
if errorlevel 1 (
  echo Error al copiar porra-mundial-2026.html a index.html
  exit /b 1
)
echo OK: porra-mundial-2026.html ^> index.html sincronizado.
