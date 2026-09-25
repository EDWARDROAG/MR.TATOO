/**
 * ============================================================
 * ARCHIVO: reportService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — reportService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   reportService (default)
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

// frontend/src/services/reportService.js
import api from './api';

// Configuración del servicio de reportes
const reportService = {
  // === Reportes de ventas ===

  /**
   * Generar reporte de ventas
   * @param {Object} params - Parámetros del reporte
   * @param {string} format - Formato (pdf, excel, csv)
   * @returns {Promise<void>}
   */
  generateSalesReport: async (params = {}, format = 'pdf') => {
    try {
      const response = await api.post('/reports/sales', params, {
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
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener resumen de ventas
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getSalesSummary: async (params = {}) => {
    try {
      const response = await api.get('/reports/sales/summary', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener ventas por período
   * @param {string} period - Período (day, week, month, quarter, year)
   * @param {number} year - Año
   * @param {number} month - Mes (opcional)
   * @returns {Promise<Array>}
   */
  getSalesByPeriod: async (period, year, month = null) => {
    try {
      const params = { period, year };
      if (month) params.month = month;
      
      const response = await api.get('/reports/sales/by-period', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener ventas por categoría
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getSalesByCategory: async (params = {}) => {
    try {
      const response = await api.get('/reports/sales/by-category', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener ventas por producto
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getSalesByProduct: async (params = {}) => {
    try {
      const response = await api.get('/reports/sales/by-product', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener ventas por cliente
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getSalesByCustomer: async (params = {}) => {
    try {
      const response = await api.get('/reports/sales/by-customer', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener ventas por método de pago
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getSalesByPaymentMethod: async (params = {}) => {
    try {
      const response = await api.get('/reports/sales/by-payment-method', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Reportes de productos ===

  /**
   * Generar reporte de productos
   * @param {Object} params - Parámetros del reporte
   * @param {string} format - Formato (pdf, excel, csv)
   * @returns {Promise<void>}
   */
  generateProductReport: async (params = {}, format = 'pdf') => {
    try {
      const response = await api.post('/reports/products', params, {
        params: { format },
        responseType: 'blob'
      });
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-productos.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener productos más vendidos
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getTopProducts: async (params = {}) => {
    try {
      const response = await api.get('/reports/products/top-selling', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener productos con bajo stock
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getLowStockProducts: async (params = {}) => {
    try {
      const response = await api.get('/reports/products/low-stock', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener productos sin movimiento
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getInactiveProducts: async (params = {}) => {
    try {
      const response = await api.get('/reports/products/inactive', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener rotación de inventario
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getInventoryTurnover: async (params = {}) => {
    try {
      const response = await api.get('/reports/products/inventory-turnover', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Reportes de clientes ===

  /**
   * Generar reporte de clientes
   * @param {Object} params - Parámetros del reporte
   * @param {string} format - Formato (pdf, excel, csv)
   * @returns {Promise<void>}
   */
  generateCustomerReport: async (params = {}, format = 'pdf') => {
    try {
      const response = await api.post('/reports/customers', params, {
        params: { format },
        responseType: 'blob'
      });
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-clientes.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener clientes frecuentes
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getTopCustomers: async (params = {}) => {
    try {
      const response = await api.get('/reports/customers/top', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener clientes nuevos
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getNewCustomers: async (params = {}) => {
    try {
      const response = await api.get('/reports/customers/new', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener clientes inactivos
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getInactiveCustomers: async (params = {}) => {
    try {
      const response = await api.get('/reports/customers/inactive', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener segmentación de clientes
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getCustomerSegmentation: async (params = {}) => {
    try {
      const response = await api.get('/reports/customers/segmentation', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Reportes financieros ===

  /**
   * Generar reporte financiero
   * @param {Object} params - Parámetros del reporte
   * @param {string} format - Formato (pdf, excel, csv)
   * @returns {Promise<void>}
   */
  generateFinancialReport: async (params = {}, format = 'pdf') => {
    try {
      const response = await api.post('/reports/financial', params, {
        params: { format },
        responseType: 'blob'
      });
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-financiero.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener ingresos y gastos
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getRevenueAndExpenses: async (params = {}) => {
    try {
      const response = await api.get('/reports/financial/revenue-expenses', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener ganancias por período
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getProfitByPeriod: async (params = {}) => {
    try {
      const response = await api.get('/reports/financial/profit', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener impuestos recaudados
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getTaxCollected: async (params = {}) => {
    try {
      const response = await api.get('/reports/financial/taxes', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Reportes de inventario ===

  /**
   * Generar reporte de inventario
   * @param {Object} params - Parámetros del reporte
   * @param {string} format - Formato (pdf, excel, csv)
   * @returns {Promise<void>}
   */
  generateInventoryReport: async (params = {}, format = 'pdf') => {
    try {
      const response = await api.post('/reports/inventory', params, {
        params: { format },
        responseType: 'blob'
      });
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-inventario.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener valor del inventario
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getInventoryValue: async (params = {}) => {
    try {
      const response = await api.get('/reports/inventory/value', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener movimientos de inventario
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Array>}
   */
  getInventoryMovements: async (params = {}) => {
    try {
      const response = await api.get('/reports/inventory/movements', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Dashboard y KPI ===

  /**
   * Obtener KPI del dashboard
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getDashboardKPI: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/kpi', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener métricas en tiempo real
   * @returns {Promise<Object>}
   */
  getRealTimeMetrics: async () => {
    try {
      const response = await api.get('/reports/dashboard/realtime');
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener tendencias
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getTrends: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/trends', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener predicciones
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>}
   */
  getForecasts: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/forecasts', { params });
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Reportes personalizados ===

  /**
   * Crear reporte personalizado
   * @param {Object} config - Configuración del reporte
   * @returns {Promise<Object>}
   */
  createCustomReport: async (config) => {
    try {
      const response = await api.post('/reports/custom', config);
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener reportes guardados
   * @returns {Promise<Array>}
   */
  getSavedReports: async () => {
    try {
      const response = await api.get('/reports/custom/saved');
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Ejecutar reporte guardado
   * @param {string} reportId - ID del reporte
   * @param {string} format - Formato (pdf, excel, csv)
   * @returns {Promise<void>}
   */
  runSavedReport: async (reportId, format = 'pdf') => {
    try {
      const response = await api.post(`/reports/custom/${reportId}/run`, null, {
        params: { format },
        responseType: 'blob'
      });
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${reportId}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Eliminar reporte guardado
   * @param {string} reportId - ID del reporte
   * @returns {Promise<void>}
   */
  deleteSavedReport: async (reportId) => {
    try {
      await api.delete(`/reports/custom/${reportId}`);
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Programar reporte
   * @param {Object} scheduleData - Datos de programación
   * @returns {Promise<Object>}
   */
  scheduleReport: async (scheduleData) => {
    try {
      const response = await api.post('/reports/schedule', scheduleData);
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Obtener reportes programados
   * @returns {Promise<Array>}
   */
  getScheduledReports: async () => {
    try {
      const response = await api.get('/reports/schedule');
      return response.data;
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Eliminar programación de reporte
   * @param {string} scheduleId - ID de la programación
   * @returns {Promise<void>}
   */
  deleteScheduledReport: async (scheduleId) => {
    try {
      await api.delete(`/reports/schedule/${scheduleId}`);
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Exportación de datos ===

  /**
   * Exportar datos a CSV
   * @param {string} entity - Entidad (sales, products, customers, etc.)
   * @param {Object} filters - Filtros
   * @returns {Promise<void>}
   */
  exportToCSV: async (entity, filters = {}) => {
    try {
      const response = await api.post(`/reports/export/${entity}`, filters, {
        params: { format: 'csv' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${entity}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  /**
   * Exportar datos a Excel
   * @param {string} entity - Entidad
   * @param {Object} filters - Filtros
   * @returns {Promise<void>}
   */
  exportToExcel: async (entity, filters = {}) => {
    try {
      const response = await api.post(`/reports/export/${entity}`, filters, {
        params: { format: 'excel' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${entity}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw reportService.handleError(error);
    }
  },

  // === Utilidades ===

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
   * Formatear número
   * @param {number} number - Número a formatear
   * @param {number} decimals - Decimales
   * @returns {string}
   */
  formatNumber: (number, decimals = 0) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  },

  /**
   * Formatear porcentaje
   * @param {number} value - Valor
   * @param {number} decimals - Decimales
   * @returns {string}
   */
  formatPercentage: (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Calcular crecimiento porcentual
   * @param {number} current - Valor actual
   * @param {number} previous - Valor anterior
   * @returns {number}
   */
  calculateGrowth: (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  /**
   * Obtener color según tendencia
   * @param {number} growth - Porcentaje de crecimiento
   * @returns {string}
   */
  getTrendColor: (growth) => {
    if (growth > 0) return '#10b981';
    if (growth < 0) return '#ef4444';
    return '#6b7280';
  },

  /**
   * Obtener ícono según tendencia
   * @param {number} growth - Porcentaje de crecimiento
   * @returns {string}
   */
  getTrendIcon: (growth) => {
    if (growth > 0) return '↑';
    if (growth < 0) return '↓';
    return '→';
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
          error.message = data.message || 'Parámetros de reporte inválidos';
          break;
        case 401:
          error.message = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          error.message = 'No tienes permisos para generar este reporte';
          break;
        case 404:
          error.message = 'Reporte no encontrado';
          break;
        case 429:
          error.message = 'Demasiadas solicitudes. Por favor, espera un momento.';
          break;
        case 500:
          error.message = 'Error al generar el reporte. Por favor, intenta más tarde.';
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

export default reportService;