/**
 * ============================================================
 * ARCHIVO: ProductSearch.jsx
 * UBICACIÓN: frontend/src/components/cajero/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ProductSearch.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ProductSearch (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useProducts, LoadingSpinner
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
import { useProducts } from '../../hooks/useProducts';
import LoadingSpinner from '../common/LoadingSpinner';

/* ========================================================================== */
/*  CATEGORÍAS RÁPIDAS                                                        */
/* ========================================================================== */

const QUICK_CATEGORIES = [
  { id: 'celulares', label: '📱 Celulares', filter: { categoria: 'celulares' } },
  { id: 'laptops', label: '💻 Laptops', filter: { categoria: 'laptops' } },
  { id: 'computadores', label: '🖥️ Computadores', filter: { categoria: 'computadores' } },
  { id: 'impresoras', label: '🖨️ Impresoras', filter: { categoria: 'impresoras' } },
  { id: 'accesorios', label: '🎧 Accesorios', filter: { categoria: 'accesorios' } }
];

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const ProductSearch = ({ onAddToCart, loading: parentLoading }) => {
  const { searchProducts, loading: searchLoading } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  /* ========================================================================= */
  /*  ATEJO DE TECLADO (/) PARA ENFOCAR                                        */
  /* ========================================================================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // ESC para limpiar búsqueda
      if (e.key === 'Escape' && inputRef.current === document.activeElement) {
        setSearchTerm('');
        setResults([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ========================================================================= */
  /*  BÚSQUEDA CON DEBOUNCE                                                    */
  /* ========================================================================= */

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm.trim() && !selectedCategory) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const params = { limit: 20 };
        
        if (searchTerm.trim()) {
          params.search = searchTerm;
        }
        
        if (selectedCategory) {
          params.categoria = selectedCategory;
        }
        
        const data = await searchProducts(params);
        setResults(data || []);
      } catch (err) {
        console.error('Error searching products:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, searchProducts]);

  /* ========================================================================= */
  /*  MANEJAR SELECCIÓN DE CATEGORÍA                                           */
  /* ========================================================================= */

  const handleCategoryClick = (category) => {
    if (selectedCategory === category.id) {
      setSelectedCategory(null);
      setSearchTerm('');
    } else {
      setSelectedCategory(category.id);
      setSearchTerm('');
    }
    inputRef.current?.focus();
  };

  /* ========================================================================= */
  /*  MANEJAR AGREGAR PRODUCTO                                                 */
  /* ========================================================================= */

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      // Podría mostrar un toast de error
      return;
    }
    onAddToCart(product);
  };

  /* ========================================================================= */
  /*  LIMPIAR BÚSQUEDA                                                         */
  /* ========================================================================= */

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setResults([]);
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
  /*  RENDERIZADO DE RESULTADOS                                                */
  /* ========================================================================= */

  const renderResults = () => {
    if (isSearching || searchLoading) {
      return (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="sm" />
        </div>
      );
    }
    
    if (results.length === 0 && (searchTerm || selectedCategory)) {
      return (
        <div className="text-center py-8">
          <div className="text-5xl mb-2">🔍</div>
          <p className="text-gray-500">No se encontraron productos</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? `para "${searchTerm}"` : 'en esta categoría'}
          </p>
        </div>
      );
    }
    
    if (results.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-5xl mb-2">📦</div>
          <p className="text-gray-500">Busca productos para agregar al carrito</p>
          <p className="text-sm text-gray-400 mt-1">
            Usa el buscador o selecciona una categoría
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {results.map((product) => (
          <div
            key={product.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              product.stock === 0
                ? 'bg-gray-100 dark:bg-gray-700 opacity-60'
                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {/* Imagen */}
            <img
              src={product.imagen_url || '/placeholder-image.png'}
              alt={product.nombre}
              className="w-12 h-12 object-cover rounded"
              onError={(e) => { e.target.src = '/placeholder-image.png'; }}
            />
            
            {/* Información */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 dark:text-white truncate">
                {product.nombre}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-blue-600">
                  {formatPrice(product.precio)}
                </span>
                {product.condicion === 'nuevo' ? (
                  <span className="text-xs text-green-600">🆕 Nuevo</span>
                ) : (
                  <span className="text-xs text-orange-600">🔄 Segunda</span>
                )}
              </div>
              {product.stock === 0 && (
                <p className="text-xs text-red-500">Agotado</p>
              )}
            </div>
            
            {/* Botón agregar */}
            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Agregar
            </button>
          </div>
        ))}
      </div>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="space-y-4">
      
      {/* Barra de búsqueda */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar producto por nombre... (presiona / para enfocar)"
          className="w-full px-4 py-3 pl-10 pr-10 border-2 rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          autoFocus
        />
        <div className="absolute left-3 top-3.5 text-gray-400 text-lg">
          🔍
        </div>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Atajo de teclado */}
      {!searchTerm && !selectedCategory && (
        <div className="text-xs text-gray-400 text-right">
          Atajo: presiona <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">/</kbd> para buscar
        </div>
      )}

      {/* Categorías rápidas */}
      <div className="flex flex-wrap gap-2">
        {QUICK_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
        {selectedCategory && (
          <button
            onClick={handleClearSearch}
            className="px-3 py-1.5 rounded-full text-sm bg-red-100 text-red-600 hover:bg-red-200 transition"
          >
            Limpiar filtros ✕
          </button>
        )}
      </div>

      {/* Resultados */}
      <div className="min-h-[400px]">
        {renderResults()}
      </div>
    </div>
  );
};

export default ProductSearch;