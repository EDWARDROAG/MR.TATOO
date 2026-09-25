/**
 * ============================================================
 * ARCHIVO: AdminDashboard.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminDashboard.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminDashboard (default)
 *
 * DEPENDENCIAS CLAVE:
 *   StatsCard, useReports, useSales, useProducts, LoadingSpinner
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../../components/admin/StatsCard';
import { useReports } from '../../hooks/useReports';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const AdminDashboard = () => {
  const { getDashboardMetrics } = useReports();
  const { getSales, getTopProducts } = useSales();
  const { getProducts } = useProducts();
  
  const [metrics, setMetrics] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ========================================================================= */
  /*  CARGAR DATOS DEL DASHBOARD                                               */
  /* ========================================================================= */

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Cargar métricas del dashboard
        const metricsData = await getDashboardMetrics();
        setMetrics(metricsData);
        
        // Cargar ventas recientes
        const salesData = await getSales({ limit: 5, page: 1 });
        if (salesData && salesData.data) {
          setRecentSales(salesData.data);
        }
        
        // Cargar productos más vendidos
        const topProductsData = await getTopProducts({ limit: 5 });
        if (topProductsData) {
          setTopProducts(topProductsData);
        }
        
        // Cargar productos con bajo stock (para alertas)
        const productsData = await getProducts({ stock: 0, limit: 5 });
        if (productsData && productsData.data) {
          const soldOut = productsData.data.filter(p => p.stock === 0);
          setLowStockProducts(soldOut);
        }
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [getDashboardMetrics, getSales, getTopProducts, getProducts]);

  /* ========================================================================= */
  /*  RENDERIZADO DE CARGA                                                     */
  /* ========================================================================= */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  /* ========================================================================= */
  /*  RENDERIZADO DE ERROR                                                     */
  /* ========================================================================= */

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido al panel de administración de CoreX
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Ventas Hoy"
          value={metrics?.ventas_hoy?.total_facturado || 0}
          subtitle={`${metrics?.ventas_hoy?.total_ventas || 0} transacciones`}
          icon="💰"
          color="blue"
          trend={metrics?.ventas_hoy?.trend}
        />
        <StatsCard
          title="Ventas Semana"
          value={metrics?.ventas_semana?.total_facturado || 0}
          subtitle={`${metrics?.ventas_semana?.total_ventas || 0} transacciones`}
          icon="📊"
          color="green"
        />
        <StatsCard
          title="Ventas Mes"
          value={metrics?.ventas_mes?.total_facturado || 0}
          subtitle={`${metrics?.ventas_mes?.total_ventas || 0} transacciones`}
          icon="📅"
          color="purple"
        />
        <StatsCard
          title="Inventario"
          value={metrics?.inventario?.disponibles || 0}
          subtitle={`${metrics?.inventario?.vendidos || 0} vendidos`}
          icon="📦"
          color="orange"
        />
      </div>

      {/* Gráfico de ventas (placeholder - implementar con librería de gráficos) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Ventas por Período
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            📊 Gráfico de ventas (próximamente)
          </p>
        </div>
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Productos más vendidos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Productos Más Vendidos
            </h2>
          </div>
          <div className="p-4">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay productos vendidos aún
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-8">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {product.nombre}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.cantidad_total} unidades vendidas
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      ${product.total_generado?.toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/admin/reports"
              className="block text-center text-blue-600 hover:underline text-sm mt-4"
            >
              Ver reporte completo →
            </Link>
          </div>
        </div>

        {/* Ventas recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Ventas Recientes
            </h2>
          </div>
          <div className="p-4">
            {recentSales.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay ventas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        Factura #{sale.factura_numero}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(sale.fecha_venta).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        ${sale.total?.toLocaleString('es-CO')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.metodo_pago === 'efectivo' ? '💰 Efectivo' : '📱 Transferencia'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/admin/sales"
              className="block text-center text-blue-600 hover:underline text-sm mt-4"
            >
              Ver todas las ventas →
            </Link>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/products"
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
          >
            <div className="text-2xl mb-2">📦</div>
            <p className="font-medium text-gray-800 dark:text-white">Productos</p>
            <p className="text-sm text-gray-500">Gestionar catálogo</p>
          </Link>
          <Link
            to="/admin/sales"
            className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition"
          >
            <div className="text-2xl mb-2">💰</div>
            <p className="font-medium text-gray-800 dark:text-white">Ventas</p>
            <p className="text-sm text-gray-500">Historial de ventas</p>
          </Link>
          <Link
            to="/admin/reports"
            className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
          >
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium text-gray-800 dark:text-white">Reportes</p>
            <p className="text-sm text-gray-500">Estadísticas</p>
          </Link>
          <Link
            to="/admin/users"
            className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center hover:bg-orange-100 dark:hover:bg-orange-900/30 transition"
          >
            <div className="text-2xl mb-2">👥</div>
            <p className="font-medium text-gray-800 dark:text-white">Usuarios</p>
            <p className="text-sm text-gray-500">Cajeros y admins</p>
          </Link>
        </div>
      </div>

      {/* Alertas de productos agotados */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
            ⚠️ Productos Agotados
          </h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-500">
            {lowStockProducts.map(product => (
              <li key={product.id}>
                {product.nombre} - 
                <Link to={`/admin/products/edit/${product.id}`} className="ml-1 underline">
                  Actualizar stock
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;