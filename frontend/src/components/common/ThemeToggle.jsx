/**
 * ============================================================
 * ARCHIVO: ThemeToggle.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ThemeToggle.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ThemeToggle (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useTheme
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

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const ThemeToggle = ({ variant = 'button', showLabel = false, className = '' }) => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);

  /* ========================================================================= */
  /*  TEMAS DISPONIBLES                                                        */
  /* ========================================================================= */

  const themes = [
    { id: 'light', name: 'Claro', icon: '☀️', description: 'Tema claro para ambientes iluminados' },
    { id: 'dark', name: 'Oscuro', icon: '🌙', description: 'Tema oscuro para ambientes con poca luz' },
    { id: 'system', name: 'Sistema', icon: '💻', description: 'Usar la configuración del sistema' }
  ];

  /* ========================================================================= */
  /*  CERRAR DROPDOWN AL HACER CLICK FUERA                                     */
  /* ========================================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ========================================================================= */
  /*  MANEJAR CAMBIO DE TEMA                                                   */
  /* ========================================================================= */

  const handleThemeChange = (newTheme) => {
    if (newTheme === theme) {
      setIsOpen(false);
      return;
    }
    
    setIsAnimating(true);
    setTheme(newTheme);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    
    setIsOpen(false);
  };

  /* ========================================================================= */
  /*  OBTENER TEMA ACTUAL                                                      */
  /* ========================================================================= */

  const getCurrentThemeInfo = () => {
    return themes.find(t => t.id === theme) || themes[0];
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE BOTÓN SIMPLE                                              */
  /* ========================================================================= */

  const renderSimpleButton = () => {
    const currentTheme = getCurrentThemeInfo();
    
    return (
      <button
        onClick={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}
        className={`p-2 rounded-lg transition ${className}`}
        aria-label="Cambiar tema"
      >
        <span className="text-xl">
          {theme === 'light' ? '🌙' : theme === 'dark' ? '☀️' : '💻'}
        </span>
        {showLabel && (
          <span className="ml-2 text-sm">
            {currentTheme.name}
          </span>
        )}
      </button>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE BOTÓN CON DROPDOWN                                        */
  /* ========================================================================= */

  const renderDropdownButton = () => {
    const currentTheme = getCurrentThemeInfo();
    
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          aria-label="Selector de tema"
        >
          <span className="text-lg">{currentTheme.icon}</span>
          <span className="text-sm">{currentTheme.name}</span>
          <span className="text-xs">▼</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-2 pb-1">
                Seleccionar tema
              </p>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    theme === t.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </div>
                  {theme === t.id && <span className="text-blue-600">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE RADIO GROUP                                               */
  /* ========================================================================= */

  const renderRadioGroup = () => {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tema
        </label>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`p-3 rounded-lg border-2 text-center transition ${
                theme === t.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-sm font-medium">{t.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  // Seleccionar variante
  let content;
  switch (variant) {
    case 'simple':
      content = renderSimpleButton();
      break;
    case 'dropdown':
      content = renderDropdownButton();
      break;
    case 'radio':
      content = renderRadioGroup();
      break;
    default:
      content = renderSimpleButton();
  }

  // Animación de cambio
  if (isAnimating) {
    return (
      <div className="inline-block">
        <div className="animate-pulse">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ThemeToggle;