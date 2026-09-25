/**
 * ============================================================
 * ARCHIVO: authService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — authService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   authService (default)
 *
 * DEPENDENCIAS CLAVE:
 *   api, env
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

// frontend/src/services/authService.js
import api from './api';
import { APP_ENV } from '../config/env';

// Configuración del servicio de autenticación
const authService = {
  // === Autenticación básica ===
  
  /**
   * Iniciar sesión
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @param {boolean} rememberMe - Recordar sesión
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>}
   */
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe
      });
      
      const { user, token, refreshToken } = response.data;
      
      // Guardar tokens
      authService.setTokens(token, refreshToken);
      authService.setUser(user);
      
      return { user, token, refreshToken };
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>}
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      const { user, token, refreshToken } = response.data;
      
      // Guardar tokens
      authService.setTokens(token, refreshToken);
      authService.setUser(user);
      
      return { user, token, refreshToken };
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      // Limpiar datos locales
      authService.clearAuthData();
    }
  },

  /**
   * Verificar token actual
   * @returns {Promise<{valid: boolean, user: Object}>}
   */
  verifyToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { valid: false, user: null };
      }
      
      const response = await api.get('/auth/verify');
      return { valid: true, user: response.data.user };
    } catch (error) {
      // Token inválido o expirado
      authService.clearAuthData();
      return { valid: false, user: null };
    }
  },

  /**
   * Refrescar token de acceso
   * @returns {Promise<{token: string, refreshToken: string}>}
   */
  refreshToken: async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token, refreshToken: newRefreshToken } = response.data;
      
      // Actualizar tokens
      authService.setTokens(token, newRefreshToken);
      
      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      authService.clearAuthData();
      throw authService.handleError(error);
    }
  },

  // === Gestión de perfil ===

  /**
   * Obtener perfil del usuario actual
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Actualizar perfil de usuario
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>}
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user } = response.data;
      
      // Actualizar usuario en localStorage
      authService.setUser(user);
      
      return user;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Actualizar avatar de usuario
   * @param {File} file - Archivo de imagen
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  updateAvatar: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      
      const { user } = response.data;
      authService.setUser(user);
      
      return user;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Eliminar avatar de usuario
   * @returns {Promise<Object>}
   */
  deleteAvatar: async () => {
    try {
      const response = await api.delete('/auth/avatar');
      const { user } = response.data;
      authService.setUser(user);
      return user;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // === Gestión de contraseña ===

  /**
   * Cambiar contraseña
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<void>}
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Correo electrónico
   * @returns {Promise<void>}
   */
  forgotPassword: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Resetear contraseña con token
   * @param {string} token - Token de recuperación
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<void>}
   */
  resetPassword: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // === Verificación de email ===

  /**
   * Enviar email de verificación
   * @returns {Promise<void>}
   */
  sendVerificationEmail: async () => {
    try {
      await api.post('/auth/send-verification');
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Verificar email con token
   * @param {string} token - Token de verificación
   * @returns {Promise<Object>}
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      const { user } = response.data;
      authService.setUser(user);
      return user;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // === Autenticación social ===

  /**
   * Obtener URL de autenticación social
   * @param {string} provider - Proveedor (google, facebook, github)
   * @returns {string}
   */
  getSocialAuthUrl: (provider) => {
    return `${APP_ENV.API_URL}/auth/${provider}`;
  },

  /**
   * Manejar callback de autenticación social
   * @param {string} provider - Proveedor
   * @param {string} code - Código de autorización
   * @returns {Promise<Object>}
   */
  handleSocialCallback: async (provider, code) => {
    try {
      const response = await api.post(`/auth/${provider}/callback`, { code });
      const { user, token, refreshToken } = response.data;
      
      authService.setTokens(token, refreshToken);
      authService.setUser(user);
      
      return { user, token, refreshToken };
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // === 2FA (Two-Factor Authentication) ===

  /**
   * Habilitar 2FA
   * @returns {Promise<{secret: string, qrCode: string}>}
   */
  enable2FA: async () => {
    try {
      const response = await api.post('/auth/2fa/enable');
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Verificar y activar 2FA
   * @param {string} token - Token TOTP
   * @returns {Promise<Object>}
   */
  verify2FA: async (token) => {
    try {
      const response = await api.post('/auth/2fa/verify', { token });
      const { user } = response.data;
      authService.setUser(user);
      return user;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Deshabilitar 2FA
   * @param {string} token - Token TOTP
   * @returns {Promise<Object>}
   */
  disable2FA: async (token) => {
    try {
      const response = await api.post('/auth/2fa/disable', { token });
      const { user } = response.data;
      authService.setUser(user);
      return user;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Verificar código 2FA durante login
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @param {string} token - Código 2FA
   * @returns {Promise<Object>}
   */
  verify2FALogin: async (email, password, token) => {
    try {
      const response = await api.post('/auth/2fa/login', {
        email,
        password,
        token
      });
      
      const { user, accessToken, refreshToken } = response.data;
      
      authService.setTokens(accessToken, refreshToken);
      authService.setUser(user);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // === Sesiones activas ===

  /**
   * Obtener todas las sesiones activas
   * @returns {Promise<Array>}
   */
  getActiveSessions: async () => {
    try {
      const response = await api.get('/auth/sessions');
      return response.data.sessions;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Revocar una sesión específica
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<void>}
   */
  revokeSession: async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  /**
   * Revocar todas las demás sesiones
   * @returns {Promise<void>}
   */
  revokeOtherSessions: async () => {
    try {
      await api.post('/auth/sessions/revoke-others');
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // === Utilidades ===

  /**
   * Guardar tokens en localStorage
   * @param {string} token - Token de acceso
   * @param {string} refreshToken - Token de refresco
   */
  setTokens: (token, refreshToken) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  /**
   * Obtener token de acceso
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Obtener token de refresco
   * @returns {string|null}
   */
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Guardar datos de usuario
   * @param {Object} user - Datos del usuario
   */
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Obtener datos de usuario
   * @returns {Object|null}
   */
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Limpiar todos los datos de autenticación
   */
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  /**
   * Obtener rol del usuario actual
   * @returns {string|null}
   */
  getUserRole: () => {
    const user = authService.getUser();
    return user?.role || null;
  },

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string|Array} roles - Rol o roles permitidos
   * @returns {boolean}
   */
  hasRole: (roles) => {
    const userRole = authService.getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  },

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} permission - Permiso requerido
   * @returns {boolean}
   */
  hasPermission: (permission) => {
    const user = authService.getUser();
    return user?.permissions?.includes(permission) || false;
  },

  /**
   * Manejar errores de autenticación
   * @param {Error} error - Error de axios
   * @returns {Error}
   */
  handleError: (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          error.message = data.message || 'Solicitud incorrecta';
          break;
        case 401:
          error.message = data.message || 'No autorizado. Por favor, inicia sesión nuevamente.';
          authService.clearAuthData();
          break;
        case 403:
          error.message = data.message || 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          error.message = data.message || 'Recurso no encontrado';
          break;
        case 409:
          error.message = data.message || 'El email ya está registrado';
          break;
        case 422:
          error.message = data.message || 'Datos de entrada inválidos';
          if (data.errors) {
            error.validationErrors = data.errors;
          }
          break;
        case 429:
          error.message = 'Demasiados intentos. Por favor, espera un momento.';
          break;
        default:
          error.message = data.message || 'Error en la autenticación';
      }
    } else if (error.request) {
      error.message = 'Error de conexión. Por favor, verifica tu conexión a internet.';
    }
    
    return error;
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
   * Validar contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validatePassword: (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    if (password.length > 50) {
      errors.push('La contraseña no puede tener más de 50 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Decodificar token JWT
   * @param {string} token - Token JWT
   * @returns {Object|null}
   */
  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Verificar si el token está expirado
   * @param {string} token - Token JWT
   * @returns {boolean}
   */
  isTokenExpired: (token) => {
    const decoded = authService.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  /**
   * Obtener tiempo restante del token en segundos
   * @param {string} token - Token JWT
   * @returns {number}
   */
  getTokenExpirationTime: (token) => {
    const decoded = authService.decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Date.now() / 1000;
    return Math.max(0, decoded.exp - currentTime);
  }
};

export default authService;