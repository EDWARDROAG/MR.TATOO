/**
 * ============================================================
 * ARCHIVO: ProductDetailPage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — ProductDetailPage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ProductDetailPage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   ProductCard, ProductImageGallery, LoadingSpinner, PageHero,
 *   SectionHeader, useProducts, useWhatsApp, CartContext, SiteContext,
 *   whatsappHelper
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import ProductImageGallery from '../../components/common/ProductImageGallery';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageHero from '../../components/ui/PageHero';
import SectionHeader from '../../components/ui/SectionHeader';
import { useProducts } from '../../hooks/useProducts';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { useCart } from '../../context/CartContext';
import { useSite } from '../../context/SiteContext';
import { getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, getProducts, loading, error } = useProducts();
  const { generateProductInquiryLink } = useWhatsApp();
  const { addToCart } = useCart();
  const { whatsapp, contact } = useSite();
  const sitePhone = getWhatsAppRuntimePhone({ whatsapp, contact });
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addedHint, setAddedHint] = useState(false);

  /* ========================================================================= */
  /*  CARGAR PRODUCTO Y RELACIONADOS                                           */
  /* ========================================================================= */

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      setNotFound(false);
      
      try {
        // Cargar producto principal
        const productData = await getProductById(id);
        
        if (!productData) {
          setNotFound(true);
          return;
        }
        
        setProduct(productData);
        
        // Cargar productos relacionados (misma categoría, excluyendo el actual)
        const related = await getProducts({
          categoria_id: productData.categoria_id,
          limit: 4,
          page: 1
        });
        
        if (related && related.data) {
          const filtered = related.data.filter(p => p.id !== parseInt(id));
          setRelatedProducts(filtered.slice(0, 4));
        }
        
      } catch (err) {
        console.error('Error loading product:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadProduct();
    }
  }, [id, getProductById, getProducts, navigate]);

  /* ========================================================================= */
  /*  COMPRAR → carrito (HU-042)                                               */
  /* ========================================================================= */

  const handleBuy = () => {
    if (!product) return;
    const result = addToCart(product, 1);
    if (result?.success) {
      setAddedHint(true);
      window.setTimeout(() => setAddedHint(false), 2500);
    }
  };

  /* ========================================================================= */
  /*  CONSULTAR → WhatsApp                                                     */
  /* ========================================================================= */

  const handleInquiry = () => {
    if (product) {
      const whatsappLink = generateProductInquiryLink(product, sitePhone);
      window.open(whatsappLink, '_blank');
    }
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE PRODUCTO NO ENCONTRADO                                    */
  /* ========================================================================= */

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Producto no encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El producto que buscas no existe o ha sido eliminado
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /*  RENDERIZADO DE CARGA                                                     */
  /* ========================================================================= */

  if (isLoading || loading) {
    return (
      <div className="corex-section flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <PageHero
        title={product?.nombre || 'Producto'}
        subtitle={[product?.condicion === 'nuevo' ? 'Nuevo' : 'Segunda', product?.categoria_nombre, product?.subcategoria_nombre]
          .filter(Boolean)
          .join(' · ')}
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Productos', to: '/products' },
          { label: product?.nombre || 'Detalle' },
        ]}
      />

      <div className="corex-section corex-section-alt">
        <div className="corex-container">
          <div className="corex-card corex-pd-panel">
            <div className="corex-pd-body">
              <ProductImageGallery product={product} />

              <div className="corex-pd-info">
                <p className="corex-pd-meta">
                  {[product?.condicion === 'nuevo' ? 'Nuevo' : 'Segunda mano', product?.categoria_nombre, product?.subcategoria_nombre]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                <h1 className="corex-pd-title">{product?.nombre}</h1>

                <span className={`corex-pd-stock${product?.stock > 0 ? '' : ' is-out'}`}>
                  {product?.stock > 0 ? 'En stock' : 'Agotado'}
                </span>

                <p className="corex-pd-price">
                  ${Number(product?.precio || 0).toLocaleString('es-CO')}
                </p>

                {product?.descripcion && (
                  <div className="corex-pd-section">
                    <strong>Descripción</strong>
                    <p>{product.descripcion}</p>
                  </div>
                )}

                <div className="corex-pd-actions">
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="corex-btn-whatsapp w-full px-6 py-3"
                    disabled={!(product?.stock > 0)}
                  >
                    Comprar
                  </button>
                  <button type="button" onClick={handleInquiry} className="corex-btn-mono corex-btn-mono--md w-full">
                    Consultar
                  </button>
                </div>

                {addedHint && (
                  <p className="mt-3 text-center text-sm text-emerald-600">
                    Añadido al carrito.{' '}
                    <Link to="/cart" className="underline">
                      Ir al carrito
                    </Link>
                  </p>
                )}

                <p className="mt-3 text-center text-xs text-gray-500">
                  * Consultar abre WhatsApp. Comprar suma al carrito; la compra se confirma allí por WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <SectionHeader title="Productos Relacionados" linkTo="/products" />
              <div className="corex-grid-4">
                {relatedProducts.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;