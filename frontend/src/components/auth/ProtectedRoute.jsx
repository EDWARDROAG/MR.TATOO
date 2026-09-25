/**
 * ============================================================
 * ARCHIVO: ProtectedRoute.jsx
 * UBICACIÓN: frontend/src/components/auth/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Auth gate + layout panel (admin/cajero). HU-057: drawer móvil.
 *
 * FUNCIONES / API (contrato exporta):
 *   DashboardLayout, ProtectedRoute (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useAuth, LoadingSpinner, Sidebar, ModuleRouteGuard
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: App.jsx
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

import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import Sidebar from '../common/Sidebar';
import ModuleRouteGuard from './ModuleRouteGuard';

const MOBILE_MQ = '(max-width: 1023px)';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  const allowed =
    !allowedRoles ||
    allowedRoles.includes(role) ||
    (role === 'super_admin' &&
      (allowedRoles.includes('admin') || allowedRoles.includes('cajero')));

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia(MOBILE_MQ).matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        isMobile={isMobile}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-100 text-gray-900">
        {isMobile && (
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-2.5 shadow-sm">
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-lg text-gray-800 hover:bg-gray-50"
            >
              ☰
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">CoreX</p>
              <p className="truncate text-xs text-gray-500">Panel</p>
            </div>
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <ModuleRouteGuard>
            <Outlet />
          </ModuleRouteGuard>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
