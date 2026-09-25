#!/usr/bin/env bash
# Aplica migraciones SQL de productos v2 y subcategorÃ­as (Docker LAN)
# Uso: ./scripts/migrate-products.sh

set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE=(docker compose --env-file backend/.env.lan -f docker-compose.yml -f docker-compose.lan.yml)
MIGRATIONS=(
  database/migrations/002-productos-v2.sql
  database/migrations/003-subcategorias.sql
)

for file in "${MIGRATIONS[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "WARN  No encontrado: $file"
    continue
  fi
  echo "Aplicando $file ..."
  cat "$file" | "${COMPOSE[@]}" exec -T postgres psql -U mr_tatoo_user -d mr_tatoo_db
done

echo "Listo."
