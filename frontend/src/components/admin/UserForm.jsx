/**
 * ============================================================
 * ARCHIVO: UserForm.jsx
 * UBICACIÓN: frontend/src/components/admin/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — UserForm.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   UserForm (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useAuth, ErrorAlert
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
import { useAuth } from '../../hooks/useAuth';
import ErrorAlert from '../common/ErrorAlert';

/* ========================================================================== */
/*  ROLES DE USUARIOS                                                         */
/* ========================================================================== */

const USER_ROLES = [
  { value: 'admin', label: 'Administrador', icon: '👑', description: 'Acceso total al sistema' },
  { value: 'cajero', label: 'Cajero', icon: '💰', description: 'Acceso a POS y ventas' }
];

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const UserForm = ({ 
  isOpen, 
  onClose, 
  user = null, 
  onSuccess 
}) => {
  const { createUser, updateUser, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'cajero'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = !!user;

  /* ========================================================================= */
  /*  RESET FORMULARIO                                                         */
  /* ========================================================================= */

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      role: 'cajero'
    });
    setErrors({});
    setServerError('');
    setShowPassword(false);
  };

  /* ========================================================================= */
  /*  CARGAR DATOS DE USUARIO (SI EDITANDO)                                    */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        password: '',
        role: user.role || 'cajero'
      });
    } else {
      resetForm();
    }
  }, [isEditing, user, isOpen]);

  /* ========================================================================= */
  /*  MANEJAR CAMBIOS                                                          */
  /* ========================================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /* ========================================================================= */
  /*  VALIDAR FORMULARIO                                                       */
  /* ========================================================================= */

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    } else if (formData.email.length > 255) {
      newErrors.email = 'El email no puede exceder 255 caracteres';
    }
    
    // Validar contraseña (solo para nuevos usuarios o si se cambia)
    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // Validar rol
    if (!formData.role) {
      newErrors.role = 'Debe seleccionar un rol';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ========================================================================= */
  /*  MANEJAR ENVÍO                                                            */
  /* ========================================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    
    try {
      const submitData = { ...formData };
      
      // Si es edición y no hay contraseña nueva, eliminarla del objeto
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }
      
      if (isEditing) {
        await updateUser(user.id, submitData);
      } else {
        await createUser(submitData);
      }
      
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setServerError(err.message || 'Error al guardar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /*  MANEJAR CIERRE                                                           */
  /* ========================================================================= */

  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* ========================================================================= */
  /*  OBTENER ICONO DEL ROL                                                    */
  /* ========================================================================= */

  const getRoleIcon = (role) => {
    const roleInfo = USER_ROLES.find(r => r.value === role);
    return roleInfo?.icon || '👤';
  };

  /* ========================================================================= */
  /*  RENDERIZADO                                                              */
  /* ========================================================================= */

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        
        {/* Encabezado */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRoleIcon(formData.role)}</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Error del servidor */}
          {serverError && (
            <ErrorAlert message={serverError} onClose={() => setServerError('')} />
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del usuario"
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              autoFocus
            />
            {errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña {!isEditing && '*'}
              {isEditing && <span className="text-xs text-gray-500 ml-1">(dejar en blanco para mantener)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditing ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                className={`w-full px-3 py-2 pr-10 border rounded-lg dark:bg-gray-700 ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
            {!isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                La contraseña debe tener al menos 6 caracteres
              </p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {USER_ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, role: role.value }));
                    if (errors.role) setErrors(prev => ({ ...prev, role: '' }));
                  }}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    formData.role === role.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{role.icon}</div>
                  <div className="text-sm font-medium">{role.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{role.description}</div>
                </button>
              ))}
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          {/* Información del rol seleccionado */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">📌 Rol {USER_ROLES.find(r => r.value === formData.role)?.label}:</span>{' '}
              {USER_ROLES.find(r => r.value === formData.role)?.description}
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                isEditing ? 'Actualizar' : 'Crear'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;