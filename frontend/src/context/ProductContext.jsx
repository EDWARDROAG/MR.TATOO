/**
 * ============================================================
 * ARCHIVO: ProductContext.jsx
 * UBICACIÓN: frontend/src/context/
 * ROL: context
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Contexto React — ProductContext.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   useProducts, ProductProvider, ProductContext (default)
 *
 * DEPENDENCIAS CLAVE:
 *   api, formatters
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

// frontend/src/context/ProductContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { currencyFormatter } from '../utils/formatters';

// Crear el contexto
const ProductContext = createContext({});

// Hook personalizado para usar el contexto
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de un ProductProvider');
  }
  return context;
};

// Provider component
export const ProductProvider = ({ children }) => {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
    sortBy: 'relevance', // relevance, price_asc, price_desc, rating, newest
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    totalPages: 0
  });
  
  // Estado para producto seleccionado
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Cargar productos iniciales
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  // Actualizar paginación cuando cambien los productos filtrados
  useEffect(() => {
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / pagination.itemsPerPage);
    setPagination(prev => ({
      ...prev,
      totalItems: total,
      totalPages: totalPages
    }));
  }, [filteredProducts, pagination.itemsPerPage]);

  // Fetch productos desde API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query params
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || response.data);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categorías
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  // Fetch marcas
  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  };

  // Aplicar filtros locales
  const applyFilters = () => {
    let result = [...products];

    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de categoría
    if (filters.category) {
      result = result.filter(product =>
        product.category === filters.category ||
        product.categoryId === filters.category
      );
    }

    // Filtro de marca
    if (filters.brand) {
      result = result.filter(product =>
        product.brand === filters.brand ||
        product.brandId === filters.brand
      );
    }

    // Filtro de precio mínimo
    if (filters.minPrice) {
      result = result.filter(product =>
        product.price >= parseFloat(filters.minPrice)
      );
    }

    // Filtro de precio máximo
    if (filters.maxPrice) {
      result = result.filter(product =>
        product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Filtro de rating
    if (filters.rating) {
      result = result.filter(product =>
        product.rating >= parseFloat(filters.rating)
      );
    }

    // Filtro de stock
    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }

    // Ordenamiento
    result = sortProducts(result, filters.sortBy);

    setFilteredProducts(result);
  };

  // Ordenar productos
  const sortProducts = (productsToSort, sortBy) => {
    const sorted = [...productsToSort];
    
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'relevance':
      default:
        return sorted;
    }
  };

  // Obtener producto por ID
  const getProductById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      setSelectedProduct(product);
      
      // Cargar productos relacionados
      await fetchRelatedProducts(product.category, product.id);
      
      return product;
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Error al cargar el producto');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener productos relacionados
  const fetchRelatedProducts = async (category, currentProductId) => {
    try {
      const response = await api.get(`/products?category=${category}&limit=4`);
      const related = response.data.products || response.data;
      setRelatedProducts(related.filter(p => p.id !== currentProductId));
    } catch (err) {
      console.error('Error fetching related products:', err);
      setRelatedProducts([]);
    }
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Resetear a primera página al cambiar filtros
    }));
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      sortBy: 'relevance'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Cambiar página
  const changePage = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  };

  // Obtener productos de la página actual
  const getCurrentPageProducts = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredProducts.slice(start, end);
  };

  // Cambiar items por página
  const setItemsPerPage = (itemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1
    }));
  };

  // Obtener rango de precios
  const getPriceRange = () => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = () => {
    return filters.search !== '' ||
           filters.category !== '' ||
           filters.brand !== '' ||
           filters.minPrice !== '' ||
           filters.maxPrice !== '' ||
           filters.rating !== '' ||
           filters.inStock === true;
  };

  // Obtener productos destacados
  const getFeaturedProducts = async (limit = 6) => {
    try {
      const response = await api.get(`/products/featured?limit=${limit}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching featured products:', err);
      return [];
    }
  };

  // Obtener productos más vendidos
  const getBestSellers = async (limit = 8) => {
    try {
      const response = await api.get(`/products/best-sellers?limit=${limit}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching best sellers:', err);
      return [];
    }
  };

  // Obtener productos por categoría
  const getProductsByCategory = async (category, limit = null) => {
    try {
      const url = limit 
        ? `/products?category=${category}&limit=${limit}`
        : `/products?category=${category}`;
      const response = await api.get(url);
      return response.data.products || response.data;
    } catch (err) {
      console.error('Error fetching products by category:', err);
      return [];
    }
  };

  // Buscar productos (autocompletado)
  const searchProducts = async (query, limit = 5) => {
    if (!query.trim()) return [];
    
    try {
      const response = await api.get(`/products/search?q=${query}&limit=${limit}`);
      return response.data.products || response.data;
    } catch (err) {
      console.error('Error searching products:', err);
      return [];
    }
  };

  // Valor del contexto
  const value = {
    // Datos principales
    products,
    filteredProducts,
    categories,
    brands,
    selectedProduct,
    relatedProducts,
    
    // Estados
    loading,
    error,
    filters,
    pagination,
    
    // Métodos de filtrado
    updateFilters,
    clearFilters,
    hasActiveFilters,
    
    // Métodos de paginación
    changePage,
    setItemsPerPage,
    getCurrentPageProducts,
    
    // Métodos de productos
    getProductById,
    getFeaturedProducts,
    getBestSellers,
    getProductsByCategory,
    searchProducts,
    
    // Utilidades
    getPriceRange,
    formatPrice: (price) => currencyFormatter.formatSimple(price),
    
    // Getters útiles
    totalProducts: filteredProducts.length,
    currentProducts: getCurrentPageProducts(),
    hasMorePages: pagination.currentPage < pagination.totalPages,
    priceRange: getPriceRange()
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;