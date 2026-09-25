/**
 * ============================================================
 * ARCHIVO: AdminReports.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminReports.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminReports (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useReports, useSales, useProducts, useAuth, LoadingSpinner
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
import { useReports } from '../../hooks/useReports';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const AdminReports = () => {
  const { getSalesReport, getTopProductsReport, getInventoryReport, getCashierClosureReport } = useReports();
  const { getSales, getSalesBySeller } = useSales();
  const { getProducts } = useProducts();
  const { getUsers } = useAuth();
  
  const [activeTab, setActiveTab] = useState('sales');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Reporte de ventas
  const [salesReport, setSalesReport] = useState(null);
  const [salesFilters, setSalesFilters] = useState({
    fecha_desde: '',
    fecha_hasta: ''
  });
  
  // Reporte por vendedor
  const [sellerReport, setSellerReport] = useState([]);
  const [sellerFilters, setSellerFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    vendedor_id: ''
  });
  const [users, setUsers] = useState([]);
  
  // Productos más vendidos
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsFilters, setTopProductsFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    limit: 10
  });
  
  // Reporte de inventario
  const [inventoryReport, setInventoryReport] = useState(null);
  const [inventoryFilters, setInventoryFilters] = useState({
    condicion: '',
    categoria_id: ''
  });
  
  // Cierre de caja
  const [cashierClosure, setCashierClosure] = useState(null);
  const [closureDate, setClosureDate] = useState(new Date().toISOString().split('T')[0]);

  /* ========================================================================= */
  /*  CARGAR USUARIOS                                                          */
  /* ========================================================================= */

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, [getUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* ========================================================================= */
  /*  REPORTE DE VENTAS                                                        */
  /* ========================================================================= */

  const loadSalesReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (salesFilters.fecha_desde) params.fecha_desde = salesFilters.fecha_desde;
      if (salesFilters.fecha_hasta) params.fecha_hasta = salesFilters.fecha_hasta;
      
      const data = await getSalesReport(params);
      setSalesReport(data);
    } catch (err) {
      console.error('Error loading sales report:', err);
      setErrorMessage('Error al cargar el reporte de ventas');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [salesFilters, getSalesReport]);

  /* ========================================================================= */
  /*  REPORTE POR VENDEDOR                                                     */
  /* ========================================================================= */

  const loadSellerReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (sellerFilters.fecha_desde) params.fecha_desde = sellerFilters.fecha_desde;
      if (sellerFilters.fecha_hasta) params.fecha_hasta = sellerFilters.fecha_hasta;
      if (sellerFilters.vendedor_id) params.vendedor_id = sellerFilters.vendedor_id;
      
      const data = await getSalesBySeller(params);
      setSellerReport(data || []);
    } catch (err) {
      console.error('Error loading seller report:', err);
      setErrorMessage('Error al cargar el reporte por vendedor');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [sellerFilters, getSalesBySeller]);

  /* ========================================================================= */
  /*  PRODUCTOS MÁS VENDIDOS                                                   */
  /* ========================================================================= */

  const loadTopProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        limit: topProductsFilters.limit
      };
      if (topProductsFilters.fecha_desde) params.fecha_desde = topProductsFilters.fecha_desde;
      if (topProductsFilters.fecha_hasta) params.fecha_hasta = topProductsFilters.fecha_hasta;
      
      const data = await getTopProductsReport(params);
      setTopProducts(data || []);
    } catch (err) {
      console.error('Error loading top products:', err);
      setErrorMessage('Error al cargar los productos más vendidos');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [topProductsFilters, getTopProductsReport]);

  /* ========================================================================= */
  /*  REPORTE DE INVENTARIO                                                    */
  /* ========================================================================= */

  const loadInventoryReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (inventoryFilters.condicion) params.condicion = inventoryFilters.condicion;
      if (inventoryFilters.categoria_id) params.categoria_id = inventoryFilters.categoria_id;
      
      const data = await getInventoryReport(params);
      setInventoryReport(data);
    } catch (err) {
      console.error('Error loading inventory report:', err);
      setErrorMessage('Error al cargar el reporte de inventario');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [inventoryFilters, getInventoryReport]);

  /* ========================================================================= */
  /*  CIERRE DE CAJA                                                           */
  /* ========================================================================= */

  const loadCashierClosure = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCashierClosureReport({ fecha: closureDate });
      setCashierClosure(data);
    } catch (err) {
      console.error('Error loading cashier closure:', err);
      setErrorMessage('Error al cargar el cierre de caja');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [closureDate, getCashierClosureReport]);

  /* ========================================================================= */
  /*  EXPORTAR A CSV                                                           */
  /* ========================================================================= */

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      setErrorMessage('No hay datos para exportar');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /* ========================================================================= */
  /*  FORMATEAR FUNCIONES                                                      */
  /* ========================================================================= */

  const formatCurrency = (amount) => {
    return `$${amount?.toLocaleString('es-CO') || 0}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CO');
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE TABS                                                      */
  /* ========================================================================= */

  const tabs = [
    { id: 'sales', label: '📊 Ventas', icon: '📊' },
    { id: 'seller', label: '👥 Por Vendedor', icon: '👥' },
    { id: 'top', label: '🏆 Top Productos', icon: '🏆' },
    { id: 'inventory', label: '📦 Inventario', icon: '📦' },
    { id: 'closure', label: '💰 Cierre de Caja', icon: '💰' }
  ];

  /* ========================================================================= */
  /*  RENDERIZADO DE REPORTE DE VENTAS                                         */
  /* ========================================================================= */

  const renderSalesReport = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Desde</label>
              <input
                type="date"
                value={salesFilters.fecha_desde}
                onChange={(e) => setSalesFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={salesFilters.fecha_hasta}
                onChange={(e) => setSalesFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadSalesReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
        
        {salesReport && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Total Ventas</p>
                <p className="text-2xl font-bold">{salesReport.resumen?.total_ventas || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Total Facturado</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesReport.resumen?.total_facturado)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Promedio por Venta</p>
                <p className="text-2xl font-bold">{formatCurrency(salesReport.resumen?.promedio_venta)}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Ventas por Método de Pago</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>💰 Efectivo</span>
                    <div className="flex gap-4">
                      <span>{salesReport.por_metodo_pago?.efectivo?.cantidad || 0} ventas</span>
                      <span className="font-semibold">{formatCurrency(salesReport.por_metodo_pago?.efectivo?.total)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>📱 Transferencia</span>
                    <div className="flex gap-4">
                      <span>{salesReport.por_metodo_pago?.transferencia?.cantidad || 0} ventas</span>
                      <span className="font-semibold">{formatCurrency(salesReport.por_metodo_pago?.transferencia?.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE REPORTE POR VENDEDOR                                      */
  /* ========================================================================= */

  const renderSellerReport = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Desde</label>
              <input
                type="date"
                value={sellerFilters.fecha_desde}
                onChange={(e) => setSellerFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={sellerFilters.fecha_hasta}
                onChange={(e) => setSellerFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vendedor</label>
              <select
                value={sellerFilters.vendedor_id}
                onChange={(e) => setSellerFilters(prev => ({ ...prev, vendedor_id: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              >
                <option value="">Todos</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadSellerReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
        
        {sellerReport.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Vendedor</th>
                    <th className="px-4 py-3 text-center">Ventas</th>
                    <th className="px-4 py-3 text-right">Total Facturado</th>
                    <th className="px-4 py-3 text-right">Promedio</th>
                    <th className="px-4 py-3 text-center">Efectivo</th>
                    <th className="px-4 py-3 text-center">Transferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerReport.map((seller, idx) => (
                    <tr key={idx} className="border-b dark:border-gray-700">
                      <td className="px-4 py-3 font-medium">{seller.vendedor_nombre}</td>
                      <td className="px-4 py-3 text-center">{seller.total_ventas}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{formatCurrency(seller.total_facturado)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(seller.promedio_venta)}</td>
                      <td className="px-4 py-3 text-center">{seller.ventas_efectivo}</td>
                      <td className="px-4 py-3 text-center">{seller.ventas_transferencia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => exportToCSV(sellerReport, 'reporte_vendedores')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                📥 Exportar a CSV
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE TOP PRODUCTOS                                             */
  /* ========================================================================= */

  const renderTopProducts = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Desde</label>
              <input
                type="date"
                value={topProductsFilters.fecha_desde}
                onChange={(e) => setTopProductsFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={topProductsFilters.fecha_hasta}
                onChange={(e) => setTopProductsFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Límite</label>
              <select
                value={topProductsFilters.limit}
                onChange={(e) => setTopProductsFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              >
                <option value={5}>5 productos</option>
                <option value={10}>10 productos</option>
                <option value={20}>20 productos</option>
                <option value={50}>50 productos</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadTopProducts}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
        
        {topProducts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-center">Veces Vendido</th>
                    <th className="px-4 py-3 text-center">Cantidad Total</th>
                    <th className="px-4 py-3 text-right">Total Generado</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b dark:border-gray-700">
                      <td className="px-4 py-3 text-center font-bold">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{product.nombre}</p>
                          <p className="text-xs text-gray-500">{product.categoria}</p>
                        </div>
                       </td>
                      <td className="px-4 py-3 text-center">{product.veces_vendido}</td>
                      <td className="px-4 py-3 text-center">{product.cantidad_total}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{formatCurrency(product.total_generado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => exportToCSV(topProducts, 'top_productos')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                📥 Exportar a CSV
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE INVENTARIO                                                */
  /* ========================================================================= */

  const renderInventoryReport = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Condición</label>
              <select
                value={inventoryFilters.condicion}
                onChange={(e) => setInventoryFilters(prev => ({ ...prev, condicion: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              >
                <option value="">Todas</option>
                <option value="nuevo">Nuevo</option>
                <option value="segunda">Segunda</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadInventoryReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
        
        {inventoryReport && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Total Productos</p>
                <p className="text-2xl font-bold">{inventoryReport.resumen?.total_productos || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{inventoryReport.resumen?.disponibles || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Vendidos</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryReport.resumen?.vendidos || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Valor Inventario</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(inventoryReport.resumen?.valor_inventario)}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Listado de Productos</h3>
                <button
                  onClick={() => exportToCSV(inventoryReport.productos || [], 'inventario')}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                >
                  Exportar CSV
                </button>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Producto</th>
                      <th className="px-4 py-2 text-right">Precio</th>
                      <th className="px-4 py-2 text-center">Condición</th>
                      <th className="px-4 py-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReport.productos?.slice(0, 50).map((product, idx) => (
                      <tr key={idx} className="border-b dark:border-gray-700">
                        <td className="px-4 py-2">{product.nombre}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(product.precio)}</td>
                        <td className="px-4 py-2 text-center">
                          {product.condicion === 'nuevo' ? '🆕 Nuevo' : '🔄 Segunda'}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {product.stock === 1 ? '✅ Disponible' : '❌ Vendido'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE CIERRE DE CAJA                                            */
  /* ========================================================================= */

  const renderCashierClosure = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input
                type="date"
                value={closureDate}
                onChange={(e) => setClosureDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadCashierClosure}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                Generar Cierre
              </button>
            </div>
          </div>
        </div>
        
        {cashierClosure && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Total Ventas</p>
                <p className="text-2xl font-bold">{cashierClosure.resumen_general?.total_ventas || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Total Efectivo</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(cashierClosure.resumen_general?.total_efectivo)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-500">Total Transferencia</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(cashierClosure.resumen_general?.total_transferencia)}</p>
              </div>
            </div>
            
            {cashierClosure.por_vendedor?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Resumen por Vendedor</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">Vendedor</th>
                        <th className="px-4 py-3 text-center">Ventas</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Efectivo</th>
                        <th className="px-4 py-3 text-right">Transferencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashierClosure.por_vendedor.map((seller, idx) => (
                        <tr key={idx} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3 font-medium">{seller.vendedor_nombre}</td>
                          <td className="px-4 py-3 text-center">{seller.total_ventas}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(seller.total_facturado)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(seller.efectivo)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(seller.transferencia)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
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
          Reportes y Estadísticas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analiza el rendimiento de tu negocio
        </p>
      </div>

      {/* Mensajes de error */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido del tab activo */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {activeTab === 'sales' && renderSalesReport()}
            {activeTab === 'seller' && renderSellerReport()}
            {activeTab === 'top' && renderTopProducts()}
            {activeTab === 'inventory' && renderInventoryReport()}
            {activeTab === 'closure' && renderCashierClosure()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReports;