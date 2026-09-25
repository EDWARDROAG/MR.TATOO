/**
 * ============================================================
 * ARCHIVO: CajeroHistory.jsx
 * UBICACIÓN: frontend/src/pages/Cajero/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — CajeroHistory.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   CajeroHistory (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useSales, useAuth, LoadingSpinner
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
import { useSales } from '../../hooks/useSales';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const CajeroHistory = () => {
  const { getMySales, getSaleInvoice, getMySalesSummary, loading } = useSales();
  const { user } = useAuth();
  
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const SALES_PER_PAGE = 10;

  /* ========================================================================= */
  /*  CARGAR VENTAS                                                            */
  /* ========================================================================= */

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: SALES_PER_PAGE,
        ...filters
      };
      
      // Limpiar filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const result = await getMySales(params);
      
      if (result) {
        setSales(result.data || []);
        setPagination({
          currentPage: result.pagination?.page || 1,
          totalPages: result.pagination?.totalPages || 1,
          totalItems: result.pagination?.total || 0
        });
      }
    } catch (err) {
      console.error('Error loading sales:', err);
      setErrorMessage('Error al cargar el historial de ventas');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, filters, getMySales]);

  const loadSummary = useCallback(async () => {
    try {
      const params = {};
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;
      
      const data = await getMySalesSummary(params);
      setSummary(data);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  }, [filters, getMySalesSummary]);

  useEffect(() => {
    loadSales();
    loadSummary();
  }, [loadSales, loadSummary]);

  /* ========================================================================= */
  /*  MANEJAR FILTROS                                                          */
  /* ========================================================================= */

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleApplyFilters = () => {
    loadSales();
    loadSummary();
  };

  const handleClearFilters = () => {
    setFilters({
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
  /*  MANEJAR DETALLE DE VENTA                                                 */
  /* ========================================================================= */

  const handleViewDetail = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedSale(null);
  };

  /* ========================================================================= */
  /*  MANEJAR FACTURA                                                          */
  /* ========================================================================= */

  const handleViewInvoice = async (saleId) => {
    try {
      await getSaleInvoice(saleId);
    } catch (err) {
      console.error('Error loading invoice:', err);
      setErrorMessage('Error al generar la factura');
      setTimeout(() => setErrorMessage(''), 3000);
    }
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
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toLocaleString('es-CO') || 0}`;
  };

  const getMethodBadge = (method) => {
    if (method === 'efectivo') {
      return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">💰 Efectivo</span>;
    }
    return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">📱 Transferencia</span>;
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE TABLA                                                     */
  /* ========================================================================= */

  const renderSaleRow = (sale) => {
    return (
      <tr key={sale.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleViewDetail(sale)}>
        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
          #{sale.factura_numero}
        </td>
        <td className="px-4 py-3 text-sm">
          {formatDate(sale.fecha_venta)}
        </td>
        <td className="px-4 py-3">
          {getMethodBadge(sale.metodo_pago)}
        </td>
        <td className="px-4 py-3 font-semibold text-blue-600">
          {formatCurrency(sale.total)}
        </td>
        <td className="px-4 py-3 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewInvoice(sale.id);
            }}
            className="text-purple-600 hover:text-purple-800"
            title="Ver factura"
          >
            📄
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
          Mis Ventas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Historial de tus transacciones realizadas
        </p>
      </div>

      {/* Mensajes de error */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      {/* Resumen de ventas */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Total Ventas</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {summary.total_ventas || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Total Facturado</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.total_facturado)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Promedio por Venta</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.promedio_venta)}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Tabla de ventas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-gray-500">No hay ventas registradas</p>
            <p className="text-sm text-gray-400 mt-2">
              {filters.fecha_desde || filters.fecha_hasta 
                ? 'Intenta con otros filtros' 
                : 'Realiza tu primera venta en el POS'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(renderSaleRow)}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Mostrando {sales.length} de {pagination.totalItems} ventas
              </p>
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {renderPagination()}

      {/* Modal de detalle de venta */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Detalle de Venta #{selectedSale.factura_numero}
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
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatDate(selectedSale.fecha_venta)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de Pago</p>
                  <p>{getMethodBadge(selectedSale.metodo_pago)}</p>
                </div>
                {selectedSale.cliente_nombre && (
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{selectedSale.cliente_nombre}</p>
                  </div>
                )}
                {selectedSale.cliente_telefono && (
                  <div>
                    <p className="text-sm text-gray-500">Teléfono Cliente</p>
                    <p className="font-medium">{selectedSale.cliente_telefono}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-center">Cant</th>
                      <th className="px-3 py-2 text-right">Precio</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, idx) => (
                      <tr key={idx} className="border-b dark:border-gray-700">
                        <td className="px-3 py-2">{item.producto_nombre}</td>
                        <td className="px-3 py-2 text-center">{item.cantidad}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.precio_unitario)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan="3" className="px-3 py-2 text-right">TOTAL:</td>
                      <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(selectedSale.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {selectedSale.comprobante_url && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">📎 Comprobante de Transferencia</p>
                  <a
                    href={selectedSale.comprobante_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver comprobante
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleViewInvoice(selectedSale.id)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                📄 Descargar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajeroHistory;