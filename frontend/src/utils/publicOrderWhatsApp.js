/**
 * ============================================================
 * ARCHIVO: publicOrderWhatsApp.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — publicOrderWhatsApp.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   buildPurchaseWhatsAppMessage
 *
 * DEPENDENCIAS CLAVE:
 *   formatters
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: CartPage
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

const money = (n) => currencyFormatter.formatSimple(n);

/**
 * @param {object} params
 * @param {Array} params.items
 * @param {object} params.totals
 * @param {object} params.billing
 */
export function buildPurchaseWhatsAppMessage({ items, totals, billing }) {
  let message = `*INTENCIÓN DE COMPRA — CoreX*\n\n`;
  message += `*Datos de facturación:*\n`;
  if (billing.nombre) message += `Nombre / razón social: ${billing.nombre}\n`;
  if (billing.documento) {
    message += `Documento: ${billing.tipoDocumento || 'CC'} ${billing.documento}\n`;
  }
  if (billing.telefono) message += `Teléfono: ${billing.telefono}\n`;
  if (billing.email) message += `Email: ${billing.email}\n`;
  if (billing.ciudad) message += `Ciudad: ${billing.ciudad}\n`;
  if (billing.direccion) message += `Dirección: ${billing.direccion}\n`;
  if (billing.notas) message += `Notas: ${billing.notas}\n`;

  message += `\n*Pedido:*\n`;
  (items || []).forEach((item, index) => {
    const name = item.nombre || item.name || 'Producto';
    const unit = Number(item.precio_unitario ?? item.price) || 0;
    const list = Number(item.precio_lista) || unit;
    const qty = item.quantity || 1;
    const line = unit * qty;
    message += `${index + 1}. ${name}\n`;
    message += `   Cantidad: ${qty}\n`;
    if (item.en_promocion && list > unit) {
      message += `   Precio lista: ${money(list)}\n`;
      message += `   Precio promo: ${money(unit)} (-${item.descuento_porcentaje || 0}%)\n`;
    } else {
      message += `   Precio: ${money(unit)}\n`;
    }
    message += `   Subtotal: ${money(line)}\n\n`;
  });

  if (totals?.descuento > 0) {
    message += `Subtotal lista: ${money(totals.subtotalLista)}\n`;
    message += `Descuentos: -${money(totals.descuento)}\n`;
  }
  message += `*TOTAL: ${money(totals?.total ?? 0)}*\n\n`;
  message += `Quiero concretar esta compra. ¿Me confirman disponibilidad y forma de pago?`;

  return message;
}
