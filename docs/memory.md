# Memoria — Mr. Tatoo

**Última sesión:** 2026-09-25 (vitrina GitHub Pages)  
**Alcance:** `ideas html/associates/produccion/mr-tatoo/`  
**Modo:** desarrollo  
**Origen:** fork CoreX — **no se modifica CoreX**

---

## Último avance

| Fecha | Tema | Estado |
|-------|------|--------|
| 2026-09-22 | Docs + concepto | ✅ |
| 2026-09-22 | Fork, puertos, HOME oscura, seed, smoke local | ✅ |
| 2026-09-22 | 28 fotos locales + nav anclas | ✅ |
| 2026-09-25 | Vitrina estática + GitHub Action Pages | ✅ |

## Stack

- Frontend: React + Vite (`:5510`)
- Backend: Node / Express (`:3011`) — no va a Pages
- BD: PostgreSQL Docker host **5438**
- Vitrina: GitHub Pages `https://edwardroag.github.io/mr-tatoo/`

## Sesión 2026-09-25 — Vitrina para el cliente

### Hecho

Build `npm run build:pages` (sin API). Workflow `.github/workflows/deploy-vitrina.yml`. Guía `docs/VITRINA.md`. Banner de muestra. Fotos con BASE_URL.

### Pendiente CEO

1. Crear repo **privado** `EDWARDROAG/mr-tatoo`.  
2. Settings → Pages → Source: **GitHub Actions**.  
3. `git init` **dentro de** `produccion/mr-tatoo` (no el git de Documentos) → commit → push.  
4. Enviar al cliente: https://edwardroag.github.io/mr-tatoo/

### Siguiente paso concreto

Crear el repo en GitHub y hacer el primer push (comandos en `docs/VITRINA.md`). Dime si quieres que yo haga el commit.

## Convenciones

- Commits: solo si el usuario lo pide.
- Nunca editar `produccion/CoreX`.
