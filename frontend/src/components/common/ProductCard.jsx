/**
 * ============================================================
 * ARCHIVO: ProductCard.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ProductCard.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ProductCard (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useWhatsApp, media, SiteContext, CartContext, whatsappHelper
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: HomePage, ProductsPage, ProductDetailPage
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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { getMediaUrl, normalizeImages } from '../../utils/media';
import { useSite } from '../../context/SiteContext';
import { useCart } from '../../context/CartContext';
import { getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';

const ProductCard = ({ product }) => {
  const { generateProductInquiryLink } = useWhatsApp();
  const { addToCart } = useCart();
  const { whatsapp, contact } = useSite();
  const sitePhone = getWhatsAppRuntimePhone({ whatsapp, contact });
  const [addedHint, setAddedHint] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (result?.success) {
      setAddedHint(true);
      window.setTimeout(() => setAddedHint(false), 2000);
    }
  };

  const handleInquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const link = generateProductInquiryLink(product, sitePhone);
    window.open(link, '_blank');
  };

  const gallery = normalizeImages(product.imagenes, product.imagen_url);
  const imageSrc = getMediaUrl(gallery[0]);
  const extraCount = Math.max(gallery.length - 1, 0);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    e.target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
    const placeholder = e.target.parentElement?.querySelector('[data-placeholder]');
    if (placeholder) placeholder.style.display = 'flex';
  };

  const renderConditionBadge = () => {
    if (product.condicion === 'nuevo') {
      return (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Nuevo
        </span>
      );
    }
    return (
      <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
        Segunda
      </span>
    );
  };

  const renderStockBadge = () => {
    if (product.stock === 0) {
      return (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Vendido
        </span>
      );
    }
    return null;
  };

  const available = product.stock > 0;

  return (
    <div className="corex-product-card group">
      <Link to={`/products/${product.id}`} className="block" aria-label={`Ver ${product.nombre}`}>
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.nombre}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
          ) : null}
          <div
            data-placeholder
            className={`absolute inset-0 items-center justify-center text-4xl text-gray-300 ${imageSrc ? 'hidden' : 'flex'}`}
            aria-hidden="true"
          >
            📦
          </div>
          {renderConditionBadge()}
          {renderStockBadge()}
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 rounded bg-black/65 px-2 py-0.5 text-xs font-medium text-white">
              +{extraCount} fotos
            </span>
          )}
        </div>

        <div className="p-4 pb-2">
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900">{product.nombre}</h3>
          {product.categoria_nombre && (
            <p className="mb-2 text-xs text-gray-500">{product.categoria_nombre}</p>
          )}
          <div className="mb-1">
            <span className="corex-price text-2xl">{formatPrice(product.precio)}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {available ? (
          <>
            <div className="flex gap-2">
              <Link
                to={`/products/${product.id}`}
                className="corex-btn-outline flex-1 px-3 py-2 text-center text-sm font-semibold"
              >
                Ver
              </Link>
              <button type="button" onClick={handleBuy} className="corex-btn-whatsapp flex-1 px-3 py-2 text-sm">
                Comprar
              </button>
            </div>
            <button
              type="button"
              onClick={handleInquiry}
              className="corex-btn-mono corex-btn-mono--sm w-full"
            >
              Consultar
            </button>
            {addedHint && (
              <p className="text-center text-xs text-emerald-600">
                Añadido al carrito.{' '}
                <Link to="/cart" className="underline" onClick={(e) => e.stopPropagation()}>
                  Ver carrito
                </Link>
              </p>
            )}
          </>
        ) : (
          <>
            <Link
              to={`/products/${product.id}`}
              className="corex-btn-outline w-full px-3 py-2 text-center text-sm font-semibold"
            >
              Ver
            </Link>
            <button type="button" disabled className="corex-btn-outline w-full cursor-not-allowed opacity-60">
              Producto vendido
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
