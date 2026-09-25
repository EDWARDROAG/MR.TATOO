/**
 * ============================================================
 * ARCHIVO: CategoryForm.jsx
 * UBICACIÓN: frontend/src/components/admin/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — CategoryForm.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   CategoryForm (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useCategories, ErrorAlert
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
import { useCategories } from '../../hooks/useCategories';
import ErrorAlert from '../common/ErrorAlert';

/* ========================================================================== */
/*  TIPOS DE CATEGORÍAS                                                       */
/* ========================================================================== */

const CATEGORY_TYPES = [
  { value: 'venta', label: 'Venta', icon: '💰', description: 'Productos para la venta' },
  { value: 'mantenimiento', label: 'Mantenimiento', icon: '🔧', description: 'Servicios de mantenimiento' },
  { value: 'accesorio', label: 'Accesorios', icon: '🎧', description: 'Accesorios y complementos' }
];

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const CategoryForm = ({ 
  isOpen, 
  onClose, 
  category = null, 
  onSuccess 
}) => {
  const { createCategory, updateCategory, loading } = useCategories();
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'venta',
    descripcion: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const isEditing = !!category;

  /* ========================================================================= */
  /*  RESET FORMULARIO                                                         */
  /* ========================================================================= */

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'venta',
      descripcion: ''
    });
    setErrors({});
    setServerError('');
  };

  /* ========================================================================= */
  /*  CARGAR DATOS DE CATEGORÍA (SI EDITANDO)                                  */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditing && category) {
      setFormData({
        nombre: category.nombre || '',
        tipo: category.tipo || 'venta',
        descripcion: category.descripcion || ''
      });
    } else {
      resetForm();
    }
  }, [isEditing, category, isOpen]);

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
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la categoría es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'Debe seleccionar un tipo';
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
      if (isEditing) {
        await updateCategory(category.id, formData);
      } else {
        await createCategory(formData);
      }
      
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
      setServerError(err.message || 'Error al guardar la categoría');
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
  /*  OBTENER ICONO DEL TIPO                                                   */
  /* ========================================================================= */

  const getTypeIcon = (tipo) => {
    const type = CATEGORY_TYPES.find(t => t.value === tipo);
    return type?.icon || '📁';
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
              <span className="text-2xl">{getTypeIcon(formData.tipo)}</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
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
              Nombre de la categoría *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Celulares, Laptops, Accesorios"
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              autoFocus
            />
            {errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de categoría *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, tipo: type.value }));
                    if (errors.tipo) setErrors(prev => ({ ...prev, tipo: '' }));
                  }}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    formData.tipo === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
            {errors.tipo && (
              <p className="text-xs text-red-500 mt-1">{errors.tipo}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional de la categoría"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* Información del tipo seleccionado */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">📌 {CATEGORY_TYPES.find(t => t.value === formData.tipo)?.label}:</span>{' '}
              {CATEGORY_TYPES.find(t => t.value === formData.tipo)?.description}
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

export default CategoryForm;