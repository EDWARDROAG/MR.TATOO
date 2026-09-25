# CoreX Frontend — Contexto del proyecto

Documento de referencia con el estado actual del frontend, cambios realizados y guía para modificar, versionar y desplegar.

---

## 1. Información general

| Campo | Valor |
|-------|-------|
| **Proyecto** | CoreX Technologies — frontend público (e-commerce / servicios técnicos) |
| **Stack** | React 18 + Vite 5 + React Router 6 + Tailwind CSS |
| **Repositorio** | https://github.com/EDWARDROAG/CoreX.git |
| **Rama principal** | `main` |
| **Sitio en producción** | https://EDWARDROAG.github.io/CoreX/ |
| **Raíz del repo Git** | Esta carpeta (`frontend/`) |

---

## 2. Estructura del proyecto

```
frontend/
├── public/
│   └── images/              # Imágenes estáticas (banner, logos, PCs, iconos)
├── src/
│   ├── App.jsx              # Rutas públicas y layout (Navbar + Footer + WhatsApp)
│   ├── main.jsx             # Punto de entrada React
│   ├── config/
│   │   └── env.js           # Variables de entorno (prefijo VITE_)
│   ├── data/
│   │   ├── homeContent.js   # Contenido de la página de inicio
│   │   └── siteInfo.js      # Contacto, navegación footer, redes, mapas
│   ├── styles/
│   │   └── design-system.css # Estilos CoreX (hero, footer, grids, componentes)
│   ├── utils/
│   │   ├── assets.js        # Rutas de imágenes con BASE_URL
│   │   └── whatsappHelper.js
│   ├── components/
│   │   ├── common/          # Navbar, Footer, ProductCard, FilterBar...
│   │   └── ui/              # SectionHeader, PageHero, WhatsAppFloat, WhatsAppIcon
│   └── pages/
│       └── Public/          # HomePage, ProductsPage, ProductDetailPage, MaintenancePage, ContactPage
├── .github/workflows/
│   └── deploy.yml           # CI/CD → GitHub Pages
├── vite.config.js           # base: '/CoreX/', puerto dev 5174
├── index.html
└── package.json
```

### Rutas públicas activas

| Ruta | Página |
|------|--------|
| `/` | Inicio |
| `/products` | Catálogo |
| `/products/:id` | Detalle de producto |
| `/maintenance` | Servicios |
| `/maintenance/:type` | Servicio específico |
| `/contact` | Contacto |

> Las rutas de admin y cajero existen en el código pero **no están cableadas** en `App.jsx` actualmente.

---

## 3. Configuración importante

### GitHub Pages (`base` path)

En `vite.config.js`:

```js
base: '/CoreX/'
```

Todas las rutas de assets deben usar `import.meta.env.BASE_URL` o la utilidad `asset()` de `src/utils/assets.js`. No usar rutas absolutas como `/images/...` en producción.

### Variables de entorno

Crear un archivo `.env` en la raíz (no commitear secretos):

```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_PHONE=573115610825
```

En código usar siempre `import.meta.env.VITE_*` o `src/config/env.js`. **No usar `process.env`** en el navegador.

### Logos (nombres invertidos en archivos del cliente)

Los archivos en `public/images/` tienen nombres invertidos respecto al color real:

| Archivo en disco | Color real | Uso en código |
|------------------|------------|---------------|
| `logo_black.png` | Logo **blanco** | `IMAGES.logoWhite` (navbar, footer, fondos oscuros) |
| `logo_white.png` | Logo **negro** | `IMAGES.logoBlack` (fondos claros) |

El mapeo correcto está en `src/utils/assets.js`.

### Datos de contacto

Editar `src/data/siteInfo.js`:

- Teléfono: 311 561 0825
- Email: corexservice@gmail.com
- Dirección: Calle 123 #45-67, Centro Comercial Tecnológico, Local 305, Bogotá
- URLs de Google Maps: `mapsUrl` y `mapsEmbedUrl`

---

## 4. Cambios realizados (historial de trabajo)

### Infraestructura y carga

- Se añadió `<script type="module" src="/src/main.jsx">` en `index.html`.
- Se migró de `process.env` a `import.meta.env` (`src/config/env.js`).
- Puerto de desarrollo: **5174** (`vite.config.js`).
- Deploy automático con GitHub Actions a rama `gh-pages`.

### Diseño y páginas públicas

- Design system en `src/styles/design-system.css`.
- Imágenes del cliente en `public/images/`.
- Páginas públicas refactorizadas: Home, Products, Product Detail, Maintenance, Contact.
- Componentes reutilizables: `SectionHeader`, `PageHero`, `WhatsAppFloat`, `WhatsAppIcon`.

### Home (inicio)

- **Hero/banner:** layout en dos columnas (texto izquierda, imagen derecha).
- Imagen con `object-fit: contain` y altura máxima para evitar desbordamiento.
- Secciones: confianza, PCs gamer, servicios, periféricos Random Pads.

### Navbar

- Fondo negro con logo blanco (`IMAGES.logoWhite`).
- Navegación: Inicio, PC Gamer, Servicios, Consolas, Periféricos, Contacto.

### Footer

- **Franja de marca:** imagen PC a la izquierda, logo blanco + “Tecnología que impulsa…” + “POWER INSIDE.” a la derecha.
- **Grid principal en 3 columnas** (desktop): Secciones | Contacto | Ubicación.
- **Mini mapa** clickeable que abre Google Maps.
- Copyright en franja inferior.

### WhatsApp flotante

- Botón fijo inferior izquierdo con icono SVG oficial (no emoji).
- Color de marca: `#25d366`.

### Commits recientes en `main`

```
cc3d7a3 responsive banher y logos
cd13817 configuracion global de estilos
90e88a6 creacion workflow
b5fc03e correccion carga de index
```

---

## 5. Cómo hacer cambios habituales

### Cambiar textos del inicio

Editar `src/data/homeContent.js` (PCs, servicios, features de confianza).

### Cambiar contacto, footer o redes

Editar `src/data/siteInfo.js`.

### Cambiar estilos globales / layout

- Estilos CoreX: `src/styles/design-system.css`
- Tailwind + imports: `src/index.css`, `src/styles/globals.css`

### Añadir o cambiar imágenes

1. Colocar el archivo en `public/images/`.
2. Registrar la ruta en `src/utils/assets.js` si se va a reutilizar.
3. Usar `IMAGES.nombreClave` en los componentes.

### Cambiar el banner del inicio

- Imagen: `public/images/banher.png`
- Layout y estilos: `HomePage.jsx` + clases `corex-hero*` en `design-system.css`

### Cambiar logo según fondo

```jsx
// Fondo oscuro (navbar, footer, hero)
<img src={IMAGES.logoWhite} alt="CoreX Technologies" />

// Fondo claro
<img src={IMAGES.logoBlack} alt="CoreX Technologies" />
```

---

## 6. Desarrollo local

### Requisitos

- Node.js >= 18
- npm >= 8

### Instalación (primera vez)

```bash
cd frontend
npm install
```

### Servidor de desarrollo

```bash
npm run dev
```

Abre http://localhost:5174/CoreX/ (Vite puede abrir el navegador automáticamente).

### Build de producción (verificar antes de subir)

```bash
npm run build
npm run preview
```

El resultado queda en `dist/`.

---

## 7. Subir cambios a Git y desplegar

### Flujo recomendado

```bash
# 1. Ver estado de los archivos
git status

# 2. Ver diferencias
git diff

# 3. Añadir archivos modificados
git add .

# 4. Commit con mensaje claro
git commit -m "fix: ajustar footer y logo en navbar"

# 5. Subir a GitHub
git push origin main
```

### Despliegue automático

Al hacer **push a `main`**, el workflow `.github/workflows/deploy.yml`:

1. Instala dependencias (`npm ci`)
2. Ejecuta `npm run build`
3. Publica `dist/` en la rama `gh-pages`

En unos minutos el sitio se actualiza en:  
**https://EDWARDROAG.github.io/CoreX/**

### Convenciones de commits (sugeridas)

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `style:` | Cambios visuales/CSS |
| `refactor:` | Reestructuración sin cambio de comportamiento |
| `docs:` | Documentación |
| `chore:` | Tareas de mantenimiento |

### Deploy manual (alternativa)

Si se necesita desplegar sin Actions:

```bash
npm run build
npm run deploy
```

Usa el script `gh-pages` definido en `package.json` (publica `dist/` directamente).

---

## 8. Checklist antes de hacer push

- [ ] `npm run build` termina sin errores
- [ ] Las imágenes usan `IMAGES.*` o `asset()`, no rutas hardcodeadas `/images/`
- [ ] No se commitean `.env` ni credenciales
- [ ] En fondos negros se usa `logoWhite`, en fondos claros `logoBlack`
- [ ] Probar en local las rutas: `/`, `/products`, `/contact`, `/maintenance`

---

## 9. Pendientes / notas técnicas

- Rutas de **admin** y **cajero** existen en `src/pages/` pero no están en el router público actual.
- WhatsApp usa `VITE_WHATSAPP_PHONE` o fallback en `env.js`; verificar que coincida con el número real (573115610825).
- El SPA fallback para GitHub Pages copia `index.html` → `404.html` en el build (plugin en `vite.config.js`).
- Si GitHub Pages no actualiza, revisar la pestaña **Actions** del repo y que la rama `gh-pages` tenga el último deploy.

---

## 10. Contacto del proyecto (datos actuales en sitio)

- **Teléfono:** 311 561 0825  
- **Email:** corexservice@gmail.com  
- **WhatsApp:** wa.me/573115610825  
- **Horario:** Lun–Vie 9:00–19:00, Sáb 10:00–16:00, Dom cerrado  

---

*Última actualización: junio 2026*
