# Mr. Tatú — Alcance

**Fecha:** 2026-09-22  
**Fase:** 0 (análisis y docs). Sin código hasta «ejecuta».

## Problema

Hay un tatuador potencial. Hay que **venderle la idea** con una muestra (Mr. Tatú), no desarrollar contra sus datos reales todavía. El producto final debe sentirse de estudio de tatuaje (oscuro, portafolio al centro, cotizar a la vista) y, a la vez, reutilizar la vitrina de productos + login + panel que ya funcionan en CoreX / Mr. Luigi.

## Opciones

| Opción | Pros | Contras | Esfuerzo |
|--------|------|---------|----------|
| **A. Fork CoreX → `mr-tatu/`** (elegida) | Misma familia que Apple Store; tienda, auth, admin y 3 entornos ya resueltos; CoreX queda intacto | CoreX es **React + Vite**, no Angular | Medio, cuando se ejecute |
| B. Fork Mr. Luigi (Angular) | Encaja con el briefing que pedía Angular | No es la base que pidió el CEO; duplica criterio | Medio |
| C. Trabajar dentro de CoreX | Cero copia | **Prohibido:** ensucia un producto en producción (core-x-techs.com) | — |

## Recomendación (cerrada)

**Opción A.** CoreX es la base de la que se **toma** el proyecto. Se copia a esta carpeta. **No se modifica CoreX.**

El briefing inicial hablaba de Angular. Al fijar CoreX como origen, el demo queda en **React + Vite + Node + PostgreSQL**, igual que Apple Store. Si más adelante se exige Angular, habría que cambiar de origen (Luigi) — eso sería otra decisión, no esta.

## Qué se reutiliza de CoreX (después del fork)

- Auth (login / registro / JWT)
- Tienda: productos, categorías, carrito, checkout, pedidos
- Área de usuario (perfil, pedidos)
- Panel admin: productos, pedidos, clientes, categorías
- Patrón de **3 entornos**: local · Docker/LAN · MV
- Scripts `start-lan` / `start-prod` (renombrados, puertos nuevos)

## Qué es nuevo (dominio tatuaje)

- HOME con hero a pantalla completa y CTAs **Ver portafolio** / **Cotizar**
- Portafolio masonry + filtros de estilo + modal «Quiero algo parecido»
- Artista, estilos, proceso (5 pasos), FAQ, redes/feed
- Formulario de cotización (idea, estilo, zona, tamaño, referencias)
- Admin: portafolio, solicitudes, reservas, enlaces de redes
- Área cliente: cotizaciones, reservas, favoritos

## Qué no entra en el demo (ocultar o no sembrar)

Módulos CoreX de **tienda de tecnología**, no de estudio:

- POS / cajero
- Recepción y entrega de equipos
- Mantenimiento / PDF de recepción
- Copy gamer / “CoreX Technologies”

## Fuera de alcance (esta sesión)

- Copiar código de CoreX
- Crear `backend/` / `frontend/` / Docker
- Commits / push
- Datos reales del tatuador
- Editar CoreX, Luigi, Apple Store o Lamakinet

## Siguiente paso si apruebas

1. Revisar [CONCEPTO-VISUAL.md](CONCEPTO-VISUAL.md) y el mockup.
2. Cuando el concepto guste: **«ejecuta HU-014»** (boceto HTML) **o** **«ejecuta HU-002»** (fork CoreX).
