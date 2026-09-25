/**
 * ============================================================
 * ARCHIVO: media.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.3 — BASE_URL Pages
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — media.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   getMediaUrl, normalizeImages, resolveProductCoverUrl, publicAsset
 *
 * DEPENDENCIAS CLAVE:
 *   env
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
 * [2.3] - 2026-09-25 10:00
 *    ✅ HU-092 — /images/* respeta BASE_URL (GitHub Pages /mr-tatoo/)
 * [2.2] - 2026-09-22 20:40
 *    ✅ HU-060 — /images/* queda en el origin del front (demo merch)
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import { APP_ENV } from '../config/env';

/**
 * @file media.js
 * @contract getMediaUrl, normalizeImages, resolveProductCoverUrl
 * @consumers ProductCard, ProductDetailPage, ProductImageGallery, POS, admin
 */

const API_ORIGIN = (APP_ENV.API_URL || '').replace(/\/api\/?$/, '');

/** Ruta de `frontend/public` con el base de Vite (Pages: /mr-tatoo/). */
export const publicAsset = (path) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};

export const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/images/')) return publicAsset(url);
  if (url.startsWith('/uploads/')) return API_ORIGIN ? `${API_ORIGIN}${url}` : url;
  if (url.includes('uploads')) {
    const uploadsIndex = url.indexOf('uploads');
    const rel = `/${url.slice(uploadsIndex).replace(/\\/g, '/')}`;
    return API_ORIGIN ? `${API_ORIGIN}${rel}` : rel;
  }
  if (url.startsWith('/')) return API_ORIGIN ? `${API_ORIGIN}${url}` : publicAsset(url);
  return API_ORIGIN ? `${API_ORIGIN}/${url}` : publicAsset(`/${url}`);
};

/** Lista de rutas de imagen del producto (galería + cover). */
export const normalizeImages = (imagenes, imagenUrl) => {
  let list = [];
  if (Array.isArray(imagenes) && imagenes.length) {
    list = imagenes.filter(Boolean);
  } else if (typeof imagenes === 'string' && imagenes.trim()) {
    try {
      const parsed = JSON.parse(imagenes);
      if (Array.isArray(parsed)) list = parsed.filter(Boolean);
    } catch {
      list = [];
    }
  }
  if (!list.length && imagenUrl) list = [imagenUrl];
  return list;
};

/**
 * Resolve cover URL for product (POS / cards).
 * Uses normalizeImages so string JSON imagenes is handled.
 */
export function resolveProductCoverUrl(product) {
  const list = normalizeImages(product?.imagenes, product?.imagen_url);
  return getMediaUrl(list[0]) || null;
}
