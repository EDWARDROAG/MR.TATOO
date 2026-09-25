/**
 * ============================================================
 * ARCHIVO: ErrorAlert.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ErrorAlert.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ErrorAlert (default)
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

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/* ========================================================================== */
/*  CONFIGURACIÓN POR TIPO                                                    */
/* ========================================================================== */

const TYPE_CONFIG = {
  error: {
    icon: '❌',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    buttonColor: 'text-red-500 hover:text-red-700'
  },
  warning: {
    icon: '⚠️',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    buttonColor: 'text-yellow-500 hover:text-yellow-700'
  },
  info: {
    icon: 'ℹ️',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
    buttonColor: 'text-blue-500 hover:text-blue-700'
  },
  success: {
    icon: '✅',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-400',
    textColor: 'text-green-800 dark:text-green-200',
    buttonColor: 'text-green-500 hover:text-green-700'
  }
};

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const ErrorAlert = ({ 
  message, 
  type = 'error', 
  title = '',
  onClose, 
  autoClose = false,
  autoCloseTime = 5000,
  showIcon = true,
  dismissible = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  /* ========================================================================= */
  /*  AUTO-CIERRE                                                              */
  /* ========================================================================= */

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isVisible]);

  /* ========================================================================= */
  /*  MANEJAR CIERRE                                                           */
  /* ========================================================================= */

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  /* ========================================================================= */
  /*  NO RENDERIZAR SI NO ES VISIBLE                                           */
  /* ========================================================================= */

  if (!isVisible) return null;

  /* ========================================================================= */
  /*  OBTENER CONFIGURACIÓN                                                    */
  /* ========================================================================= */

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.error;
  const defaultTitle = {
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
    success: 'Éxito'
  }[type] || 'Aviso';

  /* ========================================================================= */
  /*  RENDERIZADO                                                              */
  /* ========================================================================= */

  return (
    <div
      className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-lg shadow-sm transition-all duration-300 ${
        isLeaving ? 'opacity-0 transform -translate-x-4' : 'opacity-100 transform translate-x-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icono */}
        {showIcon && (
          <div className="flex-shrink-0 text-xl">
            {config.icon}
          </div>
        )}
        
        {/* Contenido */}
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${config.textColor} mb-1`}>
            {title || defaultTitle}
          </h3>
          <div className={`text-sm ${config.textColor}`}>
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {Object.values(message).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Botón de cierre */}
        {dismissible && (
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${config.buttonColor} transition`}
            aria-label="Cerrar"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/* ========================================================================== */
/*  PROPTYPES                                                                 */
/* ========================================================================== */

ErrorAlert.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  title: PropTypes.string,
  onClose: PropTypes.func,
  autoClose: PropTypes.bool,
  autoCloseTime: PropTypes.number,
  showIcon: PropTypes.bool,
  dismissible: PropTypes.bool
};

/* ========================================================================== */
/*  EXPORTAR COMPONENTE                                                       */
/* ========================================================================== */

export default ErrorAlert;