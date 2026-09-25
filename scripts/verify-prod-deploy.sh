#!/usr/bin/env bash
# VerificaciÃ³n post-deploy MR. TATOO en la MV
# Uso: cd ~/MR. TATOO && ./scripts/verify-prod-deploy.sh

set -euo pipefail

cd "$(dirname "$0")/.."

PUBLIC_PORT="${PUBLIC_PORT:-5519}"
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-https://core-x-techs.com}"

echo "========================================"
echo "MR. TATOO â€” VerificaciÃ³n deploy"
echo "========================================"
echo ""

echo "1) Contenedores"
if ! docker ps --format '{{.Names}}' | grep -q 'mr-tatoo-prod-web'; then
  echo "   FAIL  mr-tatoo-prod-web no estÃ¡ corriendo"
  exit 1
fi
if ! docker ps --format '{{.Names}}' | grep -q 'mr-tatoo-prod-api'; then
  echo "   FAIL  mr-tatoo-prod-api no estÃ¡ corriendo"
  exit 1
fi
echo "   OK  contenedores prod activos"
echo ""

echo "2) API health local"
if curl -sf "http://127.0.0.1:${PUBLIC_PORT}/api/health" >/dev/null; then
  echo "   OK  http://127.0.0.1:${PUBLIC_PORT}/api/health"
else
  echo "   FAIL  API no responde"
fi
echo ""

echo "3) Dominio (Cloudflare)"
if curl -sfL "${PUBLIC_DOMAIN}/api/health" >/dev/null 2>&1; then
  echo "   OK  ${PUBLIC_DOMAIN}/api/health"
else
  echo "   WARN  dominio aÃºn no responde â€” revisar tunnel y DNS"
fi
echo ""

echo "4) ImÃ¡genes estÃ¡ticas en el contenedor"
IMG_COUNT="$(docker exec mr-tatoo-prod-web sh -c 'ls /usr/share/nginx/html/images 2>/dev/null | wc -l' | tr -d '[:space:]')"
if [[ "${IMG_COUNT}" =~ ^[0-9]+$ ]] && [[ "${IMG_COUNT}" -ge 5 ]]; then
  echo "   OK  ${IMG_COUNT} archivos en /usr/share/nginx/html/images"
else
  echo "   FAIL  faltan imÃ¡genes en el contenedor (count=${IMG_COUNT})"
  echo "         git pull + ./start-prod.sh --build (Â¿estaban en el repo?)"
fi
echo ""

echo "5) Content-Type local de /images/banher.png"
CT_LOCAL="$(curl -sI "http://127.0.0.1:${PUBLIC_PORT}/images/banher.png" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print tolower($2); exit}')"
if echo "${CT_LOCAL}" | grep -q 'image/'; then
  echo "   OK  local Content-Type: ${CT_LOCAL}"
else
  echo "   FAIL  local devolviÃ³: ${CT_LOCAL:-vacÃ­o} (debe ser image/*)"
  echo "         Si es text/html, nginx estÃ¡ sirviendo el SPA en vez del PNG"
fi
echo ""

echo "6) Content-Type vÃ­a dominio (Cloudflare)"
CT_CF="$(curl -sI "${PUBLIC_DOMAIN}/images/banher.png" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print tolower($2); exit}')"
CF_STATUS="$(curl -sI "${PUBLIC_DOMAIN}/images/banher.png" | tr -d '\r' | awk -F': ' 'tolower($1)=="cf-cache-status"{print $2; exit}')"
if echo "${CT_CF}" | grep -q 'image/'; then
  echo "   OK  dominio Content-Type: ${CT_CF} (cf=${CF_STATUS:-n/a})"
else
  echo "   FAIL  dominio devolviÃ³: ${CT_CF:-vacÃ­o} (cf=${CF_STATUS:-n/a})"
  if echo "${CT_LOCAL}" | grep -q 'image/'; then
    echo "         Origen OK â†’ purgar cachÃ© Cloudflare (Caching â†’ Configuration â†’ Purge Everything)"
    echo "         o solo URL: ${PUBLIC_DOMAIN}/images/*"
  fi
fi
echo ""

echo "Listo."
