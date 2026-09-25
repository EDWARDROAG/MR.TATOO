# Mr. Tatoo — Los 3 entornos

**Última actualización:** 2026-09-25  
**Regla:** local · Docker/LAN · MV · **vitrina Pages**.  
**No usar .env, BD ni contenedores de CoreX.** Local ya humedecido (HU-002/003).

---

## Resumen

| # | Entorno | Dónde corre | Cómo se levantará | Front | API | Postgres |
|---|---------|-------------|-------------------|-------|-----|----------|
| 1 | **Local** | PC (Node + Vite) | `npm run dev` + Postgres Docker | **5510** | **3011** | host **5438** |
| 2 | **Docker / LAN** | PC con Docker Desktop | `.\start-lan.ps1` | **5519** (nginx) | interno `:3011` | red Docker |
| 3 | **MV** | Ubuntu Lamakinet | `./start-prod.sh` | **5519** (+ Cloudflare Tunnel) | interno `:3011` | red Docker |
| 4 | **Vitrina Pages** | GitHub Pages | push a `main` / Action | URL `…/mr-tatoo/` | **no** | **no** |

LAN y MV escuchan el mismo puerto host **5519**, pero **nunca a la vez en la misma máquina** (LAN = PC; MV = servidor). Contenedores distintos: `mr-tatoo-lan-*` vs `mr-tatoo-prod-*`.

---

## 1. Local

**Uso:** desarrollo diario (después del fork).

| Pieza | Destino (post HU-002) |
|-------|------------------------|
| Backend env | `backend/.env` |
| Frontend env | `frontend/.env` |
| Postgres | `docker compose -f docker/docker-compose.dev.yml up -d` |
| API | `cd backend && npm run dev` → http://localhost:3011 |
| Front | `cd frontend && npm run dev` → http://localhost:5510 |

- `DB_HOST=localhost` · `DB_PORT=5438` · BD `mr_tatoo_db`
- Contenedor PG: `mr-tatoo-postgres-dev`
- No reutilizar `corex_db` ni el volumen de CoreX

---

## 2. Docker / LAN

**Uso:** mostrar el demo en celular/tablet de la misma Wi‑Fi (útil para la reunión con el tatuador).

| Pieza | Destino (post HU-002) |
|-------|------------------------|
| Backend env | `backend/.env.lan` |
| Front build | `VITE_API_URL=/api` |
| Arranque | `.\start-lan.ps1` (+ `-Build` si rebuild) |
| URL | http://localhost:5519 · http://\<IP-LAN\>:5519 |

- Contenedores: `mr-tatoo-lan-api` · `mr-tatoo-lan-web` · `mr-tatoo-lan-postgres`
- API no se publica al host: nginx hace proxy a `/api`

---

## 3. MV (producción / ensayo serio)

**Uso:** servidor Ubuntu cuando el demo merezca URL pública.

| Pieza | Destino (post HU-002) |
|-------|------------------------|
| Backend env | `backend/.env.production` |
| Arranque | `./start-prod.sh` · `./start-prod.sh --build` |
| Público | Cloudflare Tunnel → `http://127.0.0.1:5519` |

- Contenedores: `mr-tatoo-prod-api` · `mr-tatoo-prod-web` · `mr-tatoo-prod-postgres`
- Secretos **propios**. Nunca copiar JWT / passwords de CoreX.
- `start-prod.sh --build` **no** borra la BD (sin `-v`).

---

## 4. Vitrina GitHub Pages (preview para el cliente)

**Uso:** link para el tatuador. Solo front. Sin Postgres ni API.

| Pieza | Destino |
|-------|---------|
| Build | `cd frontend && npm run build:pages` |
| Action | `.github/workflows/deploy-vitrina.yml` |
| Guía | [VITRINA.md](VITRINA.md) |
| URL | https://edwardroag.github.io/mr-tatoo/ |

---

## Mapa de puertos vs otros proyectos

| Proyecto | Local front / API | LAN o MV público | PG host local |
|----------|-------------------|------------------|---------------|
| Lamakinet | 5501 / 3002 | — | — |
| CoreX | 5506 / 3004 | 5514 | 5432 |
| Mr. Luigi | 5507 / 3007 | 5516 | 5433 |
| Apple Store | 5508 / 3008 | 5517 | 5436 |
| Canchas Sintéticas | 5509 / 3009 | 5518 | 5437 |
| Underbox | 5520 / 3010 | — | 5433 |
| **Mr. Tatoo** | **5510 / 3011** | **5519** | **5438** |

`3010` lo usa Underbox → API de Mr. Tatoo en **3011**.

---

## Identidad (los 3 entornos)

| Recurso | Valor |
|---------|-------|
| Prefijo contenedores | `mr-tatoo-*` |
| BD | `mr_tatoo_db` |
| Usuario | `mr_tatoo_user` |
| Volumen datos | `mr_tatoo_postgres_data` (LAN/prod no comparten volumen con local) |

Admin seed local: `admin@mr-tatoo.local` / `MrTatoo2026Admin` — **cambiar en LAN y MV**.

---

## Checklist al forkar (HU-002)

- [x] Copiar CoreX **sin** `node_modules`, `.git`, `frontend/public/docs`, `.env` de CoreX
- [x] No escribir nada dentro de `produccion/CoreX`
- [x] Sustituir puertos 5506/3004/5514 → 5510/3011/5519
- [x] Renombrar contenedores, BD y volúmenes
- [x] `FRONTEND_URL` / `CORS_ORIGIN` / `VITE_APP_NAME` = Mr. Tatoo
- [x] Smoke local `/api/health` + home `:5510` (2026-09-22)
