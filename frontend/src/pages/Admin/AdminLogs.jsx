/**
 * ============================================================
 * ARCHIVO: AdminLogs.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminLogs.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminLogs (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useLogs, useAuth, LoadingSpinner
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

import React, { useState, useEffect, useCallback } from 'react';
import { useLogs } from '../../hooks/useLogs';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ========================================================================== */
/*  TIPOS DE ACCIONES                                                         */
/* ========================================================================== */

const ACTION_TYPES = [
  { value: '', label: 'Todas las acciones', icon: '📋' },
  { value: 'CREAR_PRODUCTO', label: 'Crear Producto', icon: '➕' },
  { value: 'ACTUALIZAR_PRODUCTO', label: 'Actualizar Producto', icon: '✏️' },
  { value: 'ELIMINAR_PRODUCTO', label: 'Eliminar Producto', icon: '🗑️' },
  { value: 'MARCAR_VENDIDO', label: 'Marcar Vendido', icon: '💰' },
  { value: 'CREAR_VENTA', label: 'Crear Venta', icon: '💵' },
  { value: 'CANCELAR_VENTA', label: 'Cancelar Venta', icon: '❌' },
  { value: 'CREAR_USUARIO', label: 'Crear Usuario', icon: '👤' },
  { value: 'ACTUALIZAR_USUARIO', label: 'Actualizar Usuario', icon: '👥' },
  { value: 'ELIMINAR_USUARIO', label: 'Eliminar Usuario', icon: '🚫' },
  { value: 'CREAR_CATEGORIA', label: 'Crear Categoría', icon: '📁' },
  { value: 'ACTUALIZAR_CATEGORIA', label: 'Actualizar Categoría', icon: '📂' },
  { value: 'ELIMINAR_CATEGORIA', label: 'Eliminar Categoría', icon: '🗂️' },
  { value: 'CREAR_BACKUP', label: 'Crear Backup', icon: '💾' },
  { value: 'RESTAURAR_BACKUP', label: 'Restaurar Backup', icon: '🔄' },
  { value: 'LOGIN', label: 'Inicio de Sesión', icon: '🔑' },
  { value: 'LOGOUT', label: 'Cierre de Sesión', icon: '🚪' }
];

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const AdminLogs = () => {
  const { getLogs, getLogStats, exportLogsToCSV } = useLogs();
  const { getUsers } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    accion: '',
    usuario_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const LOGS_PER_PAGE = 20;

  /* ========================================================================= */
  /*  CARGAR DATOS                                                             */
  /* ========================================================================= */

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: LOGS_PER_PAGE,
        ...filters
      };
      
      // Limpiar filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const result = await getLogs(params);
      
      if (result) {
        setLogs(result.data || []);
        setPagination({
          currentPage: result.pagination?.page || 1,
          totalPages: result.pagination?.totalPages || 1,
          totalItems: result.pagination?.total || 0
        });
      }
    } catch (err) {
      console.error('Error loading logs:', err);
      setErrorMessage('Error al cargar los logs');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, filters, getLogs]);

  const loadStats = useCallback(async () => {
    try {
      const data = await getLogStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [getLogStats]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, [getUsers]);

  useEffect(() => {
    loadLogs();
    loadStats();
    loadUsers();
  }, [loadLogs, loadStats, loadUsers]);

  /* ========================================================================= */
  /*  MANEJAR FILTROS                                                          */
  /* ========================================================================= */

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleApplyFilters = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      accion: '',
      usuario_id: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  /* ========================================================================= */
  /*  MANEJAR PAGINACIÓN                                                       */
  /* ========================================================================= */

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ========================================================================= */
  /*  MANEJAR EXPORTACIÓN                                                      */
  /* ========================================================================= */

  const handleExport = async () => {
    try {
      await exportLogsToCSV(filters);
    } catch (err) {
      console.error('Error exporting logs:', err);
      setErrorMessage('Error al exportar logs');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  MANEJAR DETALLE                                                          */
  /* ========================================================================= */

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  /* ========================================================================= */
  /*  FORMATEAR FUNCIONES                                                      */
  /* ========================================================================= */

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action) => {
    const actionInfo = ACTION_TYPES.find(a => a.value === action);
    const icon = actionInfo?.icon || '📝';
    
    let colorClass = 'bg-gray-100 text-gray-700';
    if (action.includes('CREAR')) colorClass = 'bg-green-100 text-green-700';
    if (action.includes('ACTUALIZAR')) colorClass = 'bg-blue-100 text-blue-700';
    if (action.includes('ELIMINAR')) colorClass = 'bg-red-100 text-red-700';
    if (action.includes('VENTA')) colorClass = 'bg-purple-100 text-purple-700';
    if (action.includes('BACKUP')) colorClass = 'bg-orange-100 text-orange-700';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) colorClass = 'bg-yellow-100 text-yellow-700';
    
    return (
      <span className={`${colorClass} px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}>
        <span>{icon}</span>
        <span>{actionInfo?.label || action}</span>
      </span>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE TABLA                                                     */
  /* ========================================================================= */

  const renderLogRow = (log) => {
    return (
      <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleViewDetail(log)}>
        <td className="px-4 py-3 text-sm text-gray-500">
          {formatDate(log.created_at)}
        </td>
        <td className="px-4 py-3">
          {getActionBadge(log.accion)}
        </td>
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{log.usuario_nombre || 'Sistema'}</p>
            <p className="text-xs text-gray-500">{log.usuario_email}</p>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
          {log.detalle || 'Sin detalles'}
        </td>
        <td className="px-4 py-3 text-center">
          <button className="text-blue-600 hover:text-blue-800">
            👁️
          </button>
        </td>
      </tr>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE PAGINACIÓN                                                */
  /* ========================================================================= */

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ←
        </button>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 border rounded ${
              page === currentPage 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          →
        </button>
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Logs de Auditoría
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Historial de acciones realizadas en el sistema
        </p>
      </div>

      {/* Mensajes de error */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
            <p className="text-xs text-gray-500">Total Logs</p>
            <p className="text-xl font-bold">{stats.total_logs || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
            <p className="text-xs text-gray-500">Usuarios Activos</p>
            <p className="text-xl font-bold">{stats.usuarios_activos || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
            <p className="text-xs text-gray-500">Acciones Hoy</p>
            <p className="text-xl font-bold">{stats.acciones_hoy || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center">
            <p className="text-xs text-gray-500">Tipos de Acción</p>
            <p className="text-xl font-bold">{stats.tipos_accion || 0}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Acción</label>
            <select
              name="accion"
              value={filters.accion}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            >
              {ACTION_TYPES.map(action => (
                <option key={action.value} value={action.value}>
                  {action.icon} {action.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <select
              name="usuario_id"
              value={filters.usuario_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            >
              <option value="">Todos</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Desde</label>
            <input
              type="date"
              name="fecha_desde"
              value={filters.fecha_desde}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
            <input
              type="date"
              name="fecha_hasta"
              value={filters.fecha_hasta}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
            >
              Filtrar
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500">No hay logs registrados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(renderLogRow)}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Mostrando {logs.length} de {pagination.totalItems} registros
              </p>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                📥 Exportar a CSV
              </button>
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {renderPagination()}

      {/* Modal de detalle */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Detalle del Log
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">#{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha/Hora</p>
                  <p className="font-medium">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acción</p>
                  <p>{getActionBadge(selectedLog.accion)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usuario</p>
                  <p className="font-medium">{selectedLog.usuario_nombre || 'Sistema'}</p>
                  <p className="text-xs text-gray-500">{selectedLog.usuario_email}</p>
                </div>
                {selectedLog.ip_address && (
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-mono text-sm">{selectedLog.ip_address}</p>
                  </div>
                )}
                {selectedLog.user_agent && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">User Agent</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Detalle</p>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {selectedLog.detalle || 'Sin detalles'}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;