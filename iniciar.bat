@echo off
rem ============================================================
rem  AutoNova - iniciar el sitio en esta computadora (Windows)
rem  Hacer doble clic en este archivo. No cerrar la ventana negra
rem  mientras se usa el sitio.
rem ============================================================
title AutoNova - servidor local
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [!] No se encontro Node.js en esta computadora.
  echo      1. Descargalo desde https://nodejs.org  ^(boton "LTS"^)
  echo      2. Instalalo con las opciones por defecto
  echo      3. Reinicia la computadora y volve a abrir este archivo
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo.
  echo  Instalando lo necesario. Solo la primera vez, puede tardar varios minutos...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo  [!] La instalacion fallo. Copia el mensaje de arriba y envialo para revisarlo.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo  ============================================================
echo    AutoNova se esta iniciando...
echo    Sitio:  http://localhost:3000
echo    Panel:  http://localhost:3000/admin   ^(admin / autonova2024^)
echo.
echo    El navegador se abre solo en unos segundos.
echo    NO cierres esta ventana mientras uses el sitio.
echo    Para apagarlo: Ctrl + C
echo  ============================================================
echo.

rem Abre el navegador despues de unos segundos, sin bloquear esta ventana.
start "" /b cmd /c "ping -n 13 127.0.0.1 >nul & start "" http://localhost:3000"

call npm run dev

echo.
echo  El servidor se detuvo. Si ves un error arriba, copialo y envialo para revisarlo.
echo.
pause
