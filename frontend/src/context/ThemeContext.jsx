/**
 * ============================================================
 * ARCHIVO: ThemeContext.jsx
 * UBICACIÓN: frontend/src/context/
 * ROL: context
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Contexto React — ThemeContext.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   useTheme, ThemeProvider, ThemeContext (default)
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

// frontend/src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto
const ThemeContext = createContext({});

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

// Provider component
export const ThemeProvider = ({ children }) => {
  // Estado para el tema (light/dark)
  const [theme, setTheme] = useState(() => {
    // Verificar preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Verificar preferencia del sistema
    if (!savedTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPrefersDark ? 'dark' : 'light';
    }
    
    return savedTheme;
  });

  // Estado para el color primario (opcional)
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('primaryColor') || '#3b82f6'; // Azul por defecto
  });

  // Aplicar tema al DOM
  useEffect(() => {
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
    
    // Aplicar clase al elemento root
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // También podemos usar data-theme para CSS personalizado
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Aplicar color primario
  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  // Función para cambiar entre temas
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Función para establecer tema específico
  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
    }
  };

  // Función para cambiar color primario
  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
  };

  // Función para resetear a colores por defecto
  const resetTheme = () => {
    setTheme('light');
    setPrimaryColor('#3b82f6');
  };

  // Valor del contexto
  const value = {
    theme,
    primaryColor,
    isDarkMode: theme === 'dark',
    isLightMode: theme === 'light',
    toggleTheme,
    setTheme: setThemeMode,
    changePrimaryColor,
    resetTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;