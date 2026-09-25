/**
 * ============================================================
 * ARCHIVO: siteInfo.js
 * UBICACIÓN: frontend/src/data/
 * ROL: data
 * VERSIÓN: 2.2 — anclas footer HOME
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 20:45
 * ============================================================
 * PROPÓSITO:
 *   Datos estáticos / contenido — siteInfo.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   SITE_CONTACT, FOOTER_NAV, FOOTER_SOCIAL
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: Revisar imports en el resto del proyecto
 *
 * NOTAS:
 *   Frontend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.2] - 2026-09-22 20:45
 *    ✅ HU-020 — FOOTER_NAV a secciones HOME
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

export const SITE_CONTACT = {
  phone: '300 000 0000',
  phoneHref: '573000000000',
  email: 'mr.tatoo@demo.local',
  address: 'Bogotá, Colombia (dirección de muestra)',
  city: 'Bogotá, Colombia',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bogota%20Colombia',
  mapsEmbedUrl: 'https://www.google.com/maps?q=Bogota%20Colombia&output=embed',
  schedule: {
    weekdays: 'Lun - Vie: 11:00 AM - 8:00 PM',
    saturday: 'Sáb: 11:00 AM - 6:00 PM',
    sunday: 'Dom: Cerrado',
  },
};

export const FOOTER_NAV = [
  { label: 'Inicio', path: '/' },
  { label: 'Portafolio', path: '/#portafolio' },
  { label: 'El artista', path: '/#artista' },
  { label: 'Tienda', path: '/#tienda' },
  { label: 'Cotizar', path: '/#cotizar' },
  { label: 'Contacto', path: '/#contacto' },
];

export const FOOTER_SOCIAL = [
  { name: 'Instagram', url: 'https://instagram.com/mr.tatoo' },
  { name: 'TikTok', url: 'https://tiktok.com/@mr.tatoo' },
  { name: 'WhatsApp', url: '' },
  { name: 'Facebook', url: 'https://facebook.com/mr.tatoo' },
];
