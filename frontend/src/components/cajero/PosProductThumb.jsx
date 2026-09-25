/**
 * ============================================================
 * ARCHIVO: PosProductThumb.jsx
 * UBICACIÓN: frontend/src/components/cajero/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Miniatura de producto para galería POS (paridad visual Pañalera /
 *
 * FUNCIONES / API (contrato exporta):
 *   resolveProductCoverUrl, PosProductThumb (default)
 *
 * DEPENDENCIAS CLAVE:
 *   media
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: CajeroPOS
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

import React, { useMemo, useState } from 'react';
import {
  resolveProductCoverUrl as resolveCoverFromMedia,
} from '../../utils/media';

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
      '<rect fill="#e2e8f0" width="120" height="120"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
      'fill="#94a3b8" font-size="11" font-family="system-ui,sans-serif">Sin foto</text>' +
      '</svg>'
  );

/** URL absoluta o placeholder SVG (nunca /placeholder-image.png). */
export function resolveProductCoverUrl(product) {
  return resolveCoverFromMedia(product) || PLACEHOLDER;
}

export { PLACEHOLDER as POS_IMG_PLACEHOLDER };

/**
 * @param {{ product: object, onAdd: (p: object) => void }} props
 */
const PosProductThumb = ({ product, onAdd }) => {
  const cover = useMemo(() => resolveProductCoverUrl(product), [product]);
  const [src, setSrc] = useState(cover);
  const out = product.stock != null && Number(product.stock) <= 0;
  const price = Number(
    product.precio_display ?? product.precio_venta ?? product.precio ?? 0
  );

  React.useEffect(() => {
    setSrc(cover);
  }, [cover]);

  return (
    <button
      type="button"
      disabled={out}
      onClick={() => !out && onAdd(product)}
      className={`pos-thumb flex w-full max-w-[140px] flex-col overflow-hidden rounded-[10px] border border-gray-200 bg-white text-left shadow-sm transition hover:border-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55 dark:border-gray-600 dark:bg-gray-800 ${
        out ? '' : 'cursor-pointer'
      }`}
    >
      <div
        className="pos-thumb__media relative w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-gray-700"
        style={{ height: '4cm', maxHeight: 120, minHeight: 90 }}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 block h-full w-full object-cover"
          onError={(e) => {
            if (e.currentTarget.dataset.fallback === '1') return;
            e.currentTarget.dataset.fallback = '1';
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        {out ? (
          <span className="absolute right-1 top-1 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
            AGOTADO
          </span>
        ) : product.stock != null ? (
          <span className="absolute right-1 top-1 rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">
            {Number(product.stock)}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 p-2">
        <p
          className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-tight text-gray-800 dark:text-white"
          title={product.nombre}
        >
          {product.nombre}
        </p>
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
          ${price.toLocaleString('es-CO')}
        </p>
        <span className="mt-auto block rounded bg-slate-100 py-1 text-center text-[0.7rem] font-semibold text-slate-700 dark:bg-gray-700 dark:text-gray-200">
          + Agregar
        </span>
      </div>
    </button>
  );
};

export default PosProductThumb;
