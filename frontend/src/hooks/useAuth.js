/**
 * ============================================================
 * ARCHIVO: useAuth.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useAuth.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useAuth (default)
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

// frontend/src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Hook personalizado para autenticación
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configurar headers de axios
  const setAuthToken = useCallback((newToken) => {
    if (newToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setToken(null);
    }
  }, []);

  // Verificar token al iniciar
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          setAuthToken(storedToken);
          const response = await api.get('/auth/verify');
          
          if (response.data.valid) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token inválido
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Error verificando token:', err);
          setAuthToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      }
      
      setLoading(false);
    };

    verifyToken();
  }, [setAuthToken]);

  // Login
  const login = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setAuthToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Guardar email si "recordarme" está activado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  // Registro
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      setAuthToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al registrarse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      // Opcional: notificar al backend
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.error('Error durante logout:', err);
    } finally {
      // Limpiar estado local
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      localStorage.removeItem('user');
      setLoading(false);
    }
  }, [token, setAuthToken]);

  // Actualizar perfil de usuario
  const updateProfile = useCallback(async (updatedData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put('/auth/profile', updatedData);
      setUser(prevUser => ({ ...prevUser, ...response.data.user }));
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar contraseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Recuperar contraseña - enviar email
  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al enviar email de recuperación';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Resetear contraseña con token
  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al resetear contraseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role || user.roles?.includes(role);
  }, [user]);

  // Verificar si el usuario tiene permisos específicos
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) || user.role === 'admin' || user.role === 'super_admin';
  }, [user]);

  // Obtener email recordado
  const getRememberedEmail = useCallback(() => {
    return localStorage.getItem('rememberedEmail') || '';
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      const { token: newToken } = response.data;
      setAuthToken(newToken);
      return { success: true };
    } catch (err) {
      console.error('Error refreshing token:', err);
      logout();
      return { success: false };
    }
  }, [setAuthToken, logout]);

  const getUsers = useCallback(async () => {
    const response = await api.get('/users');
    return response.data.users || response.data.data || [];
  }, []);

  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/users', userData);
      return { success: true, user: response.data.user || response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/users/${id}`, userData);
      return { success: true, user: response.data.user || response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/users/${id}`);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    user,
    token,
    loading,
    error,
    isAuthenticated,
    
    // Métodos principales
    login,
    register,
    logout,
    updateProfile,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    
    // Métodos de contraseña
    changePassword,
    forgotPassword,
    resetPassword,
    
    // Utilidades
    hasRole,
    hasPermission,
    getRememberedEmail,
    refreshToken,
    clearError,
    
    // Getters útiles
    isAdmin: hasRole('admin'),
    isUser: hasRole('user'),
    userName: user?.nombre || user?.name || user?.username || '',
    userEmail: user?.email || '',
    userAvatar: user?.avatar || null,
    userRole: user?.role || null
  };
};

export { useAuth };
export default useAuth;