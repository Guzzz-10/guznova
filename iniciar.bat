@echo off
rem ============================================================
rem  AutoNova - iniciar el sitio en esta computadora (Windows)
rem  Hacer doble clic en este archivo. No cerrar la ventana negra
rem  mientras se usa el sitio.
rem ============================================================
title AutoNova - servidor local
cd /d "%~dp0"

rem Si se abrio desde adentro del ZIP (sin descomprimir), no hay package.json.
if not exist "package.json" (
  echo.
  echo  [!] Primero tenes que descomprimir el ZIP:
  echo      clic derecho sobre el ZIP, "Extraer todo...", y despues abri
  echo      iniciar.bat desde la carpeta extraida.
  echo.
  pause
  exit /b 1
)

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

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)"
if errorlevel 1 (
  echo.
  echo  [!] Tu version de Node.js es muy vieja. Instala la version LTS desde
  echo      https://nodejs.org, reinicia la computadora y volve a abrir este archivo.
  echo.
  pause
  exit /b 1
)

rem La marca .autonova-ok se crea solo cuando la instalacion termino bien.
if not exist "node_modules\.autonova-ok" (
  echo.
  echo  Instalando lo necesario. Solo la primera vez, puede tardar varios minutos...
  echo  No cierres esta ventana.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo  [!] La instalacion fallo. Copia el mensaje de arriba y envialo para revisarlo.
    echo.
    pause
    exit /b 1
  )
  type nul > "node_modules\.autonova-ok"
)

echo.
echo  ============================================================
echo    AutoNova se esta iniciando...
echo    Sitio:  http://localhost:3000
echo    Panel:  http://localhost:3000/admin   ^(admin / autonova2024^)
echo.
echo    El navegador se abre solo cuando el sitio este listo.
echo    NO cierres esta ventana mientras uses el sitio.
echo    Para apagarlo: cerra esta ventana.
echo.
echo    Si el sitio se queda cargando: hace clic en esta ventana
echo    y apreta Esc.
echo  ============================================================
echo.

rem Abre el navegador cuando el servidor responda, sin bloquear esta ventana.
start "" /b node scripts\abrir-navegador.mjs

call npm run dev

echo.
echo  El servidor se detuvo. Si ves un error arriba, copialo y envialo para revisarlo.
echo.
pause
