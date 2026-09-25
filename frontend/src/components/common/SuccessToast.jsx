/**
 * ============================================================
 * ARCHIVO: SuccessToast.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — SuccessToast.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   useToast, SuccessToast (default)
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
/*  COMPONENTE DE TOAST INDIVIDUAL                                            */
/* ========================================================================== */

const Toast = ({ id, message, type = 'success', duration = 3000, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  /* ========================================================================= */
  /*  CONFIGURACIÓN POR TIPO                                                   */
  /* ========================================================================= */

  const config = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-500',
      textColor: 'text-green-800 dark:text-green-200',
      progressColor: 'bg-green-500'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800 dark:text-blue-200',
      progressColor: 'bg-blue-500'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      progressColor: 'bg-yellow-500'
    }
  };

  const toastConfig = config[type] || config.success;

  /* ========================================================================= */
  /*  AUTO-CIERRE                                                              */
  /* ========================================================================= */

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [duration]);

  /* ========================================================================= */
  /*  MANEJAR CIERRE                                                           */
  /* ========================================================================= */

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  /* ========================================================================= */
  /*  RENDERIZADO                                                              */
  /* ========================================================================= */

  return (
    <div
      className={`mb-3 rounded-lg shadow-lg border-l-4 ${toastConfig.borderColor} ${toastConfig.bgColor} overflow-hidden transition-all duration-300 ${
        isLeaving ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-xl">
            {toastConfig.icon}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${toastConfig.textColor}`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${toastConfig.textColor} hover:opacity-70 transition`}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div 
        className={`h-1 ${toastConfig.progressColor} transition-all duration-75`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL (CONTENEDOR DE TOASTS)                               */
/* ========================================================================== */

const SuccessToast = ({ toasts = [], onRemove, position = 'top-right' }) => {
  /* ========================================================================= */
  /*  POSICIONES                                                               */
  /* ========================================================================= */

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  /* ========================================================================= */
  /*  NO RENDERIZAR SI NO HAY TOASTS                                           */
  /* ========================================================================= */

  if (toasts.length === 0) return null;

  /* ========================================================================= */
  /*  RENDERIZADO                                                              */
  /* ========================================================================= */

  return (
    <div className={`fixed ${positionClasses[position]} z-50 min-w-[280px] max-w-md`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration || 3000}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

/* ========================================================================== */
/*  HOOK PARA MANEJAR TOASTS                                                  */
/* ========================================================================== */

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  /* ========================================================================= */
  /*  AGREGAR TOAST                                                            */
  /* ========================================================================= */

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto-remover después de la duración
    setTimeout(() => {
      removeToast(id);
    }, duration + 300);
    
    return id;
  };

  /* ========================================================================= */
  /*  REMOVER TOAST                                                            */
  /* ========================================================================= */

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  /* ========================================================================= */
  /*  FUNCIONES DE ATAJO                                                       */
  /* ========================================================================= */

  const success = (message, duration) => addToast(message, 'success', duration);
  const info = (message, duration) => addToast(message, 'info', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    info,
    warning
  };
};

/* ========================================================================== */
/*  PROPTYPES                                                                 */
/* ========================================================================== */

SuccessToast.propTypes = {
  toasts: PropTypes.array,
  onRemove: PropTypes.func,
  position: PropTypes.oneOf(['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'])
};

Toast.propTypes = {
  id: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'info', 'warning']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired
};

/* ========================================================================== */
/*  EXPORTAR COMPONENTE                                                       */
/* ========================================================================== */

export default SuccessToast;