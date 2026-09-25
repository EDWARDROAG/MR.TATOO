/**
 * ============================================================
 * ARCHIVO: ScrollToTop.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.3 — scroll a ancla
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 20:45
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ScrollToTop.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ScrollToTop (default)
 *
 * DEPENDENCIAS CLAVE:
 *   react-router-dom, sectionNav
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: App.jsx (dentro de BrowserRouter)
 *
 * NOTAS:
 *   Frontend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.3] - 2026-09-22 20:45
 *    ✅ HU-020 — si hay hash, baja a la sección (no se queda arriba)
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../../utils/sectionNav';

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    let cancelled = false;
    const tryScroll = (attempt = 0) => {
      if (cancelled) return;
      if (scrollToSection(hash)) return;
      if (attempt < 24) {
        window.requestAnimationFrame(() => tryScroll(attempt + 1));
      }
    };
    tryScroll();
    return () => {
      cancelled = true;
    };
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
