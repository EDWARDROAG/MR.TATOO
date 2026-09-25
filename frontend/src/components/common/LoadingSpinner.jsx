/**
 * ============================================================
 * ARCHIVO: LoadingSpinner.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — LoadingSpinner.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   LoadingSpinner (default)
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

import React from 'react';
import PropTypes from 'prop-types';

/* ========================================================================== */
/*  CONFIGURACIÓN DE TAMAÑOS                                                  */
/* ========================================================================== */

const SIZE_CONFIG = {
  xs: {
    spinner: 'w-4 h-4',
    text: 'text-xs',
    border: 'border-2'
  },
  sm: {
    spinner: 'w-6 h-6',
    text: 'text-sm',
    border: 'border-2'
  },
  md: {
    spinner: 'w-10 h-10',
    text: 'text-base',
    border: 'border-3'
  },
  lg: {
    spinner: 'w-16 h-16',
    text: 'text-lg',
    border: 'border-4'
  },
  xl: {
    spinner: 'w-24 h-24',
    text: 'text-xl',
    border: 'border-4'
  }
};

/* ========================================================================== */
/*  COMPONENTE DE SPINNER CIRCULAR                                            */
/* ========================================================================== */

const CircularSpinner = ({ size, color, text }) => {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${config.spinner} ${config.border} border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: color, borderTopColor: 'transparent' }}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <p className={`${config.text} text-gray-500 dark:text-gray-400`}>
          {text}
        </p>
      )}
    </div>
  );
};

/* ========================================================================== */
/*  COMPONENTE DE PULSACIÓN                                                   */
/* ========================================================================== */

const PulsingSpinner = ({ size, color, text }) => {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${config.spinner} rounded-full animate-pulse`}
        style={{ backgroundColor: color }}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <p className={`${config.text} text-gray-500 dark:text-gray-400`}>
          {text}
        </p>
      )}
    </div>
  );
};

/* ========================================================================== */
/*  COMPONENTE DE PUNTOS                                                      */
/* ========================================================================== */

const DotsSpinner = ({ size, color, text }) => {
  const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : 
                   size === 'sm' ? 'w-2 h-2' :
                   size === 'md' ? 'w-3 h-3' :
                   size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex gap-2">
        <div
          className={`${dotSize} rounded-full animate-bounce`}
          style={{ backgroundColor: color, animationDelay: '0ms' }}
        />
        <div
          className={`${dotSize} rounded-full animate-bounce`}
          style={{ backgroundColor: color, animationDelay: '150ms' }}
        />
        <div
          className={`${dotSize} rounded-full animate-bounce`}
          style={{ backgroundColor: color, animationDelay: '300ms' }}
        />
      </div>
      {text && (
        <p className={`${SIZE_CONFIG[size]?.text || 'text-sm'} text-gray-500 dark:text-gray-400`}>
          {text}
        </p>
      )}
    </div>
  );
};

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const LoadingSpinner = ({ 
  size = 'md', 
  color = '#3B82F6',
  text = '',
  variant = 'circular',
  fullScreen = false,
  overlay = false
}) => {
  
  /* ========================================================================= */
  /*  SELECCIONAR VARIANTE                                                     */
  /* ========================================================================= */
  
  let SpinnerComponent;
  switch (variant) {
    case 'pulsing':
      SpinnerComponent = PulsingSpinner;
      break;
    case 'dots':
      SpinnerComponent = DotsSpinner;
      break;
    default:
      SpinnerComponent = CircularSpinner;
  }
  
  const spinnerContent = (
    <SpinnerComponent size={size} color={color} text={text} />
  );
  
  /* ========================================================================= */
  /*  PANTALLA COMPLETA                                                        */
  /* ========================================================================= */
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        {spinnerContent}
      </div>
    );
  }
  
  /* ========================================================================= */
  /*  OVERLAY                                                                  */
  /* ========================================================================= */
  
  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-40">
        {spinnerContent}
      </div>
    );
  }
  
  /* ========================================================================= */
  /*  SPINNER NORMAL                                                           */
  /* ========================================================================= */
  
  return spinnerContent;
};

/* ========================================================================== */
/*  PROPTYPES                                                                 */
/* ========================================================================== */

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.string,
  text: PropTypes.string,
  variant: PropTypes.oneOf(['circular', 'pulsing', 'dots']),
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool
};

/* ========================================================================== */
/*  EXPORTAR COMPONENTE                                                       */
/* ========================================================================== */

export default LoadingSpinner;