/**
 * ============================================================
 * ARCHIVO: tattooContent.js
 * UBICACIÓN: frontend/src/data/
 * ROL: data
 * VERSIÓN: 1.2 — BASE_URL vitrina
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   Contenido de muestra del sitio público (portafolio, estilos, proceso, merch).
 *
 * FUNCIONES / API (contrato exporta):
 *   TATTOO_STYLES, PORTFOLIO_ITEMS, PROCESS_STEPS, TRUST_STRIP,
 *   DEMO_MERCH, DEMO_STATS, SOCIAL_FEED, ARTIST_BIO,
 *   HERO_IMAGE, ARTIST_IMAGE, BRAND_LOGO, BRAND_LOGO_WHITE, BRAND_FAVICON
 *
 * DEPENDENCIAS CLAVE:
 *   publicAsset (media.js)
 *
 * CONSUMIDORES / RELACIONES:
 *   HomePage.jsx, QuotePage.jsx, Navbar.jsx, Footer.jsx
 *
 * NOTAS:
 *   Fotos en /images/demo/ (lista docs/ASSETS-IMAGENES.md). Falta feed-06.jpg.
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [1.2] - 2026-09-25 10:00
 *    ✅ HU-092 — fotos con BASE_URL (GitHub Pages)
 * [1.1] - 2026-09-22 20:30
 *    ✅ HU-013 — Unsplash → 28 archivos locales con nombres de la lista
 * [1.0] - 2026-09-22 13:00
 *    ✅ Contenido demo HU-010 / HU-021…024 / HU-030
 * ============================================================
 */

import { publicAsset } from '../utils/media';

const demo = (file) => publicAsset(`/images/demo/${file}`);

export const BRAND_LOGO = demo('logo-mr-tatoo.png');
export const BRAND_LOGO_WHITE = demo('logo-mr-tatoo-blanco.png');
export const BRAND_FAVICON = demo('favicon.png');

export const ARTIST_BIO = {
  name: 'Mr. Tatoo',
  tagline: 'Ink. Art. Identity.',
  claim: 'Arte que vive en tu piel',
  city: 'Bogotá',
  handle: '@mr.tatoo',
  email: 'mr.tatoo@demo.local',
  quote: 'Tatuar es escuchar sin palabras y expresar sin límites.',
  text:
    'En Mr. Tatoo creemos que cada tatuaje cuenta una historia. Nuestro trabajo convierte ideas, emociones y experiencias en piezas únicas que te acompañan siempre.',
};

export const DEMO_STATS = [
  { value: '10+', label: 'Años de experiencia' },
  { value: '500+', label: 'Tatuajes realizados' },
  { value: '8', label: 'Estilos diferentes' },
  { value: 'Bogotá', label: 'Nuestra casa' },
];

export const TRUST_STRIP = [
  { title: 'Diseños personalizados', detail: 'Cada pieza es única' },
  { title: 'Higiene y seguridad', detail: 'Protocolo de estudio' },
  { title: 'Experiencia y profesionalidad', detail: 'Años en la piel' },
  { title: 'Bogotá, Colombia', detail: 'Atención local' },
];

export const TATTOO_STYLES = [
  { id: 'blackwork', name: 'Blackwork', blurb: 'Negro intenso, geometría y contraste.', image: demo('estilo-blackwork.jpg') },
  { id: 'realismo', name: 'Realismo', blurb: 'Detalles que cobran vida.', image: demo('estilo-realismo.jpg') },
  { id: 'fine-line', name: 'Fine line', blurb: 'Líneas delicadas y precisión.', image: demo('estilo-fine-line.jpg') },
  { id: 'black-grey', name: 'Black & Grey', blurb: 'Sombras, profundidad y detalle.', image: demo('estilo-black-grey.jpg') },
  { id: 'color', name: 'Color', blurb: 'Ideas en brillo.', image: demo('estilo-color.jpg') },
  { id: 'cover-up', name: 'Cover up', blurb: 'Nuevas historias.', image: demo('estilo-cover-up.jpg') },
];

export const PORTFOLIO_ITEMS = [
  { id: 'p1', style: 'realismo', zone: 'Brazo', title: 'León', image: demo('portafolio-01-leon.jpg'), tall: true },
  { id: 'p2', style: 'realismo', zone: 'Antebrazo', title: 'Retrato', image: demo('portafolio-02-retrato.jpg'), tall: true },
  { id: 'p3', style: 'realismo', zone: 'Pierna', title: 'Ojo y rosa', image: demo('portafolio-03-ojo.jpg'), tall: false },
  { id: 'p4', style: 'blackwork', zone: 'Brazo', title: 'Mandala', image: demo('portafolio-04-mandala.jpg'), tall: true },
  { id: 'p5', style: 'blackwork', zone: 'Hombro', title: 'Máscara', image: demo('portafolio-05-mascara.jpg'), tall: true },
  { id: 'p6', style: 'fine-line', zone: 'Antebrazo', title: 'Rosa', image: demo('portafolio-06-rosa.jpg'), tall: true },
];

export const HERO_IMAGE = demo('hero-tatuador.jpg');
export const ARTIST_IMAGE = demo('artista-retrato.jpg');

export const PROCESS_STEPS = [
  { n: '01', title: 'Cuéntanos tu idea', text: 'Cuéntanos qué quieres tatuarte.' },
  { n: '02', title: 'Cotizamos', text: 'Evaluamos tamaño, ubicación, estilo y complejidad.' },
  { n: '03', title: 'Diseñamos', text: 'Creamos o adaptamos la propuesta.' },
  { n: '04', title: 'Reservamos', text: 'Elegimos fecha y confirmamos la sesión.' },
  { n: '05', title: 'Tatuamos', text: 'Tu idea pasa de la pantalla a la piel.' },
];

export const DEMO_MERCH = [
  { id: 'm1', name: 'Camiseta Mr. Tatoo', price: 55000, image: demo('merch-camiseta.jpg') },
  { id: 'm2', name: 'Gorra Classic', price: 55000, image: demo('merch-gorra.jpg') },
  { id: 'm3', name: 'Hoodie Ink Life', price: 120000, image: demo('merch-hoodie.jpg') },
  { id: 'm4', name: 'Mug Tatuador', price: 35000, image: demo('merch-mug.jpg') },
  { id: 'm5', name: 'Stickers Pack', price: 20000, image: demo('merch-stickers.jpg') },
  { id: 'm6', name: 'Kit Cuidado', price: 50000, image: demo('merch-aftercare.jpg') },
];

export const SOCIAL_FEED = [
  demo('feed-01.jpg'),
  demo('feed-02.jpg'),
  demo('feed-03.jpg'),
  demo('feed-04.jpg'),
  demo('feed-05.jpg'),
];
