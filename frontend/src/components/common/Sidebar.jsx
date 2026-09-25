/**
 * ============================================================
 * ARCHIVO: Sidebar.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — Sidebar.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   Sidebar (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useAuth, ModulesContext, navConfig
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

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useModules } from '../../context/ModulesContext';
import { ADMIN_NAV, CAJERO_NAV } from '../../config/navConfig';

const Sidebar = ({ isOpen, onToggle, isMobile = false }) => {
  const { user, userRole, userName, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // En móvil el drawer siempre va expandido (etiquetas visibles)
  const collapsed = isMobile ? false : isCollapsed;

  const closeMobile = () => {
    if (isMobile && onToggle) onToggle(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const displayName = userName || user?.nombre || 'Usuario';

  /* ========================================================================= */
  /*  MANEJAR COLAPSO                                                          */
  /* ========================================================================= */

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle(!isCollapsed);
  };

  /* ========================================================================= */
  /*  ENLACES POR ROL                                                          */
  /* ========================================================================= */

  // Enlaces filtrados según módulos activos
  const { filterNavByModules } = useModules();
  const adminLinks = filterNavByModules(ADMIN_NAV, 'admin');
  const cajeroLinks = filterNavByModules(CAJERO_NAV, 'cajero');

  // Seleccionar enlaces según rol (HU-052: super_admin = menú admin)
  const isAdminNav = userRole === 'admin' || userRole === 'super_admin';
  const links = isAdminNav ? adminLinks : cajeroLinks;

  /* ========================================================================= */
  /*  RENDERIZADO DE ENLACE                                                    */
  /* ========================================================================= */

  const renderNavLink = (link) => {
    return (
      <NavLink
        key={link.path}
        to={link.path}
        onClick={closeMobile}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            isActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          } ${collapsed ? 'justify-center' : ''}`
        }
        title={collapsed ? link.label : ''}
      >
        <span className="text-xl">{link.icon}</span>
        {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
      </NavLink>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE CABECERA                                                  */
  /* ========================================================================= */

  const renderHeader = () => {
    if (collapsed) {
      return (
        <div className="flex justify-center py-4">
          <span className="text-sm font-bold text-gray-800 dark:text-white">CX</span>
        </div>
      );
    }

    return (
      <div className="mb-6 flex items-center justify-between gap-2">
        <span className="truncate text-xl font-bold text-gray-800 dark:text-white">CoreX</span>
        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
            {isAdminNav ? 'Admin' : 'Cajero'}
          </div>
          {isMobile && (
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMobile}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE PERFIL DEL USUARIO                                        */
  /* ========================================================================= */

  const renderUserProfile = () => {
    if (collapsed) {
      return (
        <div className="mb-6 px-1 text-center">
          <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-200" title={displayName}>
            {displayName}
          </p>
        </div>
      );
    }

    return (
      <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <p className="truncate font-medium text-gray-800 dark:text-white">{displayName}</p>
        <p className="text-xs text-gray-500">
          {userRole === 'super_admin'
            ? 'Super Admin'
            : userRole === 'admin'
              ? 'Administrador'
              : 'Cajero'}
        </p>
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DEL PIE                                                      */
  /* ========================================================================= */

  const renderFooter = () => {
    if (collapsed) {
      return (
        <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 text-red-500 transition hover:text-red-700 disabled:opacity-50"
              title="Cerrar sesión"
            >
              🚪
            </button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="p-2 text-gray-500 transition hover:text-blue-600"
              title="Expandir"
            >
              ▶
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <NavLink
          to="/"
          onClick={closeMobile}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          🌐 Ir al sitio público
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {isLoggingOut ? 'Saliendo...' : '🚪 Cerrar sesión'}
        </button>
        {!isMobile && (
          <button
            type="button"
            onClick={handleToggleCollapse}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 transition hover:text-blue-600"
          >
            ◀ Colapsar menú
          </button>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  // Si es móvil y está cerrado, no mostrar
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <aside
      className={`flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        collapsed ? 'w-20' : 'w-[min(18rem,85vw)] sm:w-64'
      } ${isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-xl' : 'relative shrink-0'}`}
    >
      {/* Contenido del sidebar */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderHeader()}
        {renderUserProfile()}
        
        <nav className="space-y-1">
          {links.map(renderNavLink)}
        </nav>
      </div>
      
      <div className="p-4">
        {renderFooter()}
      </div>
    </aside>
  );
};

export default Sidebar;