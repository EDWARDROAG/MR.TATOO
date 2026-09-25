/**
 * ============================================================
 * ARCHIVO: ReportFilters.jsx
 * UBICACIÓN: frontend/src/components/admin/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ReportFilters.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ReportFilters (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useAuth
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
import { useAuth } from '../../hooks/useAuth';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const ReportFilters = ({ 
  filters = {}, 
  onApply, 
  onClear, 
  onExport,
  showSellerFilter = true,
  showPaymentFilter = true,
  showConditionFilter = false,
  showLimitFilter = false,
  loading = false,
  users = []
}) => {
  const { userRole } = useAuth();
  
  const [localFilters, setLocalFilters] = useState({
    fecha_desde: filters.fecha_desde || '',
    fecha_hasta: filters.fecha_hasta || '',
    vendedor_id: filters.vendedor_id || '',
    metodo_pago: filters.metodo_pago || '',
    condicion: filters.condicion || '',
    limit: filters.limit || 10
  });

  /* ========================================================================= */
  /*  PRESETS DE FECHAS                                                        */
  /* ========================================================================= */

  const datePresets = [
    { label: 'Hoy', getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { desde: today, hasta: today };
    }},
    { label: 'Ayer', getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];
      return { desde: date, hasta: date };
    }},
    { label: 'Últimos 7 días', getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { desde: weekAgo.toISOString().split('T')[0], hasta: today };
    }},
    { label: 'Últimos 30 días', getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return { desde: monthAgo.toISOString().split('T')[0], hasta: today };
    }},
    { label: 'Este mes', getValue: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { 
        desde: startOfMonth.toISOString().split('T')[0], 
        hasta: today.toISOString().split('T')[0] 
      };
    }},
    { label: 'Mes pasado', getValue: () => {
      const today = new Date();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { 
        desde: startOfLastMonth.toISOString().split('T')[0], 
        hasta: endOfLastMonth.toISOString().split('T')[0] 
      };
    }}
  ];

  /* ========================================================================= */
  /*  MANEJAR CAMBIO                                                           */
  /* ========================================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  /* ========================================================================= */
  /*  APLICAR PRESET DE FECHA                                                  */
  /* ========================================================================= */

  const applyDatePreset = (preset) => {
    const { desde, hasta } = preset.getValue();
    setLocalFilters(prev => ({ 
      ...prev, 
      fecha_desde: desde, 
      fecha_hasta: hasta 
    }));
  };

  /* ========================================================================= */
  /*  APLICAR FILTROS                                                          */
  /* ========================================================================= */

  const handleApply = () => {
    const appliedFilters = {};
    if (localFilters.fecha_desde) appliedFilters.fecha_desde = localFilters.fecha_desde;
    if (localFilters.fecha_hasta) appliedFilters.fecha_hasta = localFilters.fecha_hasta;
    if (localFilters.vendedor_id) appliedFilters.vendedor_id = localFilters.vendedor_id;
    if (localFilters.metodo_pago) appliedFilters.metodo_pago = localFilters.metodo_pago;
    if (localFilters.condicion) appliedFilters.condicion = localFilters.condicion;
    if (localFilters.limit) appliedFilters.limit = localFilters.limit;
    
    onApply(appliedFilters);
  };

  /* ========================================================================= */
  /*  LIMPIAR FILTROS                                                          */
  /* ========================================================================= */

  const handleClear = () => {
    setLocalFilters({
      fecha_desde: '',
      fecha_hasta: '',
      vendedor_id: '',
      metodo_pago: '',
      condicion: '',
      limit: 10
    });
    onClear();
  };

  /* ========================================================================= */
  /*  CONTAR FILTROS ACTIVOS                                                   */
  /* ========================================================================= */

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.fecha_desde) count++;
    if (localFilters.fecha_hasta) count++;
    if (localFilters.vendedor_id) count++;
    if (localFilters.metodo_pago) count++;
    if (localFilters.condicion) count++;
    if (localFilters.limit !== 10) count++;
    return count;
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE FILTRO DE FECHAS                                          */
  /* ========================================================================= */

  const renderDateFilters = () => {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {datePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyDatePreset(preset)}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              name="fecha_desde"
              value={localFilters.fecha_desde}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              name="fecha_hasta"
              value={localFilters.fecha_hasta}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
        </div>
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  const activeCount = getActiveFiltersCount();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      
      {/* Título */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Filtros de Reporte
        </h3>
        {activeCount > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {activeCount} filtro(s) activo(s)
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Filtro de fechas */}
        <div className="md:col-span-2 lg:col-span-1">
          {renderDateFilters()}
        </div>

        {/* Filtro por vendedor */}
        {showSellerFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vendedor
            </label>
            <select
              name="vendedor_id"
              value={localFilters.vendedor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            >
              <option value="">Todos los vendedores</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nombre} ({user.role === 'admin' ? 'Admin' : 'Cajero'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por método de pago */}
        {showPaymentFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Método de Pago
            </label>
            <select
              name="metodo_pago"
              value={localFilters.metodo_pago}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            >
              <option value="">Todos</option>
              <option value="efectivo">💰 Efectivo</option>
              <option value="transferencia">📱 Transferencia</option>
            </select>
          </div>
        )}

        {/* Filtro por condición */}
        {showConditionFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condición
            </label>
            <select
              name="condicion"
              value={localFilters.condicion}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            >
              <option value="">Todas</option>
              <option value="nuevo">🆕 Nuevo</option>
              <option value="segunda">🔄 Segunda</option>
            </select>
          </div>
        )}

        {/* Filtro por límite */}
        {showLimitFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Límite de resultados
            </label>
            <select
              name="limit"
              value={localFilters.limit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={handleApply}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Aplicando...
            </>
          ) : (
            'Aplicar Filtros'
          )}
        </button>
        
        <button
          onClick={handleClear}
          className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Limpiar Filtros
        </button>
        
        {onExport && (
          <button
            onClick={onExport}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            📥 Exportar a CSV
          </button>
        )}
      </div>

      {/* Filtros activos (badges) */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {localFilters.fecha_desde && localFilters.fecha_hasta && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
              📅 {localFilters.fecha_desde} → {localFilters.fecha_hasta}
            </span>
          )}
          {localFilters.vendedor_id && users.find(u => u.id == localFilters.vendedor_id) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
              👤 {users.find(u => u.id == localFilters.vendedor_id)?.nombre}
            </span>
          )}
          {localFilters.metodo_pago && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
              {localFilters.metodo_pago === 'efectivo' ? '💰 Efectivo' : '📱 Transferencia'}
            </span>
          )}
          {localFilters.condicion && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
              {localFilters.condicion === 'nuevo' ? '🆕 Nuevo' : '🔄 Segunda'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;