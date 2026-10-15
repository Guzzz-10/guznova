#!/bin/bash
# ============================================================
#  AutoNova - iniciar el sitio en esta computadora (Mac)
#  Hacer doble clic en este archivo. No cerrar la ventana de
#  Terminal mientras se usa el sitio.
# ============================================================
cd "$(dirname "$0")" || exit 1

# Node instalado con el instalador oficial o con Homebrew
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

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

if [ ! -d node_modules ]; then
  echo
  echo " Instalando lo necesario. Solo la primera vez, puede tardar varios minutos..."
  echo
  if ! npm install; then
    echo
    echo " [!] La instalación falló. Copiá el mensaje de arriba y envialo para revisarlo."
    pausar
    exit 1
  fi
fi

echo
echo " ============================================================"
echo "   AutoNova se está iniciando..."
echo "   Sitio:  http://localhost:3000"
echo "   Panel:  http://localhost:3000/admin   (admin / autonova2024)"
echo
echo "   El navegador se abre solo en unos segundos."
echo "   NO cierres esta ventana mientras uses el sitio."
echo "   Para apagarlo: Ctrl + C"
echo " ============================================================"
echo

# Abre el navegador después de unos segundos, sin bloquear.
( sleep 12; open "http://localhost:3000" ) &

npm run dev

echo
echo " El servidor se detuvo. Si ves un error arriba, copialo y envialo para revisarlo."
pausar
