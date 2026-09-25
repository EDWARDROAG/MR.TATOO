/**
 * ============================================================
 * ARCHIVO: saleService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — saleService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   saleService (default)
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

// frontend/src/services/saleService.js
import api from './api';

// Configuración del servicio de ventas
const saleService = {
  // === Operaciones CRUD de pedidos ===

  /**
   * Obtener todos los pedidos con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<{orders: Array, pagination: Object, stats: Object}>}
   */
  getAllOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Filtros básicos
      if (params.status) queryParams.append('status', params.status);
      if (params.customerId) queryParams.append('customerId', params.customerId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.minAmount) queryParams.append('minAmount', params.minAmount);
      if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount);
      if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
      if (params.search) queryParams.append('search', params.search);
      
      // Paginación
      const page = params.page || 1;
      const limit = params.limit || 10;
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      // Ordenamiento
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`/sales/orders?${queryParams.toString()}`);
      return {
        orders: response.data.orders || response.data,
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.orders?.length || 0,
          itemsPerPage: limit
        },
        stats: response.data.stats || {}
      };
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener pedido por ID
   * @param {string|number} id - ID del pedido
   * @returns {Promise<Object>}
   */
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/sales/orders/${id}`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener pedido por número de seguimiento
   * @param {string} trackingNumber - Número de seguimiento
   * @returns {Promise<Object>}
   */
  getOrderByTracking: async (trackingNumber) => {
    try {
      const response = await api.get(`/sales/orders/tracking/${trackingNumber}`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Crear nuevo pedido
   * @param {Object} orderData - Datos del pedido
   * @returns {Promise<Object>}
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/sales/orders', orderData);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Actualizar pedido
   * @param {string|number} id - ID del pedido
   * @param {Object} orderData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/sales/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Eliminar pedido (soft delete)
   * @param {string|number} id - ID del pedido
   * @returns {Promise<void>}
   */
  deleteOrder: async (id) => {
    try {
      await api.delete(`/sales/orders/${id}`);
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Eliminar pedido permanentemente
   * @param {string|number} id - ID del pedido
   * @returns {Promise<void>}
   */
  permanentDeleteOrder: async (id) => {
    try {
      await api.delete(`/sales/orders/${id}/permanent`);
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Gestión de estados ===

  /**
   * Actualizar estado del pedido
   * @param {string|number} id - ID del pedido
   * @param {string} status - Nuevo estado
   * @param {string} notes - Notas adicionales
   * @returns {Promise<Object>}
   */
  updateOrderStatus: async (id, status, notes = '') => {
    try {
      const response = await api.patch(`/sales/orders/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Cancelar pedido
   * @param {string|number} id - ID del pedido
   * @param {string} reason - Razón de cancelación
   * @returns {Promise<Object>}
   */
  cancelOrder: async (id, reason) => {
    try {
      const response = await api.post(`/sales/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Reembolsar pedido
   * @param {string|number} id - ID del pedido
   * @param {Object} refundData - Datos del reembolso
   * @returns {Promise<Object>}
   */
  refundOrder: async (id, refundData) => {
    try {
      const response = await api.post(`/sales/orders/${id}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Pagos ===

  /**
   * Procesar pago de pedido
   * @param {string|number} id - ID del pedido
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>}
   */
  processPayment: async (id, paymentData) => {
    try {
      const response = await api.post(`/sales/orders/${id}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Verificar estado de pago
   * @param {string|number} id - ID del pedido
   * @returns {Promise<Object>}
   */
  checkPaymentStatus: async (id) => {
    try {
      const response = await api.get(`/sales/orders/${id}/payment-status`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener métodos de pago disponibles
   * @returns {Promise<Array>}
   */
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/sales/payment-methods');
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Envíos ===

  /**
   * Actualizar información de envío
   * @param {string|number} id - ID del pedido
   * @param {Object} shippingData - Datos de envío
   * @returns {Promise<Object>}
   */
  updateShippingInfo: async (id, shippingData) => {
    try {
      const response = await api.patch(`/sales/orders/${id}/shipping`, shippingData);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Generar etiqueta de envío
   * @param {string|number} id - ID del pedido
   * @returns {Promise<Object>}
   */
  generateShippingLabel: async (id) => {
    try {
      const response = await api.post(`/sales/orders/${id}/shipping-label`, {}, {
        responseType: 'blob'
      });
      
      // Descargar etiqueta
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shipping-label-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Rastrear pedido
   * @param {string|number} id - ID del pedido
   * @returns {Promise<Object>}
   */
  trackOrder: async (id) => {
    try {
      const response = await api.get(`/sales/orders/${id}/tracking`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener costos de envío
   * @param {Object} shippingDetails - Detalles del envío
   * @returns {Promise<Array>}
   */
  getShippingRates: async (shippingDetails) => {
    try {
      const response = await api.post('/sales/shipping-rates', shippingDetails);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Facturación ===

  /**
   * Generar factura
   * @param {string|number} id - ID del pedido
   * @param {string} format - Formato (pdf, html)
   * @returns {Promise<void>}
   */
  generateInvoice: async (id, format = 'pdf') => {
    try {
      const response = await api.get(`/sales/orders/${id}/invoice`, {
        params: { format },
        responseType: 'blob'
      });
      
      const extension = format === 'pdf' ? 'pdf' : 'html';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Enviar factura por email
   * @param {string|number} id - ID del pedido
   * @param {string} email - Correo electrónico
   * @returns {Promise<void>}
   */
  sendInvoiceByEmail: async (id, email) => {
    try {
      await api.post(`/sales/orders/${id}/send-invoice`, { email });
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener facturas de cliente
   * @param {string|number} customerId - ID del cliente
   * @returns {Promise<Array>}
   */
  getCustomerInvoices: async (customerId) => {
    try {
      const response = await api.get(`/sales/customers/${customerId}/invoices`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Cupones y descuentos ===

  /**
   * Validar cupón de descuento
   * @param {string} code - Código del cupón
   * @param {number} orderTotal - Total del pedido
   * @returns {Promise<Object>}
   */
  validateCoupon: async (code, orderTotal) => {
    try {
      const response = await api.post('/sales/coupons/validate', { code, orderTotal });
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Aplicar cupón a pedido
   * @param {string|number} orderId - ID del pedido
   * @param {string} couponCode - Código del cupón
   * @returns {Promise<Object>}
   */
  applyCoupon: async (orderId, couponCode) => {
    try {
      const response = await api.post(`/sales/orders/${orderId}/coupon`, { couponCode });
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Eliminar cupón de pedido
   * @param {string|number} orderId - ID del pedido
   * @returns {Promise<Object>}
   */
  removeCoupon: async (orderId) => {
    try {
      const response = await api.delete(`/sales/orders/${orderId}/coupon`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Clientes ===

  /**
   * Obtener pedidos de cliente
   * @param {string|number} customerId - ID del cliente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Array>}
   */
  getCustomerOrders: async (customerId, params = {}) => {
    try {
      const response = await api.get(`/sales/customers/${customerId}/orders`, { params });
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener resumen de cliente
   * @param {string|number} customerId - ID del cliente
   * @returns {Promise<Object>}
   */
  getCustomerSummary: async (customerId) => {
    try {
      const response = await api.get(`/sales/customers/${customerId}/summary`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener historial de compras
   * @param {string|number} customerId - ID del cliente
   * @returns {Promise<Array>}
   */
  getPurchaseHistory: async (customerId) => {
    try {
      const response = await api.get(`/sales/customers/${customerId}/purchase-history`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Estadísticas y reportes ===

  /**
   * Obtener estadísticas de ventas
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getSalesStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.period) queryParams.append('period', params.period);
      
      const response = await api.get(`/sales/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener ventas por período
   * @param {string} period - Período (day, week, month, year)
   * @param {number} year - Año
   * @param {number} month - Mes
   * @returns {Promise<Array>}
   */
  getSalesByPeriod: async (period, year, month = null) => {
    try {
      const params = { period, year };
      if (month) params.month = month;
      
      const response = await api.get('/sales/stats/by-period', { params });
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener productos más vendidos
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getTopProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const response = await api.get(`/sales/stats/top-products?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener clientes frecuentes
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getTopCustomers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const response = await api.get(`/sales/stats/top-customers?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Obtener resumen diario de ventas
   * @param {string} date - Fecha (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  getDailySalesSummary: async (date) => {
    try {
      const response = await api.get(`/sales/stats/daily/${date}`);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Generar reporte de ventas
   * @param {Object} params - Parámetros del reporte
   * @param {string} format - Formato (pdf, excel, csv)
   * @returns {Promise<void>}
   */
  generateSalesReport: async (params, format = 'pdf') => {
    try {
      const response = await api.post('/sales/reports', params, {
        params: { format },
        responseType: 'blob'
      });
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-ventas.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Exportar ventas
   * @param {Object} filters - Filtros para exportación
   * @param {string} format - Formato (csv, excel)
   * @returns {Promise<void>}
   */
  exportSales: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.post('/sales/export', filters, {
        params: { format },
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
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Notificaciones ===

  /**
   * Enviar notificación de estado de pedido
   * @param {string|number} orderId - ID del pedido
   * @param {string} type - Tipo de notificación (email, sms, whatsapp)
   * @returns {Promise<void>}
   */
  sendOrderNotification: async (orderId, type = 'email') => {
    try {
      await api.post(`/sales/orders/${orderId}/notify`, { type });
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Devoluciones y cambios ===

  /**
   * Solicitar devolución
   * @param {string|number} orderId - ID del pedido
   * @param {Object} returnData - Datos de la devolución
   * @returns {Promise<Object>}
   */
  requestReturn: async (orderId, returnData) => {
    try {
      const response = await api.post(`/sales/orders/${orderId}/return`, returnData);
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  /**
   * Procesar devolución
   * @param {string|number} returnId - ID de la devolución
   * @param {string} action - Acción (approve, reject)
   * @param {string} notes - Notas
   * @returns {Promise<Object>}
   */
  processReturn: async (returnId, action, notes = '') => {
    try {
      const response = await api.post(`/sales/returns/${returnId}/process`, { action, notes });
      return response.data;
    } catch (error) {
      throw saleService.handleError(error);
    }
  },

  // === Utilidades ===

  /**
   * Formatear estado de pedido
   * @param {string} status - Estado del pedido
   * @returns {string}
   */
  formatStatus: (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado',
      'returned': 'Devuelto'
    };
    return statusMap[status] || status;
  },

  /**
   * Obtener color del estado
   * @param {string} status - Estado del pedido
   * @returns {string}
   */
  getStatusColor: (status) => {
    const colorMap = {
      'pending': '#f59e0b',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981',
      'completed': '#059669',
      'cancelled': '#ef4444',
      'refunded': '#6b7280',
      'returned': '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  },

  /**
   * Calcular subtotal de pedido
   * @param {Array} items - Items del pedido
   * @returns {number}
   */
  calculateSubtotal: (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  /**
   * Calcular impuestos
   * @param {number} subtotal - Subtotal
   * @param {number} taxRate - Tasa de impuesto (0-1)
   * @returns {number}
   */
  calculateTax: (subtotal, taxRate = 0.21) => {
    return subtotal * taxRate;
  },

  /**
   * Calcular total
   * @param {Object} calculation - Objeto con subtotal, tax, shipping, discount
   * @returns {number}
   */
  calculateTotal: ({ subtotal, tax = 0, shipping = 0, discount = 0 }) => {
    return subtotal + tax + shipping - discount;
  },

  /**
   * Formatear moneda
   * @param {number} amount - Cantidad
   * @param {string} currency - Código de moneda
   * @returns {string}
   */
  formatCurrency: (amount, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Formatear fecha
   * @param {string|Date} date - Fecha
   * @param {string} format - Formato (short, long, datetime)
   * @returns {string}
   */
  formatDate: (date, format = 'datetime') => {
    const d = new Date(date);
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString('es-ES');
      case 'long':
        return d.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'datetime':
        return d.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return d.toLocaleDateString('es-ES');
    }
  },

  /**
   * Validar datos de pedido
   * @param {Object} orderData - Datos del pedido
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateOrder: (orderData) => {
    const errors = {};
    
    if (!orderData.items || orderData.items.length === 0) {
      errors.items = 'El pedido debe tener al menos un producto';
    }
    
    if (!orderData.customerId && !orderData.customer) {
      errors.customer = 'La información del cliente es requerida';
    }
    
    if (!orderData.shippingAddress) {
      errors.shippingAddress = 'La dirección de envío es requerida';
    }
    
    if (orderData.shippingAddress) {
      const addr = orderData.shippingAddress;
      if (!addr.address) errors['shippingAddress.address'] = 'La dirección es requerida';
      if (!addr.city) errors['shippingAddress.city'] = 'La ciudad es requerida';
      if (!addr.country) errors['shippingAddress.country'] = 'El país es requerido';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Manejar errores de API
   * @param {Error} error - Error de axios
   * @returns {Error}
   */
  handleError: (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          error.message = data.message || 'Datos de pedido inválidos';
          break;
        case 401:
          error.message = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          error.message = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          error.message = 'Pedido no encontrado';
          break;
        case 409:
          error.message = data.message || 'Conflicto con el estado del pedido';
          break;
        case 422:
          error.message = data.message || 'Error de validación';
          if (data.errors) {
            error.validationErrors = data.errors;
          }
          break;
        default:
          error.message = data.message || 'Error al procesar la solicitud';
      }
    } else if (error.request) {
      error.message = 'Error de conexión. Por favor, verifica tu conexión a internet.';
    }
    
    return error;
  }
};

export default saleService;