# Mr. Tatú — Roles

Tres capas. El visitante no necesita cuenta para cotizar ni ver el portafolio.

| Rol | Código (post-fork) | Auth | Qué hace |
|-----|--------------------|------|----------|
| **Visitante** | — | No | HOME, portafolio, cotizar, tienda, redes |
| **Cliente** | `cliente` / user público | JWT | Perfil, pedidos, solicitudes, reservas, favoritos |
| **Administrador** | `admin` | JWT | Productos, pedidos, portafolio, categorías, solicitudes, clientes, redes, contenido |

**Cajero / POS / recepción de equipos:** existen en CoreX. En este demo **no se exponen** (D10). Si el tatuador más adelante quiere taquilla de merch, se reabre como HU nueva.

---

## Sitio público (visitante)

- `/` HOME
- `/portafolio` (+ modal o `/portafolio/:id`)
- `/artista`
- `/cotizar`
- `/tienda`
- `/faq` · `/contacto`
- Carrito (puede ser localStorage hasta login)

Cotizar **sin** obligar a registrarse. Si hay sesión, se asocia a «Mis solicitudes».

---

## Área cliente (tras login)

- Perfil
- Mis pedidos
- Mis solicitudes de cotización
- Mis reservas
- Favoritos (piezas del portafolio y/o productos)

---

## Admin

| Módulo | Origen | Notas |
|--------|--------|-------|
| Productos | CoreX | Merch / aftercare |
| Pedidos | CoreX | |
| Categorías | CoreX | Reusar para merch; estilos de tattoo pueden ser tabla aparte |
| Clientes | CoreX | |
| Portafolio | **Nuevo** | Piezas, estilo, zona, descripción |
| Solicitudes | **Nuevo** | Inbox de cotizaciones |
| Reservas | **Nuevo** | Fecha de sesión (simple en el demo) |
| Redes / enlaces | **Nuevo** | URLs Instagram, TikTok, etc. |
| Contenido | CoreX si existe; si no, copy en seed | Hero, bio, stats |

Seed local (cuando exista): `admin@mr-tatu.local` / `MrTatu2026Admin`.
