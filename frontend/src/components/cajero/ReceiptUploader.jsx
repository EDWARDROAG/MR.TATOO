/**
 * ============================================================
 * ARCHIVO: ReceiptUploader.jsx
 * UBICACIÓN: frontend/src/components/cajero/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ReceiptUploader.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ReceiptUploader (default)
 *
 * DEPENDENCIAS CLAVE:
 *   —
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

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const ReceiptUploader = ({ isOpen, onClose, onConfirm, existingFile = null }) => {
  const [selectedFile, setSelectedFile] = useState(existingFile);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /* ========================================================================= */
  /*  VALIDAR ARCHIVO                                                          */
  /* ========================================================================= */

  const validateFile = (file) => {
    const newErrors = {};
    
    // Validar tipo
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext)) {
      newErrors.type = `Formato no permitido. Use: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      newErrors.size = `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    
    return newErrors;
  };

  /* ========================================================================= */
  /*  PROCESAR ARCHIVO                                                         */
  /* ========================================================================= */

  const processFile = (file) => {
    const validationErrors = validateFile(file);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return false;
    }
    
    setErrors({});
    setSelectedFile(file);
    
    // Crear preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    return true;
  };

  /* ========================================================================= */
  /*  MANEJAR SELECCIÓN DE ARCHIVO                                             */
  /* ========================================================================= */

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  /* ========================================================================= */
  /*  MANEJAR DRAG & DROP                                                      */
  /* ========================================================================= */

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  /* ========================================================================= */
  /*  ELIMINAR ARCHIVO                                                         */
  /* ========================================================================= */

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrors({});
  };

  /* ========================================================================= */
  /*  CONFIRMAR SUBIDA                                                         */
  /* ========================================================================= */

  const handleConfirm = async () => {
    if (!selectedFile) {
      setErrors({ general: 'Debe seleccionar un comprobante' });
      return;
    }
    
    setIsUploading(true);
    try {
      await onConfirm(selectedFile);
      handleClose();
    } catch (err) {
      console.error('Error uploading receipt:', err);
      setErrors({ general: 'Error al subir el comprobante' });
    } finally {
      setIsUploading(false);
    }
  };

  /* ========================================================================= */
  /*  CERRAR MODAL                                                             */
  /* ========================================================================= */

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrors({});
    setIsDragging(false);
    onClose();
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
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Subir Comprobante
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Transferencia bancaria, Nequi, Daviplata, etc.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={isUploading}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          
          {/* Área de subida */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : errors.type || errors.size
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {previewUrl ? (
              // Vista previa
              <div>
                <img
                  src={previewUrl}
                  alt="Vista previa del comprobante"
                  className="max-h-48 mx-auto rounded-lg mb-3"
                />
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile?.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={handleRemoveFile}
                  className="mt-3 text-red-600 text-sm hover:underline"
                  disabled={isUploading}
                >
                  Eliminar
                </button>
              </div>
            ) : (
              // Selector
              <label className="cursor-pointer block">
                <div className="text-5xl mb-3">📎</div>
                <p className="text-gray-600 dark:text-gray-300">
                  Arrastra y suelta tu comprobante aquí
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
                  o
                </p>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  disabled={isUploading}
                >
                  Seleccionar archivo
                </button>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  Formatos: JPG, PNG, WEBP (máx. 5MB)
                </p>
              </label>
            )}
          </div>

          {/* Mensajes de error */}
          {errors.type && (
            <p className="text-xs text-red-500 mt-2">{errors.type}</p>
          )}
          {errors.size && (
            <p className="text-xs text-red-500 mt-2">{errors.size}</p>
          )}
          {errors.general && (
            <p className="text-xs text-red-500 mt-2">{errors.general}</p>
          )}

          {/* Instrucciones */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-yellow-800 dark:text-yellow-400">⚠️</span>
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                Verifica que el cliente haya enviado el comprobante por WhatsApp 
                antes de continuar con la venta.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFile || isUploading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Subiendo...
              </>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/*  PROPTYPES                                                                 */
/* ========================================================================== */

ReceiptUploader.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  existingFile: PropTypes.object
};

/* ========================================================================== */
/*  EXPORTAR COMPONENTE                                                       */
/* ========================================================================== */

export default ReceiptUploader;