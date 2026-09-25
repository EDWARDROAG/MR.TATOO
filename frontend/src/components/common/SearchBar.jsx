/**
 * ============================================================
 * ARCHIVO: SearchBar.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — SearchBar.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   SearchBar (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useProducts
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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const SearchBar = ({ placeholder = "Buscar productos...", className = "", onSearch }) => {
  const navigate = useNavigate();
  const { searchProducts, loading } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  /* ========================================================================= */
  /*  ATEJO DE TECLADO (/) PARA ENFOCAR                                        */
  /* ========================================================================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Si presionan "/" y no están en un input
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // ESC para limpiar y cerrar sugerencias
      if (e.key === 'Escape' && inputRef.current === document.activeElement) {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ========================================================================= */
  /*  CERRAR SUGERENCIAS AL HACER CLICK FUERA                                  */
  /* ========================================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ========================================================================= */
  /*  BÚSQUEDA CON DEBOUNCE                                                    */
  /* ========================================================================= */

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      try {
        const results = await searchProducts({ search: searchTerm, limit: 5 });
        setSuggestions(results || []);
        setShowSuggestions(results && results.length > 0);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      }
    };
    
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, searchProducts]);

  /* ========================================================================= */
  /*  MANEJAR BÚSQUEDA                                                         */
  /* ========================================================================= */

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm);
      } else {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      }
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [searchTerm, navigate, onSearch]);

  /* ========================================================================= */
  /*  MANEJAR ENTER                                                            */
  /* ========================================================================= */

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /* ========================================================================= */
  /*  MANEJAR SELECCIÓN DE SUGERENCIA                                          */
  /* ========================================================================= */

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}`);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  /* ========================================================================= */
  /*  LIMPIAR BÚSQUEDA                                                         */
  /* ========================================================================= */

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  /* ========================================================================= */
  /*  FORMATEAR PRECIO                                                         */
  /* ========================================================================= */

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE SUGERENCIAS                                               */
  /* ========================================================================= */

  const renderSuggestions = () => {
    if (!showSuggestions || !isFocused) return null;
    
    if (loading) {
      return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Buscando...</span>
          </div>
        </div>
      );
    }
    
    if (suggestions.length === 0 && searchTerm) {
      return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4">
          <p className="text-sm text-gray-500 text-center">
            No se encontraron resultados para "{searchTerm}"
          </p>
          <button
            onClick={handleSearch}
            className="mt-2 w-full text-center text-blue-600 text-sm hover:underline"
          >
            Ver todos los resultados →
          </button>
        </div>
      );
    }
    
    if (suggestions.length === 0) return null;
    
    return (
      <div 
        ref={suggestionsRef}
        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
      >
        <div className="p-2">
          {suggestions.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSuggestionClick(product)}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-left"
            >
              <img
                src={product.imagen_url || '/placeholder-image.png'}
                alt={product.nombre}
                className="w-10 h-10 object-cover rounded"
                onError={(e) => { e.target.src = '/placeholder-image.png'; }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {product.nombre}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPrice(product.precio)} • {product.condicion === 'nuevo' ? 'Nuevo' : 'Segunda'}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <button
            onClick={handleSearch}
            className="w-full text-center text-blue-600 text-sm hover:underline py-1"
          >
            Ver todos los resultados para "{searchTerm}" →
          </button>
        </div>
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Icono de búsqueda */}
        <div className="absolute left-3 top-2.5 text-gray-400">
          🔍
        </div>
        
        {/* Botón de limpiar */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Sugerencias */}
      {renderSuggestions()}
      
      {/* Atajo de teclado (solo visible cuando no está enfocado) */}
      {!searchTerm && !isFocused && (
        <div className="absolute right-3 top-2.5 text-xs text-gray-400 hidden sm:block">
          Presiona <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">/</kbd>
        </div>
      )}
    </div>
  );
};

export default SearchBar;