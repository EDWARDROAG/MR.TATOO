# Mr. Tatoo

Demo comercial de estudio de tatuaje (vitrina + cotización + tienda + login).  
**Origen:** fork limpio de CoreX. **CoreX no se modifica.**

**Alcance:** `ideas html/associates/produccion/mr-tatoo/`  
**Marca:** MR. TATOO · *Ink. Art. Identity.*

---

## Arranque rápido (local)

```powershell
docker compose -f docker/docker-compose.dev.yml up -d   # Postgres :5438

cd backend
npm install
npm run seed
npm run dev    # http://localhost:3011

cd ../frontend
npm install
npm run dev    # http://localhost:5510
```

Admin seed: `admin@mr-tatoo.local` / `MrTatoo2026Admin`

---

## Vitrina para el cliente (GitHub Pages)

Front estático, sin API. Guía: [docs/VITRINA.md](docs/VITRINA.md)

URL esperada: **https://edwardroag.github.io/mr-tatoo/**

---

## Los 3 entornos (no chocan con CoreX)

| Entorno | Front | API | Cómo |
|---------|-------|-----|------|
| **1. Local** | **5510** | **3011** | Node + Vite; Postgres Docker **`:5438`** |
| **2. Docker / LAN** | **5519** | interno | `.\start-lan.ps1` · `mr-tatoo-lan-*` |
| **3. MV** | **5519** + tunnel | interno | `./start-prod.sh` · `mr-tatoo-prod-*` |

BD: `mr_tatoo_db` / usuario `mr_tatoo_user`. Nunca `corex_db`.

Detalle: [docs/ENTORNOS.md](docs/ENTORNOS.md)
# MR.TATOO
