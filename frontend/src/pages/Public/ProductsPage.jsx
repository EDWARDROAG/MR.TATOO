/**
 * ============================================================
 * ARCHIVO: ProductsPage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — ProductsPage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ProductsPage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   ProductCard, FilterBar, Pagination, LoadingSpinner, PageHero,
 *   useProducts, api, navConfig
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: App routes /products
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import FilterBar from '../../components/common/FilterBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHero from '../../components/ui/PageHero';
import { useProducts } from '../../hooks/useProducts';
import api from '../../services/api';
import { matchCategoryBySlug, slugifyCategory } from '../../config/navConfig';

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getProducts, loading, error } = useProducts();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    categoria_id: '',
    condicion: searchParams.get('condicion') || '',
    search: searchParams.get('search') || '',
  });
  const [categoryMiss, setCategoryMiss] = useState(false);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesReady(true));
  }, []);

  const slug = searchParams.get('categoria') || '';

  const matchedCategory = useMemo(
    () => (slug ? matchCategoryBySlug(categories, slug) : null),
    [categories, slug]
  );

  useEffect(() => {
    if (!slug) {
      setCategoryMiss(false);
      setFilters((prev) => (prev.categoria_id ? { ...prev, categoria_id: '' } : prev));
      return;
    }
    if (!categoriesReady) return;

    if (matchedCategory) {
      setCategoryMiss(false);
      setFilters((prev) => ({
        ...prev,
        categoria_id: String(matchedCategory.id),
      }));
      return;
    }

    // Slug pedido pero no existe → lista vacía (no mostrar todo el catálogo)
    setCategoryMiss(true);
    setFilters((prev) => ({ ...prev, categoria_id: '' }));
    setProducts([]);
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
  }, [slug, matchedCategory, categoriesReady]);

  const loadProducts = useCallback(async () => {
    if (slug && !categoriesReady) return;
    if (slug && categoryMiss) return;
    // Esperar a tener categoria_id resuelto antes de pedir (evita listar todo el catálogo)
    if (slug && matchedCategory && !filters.categoria_id) return;
    if (slug && matchedCategory && String(filters.categoria_id) !== String(matchedCategory.id)) {
      return;
    }

    const page = parseInt(searchParams.get('page'), 10) || 1;
    const params = {
      page,
      limit: PRODUCTS_PER_PAGE,
      ...filters,
    };

    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    const result = await getProducts(params);

    if (result) {
      setProducts(result.data || []);
      setPagination({
        currentPage: result.pagination?.page || page,
        totalPages: result.pagination?.totalPages || 1,
        totalItems: result.pagination?.total || 0,
      });
    }
  }, [
    filters,
    searchParams,
    getProducts,
    slug,
    categoriesReady,
    categoryMiss,
    matchedCategory,
  ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    searchParams.delete('page');
    if (newFilters.categoria_id !== undefined) {
      if (newFilters.categoria_id) {
        const cat = categories.find((c) => String(c.id) === String(newFilters.categoria_id));
        if (cat) searchParams.set('categoria', slugifyCategory(cat.nombre));
        else searchParams.set('categoria', newFilters.categoria_id);
      } else searchParams.delete('categoria');
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    searchParams.delete('page');
    if (searchTerm) searchParams.set('search', searchTerm);
    else searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setFilters({
      categoria_id: '',
      condicion: '',
      search: '',
    });
    searchParams.delete('categoria');
    searchParams.delete('condicion');
    searchParams.delete('search');
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heroTitle = matchedCategory?.nombre || (slug && categoryMiss ? 'Categoría' : 'Productos');

  return (
    <>
      <PageHero
        title={heroTitle}
        subtitle="Computadores, portátiles, impresoras y más — CoreX Technologies"
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Productos', to: '/products' },
          ...(matchedCategory ? [{ label: matchedCategory.nombre }] : []),
        ]}
      />

      <div className="corex-section corex-section-alt">
        <div className="corex-container">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
          />

          <p className="mb-4 text-sm text-gray-500">
            {categoryMiss ? (
              'No hay productos en esta categoría (o la categoría no existe).'
            ) : pagination.totalItems > 0 ? (
              <>
                Mostrando {products.length} de {pagination.totalItems} productos
              </>
            ) : (
              !loading && 'No se encontraron productos'
            )}
          </p>

          {loading && !categoryMiss ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="corex-empty-state">
              <p className="text-red-500">Error al cargar productos: {error}</p>
              <button type="button" onClick={loadProducts} className="corex-link mt-4">
                Reintentar
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="corex-empty-state">
              <h3 className="corex-section-title text-xl">No se encontraron productos</h3>
              <p className="corex-page-subtitle">
                {matchedCategory
                  ? `La categoría «${matchedCategory.nombre}» no tiene productos publicados aún.`
                  : 'Intenta con otros filtros o realiza una nueva búsqueda'}
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="corex-btn-mono corex-btn-mono--sm mt-6"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <div className="corex-grid-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
