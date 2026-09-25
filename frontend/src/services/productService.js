/**
 * ============================================================
 * ARCHIVO: productService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — productService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   productService (default)
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

// frontend/src/services/productService.js
import api from './api';

// Configuración del servicio de productos
const productService = {
  // === Operaciones CRUD básicas ===

  /**
   * Obtener todos los productos con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<{products: Array, pagination: Object}>}
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Filtros básicos
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.brand) queryParams.append('brand', params.brand);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.status) queryParams.append('status', params.status);
      
      // Paginación
      const page = params.page || 1;
      const limit = params.limit || 12;
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      // Ordenamiento
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Filtros adicionales
      if (params.inStock) queryParams.append('inStock', true);
      if (params.onSale) queryParams.append('onSale', true);
      if (params.featured) queryParams.append('featured', true);
      if (params.rating) queryParams.append('rating', params.rating);
      
      const response = await api.get(`/products?${queryParams.toString()}`);
      return {
        products: response.data.products || response.data,
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.products?.length || 0,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener producto por ID
   * @param {string|number} id - ID del producto
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener producto por slug
   * @param {string} slug - Slug del producto
   * @returns {Promise<Object>}
   */
  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Crear nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>}
   */
  create: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Actualizar producto existente
   * @param {string|number} id - ID del producto
   * @param {Object} productData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Eliminar producto
   * @param {string|number} id - ID del producto
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Eliminar múltiples productos
   * @param {Array} ids - Array de IDs de productos
   * @returns {Promise<{deletedCount: number}>}
   */
  deleteMultiple: async (ids) => {
    try {
      const response = await api.post('/products/delete-multiple', { ids });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Gestión de imágenes ===

  /**
   * Subir imagen de producto
   * @param {string|number} productId - ID del producto
   * @param {File} file - Archivo de imagen
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadImage: async (productId, file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(`/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Subir múltiples imágenes
   * @param {string|number} productId - ID del producto
   * @param {File[]} files - Array de archivos de imagen
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadMultipleImages: async (productId, files, onProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await api.post(`/products/${productId}/images/multiple`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Eliminar imagen de producto
   * @param {string|number} productId - ID del producto
   * @param {string|number} imageId - ID de la imagen
   * @returns {Promise<void>}
   */
  deleteImage: async (productId, imageId) => {
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Reordenar imágenes de producto
   * @param {string|number} productId - ID del producto
   * @param {Array} imageOrder - Array con orden de IDs de imágenes
   * @returns {Promise<Object>}
   */
  reorderImages: async (productId, imageOrder) => {
    try {
      const response = await api.patch(`/products/${productId}/images/reorder`, { imageOrder });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Establecer imagen principal
   * @param {string|number} productId - ID del producto
   * @param {string|number} imageId - ID de la imagen
   * @returns {Promise<Object>}
   */
  setMainImage: async (productId, imageId) => {
    try {
      const response = await api.patch(`/products/${productId}/images/${imageId}/main`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Gestión de variantes ===

  /**
   * Obtener variantes de producto
   * @param {string|number} productId - ID del producto
   * @returns {Promise<Array>}
   */
  getVariants: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/variants`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Agregar variante a producto
   * @param {string|number} productId - ID del producto
   * @param {Object} variantData - Datos de la variante
   * @returns {Promise<Object>}
   */
  addVariant: async (productId, variantData) => {
    try {
      const response = await api.post(`/products/${productId}/variants`, variantData);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Actualizar variante
   * @param {string|number} productId - ID del producto
   * @param {string|number} variantId - ID de la variante
   * @param {Object} variantData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateVariant: async (productId, variantId, variantData) => {
    try {
      const response = await api.put(`/products/${productId}/variants/${variantId}`, variantData);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Eliminar variante
   * @param {string|number} productId - ID del producto
   * @param {string|number} variantId - ID de la variante
   * @returns {Promise<void>}
   */
  deleteVariant: async (productId, variantId) => {
    try {
      await api.delete(`/products/${productId}/variants/${variantId}`);
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Actualizar stock de variante
   * @param {string|number} productId - ID del producto
   * @param {string|number} variantId - ID de la variante
   * @param {number} quantity - Cantidad a actualizar
   * @param {string} operation - Tipo de operación (set, add, subtract)
   * @returns {Promise<Object>}
   */
  updateVariantStock: async (productId, variantId, quantity, operation = 'set') => {
    try {
      const response = await api.patch(`/products/${productId}/variants/${variantId}/stock`, {
        quantity,
        operation
      });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Gestión de stock ===

  /**
   * Actualizar stock de producto
   * @param {string|number} productId - ID del producto
   * @param {number} quantity - Cantidad a actualizar
   * @param {string} operation - Tipo de operación (set, add, subtract)
   * @returns {Promise<Object>}
   */
  updateStock: async (productId, quantity, operation = 'set') => {
    try {
      const response = await api.patch(`/products/${productId}/stock`, {
        quantity,
        operation
      });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Verificar disponibilidad de stock
   * @param {string|number} productId - ID del producto
   * @param {number} quantity - Cantidad deseada
   * @param {Object} options - Opciones de variante (opcional)
   * @returns {Promise<{available: boolean, stock: number}>}
   */
  checkStock: async (productId, quantity = 1, options = null) => {
    try {
      const response = await api.post(`/products/${productId}/check-stock`, {
        quantity,
        options
      });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Búsqueda y filtros ===

  /**
   * Buscar productos
   * @param {string} query - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>}
   */
  search: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({ q: query });
      if (filters.category) params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/products/search?${params.toString()}`);
      return response.data.products || response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener productos por categoría
   * @param {string|number} categoryId - ID de la categoría
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Array>}
   */
  getByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get(`/products/category/${categoryId}`, { params });
      return response.data.products || response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener productos por marca
   * @param {string|number} brandId - ID de la marca
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Array>}
   */
  getByBrand: async (brandId, params = {}) => {
    try {
      const response = await api.get(`/products/brand/${brandId}`, { params });
      return response.data.products || response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener productos destacados
   * @param {number} limit - Cantidad de productos
   * @returns {Promise<Array>}
   */
  getFeatured: async (limit = 6) => {
    try {
      const response = await api.get('/products/featured', { params: { limit } });
      return response.data.products || response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener productos más vendidos
   * @param {number} limit - Cantidad de productos
   * @returns {Promise<Array>}
   */
  getBestSellers: async (limit = 8) => {
    try {
      const response = await api.get('/products/best-sellers', { params: { limit } });
      return response.data.products || response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener productos en oferta
   * @param {number} limit - Cantidad de productos
   * @returns {Promise<Array>}
   */
  getOnSale: async (limit = 8) => {
    try {
      const response = await api.get('/products/on-sale', { params: { limit } });
      return response.data.products || response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener productos relacionados
   * @param {string|number} productId - ID del producto
   * @param {number} limit - Cantidad de productos
   * @returns {Promise<Array>}
   */
  getRelated: async (productId, limit = 4) => {
    try {
      const response = await api.get(`/products/${productId}/related`, { params: { limit } });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Obtener filtros disponibles
   * @returns {Promise<Object>}
   */
  getFilters: async () => {
    try {
      const response = await api.get('/products/filters');
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Reseñas y calificaciones ===

  /**
   * Obtener reseñas de producto
   * @param {string|number} productId - ID del producto
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<{reviews: Array, pagination: Object}>}
   */
  getReviews: async (productId, params = {}) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`, { params });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Agregar reseña a producto
   * @param {string|number} productId - ID del producto
   * @param {Object} reviewData - Datos de la reseña
   * @returns {Promise<Object>}
   */
  addReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Actualizar reseña
   * @param {string|number} productId - ID del producto
   * @param {string|number} reviewId - ID de la reseña
   * @param {Object} reviewData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateReview: async (productId, reviewId, reviewData) => {
    try {
      const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Eliminar reseña
   * @param {string|number} productId - ID del producto
   * @param {string|number} reviewId - ID de la reseña
   * @returns {Promise<void>}
   */
  deleteReview: async (productId, reviewId) => {
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Marcar reseña como útil
   * @param {string|number} productId - ID del producto
   * @param {string|number} reviewId - ID de la reseña
   * @returns {Promise<Object>}
   */
  markReviewHelpful: async (productId, reviewId) => {
    try {
      const response = await api.post(`/products/${productId}/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Precios y descuentos ===

  /**
   * Aplicar descuento a producto
   * @param {string|number} productId - ID del producto
   * @param {Object} discountData - Datos del descuento
   * @returns {Promise<Object>}
   */
  applyDiscount: async (productId, discountData) => {
    try {
      const response = await api.post(`/products/${productId}/discount`, discountData);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Eliminar descuento de producto
   * @param {string|number} productId - ID del producto
   * @returns {Promise<Object>}
   */
  removeDiscount: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}/discount`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Actualizar precio de producto
   * @param {string|number} productId - ID del producto
   * @param {number} price - Nuevo precio
   * @returns {Promise<Object>}
   */
  updatePrice: async (productId, price) => {
    try {
      const response = await api.patch(`/products/${productId}/price`, { price });
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Exportación e importación ===

  /**
   * Exportar productos
   * @param {string} format - Formato de exportación (csv, json, excel)
   * @param {Object} filters - Filtros para exportación
   * @returns {Promise<void>}
   */
  exportProducts: async (format = 'csv', filters = {}) => {
    try {
      const response = await api.post('/products/export', { format, filters }, {
        responseType: 'blob'
      });
      
      // Descargar archivo
      const extension = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'json';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `productos.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  /**
   * Importar productos desde archivo
   * @param {File} file - Archivo a importar
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  importProducts: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // === Utilidades ===

  /**
   * Generar slug a partir de nombre
   * @param {string} name - Nombre del producto
   * @returns {string}
   */
  generateSlug: (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  },

  /**
   * Calcular precio con descuento
   * @param {number} price - Precio original
   * @param {number} discount - Porcentaje de descuento
   * @returns {number}
   */
  calculateDiscountedPrice: (price, discount) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  },

  /**
   * Formatear precio
   * @param {number} price - Precio a formatear
   * @param {string} currency - Código de moneda
   * @returns {string}
   */
  formatPrice: (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  },

  /**
   * Validar datos de producto
   * @param {Object} productData - Datos del producto
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateProduct: (productData) => {
    const errors = {};
    
    if (!productData.name || productData.name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!productData.price || productData.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    
    if (productData.compareAtPrice && productData.compareAtPrice <= productData.price) {
      errors.compareAtPrice = 'El precio de comparación debe ser mayor al precio actual';
    }
    
    if (productData.stock !== undefined && productData.stock < 0) {
      errors.stock = 'El stock no puede ser negativo';
    }
    
    if (productData.weight && productData.weight <= 0) {
      errors.weight = 'El peso debe ser mayor a 0';
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
          error.message = data.message || 'Datos de producto inválidos';
          break;
        case 401:
          error.message = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          error.message = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          error.message = 'Producto no encontrado';
          break;
        case 409:
          error.message = data.message || 'Conflicto: El producto ya existe';
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

export default productService;