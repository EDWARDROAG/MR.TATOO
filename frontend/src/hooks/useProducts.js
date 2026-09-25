/**
 * ============================================================
 * ARCHIVO: useProducts.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useProducts.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useProducts (default)
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

// frontend/src/hooks/useProducts.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import api, { extractList, extractData } from '../services/api';
import { currencyFormatter } from '../utils/formatters';

const useProducts = (initialFilters = {}, initialItemsPerPage = 12) => {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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
    sortBy: 'relevance',
    ...initialFilters
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: initialItemsPerPage,
    totalItems: 0,
    totalPages: 0
  });
  
  // Estados adicionales
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands()
      ]);
    };
    initialize();
  }, []);

  // Aplicar filtros cuando cambien los productos o filtros
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

  // Fetch productos desde API (HU-060: pasa categoria_id / condicion al backend)
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();

      const categoriaId = params.categoria_id ?? params.category;
      if (categoriaId) queryParams.append('categoria_id', String(categoriaId));
      if (params.subcategoria_id) queryParams.append('subcategoria_id', String(params.subcategoria_id));
      if (params.condicion) queryParams.append('condicion', params.condicion);
      if (params.search) queryParams.append('search', params.search);
      if (params.destacado !== undefined && params.destacado !== '') {
        queryParams.append('destacado', String(params.destacado));
      }
      if (params.page) queryParams.append('page', String(params.page));
      if (params.limit) queryParams.append('limit', String(params.limit));

      const qs = queryParams.toString();
      const response = await api.get(qs ? `/products?${qs}` : '/products');
      const body = response.data;
      const productsData = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : [];

      setProducts(productsData);
      return {
        data: productsData,
        pagination: body?.pagination || null,
      };
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Error al cargar los productos');
      setProducts([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categorías
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
      return [];
    }
  }, []);

  // Fetch marcas
  const fetchBrands = useCallback(async () => {
    try {
      const response = await api.get('/brands');
      const brandsData = response.data?.data ?? response.data ?? [];
      setBrands(brandsData);
      return brandsData;
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
      return [];
    }
  }, []);

  // Aplicar filtros locales
  const applyFilters = useCallback(() => {
    let result = [...products];

    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro de categoría
    if (filters.category) {
      result = result.filter(product =>
        product.category === filters.category ||
        product.categoryId === filters.category ||
        product.category?.name === filters.category
      );
    }

    // Filtro de marca
    if (filters.brand) {
      result = result.filter(product =>
        product.brand === filters.brand ||
        product.brandId === filters.brand ||
        product.brand?.name === filters.brand
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
        (product.rating || 0) >= parseFloat(filters.rating)
      );
    }

    // Filtro de stock
    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }

    // Aplicar ordenamiento
    result = sortProducts(result, filters.sortBy);

    setFilteredProducts(result);
  }, [products, filters]);

  // Ordenar productos
  const sortProducts = useCallback((productsToSort, sortBy) => {
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
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'relevance':
      default:
        return sorted;
    }
  }, []);

  // Obtener producto por ID
  const getProductById = useCallback(async (id) => {
    try {
      setError(null);
      
      const response = await api.get(`/products/${id}`);
      const product = extractData(response.data);
      setSelectedProduct(product);
      
      return product;
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Error al cargar el producto');
      return null;
    }
  }, []);

  // Obtener productos relacionados
  const fetchRelatedProducts = useCallback(async (category, currentProductId, limit = 4) => {
    try {
      const response = await api.get(`/products?category=${category}&limit=${limit + 1}`);
      const products = extractList(response.data, 'products');
      const related = products.filter(p => p.id !== currentProductId).slice(0, limit);
      setRelatedProducts(related);
      return related;
    } catch (err) {
      console.error('Error fetching related products:', err);
      setRelatedProducts([]);
      return [];
    }
  }, []);

  // Obtener productos destacados
  const fetchFeaturedProducts = useCallback(async (limit = 6) => {
    try {
      const response = await api.get(`/products/featured?limit=${limit}`);
      const featured = extractList(response.data, 'products');
      setFeaturedProducts(featured);
      return featured;
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setFeaturedProducts([]);
      return [];
    }
  }, []);

  // Obtener más vendidos
  const fetchBestSellers = useCallback(async (limit = 8) => {
    try {
      const response = await api.get(`/products/best-sellers?limit=${limit}`);
      const bestSellersData = extractList(response.data, 'products');
      setBestSellers(bestSellersData);
      return bestSellersData;
    } catch (err) {
      console.error('Error fetching best sellers:', err);
      setBestSellers([]);
      return [];
    }
  }, []);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Resetear a primera página
    }));
  }, []);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
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
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return filters.search !== '' ||
           filters.category !== '' ||
           filters.brand !== '' ||
           filters.minPrice !== '' ||
           filters.maxPrice !== '' ||
           filters.rating !== '' ||
           filters.inStock === true;
  }, [filters]);

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

  // Obtener productos de la página actual
  const getCurrentPageProducts = useCallback(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, pagination.currentPage, pagination.itemsPerPage]);

  // Obtener rango de precios
  const getPriceRange = useCallback(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Buscar productos (autocompletado)
  const searchProducts = useCallback(async (query, limit = 5) => {
    if (!query.trim()) return [];
    
    try {
      const response = await api.get(`/products/search?q=${query}&limit=${limit}`);
      return extractList(response.data, 'products');
    } catch (err) {
      console.error('Error searching products:', err);
      return [];
    }
  }, []);

  // Obtener productos por categoría
  const getProductsByCategory = useCallback(async (category, limit = null) => {
    try {
      const url = limit 
        ? `/products?category=${category}&limit=${limit}`
        : `/products?category=${category}`;
      const response = await api.get(url);
      return extractList(response.data, 'products');
    } catch (err) {
      console.error('Error fetching products by category:', err);
      return [];
    }
  }, []);

  // Crear producto (admin)
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/products', productData);
      const newProduct = extractData(response.data);
      
      if (newProduct) {
        setProducts(prev => [newProduct, ...prev]);
      }
      
      return { success: true, product: newProduct };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear producto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar producto (admin)
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/products/${id}`, productData);
      const updatedProduct = extractData(response.data);
      
      if (updatedProduct) {
        setProducts(prev => prev.map(p => 
          p.id === id ? updatedProduct : p
        ));
        
        if (selectedProduct?.id === id) {
          setSelectedProduct(updatedProduct);
        }
      }
      
      return { success: true, product: updatedProduct };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar producto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  // Eliminar producto (admin)
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/products/${id}`);
      
      // Eliminar de la lista de productos
      setProducts(prev => prev.filter(p => p.id !== id));
      
      // Limpiar producto seleccionado si es el mismo
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar producto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  // Agregar reseña a producto
  const addReview = useCallback(async (productId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      const updatedProduct = response.data;
      
      // Actualizar producto en la lista
      setProducts(prev => prev.map(p => 
        p.id === productId ? updatedProduct : p
      ));
      
      // Actualizar producto seleccionado si es el mismo
      if (selectedProduct?.id === productId) {
        setSelectedProduct(updatedProduct);
      }
      
      return { success: true, product: updatedProduct };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al agregar reseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  // Formatear precio
  const formatPrice = useCallback((price, currency = 'COP') => {
    return currencyFormatter.formatSimple(price, currency);
  }, []);

  // Calcular precio con descuento
  const getDiscountedPrice = useCallback((price, discount) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  }, []);

  // Validar stock
  const checkStock = useCallback((productId, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    return product.stock >= quantity;
  }, [products]);

  // Obtener productos por IDs
  const getProductsByIds = useCallback(async (ids) => {
    try {
      const response = await api.post('/products/by-ids', { ids });
      return extractList(response.data, 'products');
    } catch (err) {
      console.error('Error fetching products by ids:', err);
      return [];
    }
  }, []);

  const getProducts = useCallback(async (params = {}) => {
    return fetchProducts(params);
  }, [fetchProducts]);

  // Memoized values
  const currentProducts = useMemo(() => getCurrentPageProducts(), [getCurrentPageProducts]);
  const priceRange = useMemo(() => getPriceRange(), [getPriceRange]);
  const hasFilters = useMemo(() => hasActiveFilters(), [hasActiveFilters]);

  return {
    // Datos principales
    products,
    filteredProducts,
    currentProducts,
    categories,
    brands,
    selectedProduct,
    relatedProducts,
    featuredProducts,
    bestSellers,
    
    // Estados
    loading,
    error,
    filters,
    pagination,
    
    // Métodos de filtrado
    updateFilters,
    clearFilters,
    hasActiveFilters: hasFilters,
    
    // Métodos de paginación
    changePage,
    setItemsPerPage,
    
    // Métodos de productos
    fetchProducts,
    getProducts,
    getProductById,
    fetchRelatedProducts,
    fetchFeaturedProducts,
    fetchBestSellers,
    searchProducts,
    getProductsByCategory,
    getProductsByIds,
    
    // Métodos de administración
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Métodos de reseñas
    addReview,
    
    // Utilidades
    formatPrice,
    getDiscountedPrice,
    getPriceRange: priceRange,
    checkStock,
    
    // Getters útiles
    totalProducts: filteredProducts.length,
    hasMorePages: pagination.currentPage < pagination.totalPages,
    isLastPage: pagination.currentPage === pagination.totalPages,
    isFirstPage: pagination.currentPage === 1,
    
    // Loading states específicos
    isLoadingProducts: loading && products.length === 0,
    isLoadingProduct: loading && selectedProduct === null
  };
};

export { useProducts };
export default useProducts;