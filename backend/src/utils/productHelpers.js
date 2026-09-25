/**
 * ============================================================
 * ARCHIVO: productHelpers.js
 * UBICACIÓN: backend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — productHelpers.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   calcDiscountPercent, generateBarcode, enrichProduct, parseImagenes,
 *   parseBool, parseNumber
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: Revisar imports en el resto del proyecto
 *
 * NOTAS:
 *   Backend · mantener contrato y consumidores al cambiar la API
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

/**
 * Utilidades de producto: barcode, descuento, normalización JSON imagenes
 */

const calcDiscountPercent = (precioVenta, precioPromocion, enPromocion) => {
    const venta = Number(precioVenta);
    const promo = Number(precioPromocion);
    if (!enPromocion || !promo || venta <= 0 || promo >= venta) return 0;
    return Math.round((1 - promo / venta) * 100);
};

const calcEan13CheckDigit = (digits12) => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const n = parseInt(digits12[i], 10);
        sum += i % 2 === 0 ? n : n * 3;
    }
    const mod = sum % 10;
    return mod === 0 ? 0 : 10 - mod;
};

const generateBarcode = () => {
    const body = `770${String(Date.now()).slice(-9)}`.padEnd(12, '0').slice(0, 12);
    return `${body}${calcEan13CheckDigit(body)}`;
};

const parseImagenes = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return value ? [value] : [];
        }
    }
    return [];
};

const enrichProduct = (row) => {
    if (!row) return row;
    const imagenes = parseImagenes(row.imagenes);
    if (!imagenes.length && row.imagen_url) imagenes.push(row.imagen_url);

    const precioVenta = Number(row.precio);
    const enPromocion = !!row.en_promocion;
    const precioPromocion = row.precio_promocion != null ? Number(row.precio_promocion) : null;
    const porcentaje = row.porcentaje_descuento
        ?? calcDiscountPercent(precioVenta, precioPromocion, enPromocion);

    return {
        ...row,
        imagenes,
        imagen_url: imagenes[0] || row.imagen_url || null,
        stock: Number(row.stock ?? 0),
        precio_venta: precioVenta,
        precio_compra: row.precio_compra != null ? Number(row.precio_compra) : null,
        precio_promocion: precioPromocion,
        precio_display: enPromocion && precioPromocion ? precioPromocion : precioVenta,
        porcentaje_descuento: porcentaje,
        en_promocion: enPromocion,
        activo: row.activo !== false,
    };
};

const parseBool = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1' || value === 1;
};

const parseNumber = (value, defaultValue = null) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    const n = Number(value);
    return Number.isFinite(n) ? n : defaultValue;
};

module.exports = {
    calcDiscountPercent,
    generateBarcode,
    enrichProduct,
    parseImagenes,
    parseBool,
    parseNumber,
};
