/**
 * ============================================================
 * ARCHIVO: useSales.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useSales.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useSales (default)
 *
 * DEPENDENCIAS CLAVE:
 *   api
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

// frontend/src/hooks/useSales.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const useSales = () => {
  // Estados principales
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    customerId: '',
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
    search: ''
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });
  
  // Estados de estadísticas
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByDay: [],
    salesByMonth: [],
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });

  // Cargar órdenes iniciales
  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // Actualizar estadísticas cuando cambien las órdenes
  useEffect(() => {
    if (orders.length > 0) {
      calculateStats();
    }
  }, [orders]);

  // Fetch órdenes desde API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.search && { search: filters.search })
      });
      
      const response = await api.get(`/sales/orders?${params.toString()}`);
      const body = response.data;
      const ordersData = body.data ?? body.orders ?? (Array.isArray(body) ? body : []);
      const paginationData = body.pagination || {};
      
      setOrders(ordersData);
      setPagination(prev => ({
        ...prev,
        totalItems: paginationData.totalItems || ordersData.length,
        totalPages: paginationData.totalPages || 1
      }));
      
      return ordersData;
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Error al cargar las ventas');
      setOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // Calcular estadísticas
  const calculateStats = useCallback(() => {
    const completedOrders = orders.filter(order => order.status === 'completed' || order.status === 'delivered');
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Productos más vendidos
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    // Ventas por día
    const salesByDay = {};
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { date, total: 0, count: 0 };
      }
      salesByDay[date].total += order.total;
      salesByDay[date].count += 1;
    });
    
    // Ventas por mes
    const salesByMonth = {};
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!salesByMonth[monthKey]) {
        salesByMonth[monthKey] = { month: monthKey, total: 0, count: 0 };
      }
      salesByMonth[monthKey].total += order.total;
      salesByMonth[monthKey].count += 1;
    });
    
    setSalesStats({
      totalSales,
      totalOrders,
      averageOrderValue,
      topProducts: topProducts,
      salesByDay: Object.values(salesByDay),
      salesByMonth: Object.values(salesByMonth),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: completedOrders.length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    });
  }, [orders]);

  // Obtener orden por ID
  const getOrderById = useCallback(async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/sales/orders/${orderId}`);
      const order = response.data;
      setCurrentOrder(order);
      return order;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Error al cargar la orden');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva orden (legacy /orders)
  const createOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/sales/orders', orderData);
      const newOrder = response.data;
      
      // Actualizar lista de órdenes
      setOrders(prev => [newOrder, ...prev]);
      
      return { success: true, order: newOrder };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear la orden';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Venta POS (HU-055) — POST /api/sales
   * @param {object} saleData — items, cliente_*, metodo_pago, total
   * @param {File|null} comprobanteFile — solo transferencia
   */
  const createSale = useCallback(async (saleData, comprobanteFile = null) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (comprobanteFile) {
        const formData = new FormData();
        formData.append('items', JSON.stringify(saleData.items || []));
        formData.append('cliente_nombre', saleData.cliente_nombre || '');
        formData.append('cliente_telefono', saleData.cliente_telefono || '');
        formData.append('metodo_pago', saleData.metodo_pago);
        if (saleData.total != null) formData.append('total', String(saleData.total));
        formData.append('comprobante', comprobanteFile);
        response = await api.post('/sales', formData);
      } else {
        response = await api.post('/sales', saleData);
      }

      const payload = response.data || {};
      const sale = payload.data?.sale || payload.sale || payload.data;
      return {
        success: payload.success !== false,
        sale,
        factura_pdf: payload.data?.factura_pdf || payload.factura_pdf,
        message: payload.message,
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Error al registrar la venta';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar orden
  const updateOrder = useCallback(async (orderId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/sales/orders/${orderId}`, updateData);
      const updatedOrder = response.data;
      
      // Actualizar en la lista de órdenes
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      // Actualizar orden actual si es la misma
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      
      return { success: true, order: updatedOrder };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la orden';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Actualizar estado de orden
  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/sales/orders/${orderId}/status`, { status });
      const updatedOrder = response.data;
      
      // Actualizar en la lista de órdenes
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      // Actualizar orden actual si es la misma
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      
      return { success: true, order: updatedOrder };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el estado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Cancelar orden
  const cancelOrder = useCallback(async (orderId, reason) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/sales/orders/${orderId}/cancel`, { reason });
      const cancelledOrder = response.data;
      
      // Actualizar en la lista de órdenes
      setOrders(prev => prev.map(order => 
        order.id === orderId ? cancelledOrder : order
      ));
      
      // Actualizar orden actual si es la misma
      if (currentOrder?.id === orderId) {
        setCurrentOrder(cancelledOrder);
      }
      
      return { success: true, order: cancelledOrder };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cancelar la orden';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Generar / descargar factura térmica POS
  const generateInvoice = useCallback(async (saleId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/sales/${saleId}/invoice`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${saleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al generar la factura';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar factura por email
  const sendInvoiceByEmail = useCallback(async (orderId, email) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/sales/orders/${orderId}/send-invoice`, { email });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al enviar la factura';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Procesar pago
  const processPayment = useCallback(async (orderId, paymentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/sales/orders/${orderId}/payment`, paymentData);
      const updatedOrder = response.data;
      
      // Actualizar en la lista de órdenes
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      // Actualizar orden actual si es la misma
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      
      return { success: true, order: updatedOrder };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al procesar el pago';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Obtener estadísticas por período
  const getStatsByPeriod = useCallback(async (period, year, month) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({ period });
      if (year) params.append('year', year);
      if (month) params.append('month', month);
      
      const response = await api.get(`/sales/stats?${params.toString()}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      customerId: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Cambiar página
  const changePage = useCallback((page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  }, []);

  // Cambiar items por página
  const setItemsPerPage = useCallback((itemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1
    }));
  }, []);

  // Obtener órdenes del cliente actual
  const getCustomerOrders = useCallback(async (customerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/sales/customers/${customerId}/orders`);
      return response.data;
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setError(err.response?.data?.message || 'Error al cargar las órdenes del cliente');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar ventas a CSV/Excel
  const exportSales = useCallback(async (format = 'csv') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        format,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status })
      });
      
      const response = await api.get(`/sales/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ventas.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al exportar ventas';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Formatear moneda
  const formatCurrency = useCallback((amount, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Formatear fecha
  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Obtener estado de orden en español
  const getOrderStatusText = useCallback((status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado'
    };
    return statusMap[status] || status;
  }, []);

  // Obtener color del estado
  const getOrderStatusColor = useCallback((status) => {
    const colorMap = {
      'pending': '#f59e0b', // Amarillo
      'processing': '#3b82f6', // Azul
      'shipped': '#8b5cf6', // Púrpura
      'delivered': '#10b981', // Verde
      'completed': '#059669', // Verde oscuro
      'cancelled': '#ef4444', // Rojo
      'refunded': '#6b7280' // Gris
    };
    return colorMap[status] || '#6b7280';
  }, []);

  // Verificar si se puede cancelar orden
  const canCancelOrder = useCallback((order) => {
    const cancellableStatuses = ['pending', 'processing'];
    return cancellableStatuses.includes(order.status);
  }, []);

  // Calcular subtotal de orden
  const calculateOrderSubtotal = useCallback((order) => {
    return order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  }, []);

  // Calcular impuestos de orden
  const calculateOrderTax = useCallback((order) => {
    const subtotal = calculateOrderSubtotal(order);
    const taxRate = order.taxRate || 0.21; // 21% por defecto
    return subtotal * taxRate;
  }, [calculateOrderSubtotal]);

  // Obtener métodos de pago disponibles
  const getPaymentMethods = useCallback(() => {
    return [
      { id: 'credit_card', name: 'Tarjeta de crédito/débito', icon: '💳' },
      { id: 'paypal', name: 'PayPal', icon: '💰' },
      { id: 'bank_transfer', name: 'Transferencia bancaria', icon: '🏦' },
      { id: 'cash', name: 'Efectivo', icon: '💵' }
    ];
  }, []);

  // Memoized values
  const currentOrders = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return orders.slice(start, end);
  }, [orders, pagination.currentPage, pagination.itemsPerPage]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '' && value !== null);
  }, [filters]);

  const getSales = useCallback(async (params = {}) => {
    const response = await api.get('/sales', { params });
    const payload = response.data;
    return {
      data: payload.sales || payload.data || [],
      pagination: payload.pagination,
    };
  }, []);

  const getTopProducts = useCallback(async (params = {}) => {
    const response = await api.get('/reports/top-products', { params });
    const payload = response.data;
    return payload.data?.top_productos || payload.top_productos || payload.data || [];
  }, []);

  const getSalesBySeller = useCallback(async (params = {}) => {
    const response = await api.get('/reports/sales-by-seller', { params });
    const payload = response.data;
    return payload.data?.vendedores || payload.vendedores || payload.data || [];
  }, []);

  return {
    // Datos principales
    orders,
    currentOrders,
    currentOrder,
    salesStats,
    
    // Estados
    loading,
    error,
    filters,
    pagination,
    
    // Métodos de órdenes
    fetchOrders,
    getOrderById,
    createOrder,
    createSale,
    updateOrder,
    updateOrderStatus,
    cancelOrder,
    getCustomerOrders,
    
    // Métodos de facturación
    generateInvoice,
    sendInvoiceByEmail,
    
    // Métodos de pago
    processPayment,
    getPaymentMethods,
    
    // Métodos de estadísticas
    getStatsByPeriod,
    
    // Métodos de exportación
    exportSales,
    
    // Métodos de filtrado
    updateFilters,
    clearFilters,
    changePage,
    setItemsPerPage,
    
    // Utilidades
    formatCurrency,
    formatDate,
    getOrderStatusText,
    getOrderStatusColor,
    canCancelOrder,
    calculateOrderSubtotal,
    calculateOrderTax,
    
    // Getters útiles
    totalOrders: pagination.totalItems,
    hasMorePages: pagination.currentPage < pagination.totalPages,
    isFirstPage: pagination.currentPage === 1,
    isLastPage: pagination.currentPage === pagination.totalPages,
    hasActiveFilters,
    
    // Loading states específicos
    isLoadingOrders: loading && orders.length === 0,
    isLoadingOrder: loading && currentOrder === null,

    getSales,
    getTopProducts,
    getSalesBySeller,
  };
};

export { useSales };
export default useSales;