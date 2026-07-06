@echo off
setlocal
cd /d "%~dp0"
title CubaRemesas

echo ============================================
echo    CubaRemesas - Envio de remesas a Cuba
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 goto no_node

for /f "delims=" %%v in ('node --version') do echo [OK] Node.js %%v detectado.
echo.

echo [1/3] Instalando dependencias (la primera vez tarda unos minutos)...
call npm install
if errorlevel 1 goto error
echo.

echo [2/3] Compilando la aplicacion...
call npm run build
if errorlevel 1 goto error
echo.

echo [3/3] Iniciando el servidor en una ventana nueva...
start "CubaRemesas - servidor (NO CERRAR)" cmd /k npm start

echo.
echo Esperando a que arranque el servidor...
timeout /t 7 /nobreak >nul
start "" http://localhost:4000

echo.
echo ============================================
echo   Listo. La app se abrio en tu navegador:
echo.
echo        http://localhost:4000
echo.
echo   Si el navegador muestra un error, espera
echo   unos segundos y actualiza la pagina (F5).
echo.
echo   Para DETENER la app: cierra la ventana
echo   titulada "CubaRemesas - servidor".
echo ============================================
echo.
pause
exit /b 0

:no_node
echo [X] No se encontro Node.js.
echo.
echo     1) Instalalo desde:  https://nodejs.org   (elige la version "LTS")
echo     2) Vuelve a hacer doble clic en este archivo.
echo.
pause
exit /b 1

:error
echo.
echo [X] Hubo un error. Revisa los mensajes de arriba.
echo     Sacale una captura y enviamela para ayudarte.
echo.
pause
exit /b 1
