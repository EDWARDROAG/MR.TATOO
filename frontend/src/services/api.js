/**
 * ============================================================
 * ARCHIVO: api.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — api.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   api (default)
 *
 * DEPENDENCIAS CLAVE:
 *   env
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

// frontend/src/services/api.js
import axios from 'axios';
import { APP_ENV } from '../config/env';

// Configuración base de la API
const API_URL = APP_ENV.API_URL;
const API_TIMEOUT = APP_ENV.API_TIMEOUT;

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enviar cookies con las peticiones
});

// Variables para manejo de token refresh
let isRefreshing = false;
let failedQueue = [];

// Procesar cola de peticiones fallidas
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor de petición
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe token, agregarlo al header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // FormData: dejar que el navegador ponga el boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Log de peticiones en desarrollo
    if (APP_ENV.isDev) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => {
    // Log de respuestas en desarrollo
    if (APP_ENV.isDev) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log de errores
    if (APP_ENV.isDev) {
      console.error('❌ API Response Error:', error.response || error);
    }
    
    // Manejar error 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Guardar nuevos tokens
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Actualizar header por defecto
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        
        // Procesar cola de peticiones
        processQueue(null, token);
        
        // Reintentar petición original
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        processQueue(refreshError, null);
        clearAuthData();
        
        // Redirigir a login si no está ya en la página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Manejar errores específicos por código de estado
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          error.message = data.message || 'Solicitud incorrecta';
          break;
        case 403:
          error.message = data.message || 'No tienes permisos para realizar esta acción';
          // Opcional: mostrar notificación de acceso denegado
          break;
        case 404:
          error.message = data.message || 'Recurso no encontrado';
          break;
        case 409:
          error.message = data.message || 'Conflicto con el estado actual del recurso';
          break;
        case 422:
          error.message = data.message || 'Datos de entrada inválidos';
          break;
        case 429:
          error.message = 'Demasiadas peticiones. Por favor, espera un momento';
          break;
        case 500:
          error.message = 'Error interno del servidor. Por favor, intenta más tarde';
          break;
        case 503:
          error.message = 'Servicio no disponible. Por favor, intenta más tarde';
          break;
        default:
          error.message = data.message || 'Error en la petición';
      }
    } else if (error.request) {
      // Error de red o timeout
      error.message = 'Error de conexión. Por favor, verifica tu conexión a internet';
    } else {
      error.message = error.message || 'Error desconocido';
    }
    
    return Promise.reject(error);
  }
);

// Funciones auxiliares
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common.Authorization;
};

// Métodos adicionales para manejo de archivos
const uploadFile = async (url, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  };
  
  return api.post(url, formData, config);
};

const downloadFile = async (url, filename) => {
  const response = await api.get(url, {
    responseType: 'blob',
  });
  
  // Crear enlace de descarga
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
  
  return response;
};

// Método para cancelar peticiones
const cancelRequest = (source) => {
  if (source) {
    source.cancel('Petición cancelada por el usuario');
  }
};

// Método para crear fuente de cancelación
const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Método para configurar headers específicos
const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Método para obtener errores formateados
const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || error.message;
  }
  return error.message;
};

// Método para verificar si el error es de red
const isNetworkError = (error) => {
  return !error.response && error.request;
};

// Método para verificar si el error es de autenticación
const isAuthError = (error) => {
  return error.response?.status === 401;
};

// Método para verificar si el error es de permisos
const isForbiddenError = (error) => {
  return error.response?.status === 403;
};

// Método para verificar si el error es de validación
const isValidationError = (error) => {
  return error.response?.status === 422;
};

// Método para obtener errores de validación
const getValidationErrors = (error) => {
  if (error.response?.status === 422 && error.response.data.errors) {
    return error.response.data.errors;
  }
  return {};
};

// Exportar instancia principal y métodos auxiliares
export default api;
const extractList = (payload, key) => {
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload[key])) return payload[key];
  if (Array.isArray(payload)) return payload;
  return [];
};

const extractData = (payload) => {
  if (!payload) return null;
  if (payload.data !== undefined && payload.success !== undefined) {
    return payload.data;
  }
  return payload;
};

export {
  extractList,
  extractData,
  uploadFile,
  downloadFile,
  cancelRequest,
  createCancelToken,
  setAuthHeader,
  getErrorMessage,
  isNetworkError,
  isAuthError,
  isForbiddenError,
  isValidationError,
  getValidationErrors,
  clearAuthData,
};