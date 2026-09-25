#!/usr/bin/env bash
# ======================================================
# start-prod.sh â€” MR. TATOO (MV Ubuntu + Docker)
# Tunnel Cloudflare â†’ localhost:5519
#
# Uso:
#   ./start-prod.sh           # rÃ¡pido (sin rebuild)
#   ./start-prod.sh --build   # down + rebuild + up (conserva BD)
#   ./start-prod.sh -build    # alias de --build
#
# La BD NO se borra con --build. Solo se pierde con:
#   ./stop-prod.sh -v
# ======================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="$SCRIPT_DIR/backend/.env.production"
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-https://core-x-techs.com}"
PUBLIC_PORT="${PUBLIC_PORT:-5519}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "âŒ Falta backend/.env.production"
  echo "   Copia: cp backend/.env.production.example backend/.env.production"
  exit 1
fi

get_env() {
  grep -E "^${1}=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r'
}

export DB_PASSWORD="$(get_env DB_PASSWORD)"
export PUBLIC_PORT

if [[ -z "$DB_PASSWORD" ]]; then
  echo "âŒ DB_PASSWORD vacÃ­o en backend/.env.production"
  exit 1
fi

if grep -qE '^(DB_PASSWORD=cambiar_password|JWT_SECRET=cambiar_jwt|ADMIN_PASSWORD=cambiar_password_admin)' "$ENV_FILE"; then
  echo "âŒ backend/.env.production aÃºn tiene valores de plantilla (.example)"
  echo "   Edita en la MV: nano backend/.env.production"
  exit 1
fi

print_urls() {
  echo ""
  echo "Local (servidor):"
  echo "  Sitio:  http://127.0.0.1:${PUBLIC_PORT}"
  echo "  API:    http://127.0.0.1:${PUBLIC_PORT}/api/health"
  echo "  Admin:  http://127.0.0.1:${PUBLIC_PORT}/login"
  echo ""
  echo "Internet (Cloudflare Tunnel):"
  echo "  Sitio:  ${PUBLIC_DOMAIN}"
  echo "  API:    ${PUBLIC_DOMAIN}/api/health"
  echo ""
}

health_check() {
  echo ""
  echo "Healthcheck..."
  sleep 5
  if curl -sf "http://127.0.0.1:${PUBLIC_PORT}/api/health" >/dev/null 2>&1; then
    echo "  OK  http://127.0.0.1:${PUBLIC_PORT}/api/health"
  else
    echo "  WARN  API aÃºn no responde â€” docker compose logs backend"
  fi
}

COMPOSE=(docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.prod.yml)

DO_BUILD=0
case "${1:-}" in
  --build|-build|build)
    DO_BUILD=1
    ;;
  "")
    ;;
  *)
    echo "âŒ Argumento desconocido: $1"
    echo "   Uso: ./start-prod.sh  |  ./start-prod.sh --build"
    echo "   (tambiÃ©n acepta -build)"
    exit 1
    ;;
esac

if [[ "$DO_BUILD" -eq 1 ]]; then
  echo "========================================"
  echo "MR. TATOO â€” PRODUCCIÃ“N (BUILD)"
  echo "========================================"
  echo "Reconstruyendo imÃ¡genes (volumen Postgres intacto)..."
  "${COMPOSE[@]}" down
  "${COMPOSE[@]}" build --no-cache
  if ! "${COMPOSE[@]}" up -d; then
    echo ""
    echo "âŒ FallÃ³ el arranque. Ãšltimas lÃ­neas del API:"
    "${COMPOSE[@]}" logs backend --tail 60 || true
    exit 1
  fi
  "${COMPOSE[@]}" ps
  health_check
  print_urls
  exit 0
fi

echo "========================================"
echo "MR. TATOO â€” PRODUCCIÃ“N (rÃ¡pido)"
echo "========================================"
if ! "${COMPOSE[@]}" up -d; then
  echo ""
  echo "âŒ FallÃ³ el arranque. Ãšltimas lÃ­neas del API:"
  "${COMPOSE[@]}" logs backend --tail 60 || true
  exit 1
fi
"${COMPOSE[@]}" ps
health_check
print_urls
