# Mr. Tatú — Concepto visual

**Estado:** propuesta para aprobación (no hay CSS ni componentes todavía).  
**Mockup de HOME:** [assets/home-mockup.jpg](assets/home-mockup.jpg)

El cliente debe ver esto y decir «sí, por aquí» **antes** del fork.

---

## 1. Dirección

Negro profundo + gris carbón + blanco roto + **un solo acento**. El tatuaje es el protagonista. No llenar de rojo, dorado o neón.

El oscuro funciona en este sector; la identidad se diferencia por **tipografía, foto y acento contenido**, no por copiar el típico black+red de plantilla.

### Paleta

| Rol | Valor | Uso |
|-----|-------|-----|
| Fondo | `#080808` | Página |
| Superficie | `#111111` / gris carbón | Secciones, cards, nav |
| Texto principal | blanco roto `#F4F1EA` | Títulos y copy fuerte |
| Texto secundario | gris `#9A9A9A` | Apoyos, labels |
| Línea / borde | `#2A2A2A` | Separadores |
| Acento (mockup) | rojo oscuro `#C41E3A` | CTA primario, «PORTAFOLIO», números |
| Acento (alternativa) | naranja quemado `#B85C38` o dorado envejecido `#C4A574` | Si se quiere salir del black+red |

**Decisión abierta (D7):** el mockup usa rojo. Se puede cambiar el acento sin rediseñar el layout.

### Tipografía

| Uso | Familia | Notas |
|-----|---------|-------|
| Marca / títulos hero | Display o serif artística | «MR. TATÚ», «ARTE QUE VIVE EN TU PIEL» |
| Firma del artista | Script ligera | Solo en bloque El artista |
| Interfaz | Sans-serif limpia | Nav, botones, formulario, precios |

Candidatos (cuando se codee): *Cinzel* / *Playfair Display* (títulos) + *Inter* o *Outfit* (UI). No cerrar fuente hasta HU-014 / HU-020.

### Foto

Una sola fotografía **muy fuerte** en el hero: tatuador trabajando (guantes, máquina, piel). El resto de la página usa recortes de piezas, no stock genérico de “estudio vacío”.

---

## 2. HOME — recorrido de arriba abajo

Orden fijo. El diseño espectacular **no esconde** las acciones.

```
HOME
├── Nav (logo + Inicio · Portafolio · El artista · Tienda · Cotizar · Blog · Contacto + buscar + carrito)
├── HERO (pantalla completa)
├── Franja de confianza (diseños · higiene · experiencia · Bogotá)
├── PORTAFOLIO (filtros + tira de piezas + Ver todo)
├── EL ARTISTA (foto + bio + stats)
├── ESTILOS (6 tarjetas)
├── PROCESO + COTIZAR (dos columnas)
├── TIENDA (merch)
├── REDES / SIGUENOS (feed)
└── Footer
```

FAQ y Contacto pueden ser secciones extra o páginas (`/faq`, `/contacto`) enlazadas en nav/footer. Blog en el mockup queda **opcional** (P3): no es el gancho de venta.

### Hero

- Marca grande: **MR. TATÚ**
- Claim: **ARTE QUE VIVE EN TU PIEL**
- Línea: Tatuajes personalizados · Bogotá
- Apoyo: Ideas, historias y emociones convertidas en arte
- Botones: **VER PORTAFOLIO** (primario) · **COTIZAR MI TATUAJE** (secundario / ghost)
- Firma visual a la derecha: *Good Tattoos Better People* (quote, no sustituye los CTAs)

### Portafolio (sección HOME)

Filtros: `TODOS | BLACKWORK | REALISMO | BLACK & GREY | FINE LINE | COLOR | COVER UP`  
Tira de piezas (en HOME: 6 destacadas). **Ver todo** abre la galería masonry completa.

### El artista

Foto grande. Texto corto. Stats **ficticios y reemplazables**:

| Dato demo | Etiqueta |
|-----------|----------|
| 10+ | Años de experiencia |
| 500+ | Tatuajes realizados |
| 8 | Estilos diferentes |
| Bogotá | Nuestra casa |

Quote: *«Tatuar es escuchar sin palabras y expresar sin límites»*.

### Estilos

Cada tarjeta: imagen + nombre + una línea. Hover: **VER TRABAJOS →** (filtra el portafolio).

### Proceso (¿Cómo funciona?)

1. Cuéntanos tu idea  
2. Cotizamos  
3. Diseñamos  
4. Reservamos  
5. Tatuamos  

### Cotización (formulario, no solo WhatsApp)

Campos mínimos del mockup + briefing:

- Nombre
- WhatsApp
- ¿Qué quieres tatuarte? / idea
- Estilo (select)
- Zona del cuerpo
- Tamaño aproximado (en página completa `/cotizar`; en HOME puede ir abreviado)
- Adjuntar referencias
- Enviar solicitud

WhatsApp queda como **canal de respuesta**, no como único captura.

### Tienda

Reúso de la vitrina CoreX con look de merch de estudio: camiseta, gorra, hoodie, mug, stickers, aftercare. Precio + carrito en cada tarjeta.

### Redes

Instagram · TikTok · Facebook · WhatsApp + grid de 6 fotos + **Ver más en Instagram**. Handle demo: `@mr.tatu`.

---

## 3. Páginas (después de HOME)

| Ruta | Qué ve el visitante |
|------|---------------------|
| `/` | Recorrido completo |
| `/portafolio` | Masonry + filtros + modal |
| `/portafolio/:id` | Detalle (o solo modal) |
| `/artista` | Bio extendida |
| `/estilos` | O anclas desde HOME |
| `/cotizar` | Formulario completo |
| `/tienda` | Catálogo merch |
| `/tienda/:id` | Producto |
| `/faq` | Dudas (higiene, dolor, cuidado) |
| `/contacto` | Mapa/dirección placeholder + redes |
| `/login` · `/registro` | Auth CoreX re-tematizado |
| `/cuenta/*` | Pedidos, cotizaciones, reservas, favoritos |
| `/admin/*` | Panel (lógica CoreX; piel oscura del estudio) |

---

## 4. Qué debe sentir el cliente potencial

1. «Esto no es una tienda genérica.»  
2. «El siguiente paso está a un clic (portafolio o cotizar).»  
3. «Si contrato, mañana cambiamos el nombre, las fotos y los números.»
