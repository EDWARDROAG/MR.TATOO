# Mr. Tatú — Documentación

**Proyecto:** demo de sitio para tatuador (vitrina + cotización + tienda + auth).  
**Base técnica:** CoreX (copia; **no se modifica CoreX**).  
**Última actualización:** 2026-09-22 · Fase 0 (docs, sin código).

## Índice

| Documento | Para qué |
|-----------|----------|
| [memory.md](memory.md) | Estado de la sesión |
| [ALCANCE.md](ALCANCE.md) | Fronteras y reúso |
| [DECISIONES.md](DECISIONES.md) | Decisiones ya tomadas |
| [CONCEPTO-VISUAL.md](CONCEPTO-VISUAL.md) | Dirección visual y HOME |
| [REFERENCIAS.md](REFERENCIAS.md) | Estudios locales y mockup |
| [HISTORIAS_USUARIO.md](HISTORIAS_USUARIO.md) | Épicas / HUs / criterios |
| [ROLES.md](ROLES.md) | Visitante, cliente, admin |
| [ENTORNOS.md](ENTORNOS.md) | Local · Docker/LAN · MV |
| [../README.md](../README.md) | Entrada del proyecto |

## Tres entornos (misma lógica que CoreX / Apple Store)

| Entorno | Uso | Cómo (post-fork) |
|---------|-----|------------------|
| **Local** | Desarrollo diario | PostgreSQL Docker + `npm run dev` |
| **Docker/LAN** | Pruebas en la red | `start-lan.ps1` |
| **Producción (MV)** | Ubuntu Lamakinet | `start-prod.sh` |

Puertos reservados: front **5510** / API **3011** / PG **5438** / LAN-MV **5519**.

## Regla de oro

Trabajo **solo** bajo `produccion/mr-tatu/`. CoreX, Mr. Luigi y Apple Store no se editan en esta sesión ni en el fork.
