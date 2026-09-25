/**
 * ============================================================
 * ARCHIVO: SalesTable.jsx
 * UBICACIÓN: frontend/src/components/admin/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — SalesTable.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   SalesTable (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useSales, LoadingSpinner
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

import React, { useState, useMemo } from 'react';
import { useSales } from '../../hooks/useSales';
import LoadingSpinner from '../common/LoadingSpinner';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const SalesTable = ({ 
  sales = [], 
  loading = false, 
  onViewDetail, 
  onCancelSale, 
  onViewInvoice 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fecha_venta');
  const [sortDirection, setSortDirection] = useState('desc');

  /* ========================================================================= */
  /*  FORMATEAR FUNCIONES                                                      */
  /* ========================================================================= */

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toLocaleString('es-CO') || 0}`;
  };

  const getMethodBadge = (method) => {
    if (method === 'efectivo') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          💰 Efectivo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        📱 Transferencia
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'completada') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          ✅ Completada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
        ❌ Cancelada
      </span>
    );
  };

  /* ========================================================================= */
  /*  FILTRAR Y ORDENAR VENTAS                                                 */
  /* ========================================================================= */

  const filteredAndSortedSales = useMemo(() => {
    let filtered = [...sales];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.factura_numero?.toString().includes(term) ||
        sale.cliente_nombre?.toLowerCase().includes(term) ||
        sale.vendedor_nombre?.toLowerCase().includes(term)
      );
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'fecha_venta') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [sales, searchTerm, sortField, sortDirection]);

  /* ========================================================================= */
  /*  MANEJAR ORDENAMIENTO                                                     */
  /* ========================================================================= */

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE CABECERA                                                  */
  /* ========================================================================= */

  const renderSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE FILAS                                                     */
  /* ========================================================================= */



  /* ========================================================================= */
  /*  RENDERIZADO DE ESTADO VACÍO                                              */
  /* ========================================================================= */

  const renderEmptyState = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-12">
            <LoadingSpinner size="md" />
          </td>
        </tr>
      );
    }
    
    return (
      <tr>
        <td colSpan="8" className="text-center py-12">
          <div className="text-6xl mb-2">💰</div>
          <p className="text-gray-500">No hay ventas registradas</p>
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-1">
              No se encontraron resultados para "{searchTerm}"
            </p>
          )}
        </td>
      </tr>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="Buscar por factura #, cliente o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('factura_numero')}
              >
                Factura {renderSortIcon('factura_numero')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('fecha_venta')}
              >
                Fecha {renderSortIcon('fecha_venta')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('vendedor_nombre')}
              >
                Vendedor {renderSortIcon('vendedor_nombre')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Método
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('total')}
              >
                Total {renderSortIcon('total')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedSales.length === 0 
              ? renderEmptyState()
              : filteredAndSortedSales.map(renderRow)
            }
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      {filteredAndSortedSales.length > 0 && !loading && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Mostrando {filteredAndSortedSales.length} de {sales.length} ventas
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Total facturado: <span className="font-semibold text-blue-600">
                {formatCurrency(filteredAndSortedSales.reduce((sum, s) => sum + (s.total || 0), 0))}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTable;