/**
 * ============================================================
 * ARCHIVO: sectionNav.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 1.0 — anclas HOME
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 20:45
 * ============================================================
 * PROPÓSITO:
 *   Parsear /#seccion y hacer scroll bajo el nav fijo.
 *
 * FUNCIONES / API (contrato exporta):
 *   HEADER_OFFSET, parseSectionTo, scrollToSection
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   ScrollToTop.jsx, SectionLink.jsx, HomePage.jsx
 *
 * NOTAS:
 *   Frontend · anclas de la HOME pública
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [1.0] - 2026-09-22 20:45
 *    ✅ HU-020 — scroll a portafolio / artista / tienda / cotizar
 * ============================================================
 */

export const HEADER_OFFSET = 80;

export function parseSectionTo(to) {
  if (to && typeof to === 'object') {
    const pathname = to.pathname || '/';
    const hash = to.hash ? (to.hash.startsWith('#') ? to.hash : `#${to.hash}`) : '';
    return { pathname, hash };
  }
  const raw = String(to || '/');
  const hashIdx = raw.indexOf('#');
  if (hashIdx === -1) return { pathname: raw || '/', hash: '' };
  return {
    pathname: raw.slice(0, hashIdx) || '/',
    hash: raw.slice(hashIdx),
  };
}

export function scrollToSection(hash) {
  const id = String(hash || '').replace(/^#/, '');
  if (!id) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'smooth' });
  return true;
}
