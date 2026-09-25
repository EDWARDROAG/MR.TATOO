#!/usr/bin/env bash
# Bootstrap BD en producciÃ³n (contenedor Docker) â€” usa backend/.env.production
#
# Uso:
#   ./bootstrap-prod.sh              # seed producciÃ³n (solo admin)
#   ./bootstrap-prod.sh --reset-admin
#   ./bootstrap-prod.sh --fresh      # BD limpia: borra volÃºmenes + build + seed prod

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="$SCRIPT_DIR/backend/.env.production"
PUBLIC_PORT="${PUBLIC_PORT:-5519}"
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-https://core-x-techs.com}"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.prod.yml)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "âŒ Falta backend/.env.production"
  exit 1
fi

get_env() {
  grep -E "^${1}=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r'
}

run_seed_prod() {
  echo "MR. TATOO â€” Seed producciÃ³n (solo administrador, sin productos demo)"
  "${COMPOSE[@]}" exec -T backend npm run seed:prod
}

if [[ "${1:-}" == "--fresh" ]]; then
  echo "========================================"
  echo "MR. TATOO â€” BD LIMPIA (primera vez / reset total)"
  echo "========================================"
  echo "âš ï¸  Esto borra el volumen PostgreSQL y los datos del contenedor."
  read -r -p "Â¿Continuar? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Cancelado."
    exit 0
  fi
  ./stop-prod.sh -v
  ./start-prod.sh --build
  run_seed_prod
elif [[ "${1:-}" == "--reset-admin" ]]; then
  echo "========================================"
  echo "MR. TATOO â€” Restablecer password admin (prod)"
  echo "========================================"
  "${COMPOSE[@]}" exec -T backend npm run seed:reset-admin
else
  echo "========================================"
  run_seed_prod
  echo "========================================"
fi

EMAIL="$(get_env ADMIN_EMAIL)"
PASS="$(get_env ADMIN_PASSWORD)"

echo ""
echo "Listo."
echo "Login:  $EMAIL"
echo "Clave:  $PASS"
echo "URL:    ${PUBLIC_DOMAIN}/login"
echo "Local:  http://127.0.0.1:${PUBLIC_PORT}/login"
echo ""
