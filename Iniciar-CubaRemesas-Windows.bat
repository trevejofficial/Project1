@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title CubaRemesas - Envio de remesas a Cuba
color 0b

echo ============================================
echo    CubaRemesas - Iniciando la aplicacion
echo ============================================
echo.

REM 1) Comprobar que Node.js esta instalado
where node >nul 2>nul
if errorlevel 1 (
  echo [X] No se encontro Node.js.
  echo.
  echo     Instalalo desde: https://nodejs.org  ^(elige la version "LTS"^)
  echo     Cuando termine, vuelve a hacer doble clic en este archivo.
  echo.
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node --version') do echo [OK] Node.js %%v detectado.
echo.

REM 2) Instalar dependencias (solo tarda la primera vez)
echo [1/3] Instalando dependencias... (puede tardar unos minutos la primera vez)
call npm install
if errorlevel 1 (
  echo.
  echo [X] Hubo un error instalando dependencias. Revisa el mensaje de arriba.
  pause
  exit /b 1
)
echo.

REM 3) Compilar la aplicacion
echo [2/3] Compilando la aplicacion...
call npm run build
if errorlevel 1 (
  echo.
  echo [X] Hubo un error al compilar. Revisa el mensaje de arriba.
  pause
  exit /b 1
)
echo.

REM 4) Abrir el navegador (con un pequeno retraso) e iniciar el servidor
echo [3/3] Iniciando el servidor...
echo.
echo     La app se abrira sola en: http://localhost:4000
echo     Para DETENERLA: cierra esta ventana o pulsa Ctrl + C.
echo.
start "" /b cmd /c "timeout /t 6 /nobreak >nul & start "" http://localhost:4000"
call npm start

pause
