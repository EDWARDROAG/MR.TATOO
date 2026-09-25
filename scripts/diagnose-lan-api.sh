#!/usr/bin/env bash
# DiagnÃ³stico cuando mr-tatoo-lan-api queda unhealthy
# Uso: ./scripts/diagnose-lan-api.sh

set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE="backend/.env.lan"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.lan.yml)

echo "========================================"
echo "MR. TATOO â€” DiagnÃ³stico API LAN"
echo "========================================"
echo ""

if [[ ! -f "$ENV_FILE" ]]; then
  echo "âŒ Falta $ENV_FILE"
  exit 1
fi

echo "1) Variables (sin secretos)"
for key in DB_HOST DB_NAME DB_USER PORT NODE_ENV; do
  val="$(grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' || true)"
  echo "   $key=${val:-<vacÃ­o>}"
done
echo ""

echo "2) Estado contenedores"
"${COMPOSE[@]}" ps || true
echo ""

echo "3) Ãšltimos logs del API"
"${COMPOSE[@]}" logs backend --tail 50 || true
echo ""

echo "4) Health local"
if curl -sf "http://127.0.0.1:${PUBLIC_PORT:-5519}/api/health" >/dev/null 2>&1; then
  echo "   OK  http://127.0.0.1:${PUBLIC_PORT:-5519}/api/health"
else
  echo "   FAIL"
  echo ""
  echo "ðŸ’¡ Si ves 'password authentication failed':"
  echo "   docker compose --env-file backend/.env.lan -f docker-compose.yml -f docker-compose.lan.yml down -v"
  echo "   ./start-lan.sh --build"
fi
echo ""
