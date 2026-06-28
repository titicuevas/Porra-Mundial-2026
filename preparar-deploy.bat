@echo off
cd /d "%~dp0"
echo.
echo  === Porra Mundial 2026 — preparar despliegue ===
echo.
node scripts/sync-version.js
if errorlevel 1 goto fail
echo.
node scripts/verify.js
if errorlevel 1 goto fail
echo.
echo  Siguiente paso:
echo    git add .
echo    git commit -m "Tu mensaje"
echo    git push
echo.
pause
exit /b 0
:fail
echo.
echo  Corrige los errores antes de hacer push.
pause
exit /b 1
