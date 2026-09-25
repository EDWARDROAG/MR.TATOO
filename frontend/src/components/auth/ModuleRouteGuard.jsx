/**
 * ============================================================
 * ARCHIVO: ModuleRouteGuard.jsx
 * UBICACIÓN: frontend/src/components/auth/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ModuleRouteGuard.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ModuleRouteGuard, ModuleRouteGuard (default)
 *
 * DEPENDENCIAS CLAVE:
 *   navConfig, ModulesContext
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

import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultAdminPath, getDefaultCajeroPath, getDefaultPublicPath } from '../../config/navConfig';
import { useModules } from '../../context/ModulesContext';

/**
 * Redirige si la ruta actual corresponde a un módulo desactivado.
 */
export function ModuleRouteGuard({ children, area = 'auto', fallback }) {
  const location = useLocation();
  const { loading, isRouteEnabled, modules } = useModules();

  if (loading) return children;

  if (!isRouteEnabled(location.pathname, location.search)) {
    let target = fallback;
    if (!target) {
      if (area === 'admin') target = getDefaultAdminPath(modules);
      else if (area === 'cajero') target = getDefaultCajeroPath(modules);
      else if (location.pathname.startsWith('/admin')) target = getDefaultAdminPath(modules);
      else if (location.pathname.startsWith('/cajero')) target = getDefaultCajeroPath(modules);
      else target = getDefaultPublicPath(modules);
    }
    return <Navigate to={target} replace />;
  }

  return children;
}

export default ModuleRouteGuard;
