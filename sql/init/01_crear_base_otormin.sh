#!/bin/sh
# Se ejecuta una sola vez, cuando el volumen de Postgres está vacío.
# Crea la base "otormin" (datos del bot) al lado de la base "n8n"
# (datos internos de n8n) y le aplica sql/schema.sql.
set -e

DB_APP="${OTORMIN_DB_NAME:-otormin}"

if ! psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
    "SELECT 1 FROM pg_database WHERE datname = '${DB_APP}'" | grep -q 1; then
  echo "Creando base ${DB_APP}..."
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE \"${DB_APP}\""
fi

echo "Aplicando schema.sql en ${DB_APP}..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$DB_APP" -f /otormin/schema.sql
