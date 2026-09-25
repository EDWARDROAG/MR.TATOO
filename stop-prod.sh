#!/usr/bin/env bash
# ======================================================
# stop-prod.sh â€” MR. TATOO
#
# Uso:
#   ./stop-prod.sh       # detener (conserva volÃºmenes)
#   ./stop-prod.sh -v    # detener + borrar volÃºmenes (Â¡pierde datos!)
# ======================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="$SCRIPT_DIR/backend/.env.production"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.prod.yml)

echo "========================================"
echo "DETENIENDO MR. TATOO"
echo "========================================"

if [[ "${1:-}" == "-v" ]]; then
  echo "âš ï¸  Borrando volÃºmenes..."
  "${COMPOSE[@]}" down -v
else
  "${COMPOSE[@]}" down
fi

echo ""
echo "OK â€” stack detenido."
