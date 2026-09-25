/**
 * ============================================================
 * ARCHIVO: assets.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — assets.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   asset, IMAGES
 *
 * DEPENDENCIAS CLAVE:
 *   banher.png, logo_black.png, logo_white.png, logo_favicon.png,
 *   entry_pc.png, performance_pc.png, elite_pc.png, workstation_pc.png,
 *   img_fondo_mantenimiento.png, img_fondo_armado_pcs.png
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
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

/**
 * Imágenes del sitio público.
 * Importadas desde src/assets para que Vite genere URLs hasheadas en /assets/*
 * (evita caché Cloudflare/navegador envenenada de /images/*.png como text/html).
 */
import banher from '../assets/images/banher.png';
import logoBlack from '../assets/images/logo_black.png';
import logoWhite from '../assets/images/logo_white.png';
import logoFavicon from '../assets/images/logo_favicon.png';
import entryPc from '../assets/images/entry_pc.png';
import performancePc from '../assets/images/performance_pc.png';
import elitePc from '../assets/images/elite_pc.png';
import workstationPc from '../assets/images/workstation_pc.png';
import fondoMantenimiento from '../assets/images/img_fondo_mantenimiento.png';
import fondoArmadoPcs from '../assets/images/img_fondo_armado_pcs.png';
import fondoConsolas from '../assets/images/img_fondo_consolas.png';
import logoMantenimiento from '../assets/images/logo_mantenimiento.png';
import logoArmadoPcs from '../assets/images/logo_armado_pcs.png';
import logoConsolas from '../assets/images/logo_consolas.png';
import logoPerifericos from '../assets/images/logo_perifericos.png';
import envioGratis from '../assets/images/logo_envio_gratis.png';
import soporteTecnico from '../assets/images/logo_soporte_tecnico.png';
import garantia from '../assets/images/logo_garantia.png';
import pagoSeguro from '../assets/images/logo_pago_seguro.png';

/** Fallback por si algún import falla en build legacy */
const base = (import.meta.env.BASE_URL || '/').endsWith('/')
  ? import.meta.env.BASE_URL || '/'
  : `${import.meta.env.BASE_URL}/`;

export const asset = (path) => `${base}images/${String(path || '').replace(/^\/+/, '')}`;

export const IMAGES = {
  banner: banher,
  // Archivos del cliente: nombres invertidos respecto al color real del logo
  logoWhite: logoBlack,
  logoBlack: logoWhite,
  favicon: logoFavicon,
  entryPc,
  performancePc,
  elitePc,
  workstationPc,
  fondoMantenimiento,
  fondoArmadoPcs,
  fondoConsolas,
  logoMantenimiento,
  logoArmadoPcs,
  logoConsolas,
  logoPerifericos,
  envioGratis,
  soporteTecnico,
  garantia,
  pagoSeguro,
};
