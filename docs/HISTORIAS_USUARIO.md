# Mr. Tatoo — Historias de usuario

**Proyecto:** Mr. Tatoo (demo tatuador)  
**Origen:** fork de CoreX — **sin modificar CoreX**  
**Carpeta:** `ideas html/associates/produccion/mr-tatoo/`  
**Última actualización:** 2026-09-25 (vitrina GitHub Pages)

### Regla de trabajo

1. Cada acción → HU aquí **antes** (o al inicio).
2. **No implementar** código sin HU. **No tocar** `produccion/CoreX`.
3. Ejecutar cuando el usuario diga **«ejecuta»** / **«procede»**.
4. Al cerrar: estado `Hecho` + bitácora.

---

## Cómo leer

| Campo | Significado |
|-------|-------------|
| **ID** | `HU-XXX` |
| **Estado** | `Hecho` · `En progreso` · `Pendiente` · `Bloqueado` |
| **Prioridad** | `P0` crítico · `P1` alto · `P2` medio · `P3` bajo |
| **Criterio de aceptación** | Cómo sabemos que está cumplida |

---

## Matriz

| ID | Épica | Tema | Pri | Estado |
|----|-------|------|-----|--------|
| HU-001 | 0 | Carpeta docs + alcance | P0 | **Hecho** |
| HU-002 | 0 | Fork limpio CoreX → `mr-tatoo/` | P0 | **Hecho** |
| HU-003 | 0 | Identidad, puertos, env propios | P0 | **Hecho** |
| HU-004 | 0 | Tres entornos local / LAN / MV | P0 | En progreso (local OK) |
| HU-010 | 1 | Dirección visual aprobable | P0 | **Hecho** (doc) |
| HU-011 | 1 | Recorrido HOME + CTAs | P0 | **Hecho** |
| HU-012 | 1 | Paleta, tipo, acento | P1 | **Hecho** (acento rojo del mockup) |
| HU-013 | 1 | Pack de imágenes demo con licencia | P1 | **Hecho** (28/29 locales) |
| HU-014 | 1 | Boceto HTML estático navegable | P1 | Omitida (se fue a React) |
| HU-020 | 2 | Shell público (nav, footer, tema) | P0 | **Hecho** |
| HU-021 | 2 | Hero pantalla completa | P0 | **Hecho** |
| HU-022 | 2 | El artista + stats ficticios | P1 | **Hecho** |
| HU-023 | 2 | Tarjetas de estilos | P1 | **Hecho** |
| HU-024 | 2 | Proceso 5 pasos | P1 | **Hecho** |
| HU-025 | 2 | FAQ | P2 | Pendiente |
| HU-026 | 2 | Contacto | P2 | Pendiente (página CoreX aún) |
| HU-030 | 3 | Filtros de portafolio | P0 | **Hecho** |
| HU-031 | 3 | Galería masonry | P0 | **Hecho** |
| HU-032 | 3 | Modal / detalle de pieza | P0 | **Hecho** |
| HU-033 | 3 | «Quiero algo parecido» | P1 | **Hecho** |
| HU-040 | 4 | Formulario cotizar | P0 | **Hecho** (WhatsApp) |
| HU-041 | 4 | Adjuntos de referencia | P1 | Pendiente |
| HU-042 | 4 | Admin: inbox de solicitudes | P0 | Pendiente |
| HU-043 | 4 | Cliente: mis solicitudes | P1 | Pendiente |
| HU-050 | 5 | Bloque redes + feed | P1 | **Hecho** (visual) |
| HU-051 | 5 | Admin: enlaces de redes | P2 | Pendiente |
| HU-060 | 6 | Catálogo tienda (reúso CoreX) | P1 | En progreso |
| HU-061 | 6 | Carrito | P1 | Pendiente (heredado) |
| HU-062 | 6 | Checkout | P1 | Pendiente (heredado) |
| HU-070 | 7 | Login / registro tematizado | P1 | Pendiente (login CoreX sigue) |
| HU-071 | 7 | Perfil + pedidos | P1 | Pendiente |
| HU-072 | 7 | Reservas y favoritos | P2 | Pendiente |
| HU-080 | 8 | Admin: ocultar POS/equipos | P0 | En progreso (fuera del nav) |
| HU-081 | 8 | Admin: portafolio CMS | P0 | Pendiente |
| HU-082 | 8 | Admin: contenido / copy | P2 | Pendiente |
| HU-090 | 9 | Seed demo marcado como ficticio | P1 | En progreso |
| HU-091 | 9 | Disclaimer demo vs cliente real | P1 | **Hecho** (banner vitrina) |
| HU-092 | 9 | Vitrina estática GitHub Pages | P0 | **Hecho** |

---

## Épica 0 — Carpeta, origen CoreX, entornos

### HU-001 — Carpeta `mr-tatu` y documentación de producto

| | |
|---|---|
| **Estado** | Hecho |
| **Prioridad** | P0 |
| **Como** | arquitecto |
| **Quiero** | una carpeta propia con alcance, visual, entornos, roles y backlog |
| **Para** | vender la idea al tatuador y no ensuciar CoreX |

**Por qué:** CoreX está en producción. El demo es otro producto.

**Qué se hizo:** `produccion/mr-tatu/` con README + `docs/` (ALCANCE, DECISIONES, CONCEPTO-VISUAL, REFERENCIAS, ENTORNOS, ROLES, HISTORIAS, memory) y mockup `docs/assets/home-mockup.jpg`. Cero código de aplicación. Cero cambios en CoreX.

**Criterio de aceptación:**
- Existe `ideas html/associates/produccion/mr-tatu/docs/`.
- CoreX no tiene diffs de esta sesión.
- Queda escrito: origen = CoreX; no se modifica CoreX; 3 entornos reservados.

### Bitácora

- 2026-09-22: docs creados. Fork **no** ejecutado.

---

### HU-002 — Fork limpio CoreX → Mr. Tatoo

| | |
|---|---|
| **Estado** | Hecho |
| **Prioridad** | P0 |
| **Como** | desarrollador |
| **Quiero** | una copia independiente de CoreX en esta carpeta |
| **Para** | reutilizar tienda, auth y admin sin tocar el original |

**Por qué:** Mismo patrón que Apple Store.

**Qué se hizo:**
- Copia a `produccion/mr-tatoo/` sin `node_modules`, `.git`, docs CoreX, uploads.
- Puertos 5510 / 3011 / 5438 / 5519. BD `mr_tatoo_db`.
- CoreX no se tocó.

**Criterio de aceptación:**
- `mr-tatoo/backend` y `mr-tatoo/frontend` existen.
- `produccion/CoreX` sin cambios de este fork.
- Seed y smoke local OK.

### Bitácora

- 2026-09-22: fork + seed + home en `:5510`.

---

### HU-003 — Identidad y puertos propios

| | |
|---|---|
| **Estado** | Hecho |
| **Prioridad** | P0 |
| **Como** | operador |
| **Quiero** | que nada se llame CoreX ni use 5506/3004/5514 |
| **Para** | no chocar con el producto vivo ni confundir al cliente |

**Criterio de aceptación:**
- Front local **5510**, API **3011**, PG **5438**, LAN/MV **5519**.
- `VITE_APP_NAME` / títulos / seed = Mr. Tatoo.
- BD `mr_tatoo_db`. JWT y passwords distintos a CoreX.

### Bitácora

- 2026-09-22: env, Docker, nginx y seed con identidad Mr. Tatoo.
- BD `mr_tatu_db`. JWT y passwords distintos a CoreX.

---

### HU-004 — Tres entornos operativos

| | |
|---|---|
| **Estado** | Pendiente |
| **Prioridad** | P0 |
| **Como** | CEO |
| **Quiero** | local, Docker/LAN y MV con la misma lógica que CoreX |
| **Para** | desarrollar, mostrar en el celular del tatuador y, si cierra, publicar |

**Criterio de aceptación:**
- Local: home en `:5510` y `/api/health` en `:3011`.
- LAN: `start-lan.ps1` sirve `:5519` (nginx + `/api`).
- MV: `start-prod.sh` documentado; `--build` no borra volumen.
- Checklist en [ENTORNOS.md](ENTORNOS.md) marcado.

---

## Épica 1 — Boceto visual (antes de programar el producto)

### HU-010 — Dirección visual documentada

| | |
|---|---|
| **Estado** | Hecho (documento) |
| **Prioridad** | P0 |
| **Como** | comercial |
| **Quiero** | un concepto escrito + mockup de HOME |
| **Para** | enseñárselo al tatuador sin haber gastado el fork |

**Criterio de aceptación:** [CONCEPTO-VISUAL.md](CONCEPTO-VISUAL.md) + mockup en `docs/assets/`. Paleta, tipo, orden de secciones y CTAs definidos.

---

### HU-011 — Recorrido HOME y acciones visibles

| | |
|---|---|
| **Estado** | Hecho (documento) |
| **Prioridad** | P0 |
| **Como** | visitante |
| **Quiero** | ver portafolio y cotizar en el primer pantallazo |
| **Para** | no perderme en un diseño bonito pero mudo |

**Criterio de aceptación:** Hero con **VER PORTAFOLIO** y **COTIZAR MI TATUAJE**. Orden de secciones el de CONCEPTO-VISUAL. Criterio inspirado en Crisbo (acción primero).

---

### HU-012 — Paleta y tipografías

| | |
|---|---|
| **Estado** | Hecho (doc; acento aún eligiendo) |
| **Prioridad** | P1 |
| **Como** | diseñador |
| **Quiero** | negro profundo + un acento + display + sans |
| **Para** | que el tatuaje mande y no el color de plantilla |

**Criterio de aceptación:** Tokens en CONCEPTO-VISUAL. Acento rojo del mockup **o** naranja/dorado (D7) decidido antes de HU-020.

---

### HU-013 — Pack de imágenes demo

| | |
|---|---|
| **Estado** | Hecho |
| **Prioridad** | P1 |
| **Como** | comercial |
| **Quiero** | fotos de tatuajes y merch con licencia |
| **Para** | el boceto/fork no robe fotos de estudios reales |

**Criterio de aceptación:** Carpeta `docs/assets/demo/` (o `frontend/public` post-fork) con origen/licencia anotado. Ninguna foto de Crisbo/Supremacy/Cintia.

**Qué se hizo:** 28 archivos numerados → `frontend/public/images/demo/` con nombres de `ASSETS-IMAGENES.md`. HOME, nav, footer, favicon y merch apuntan a esas rutas. Falta `feed-06.jpg` (#29). Optimizar peso si el cliente aprueba.

---

### HU-014 — Boceto HTML estático (opcional, pre-fork)

| | |
|---|---|
| **Estado** | Pendiente |
| **Prioridad** | P1 |
| **Como** | comercial |
| **Quiero** | una HOME clicable en HTML/CSS |
| **Para** | mostrar el look en el navegador **antes** de copiar CoreX |

**Criterio de aceptación:** `mr-tatu/boceto/` (o `preview/index.html`) recorre hero → portafolio → artista → estilos → proceso/cotizar → tienda → redes. Sin API. Sin tocar CoreX.

---

## Épica 2 — Sitio público (post-fork)

Bloqueada hasta HU-002.

### HU-020 — Shell: nav, footer, tema oscuro

**Como** visitante **quiero** una piel de estudio, no de CoreX Technologies.

**Criterio de aceptación:** Nav del mockup. Logo Mr. Tatú. Fondo `#080808`. Cero copy «CoreX» en público. Responsive.

**Qué se hizo:** Inicio, Portafolio, El artista, Tienda, Cotizar y Contacto bajan a las secciones de la HOME (`/#…`). React Router ya no se queda arriba al repetir clic. `/products` y `/cotizar` siguen existiendo (botón «Ver todos» y CTA del hero).

### HU-021 — Hero pantalla completa

**Criterio de aceptación:** Foto fuerte + MR. TATÚ + «Arte que vive en tu piel» + Bogotá + dos CTAs. Los CTAs hacen scroll o navegan a `/portafolio` y `/cotizar`.

### HU-022 — El artista

**Criterio de aceptación:** Foto, bio corta, 4 stats **con etiqueta de demo/reemplazable**. Quote opcional.

**Qué se hizo:** Retrato en `artista-retrato.jpg` a tamaño natural (`object-fit: contain`), sin `max-height` ni `cover` que recortaba cara y estudio.

### HU-023 — Estilos

**Criterio de aceptación:** 6 tarjetas (Blackwork, Realismo, Fine line, Black & Grey, Color, Cover up). Hover «Ver trabajos» filtra portafolio.

### HU-024 — Proceso en 5 pasos

**Criterio de aceptación:** 01–05 visibles en HOME: idea → cotizamos → diseñamos → reservamos → tatuamos.

### HU-025 — FAQ

**Criterio de aceptación:** 5–8 preguntas demo (higiene, depósito, cuidado, dolor, cover up). Copy marcado como muestra.

### HU-026 — Contacto

**Criterio de aceptación:** Ciudad Bogotá (placeholder). Email/WhatsApp demo. No datos reales del cliente potencial.

---

## Épica 3 — Portafolio

### HU-030 — Filtros por estilo

**Criterio de aceptación:** TODOS + 6 estilos. Al filtrar, solo piezas de esa categoría. Vacío: mensaje amable, no grilla rota.

### HU-031 — Masonry

**Criterio de aceptación:** Alturas distintas (no grilla e-commerce de cuadrados iguales). HOME puede mostrar tira; `/portafolio` la galería completa.

### HU-032 — Modal / detalle

**Criterio de aceptación:** Clic → foto grande, estilo, descripción, zona del cuerpo. Cerrar con overlay o Escape.

### HU-033 — Quiero algo parecido

**Criterio de aceptación:** Botón en el detalle abre `/cotizar` con estilo (y si se puede, id de pieza) prellenados.

---

## Épica 4 — Cotización

### HU-040 — Formulario estructurado

**Criterio de aceptación:** Nombre, WhatsApp, idea, estilo, zona, tamaño, texto libre. Validación mínima. Confirmación al enviar. **No** obliga a DM desordenado como único camino.

### HU-041 — Adjuntos de referencia

**Criterio de aceptación:** 1–5 imágenes (tipo/tamaño limitado). Se guardan ligadas a la solicitud. Error claro si el archivo no vale.

### HU-042 — Admin: solicitudes

**Criterio de aceptación:** Listado con estado (nueva / en revisión / respondida). Ver detalle + adjuntos. Sin esto, el formulario es teatro.

### HU-043 — Cliente: mis solicitudes

**Criterio de aceptación:** Si el visitante estaba logueado, ve el historial. Si no, igual se registra la solicitud (email/WhatsApp).

---

## Épica 5 — Redes

### HU-050 — SIGUENOS + feed visual

**Criterio de aceptación:** Instagram, TikTok, Facebook, WhatsApp. Grid de 6 placeholders. CTA «Ver Instagram». Handle `@mr.tatu` demo.

### HU-051 — Admin enlaces

**Criterio de aceptación:** URLs editables. El público lee lo del admin, no hardcode eterno (salvo seed inicial).

---

## Épica 6 — Tienda (reúso CoreX)

### HU-060 — Catálogo merch

| | |
|---|---|
| **Estado** | En progreso |
| **Prioridad** | P1 |

**Criterio de aceptación:** Productos demo (camiseta, gorra, hoodie, mug, stickers, aftercare). Imagen, nombre, precio, agregar. Look oscuro, no el home gamer de CoreX.

**Qué se hizo:** Seed + HOME muestran los 6 merch. Fotos en `/images/demo/merch-*.jpg`. `getMediaUrl` ya no reescribe `/images/` al origin de la API (si no, las tarjetas salían negras). Falta piel de `/products`.

### HU-061 — Carrito

**Criterio de aceptación:** Badge en nav. Agregar / quitar / cantidades. Persistencia local al menos.

### HU-062 — Checkout

**Criterio de aceptación:** Flujo heredado de CoreX (pedido + medio que ya exista: WhatsApp o el checkout actual) tematizado. Login si el flujo CoreX lo exige.

---

## Épica 7 — Auth y cuenta

### HU-070 — Login / registro

**Criterio de aceptación:** Mismas rutas CoreX, piel Mr. Tatú. Seed admin documentado. Cliente puede registrarse.

### HU-071 — Perfil y mis pedidos

**Criterio de aceptación:** El cliente ve y actualiza datos básicos y lista de pedidos.

### HU-072 — Reservas y favoritos

**Criterio de aceptación:** Favoritos de piezas (mínimo). Reservas: listado simple (puede ser manual desde admin en el demo).

---

## Épica 8 — Admin

### HU-080 — Ocultar módulos de tecnología

**Criterio de aceptación:** Menú admin **sin** POS, cajero, recepción/entrega de equipos. Rutas viejas redirigen o 404. Público sin copy de mantenimiento de PCs.

### HU-081 — CMS de portafolio

**Criterio de aceptación:** Alta/edita/oculta pieza: foto, estilo, zona, descripción, orden. El público refleja el cambio tras refresh.

### HU-082 — Contenido

**Criterio de aceptación:** Bio, stats y (si aplica) textos de hero editables o claramente en seed para sustituir al cerrar trato.

---

## Épica 9 — Demo comercial / legal mínimo

### HU-090 — Seed ficticio

**Criterio de aceptación:** Datos de artista, stats y productos con comentario o flag `demo`. README dice «reemplazar».

### HU-091 — Disclaimer

| | |
|---|---|
| **Estado** | Hecho |
| **Prioridad** | P1 |

**Criterio de aceptación:** En footer o banner discreto: «Sitio de muestra · marca ficticia». Se quita cuando entren datos reales (HU futura, no numerada aún).

**Qué se hizo:** Banner rojo en layout público cuando `VITE_VITRINA=true`.

### HU-092 — Vitrina estática (GitHub Pages)

| | |
|---|---|
| **Estado** | Hecho |
| **Prioridad** | P0 |
| **Como** | comercial |
| **Quiero** | un link público del front sin API |
| **Para** | que el tatuador vea la idea en el celular |

**Criterio de aceptación:** Action publica solo `frontend/dist`. HOME (fotos, cotizar, merch) funciona sin backend. URL tipo `https://edwardroag.github.io/mr-tatoo/`.

**Qué se hizo:** `npm run build:pages`, workflow `.github/workflows/deploy-vitrina.yml`, guía `docs/VITRINA.md`. No se publica backend.

---

## Orden sugerido de ejecución (cuando salgamos de Fase 0)

1. HU-014 (boceto HTML) **si** el tatuador debe ver algo en el browser esta semana.  
2. HU-002 → HU-003 → HU-004 (fork + entornos).  
3. HU-080 (quitar POS) en el mismo tren que el rebrand.  
4. HU-020…024 + HU-030…033 (la HOME que vende).  
5. HU-040…042 (cotizar de verdad).  
6. HU-060…062 y HU-070 (tienda + login, ya vienen de CoreX).  
7. HU-050, FAQ, polish.

No mezclar con otras carpetas. Commits: solo si los pides.
