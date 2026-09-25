/**
 * ============================================================
 * ARCHIVO: useCategories.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useCategories.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useCategories (default)
 *
 * DEPENDENCIAS CLAVE:
 *   api
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

// frontend/src/hooks/useCategories.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import api, { extractList } from '../services/api';

const useCategories = () => {
  // Estados principales
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Sin filtrar
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'active', // active, inactive, all
    parentId: null,
    level: null,
    hasProducts: null
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });
  
  // Estado para estadísticas
  const [categoryStats, setCategoryStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    rootCategories: 0,
    categoriesWithProducts: 0,
    categoriesWithoutProducts: 0
  });

  // Cargar categorías iniciales
  useEffect(() => {
    fetchCategories();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // Actualizar estadísticas cuando cambien las categorías
  useEffect(() => {
    if (categories.length > 0) {
      calculateStats();
    }
  }, [categories]);

  // Fetch categorías desde API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.parentId !== null && { parentId: filters.parentId }),
        ...(filters.level !== null && { level: filters.level }),
        ...(filters.hasProducts !== null && { hasProducts: filters.hasProducts })
      });
      
      const response = await api.get(`/categories?${params.toString()}`);
      const categoriesData = extractList(response.data, 'categories');
      const paginationData = response.data.pagination || {};
      
      setCategories(categoriesData);
      setPagination(prev => ({
        ...prev,
        totalItems: paginationData.totalItems || categoriesData.length,
        totalPages: paginationData.totalPages || 1
      }));
      
      return categoriesData;
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Error al cargar las categorías');
      setCategories([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  const getCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      return extractList(response.data, 'categories');
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  }, []);

  // Obtener todas las categorías (sin paginación)
  const fetchAllCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories/all');
      const allCategoriesData = extractList(response.data, 'categories');
      setAllCategories(allCategoriesData);
      return allCategoriesData;
    } catch (err) {
      console.error('Error fetching all categories:', err);
      return [];
    }
  }, []);

  // Calcular estadísticas
  const calculateStats = useCallback(() => {
    const activeCategories = categories.filter(c => c.status === 'active').length;
    const inactiveCategories = categories.filter(c => c.status === 'inactive').length;
    const rootCategories = categories.filter(c => !c.parentId).length;
    const categoriesWithProducts = categories.filter(c => c.productCount > 0).length;
    const categoriesWithoutProducts = categories.filter(c => c.productCount === 0).length;
    
    setCategoryStats({
      totalCategories: categories.length,
      activeCategories,
      inactiveCategories,
      rootCategories,
      categoriesWithProducts,
      categoriesWithoutProducts
    });
  }, [categories]);

  // Obtener categoría por ID
  const getCategoryById = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/categories/${categoryId}`);
      const category = response.data;
      setSelectedCategory(category);
      return category;
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(err.response?.data?.message || 'Error al cargar la categoría');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva categoría
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/categories', categoryData);
      const newCategory = response.data;
      
      // Actualizar lista de categorías
      setCategories(prev => [newCategory, ...prev]);
      
      // Actualizar todas las categorías si es necesario
      if (allCategories.length > 0) {
        setAllCategories(prev => [newCategory, ...prev]);
      }
      
      return { success: true, category: newCategory };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear la categoría';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [allCategories]);

  // Actualizar categoría
  const updateCategory = useCallback(async (categoryId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/categories/${categoryId}`, updateData);
      const updatedCategory = response.data;
      
      // Actualizar en la lista de categorías
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      ));
      
      // Actualizar todas las categorías
      if (allCategories.length > 0) {
        setAllCategories(prev => prev.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        ));
      }
      
      // Actualizar categoría seleccionada si es la misma
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(updatedCategory);
      }
      
      return { success: true, category: updatedCategory };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la categoría';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [allCategories, selectedCategory]);

  // Eliminar categoría
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/categories/${categoryId}`);
      
      // Eliminar de la lista de categorías
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // Eliminar de todas las categorías
      if (allCategories.length > 0) {
        setAllCategories(prev => prev.filter(cat => cat.id !== categoryId));
      }
      
      // Limpiar categoría seleccionada si es la misma
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la categoría';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [allCategories, selectedCategory]);

  // Obtener subcategorías
  const getSubcategories = useCallback(async (parentId) => {
    try {
      const response = await api.get(`/categories/${parentId}/subcategories`);
      return extractList(response.data, 'categories');
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      return [];
    }
  }, []);

  // Obtener árbol de categorías
  const getCategoryTree = useCallback(async () => {
    try {
      const response = await api.get('/categories/tree');
      return response.data;
    } catch (err) {
      console.error('Error fetching category tree:', err);
      return [];
    }
  }, []);

  // Reordenar categorías
  const reorderCategories = useCallback(async (reorderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/categories/reorder', reorderData);
      
      // Actualizar lista de categorías
      await fetchCategories();
      
      return { success: true, categories: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al reordenar las categorías';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Actualizar estado de categoría (active/inactive)
  const updateCategoryStatus = useCallback(async (categoryId, status) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/categories/${categoryId}/status`, { status });
      const updatedCategory = response.data;
      
      // Actualizar en la lista de categorías
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      ));
      
      // Actualizar todas las categorías
      if (allCategories.length > 0) {
        setAllCategories(prev => prev.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        ));
      }
      
      // Actualizar categoría seleccionada si es la misma
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(updatedCategory);
      }
      
      return { success: true, category: updatedCategory };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el estado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [allCategories, selectedCategory]);

  // Obtener categorías para select (formularios)
  const getCategoriesForSelect = useCallback(async (excludeId = null) => {
    try {
      const allCats = await fetchAllCategories();
      let filtered = allCats;
      
      if (excludeId) {
        filtered = allCats.filter(cat => cat.id !== excludeId);
      }
      
      // Formato para select anidado
      const formatForSelect = (categories, level = 0) => {
        let result = [];
        for (const category of categories) {
          result.push({
            id: category.id,
            name: `${'—'.repeat(level)} ${category.name}`,
            level: level
          });
          
          if (category.children && category.children.length > 0) {
            result = [...result, ...formatForSelect(category.children, level + 1)];
          }
        }
        return result;
      };
      
      // Construir árbol
      const tree = buildCategoryTree(filtered);
      return formatForSelect(tree);
    } catch (err) {
      console.error('Error getting categories for select:', err);
      return [];
    }
  }, [fetchAllCategories]);

  // Construir árbol de categorías
  const buildCategoryTree = useCallback((flatCategories, parentId = null) => {
    const tree = [];
    const children = flatCategories.filter(cat => cat.parentId === parentId);
    
    for (const child of children) {
      tree.push({
        ...child,
        children: buildCategoryTree(flatCategories, child.id)
      });
    }
    
    return tree;
  }, []);

  // Obtener ruta de categoría (breadcrumb)
  const getCategoryPath = useCallback(async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}/path`);
      return response.data;
    } catch (err) {
      console.error('Error fetching category path:', err);
      return [];
    }
  }, []);

  // Mover categoría a otro padre
  const moveCategory = useCallback(async (categoryId, newParentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/categories/${categoryId}/move`, { parentId: newParentId });
      const updatedCategory = response.data;
      
      // Actualizar lista de categorías
      await fetchCategories();
      
      // Actualizar categoría seleccionada si es la misma
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(updatedCategory);
      }
      
      return { success: true, category: updatedCategory };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al mover la categoría';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, selectedCategory]);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'active',
      parentId: null,
      level: null,
      hasProducts: null
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Cambiar página
  const changePage = useCallback((page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  }, []);

  // Cambiar items por página
  const setItemsPerPage = useCallback((itemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1
    }));
  }, []);

  // Obtener categorías por nivel
  const getCategoriesByLevel = useCallback((level) => {
    return categories.filter(cat => cat.level === level);
  }, [categories]);

  // Obtener categorías activas
  const getActiveCategories = useCallback(() => {
    return categories.filter(cat => cat.status === 'active');
  }, [categories]);

  // Obtener categorías raíz (sin padre)
  const getRootCategories = useCallback(() => {
    return categories.filter(cat => !cat.parentId);
  }, [categories]);

  // Verificar si una categoría tiene subcategorías
  const hasSubcategories = useCallback((categoryId) => {
    return categories.some(cat => cat.parentId === categoryId);
  }, [categories]);

  // Obtener conteo de productos por categoría
  const getProductCountByCategory = useCallback((categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.productCount || 0;
  }, [categories]);

  // Formatear nombre de categoría para URL slug
  const slugify = useCallback((name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  }, []);

  // Validar nombre de categoría único
  const isNameUnique = useCallback(async (name, excludeId = null) => {
    try {
      const response = await api.post('/categories/check-name', { name, excludeId });
      return response.data.unique;
    } catch (err) {
      console.error('Error checking name uniqueness:', err);
      return false;
    }
  }, []);

  // Exportar categorías
  const exportCategories = useCallback(async (format = 'csv') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/categories/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const extension = format === 'csv' ? 'csv' : 'json';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `categorias.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al exportar categorías';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Importar categorías
  const importCategories = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/categories/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Recargar categorías
      await fetchCategories();
      await fetchAllCategories();
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al importar categorías';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchAllCategories]);

  // Memoized values
  const categoryTree = useMemo(() => {
    if (allCategories.length > 0) {
      return buildCategoryTree(allCategories);
    }
    return buildCategoryTree(categories);
  }, [categories, allCategories, buildCategoryTree]);

  const activeCategories = useMemo(() => getActiveCategories(), [getActiveCategories]);
  const rootCategories = useMemo(() => getRootCategories(), [getRootCategories]);
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '' && value !== null && value !== 'active');
  }, [filters]);

  return {
    // Datos principales
    categories,
    allCategories,
    currentCategories: categories,
    selectedCategory,
    categoryTree,
    
    // Estados
    loading,
    error,
    filters,
    pagination,
    categoryStats,
    
    // Métodos CRUD
    fetchCategories,
    fetchAllCategories,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Métodos de organización
    getSubcategories,
    getCategoryTree,
    getCategoryPath,
    reorderCategories,
    moveCategory,
    
    // Métodos de estado
    updateCategoryStatus,
    
    // Métodos de filtrado
    updateFilters,
    clearFilters,
    changePage,
    setItemsPerPage,
    
    // Métodos utilitarios
    getCategoriesByLevel,
    getActiveCategories,
    getRootCategories,
    getCategoriesForSelect,
    hasSubcategories,
    getProductCountByCategory,
    slugify,
    isNameUnique,
    
    // Métodos de import/export
    exportCategories,
    importCategories,
    
    // Getters útiles
    totalCategories: pagination.totalItems,
    hasMorePages: pagination.currentPage < pagination.totalPages,
    isFirstPage: pagination.currentPage === 1,
    isLastPage: pagination.currentPage === pagination.totalPages,
    hasActiveFilters,
    
    // Loading states específicos
    isLoadingCategories: loading && categories.length === 0,
    isLoadingCategory: loading && selectedCategory === null
  };
};

export { useCategories };
export default useCategories;