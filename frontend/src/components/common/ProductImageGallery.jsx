/**
 * ============================================================
 * ARCHIVO: ProductImageGallery.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — ProductImageGallery.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ProductImageGallery (default)
 *
 * DEPENDENCIAS CLAVE:
 *   media
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: ProductDetailPage
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

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getMediaUrl, normalizeImages } from '../../utils/media';

const ProductImageGallery = ({ product, className = '' }) => {
  const gallery = normalizeImages(product?.imagenes, product?.imagen_url).map(getMediaUrl).filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
    setLightboxOpen(false);
  }, [product?.id]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight' && gallery.length) {
        setSelectedIndex((i) => (i + 1) % gallery.length);
      }
      if (e.key === 'ArrowLeft' && gallery.length) {
        setSelectedIndex((i) => (i - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, gallery.length]);

  if (!gallery.length) {
    return (
      <div className={`corex-pd-gallery corex-pd-gallery--empty ${className}`}>
        Sin imagen
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, gallery.length - 1);
  const mainSrc = gallery[safeIndex];
  const goPrev = (e) => {
    e?.stopPropagation();
    setSelectedIndex((i) => (i - 1 + gallery.length) % gallery.length);
  };
  const goNext = (e) => {
    e?.stopPropagation();
    setSelectedIndex((i) => (i + 1) % gallery.length);
  };

  const lightbox = lightboxOpen
    ? createPortal(
        <div
          className="corex-pd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Galería ampliada"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="corex-pd-lightbox__close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
          >
            ×
          </button>
          {gallery.length > 1 && (
            <>
              <button type="button" className="corex-pd-lightbox__nav corex-pd-lightbox__nav--prev" onClick={goPrev} aria-label="Anterior">
                ‹
              </button>
              <button type="button" className="corex-pd-lightbox__nav corex-pd-lightbox__nav--next" onClick={goNext} aria-label="Siguiente">
                ›
              </button>
            </>
          )}
          <img
            src={mainSrc}
            alt={product?.nombre || 'Producto'}
            className="corex-pd-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
          {gallery.length > 1 && (
            <p className="corex-pd-lightbox__count">
              {safeIndex + 1} / {gallery.length}
            </p>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className={`corex-pd-gallery ${className}`}>
        {gallery.length > 1 && (
          <div className="corex-pd-thumbs" role="list">
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                role="listitem"
                onClick={() => setSelectedIndex(i)}
                className={`corex-pd-thumb${i === safeIndex ? ' is-active' : ''}`}
                aria-label={`Foto ${i + 1}`}
                aria-current={i === safeIndex ? 'true' : undefined}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="corex-pd-main">
          <button
            type="button"
            className="corex-pd-main__btn"
            onClick={() => setLightboxOpen(true)}
            aria-label="Ampliar imagen"
          >
            <img
              src={mainSrc}
              alt={product?.nombre || 'Producto'}
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
            <span className="corex-pd-main__zoom">Ampliar</span>
          </button>
          {gallery.length > 1 && (
            <p className="corex-pd-main__count">
              {safeIndex + 1} / {gallery.length}
            </p>
          )}
        </div>
      </div>
      {lightbox}
    </>
  );
};

export default ProductImageGallery;
