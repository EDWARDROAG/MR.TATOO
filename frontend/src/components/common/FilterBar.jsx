/**
 * ============================================================
 * ARCHIVO: FilterBar.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — FilterBar.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   FilterBar (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useCategories
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

import React, { useState, useEffect, useCallback } from 'react';
import { useCategories } from '../../hooks/useCategories';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const FilterBar = ({ filters = {}, onFilterChange, onSearch, onClearFilters }) => {
  const { getCategories, loading: categoriesLoading } = useCategories();
  
  const [categories, setCategories] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    categoria_id: filters.categoria_id || '',
    condicion: filters.condicion || '',
    search: filters.search || ''
  });
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    setLocalFilters({
      categoria_id: filters.categoria_id || '',
      condicion: filters.condicion || '',
      search: filters.search || '',
    });
    setSearchTerm(filters.search || '');
  }, [filters.categoria_id, filters.condicion, filters.search]);

  /* ========================================================================= */
  /*  CARGAR CATEGORÍAS                                                        */
  /* ========================================================================= */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, [getCategories]);

  /* ========================================================================= */
  /*  CONTAR FILTROS ACTIVOS                                                   */
  /* ========================================================================= */

  useEffect(() => {
    let count = 0;
    if (localFilters.categoria_id) count++;
    if (localFilters.condicion) count++;
    if (localFilters.search) count++;
    setActiveFiltersCount(count);
  }, [localFilters]);

  /* ========================================================================= */
  /*  MANEJAR CAMBIO DE FILTRO                                                 */
  /* ========================================================================= */

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange({ [name]: value });
    }
  };

  /* ========================================================================= */
  /*  MANEJAR BÚSQUEDA CON DEBOUNCE                                            */
  /* ========================================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== localFilters.search) {
        const newFilters = { ...localFilters, search: searchTerm };
        setLocalFilters(newFilters);
        
        if (onSearch) {
          onSearch(searchTerm);
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ========================================================================= */
  /*  MANEJAR BÚSQUEDA INMEDIATA (AL PRESIONAR ENTER)                          */
  /* ========================================================================= */

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newFilters = { ...localFilters, search: searchTerm };
    setLocalFilters(newFilters);
    
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  /* ========================================================================= */
  /*  LIMPIAR FILTROS                                                          */
  /* ========================================================================= */

  const handleClearFilters = () => {
    setLocalFilters({
      categoria_id: '',
      condicion: '',
      search: ''
    });
    setSearchTerm('');
    
    if (onClearFilters) {
      onClearFilters();
    }
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE OPCIONES DE CATEGORÍA                                     */
  /* ========================================================================= */

  const renderCategoryOptions = () => {
    if (categoriesLoading) {
      return <option>Cargando...</option>;
    }
    
    return (
      <>
        <option value="">Todas las categorías</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.icon && <span>{category.icon}</span>} {category.nombre}
          </option>
        ))}
      </>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE OPCIONES DE CONDICIÓN                                     */
  /* ========================================================================= */

  const renderConditionOptions = () => {
    return (
      <>
        <option value="">Todas las condiciones</option>
        <option value="nuevo">🆕 Nuevo</option>
        <option value="segunda">🔄 Segunda Mano</option>
      </>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="corex-filter-bar">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label className="corex-label">Buscar producto</label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre del producto..."
              className="corex-input pl-10"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
          </form>
        </div>

        <div className="w-full sm:w-48">
          <label className="corex-label">Categoría</label>
          <select
            name="categoria_id"
            value={localFilters.categoria_id}
            onChange={handleFilterChange}
            className="corex-select"
          >
            {renderCategoryOptions()}
          </select>
        </div>

        <div className="w-full sm:w-40">
          <label className="corex-label">Condición</label>
          <select
            name="condicion"
            value={localFilters.condicion}
            onChange={handleFilterChange}
            className="corex-select"
          >
            {renderConditionOptions()}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button type="button" onClick={handleClearFilters} className="corex-btn-outline">
              Limpiar ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-3">
          {localFilters.categoria_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
              📁 {categories.find(c => c.id == localFilters.categoria_id)?.nombre || 'Categoría'}
              <button
                onClick={() => {
                  const newFilters = { ...localFilters, categoria_id: '' };
                  setLocalFilters(newFilters);
                  if (onFilterChange) onFilterChange({ categoria_id: '' });
                }}
                className="ml-1 hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
          
          {localFilters.condicion && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
              {localFilters.condicion === 'nuevo' ? '🆕 Nuevo' : '🔄 Segunda'}
              <button
                onClick={() => {
                  const newFilters = { ...localFilters, condicion: '' };
                  setLocalFilters(newFilters);
                  if (onFilterChange) onFilterChange({ condicion: '' });
                }}
                className="ml-1 hover:text-green-900"
              >
                ✕
              </button>
            </span>
          )}
          
          {localFilters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
              🔍 {localFilters.search}
              <button
                onClick={() => {
                  setSearchTerm('');
                  const newFilters = { ...localFilters, search: '' };
                  setLocalFilters(newFilters);
                  if (onSearch) onSearch('');
                }}
                className="ml-1 hover:text-purple-900"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;