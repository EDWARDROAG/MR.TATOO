/**
 * ============================================================
 * ARCHIVO: userService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — userService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   userService (default)
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

// frontend/src/services/userService.js
import api from './api';

// Configuración del servicio de usuarios
const userService = {
  // === Operaciones CRUD de usuarios ===

  /**
   * Obtener todos los usuarios con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<{users: Array, pagination: Object}>}
   */
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Filtros
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.verified) queryParams.append('verified', params.verified);
      
      // Paginación
      const page = params.page || 1;
      const limit = params.limit || 10;
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      // Ordenamiento
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`/users?${queryParams.toString()}`);
      return {
        users: response.data.users || response.data,
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: response.data.users?.length || 0,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Obtener usuario por ID
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>}
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Obtener usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>}
   */
  getUserByEmail: async (email) => {
    try {
      const response = await api.get(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Crear nuevo usuario (admin)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>}
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar usuario
   * @param {string|number} id - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Eliminar usuario (soft delete)
   * @param {string|number} id - ID del usuario
   * @returns {Promise<void>}
   */
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Eliminar usuario permanentemente
   * @param {string|number} id - ID del usuario
   * @returns {Promise<void>}
   */
  permanentDeleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}/permanent`);
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Restaurar usuario eliminado
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>}
   */
  restoreUser: async (id) => {
    try {
      const response = await api.post(`/users/${id}/restore`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  // === Gestión de roles y permisos ===

  /**
   * Obtener todos los roles
   * @returns {Promise<Array>}
   */
  getRoles: async () => {
    try {
      const response = await api.get('/users/roles');
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Obtener permisos de usuario
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Array>}
   */
  getUserPermissions: async (id) => {
    try {
      const response = await api.get(`/users/${id}/permissions`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar rol de usuario
   * @param {string|number} id - ID del usuario
   * @param {string} role - Nuevo rol
   * @returns {Promise<Object>}
   */
  updateUserRole: async (id, role) => {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Asignar permisos a usuario
   * @param {string|number} id - ID del usuario
   * @param {Array} permissions - Lista de permisos
   * @returns {Promise<Object>}
   */
  assignPermissions: async (id, permissions) => {
    try {
      const response = await api.post(`/users/${id}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Crear nuevo rol
   * @param {Object} roleData - Datos del rol
   * @returns {Promise<Object>}
   */
  createRole: async (roleData) => {
    try {
      const response = await api.post('/users/roles', roleData);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar rol
   * @param {string|number} id - ID del rol
   * @param {Object} roleData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/users/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Eliminar rol
   * @param {string|number} id - ID del rol
   * @returns {Promise<void>}
   */
  deleteRole: async (id) => {
    try {
      await api.delete(`/users/roles/${id}`);
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  // === Gestión de perfiles ===

  /**
   * Obtener perfil de usuario
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar perfil
   * @param {Object} profileData - Datos del perfil
   * @returns {Promise<Object>}
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Cambiar contraseña
   * @param {Object} passwordData - Datos de contraseña
   * @returns {Promise<void>}
   */
  changePassword: async (passwordData) => {
    try {
      await api.post('/users/change-password', passwordData);
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Subir avatar
   * @param {File} file - Archivo de imagen
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadAvatar: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/users/avatar', formData, {
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
      throw userService.handleError(error);
    }
  },

  /**
   * Eliminar avatar
   * @returns {Promise<void>}
   */
  deleteAvatar: async () => {
    try {
      await api.delete('/users/avatar');
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  // === Direcciones ===

  /**
   * Obtener direcciones del usuario
   * @returns {Promise<Array>}
   */
  getAddresses: async () => {
    try {
      const response = await api.get('/users/addresses');
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Agregar dirección
   * @param {Object} addressData - Datos de la dirección
   * @returns {Promise<Object>}
   */
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/users/addresses', addressData);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar dirección
   * @param {string|number} addressId - ID de la dirección
   * @param {Object} addressData - Datos a actualizar
   * @returns {Promise<Object>}
   */
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/users/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Eliminar dirección
   * @param {string|number} addressId - ID de la dirección
   * @returns {Promise<void>}
   */
  deleteAddress: async (addressId) => {
    try {
      await api.delete(`/users/addresses/${addressId}`);
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Establecer dirección como principal
   * @param {string|number} addressId - ID de la dirección
   * @returns {Promise<Object>}
   */
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.patch(`/users/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  // === Preferencias ===

  /**
   * Obtener preferencias del usuario
   * @returns {Promise<Object>}
   */
  getPreferences: async () => {
    try {
      const response = await api.get('/users/preferences');
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar preferencias
   * @param {Object} preferences - Preferencias del usuario
   * @returns {Promise<Object>}
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar tema
   * @param {string} theme - Tema (light, dark, system)
   * @returns {Promise<Object>}
   */
  updateTheme: async (theme) => {
    try {
      const response = await api.patch('/users/preferences/theme', { theme });
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Actualizar notificaciones
   * @param {Object} notifications - Configuración de notificaciones
   * @returns {Promise<Object>}
   */
  updateNotifications: async (notifications) => {
    try {
      const response = await api.patch('/users/preferences/notifications', notifications);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  // === Estadísticas de usuario ===

  /**
   * Obtener estadísticas del usuario
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>}
   */
  getUserStats: async (id) => {
    try {
      const response = await api.get(`/users/${id}/stats`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Obtener actividad reciente
   * @param {string|number} id - ID del usuario
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Array>}
   */
  getUserActivity: async (id, params = {}) => {
    try {
      const response = await api.get(`/users/${id}/activity`, { params });
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Obtener historial de inicio de sesión
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Array>}
   */
  getLoginHistory: async (id) => {
    try {
      const response = await api.get(`/users/${id}/login-history`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  // === Suspensión y bloqueo ===

  /**
   * Suspender usuario
   * @param {string|number} id - ID del usuario
   * @param {Object} data - Datos de suspensión
   * @returns {Promise<Object>}
   */
  suspendUser: async (id, data) => {
    try {
      const response = await api.post(`/users/${id}/suspend`, data);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Activar usuario suspendido
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>}
   */
  activateUser: async (id) => {
    try {
      const response = await api.post(`/users/${id}/activate`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Bloquear usuario
   * @param {string|number} id - ID del usuario
   * @param {string} reason - Razón de bloqueo
   * @returns {Promise<Object>}
   */
  blockUser: async (id, reason) => {
    try {
      const response = await api.post(`/users/${id}/block`, { reason });
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Desbloquear usuario
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>}
   */
  unblockUser: async (id) => {
    try {
      const response = await api.post(`/users/${id}/unblock`);
      return response.data;
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  // === Exportación e importación ===

  /**
   * Exportar usuarios
   * @param {string} format - Formato (csv, json, excel)
   * @param {Object} filters - Filtros para exportación
   * @returns {Promise<void>}
   */
  exportUsers: async (format = 'csv', filters = {}) => {
    try {
      const response = await api.post('/users/export', { format, filters }, {
        responseType: 'blob'
      });
      
      const extension = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'json';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usuarios.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw userService.handleError(error);
    }
  },

  /**
   * Importar usuarios desde archivo
   * @param {File} file - Archivo a importar
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  importUsers: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/users/import', formData, {
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
      throw userService.handleError(error);
    }
  },

  // === Utilidades ===

  /**
   * Formatear rol
   * @param {string} role - Rol del usuario
   * @returns {string}
   */
  formatRole: (role) => {
    const roleMap = {
      'admin': 'Administrador',
      'user': 'Usuario',
      'moderator': 'Moderador',
      'editor': 'Editor',
      'viewer': 'Visitante'
    };
    return roleMap[role] || role;
  },

  /**
   * Formatear estado
   * @param {string} status - Estado del usuario
   * @returns {string}
   */
  formatStatus: (status) => {
    const statusMap = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'suspended': 'Suspendido',
      'blocked': 'Bloqueado',
      'pending': 'Pendiente'
    };
    return statusMap[status] || status;
  },

  /**
   * Obtener color del estado
   * @param {string} status - Estado del usuario
   * @returns {string}
   */
  getStatusColor: (status) => {
    const colorMap = {
      'active': '#10b981',
      'inactive': '#6b7280',
      'suspended': '#f59e0b',
      'blocked': '#ef4444',
      'pending': '#3b82f6'
    };
    return colorMap[status] || '#6b7280';
  },

  /**
   * Validar email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validar teléfono
   * @param {string} phone - Teléfono a validar
   * @returns {boolean}
   */
  validatePhone: (phone) => {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
    return re.test(phone);
  },

  /**
   * Validar datos de usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateUser: (userData) => {
    const errors = {};
    
    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!userData.email || !userService.validateEmail(userData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (userData.phone && !userService.validatePhone(userData.phone)) {
      errors.phone = 'Teléfono inválido';
    }
    
    if (userData.password) {
      if (userData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (userData.password !== userData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
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
          error.message = data.message || 'Datos de usuario inválidos';
          break;
        case 401:
          error.message = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          error.message = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          error.message = 'Usuario no encontrado';
          break;
        case 409:
          error.message = data.message || 'El email ya está registrado';
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

export default userService;