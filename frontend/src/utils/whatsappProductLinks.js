/**
 * ============================================================
 * ARCHIVO: whatsappProductLinks.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — whatsappProductLinks.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   buildWaMeUrl, generateQuickBuyLink, generateProductInquiryLink,
 *   generateServiceInquiryLink, WHATSAPP_PRODUCT_LINK_API
 *
 * DEPENDENCIAS CLAVE:
 *   formatters, whatsappHelper
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: useWhatsApp, ProductDetailPage (vía hook),
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

import { currencyFormatter } from './formatters';
import { getWhatsAppRuntimePhone } from './whatsappHelper';

const formatMoney = (amount) => currencyFormatter.formatSimple(amount);

/**
 * @param {string|null} phoneNumber
 * @param {string} [message]
 * @returns {string}
 */
export function buildWaMeUrl(phoneNumber, message = '') {
  const phone = getWhatsAppRuntimePhone(phoneNumber ? { phone: phoneNumber } : undefined);
  if (!message) return `https://wa.me/${phone}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function productLabel(product) {
  return product?.nombre || product?.name || 'un producto';
}

function productPriceLabel(product) {
  const price = product?.precio ?? product?.price;
  if (price == null || price === '') return '';
  return formatMoney(price);
}

/**
 * Compra rápida — mismo contrato que backend whatsappLink.generateQuickBuyLink
 * @param {object|null} product
 * @param {string|null} [phoneNumber]
 */
export function generateQuickBuyLink(product, phoneNumber = null) {
  if (!product) {
    return buildWaMeUrl(phoneNumber, 'Hola, quiero comprar un producto.');
  }
  const pricePart = productPriceLabel(product);
  const message = `Hola, quiero COMPRAR: ${productLabel(product)}${pricePart ? ` - Precio: ${pricePart}` : ''}. ¿Tiene stock disponible?`;
  return buildWaMeUrl(phoneNumber, message);
}

/**
 * Consulta de producto
 * @param {object|null} product
 * @param {string|null} [phoneNumber]
 */
export function generateProductInquiryLink(product, phoneNumber = null) {
  if (!product) {
    return buildWaMeUrl(phoneNumber, 'Hola, estoy interesado en sus productos.');
  }
  const pricePart = productPriceLabel(product);
  const message = `Hola, estoy interesado en el producto: ${productLabel(product)}${pricePart ? ` (${pricePart})` : ''}. ¿Podría darme más información?`;
  return buildWaMeUrl(phoneNumber, message);
}

/**
 * Consulta de servicio (mantenimiento)
 * @param {string} serviceType
 * @param {string|null} [phoneNumber]
 */
export function generateServiceInquiryLink(serviceType, phoneNumber = null) {
  const serviceMap = {
    celulares: 'mantenimiento de celulares',
    computadores: 'mantenimiento de computadores',
    laptops: 'mantenimiento de laptops',
    impresoras: 'mantenimiento de impresoras'
  };
  const serviceName = serviceMap[serviceType] || serviceType || 'mantenimiento';
  const message = `Hola, necesito información sobre el servicio de ${serviceName}. ¿Cuál es el costo y la disponibilidad?`;
  return buildWaMeUrl(phoneNumber, message);
}

export const WHATSAPP_PRODUCT_LINK_API = [
  'generateQuickBuyLink',
  'generateProductInquiryLink',
  'generateServiceInquiryLink',
  'buildWaMeUrl'
];
