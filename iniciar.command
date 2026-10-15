#!/bin/bash
# ============================================================
#  AutoNova - iniciar el sitio en esta computadora (Mac)
#  Hacer doble clic en este archivo. No cerrar la ventana de
#  Terminal mientras se usa el sitio.
# ============================================================
cd "$(dirname "$0")" || exit 1

# Por si Terminal no cargó el PATH (Node del instalador oficial o de Homebrew).
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin"

pausar() { echo; read -r -p "Presioná Enter para cerrar esta ventana..."; }

if ! command -v node >/dev/null 2>&1; then
  echo
  echo " [!] No se encontró Node.js en esta computadora."
  echo "     1. Descargalo desde https://nodejs.org (botón \"LTS\")"
  echo "     2. Instalalo con las opciones por defecto"
  echo "     3. Volvé a abrir este archivo"
  pausar
  exit 1
fi

if ! node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)"; then
  echo
  echo " [!] Tu versión de Node.js es muy vieja. Instalá la versión LTS desde"
  echo "     https://nodejs.org y volvé a abrir este archivo."
  pausar
  exit 1
fi

# La marca .autonova-ok se crea solo cuando la instalación terminó bien.
if [ ! -f node_modules/.autonova-ok ]; then
  echo
  echo " Instalando lo necesario. Solo la primera vez, puede tardar varios minutos..."
  echo " No cierres esta ventana."
  echo
  if ! npm install; then
    echo
    echo " [!] La instalación falló. Copiá el mensaje de arriba y envialo para revisarlo."
    pausar
    exit 1
  fi
  touch node_modules/.autonova-ok
fi

echo
echo " ============================================================"
echo "   AutoNova se está iniciando..."
echo "   Sitio:  http://localhost:3000"
echo "   Panel:  http://localhost:3000/admin   (admin / autonova2024)"
echo
echo "   El navegador se abre solo cuando el sitio esté listo."
echo "   NO cierres esta ventana mientras uses el sitio."
echo "   Para apagarlo: Ctrl + C"
echo " ============================================================"
echo

# Abre el navegador cuando el servidor responda, sin bloquear esta ventana.
node scripts/abrir-navegador.mjs &
ABRIR_PID=$!

npm run dev

kill "$ABRIR_PID" 2>/dev/null
echo
echo " El servidor se detuvo. Si ves un error arriba, copialo y envialo para revisarlo."
pausar
