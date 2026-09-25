/**
 * ============================================================
 * ARCHIVO: invoiceGenerator.js
 * UBICACIÓN: backend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Ticket PDF térmico 80mm — ventas POS CoreX (HU-043 / HU-051).
 *
 * FUNCIONES / API (contrato exporta):
 *   generateInvoice, generateInvoiceHTML, resolveBusiness, formatPrice,
 *   formatDate
 *
 * DEPENDENCIAS CLAVE:
 *   Setting
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: saleController
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

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Setting = require('../models/Setting');

const PAGE_WIDTH = 226;
const MARGIN = 8;
const CONTENT_W = PAGE_WIDTH - MARGIN * 2;

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const formatDate = (date) =>
  new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const sep = (doc) => {
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .lineWidth(1.2)
    .strokeColor('#000')
    .stroke();
  doc.moveDown(0.35);
};

const estimateHeight = (itemCount, business) => {
  const extra = business.nit ? 12 : 0;
  const h = 120 + 55 + Math.max(itemCount, 1) * 36 + 130 + MARGIN * 2 + extra;
  return Math.max(h, 220);
};

async function resolveBusiness() {
  const fallback = {
    name: process.env.BUSINESS_NAME || 'CoreX',
    tagline: process.env.BUSINESS_TAGLINE || 'Servicios Tecnológicos',
    phone: process.env.WHATSAPP_NUMBER || process.env.VITE_WHATSAPP_PHONE || '',
    email: process.env.BUSINESS_EMAIL || '',
    nit: '',
    address: '',
  };
  try {
    const site = await Setting.getSite();
    const g = site?.general || {};
    const contact = site?.contact || {};
    return {
      name: g.site_name || fallback.name,
      tagline: g.site_description || fallback.tagline,
      phone: contact.phone || g.contact_phone || fallback.phone,
      email: g.contact_email || fallback.email,
      nit: g.nit || '',
      address: [g.address, g.city].filter(Boolean).join(', ') || '',
    };
  } catch (_) {
    return fallback;
  }
}

const generateInvoice = async (sale) => {
  const business = await resolveBusiness();

  return new Promise((resolve, reject) => {
    try {
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const invoiceNo = sale.factura_numero ?? sale.id ?? 'S/N';
      const items = sale.items || [];
      const pageHeight = estimateHeight(items.length, business);
      const filepath = path.join(tempDir, `invoice_${invoiceNo}_${Date.now()}.pdf`);

      const doc = new PDFDocument({
        size: [PAGE_WIDTH, pageHeight],
        margin: MARGIN,
        autoFirstPage: true,
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      doc.fillColor('#000');
      doc.font('Helvetica-Bold').fontSize(11).text('RECIBO DE VENTA', { align: 'center' });
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').fontSize(12).text(business.name, { align: 'center' });
      if (business.tagline) {
        doc.font('Helvetica').fontSize(7).text(business.tagline, { align: 'center' });
      }
      if (business.nit) {
        doc.font('Helvetica-Bold').fontSize(8).text(`NIT: ${business.nit}`, { align: 'center' });
      }
      if (business.phone) {
        doc.font('Helvetica-Bold').fontSize(8).text(`Tel: ${business.phone}`, { align: 'center' });
      }
      if (business.email) {
        doc.font('Helvetica').fontSize(7).text(business.email, { align: 'center' });
      }
      if (business.address) {
        doc.font('Helvetica').fontSize(6).text(business.address, { align: 'center' });
      }
      doc.moveDown(0.35);
      sep(doc);

      doc.font('Helvetica-Bold').fontSize(9).text(`Factura: ${invoiceNo}`, { align: 'left' });
      doc.font('Helvetica').fontSize(8).text(`Fecha: ${formatDate(sale.fecha_venta)}`);
      doc.font('Helvetica').fontSize(8).text(`Vendedor: ${sale.vendedor_nombre || 'N/A'}`);
      if (sale.cliente_nombre) {
        doc.font('Helvetica').fontSize(8).text(`Cliente: ${sale.cliente_nombre}`);
      }
      if (sale.cliente_telefono) {
        doc.font('Helvetica').fontSize(8).text(`Teléfono: ${sale.cliente_telefono}`);
      }
      doc.moveDown(0.3);
      sep(doc);

      if (!items.length) {
        doc.font('Helvetica').fontSize(8).text('Sin productos', { align: 'center' });
      } else {
        for (const item of items) {
          let name = item.producto_nombre || `Producto #${item.producto_id}`;
          if (name.length > 36) name = `${name.slice(0, 33)}...`;

          const qty = Number(item.cantidad) || 0;
          const unit = Number(item.precio_unitario) || 0;
          const sub = Number(item.subtotal) || unit * qty;

          doc.font('Helvetica-Bold').fontSize(8).text(name, MARGIN, doc.y, {
            width: CONTENT_W,
            lineBreak: true,
          });
          doc.font('Helvetica').fontSize(8).text(`${qty} x ${formatPrice(unit)}`, MARGIN, doc.y, {
            width: CONTENT_W / 2,
            continued: true,
          });
          doc.text(formatPrice(sub), { align: 'right' });
          doc.moveDown(0.3);
        }
      }

      sep(doc);

      const pago = String(sale.metodo_pago || '').toUpperCase();
      doc.font('Helvetica').fontSize(8).text(`Pago: ${pago}`);
      doc.font('Helvetica-Bold').fontSize(11).text(`Valor venta: ${formatPrice(sale.total)}`, {
        align: 'center',
      });
      doc.moveDown(0.25);
      sep(doc);

      doc.font('Helvetica').fontSize(9).text('Gracias por su compra', { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    } catch (error) {
      console.error('Error al generar factura PDF:', error);
      reject(error);
    }
  });
};

const generateInvoiceHTML = async (sale) => {
  const business = await resolveBusiness();
  const invoiceNo = sale.factura_numero ?? sale.id ?? 'S/N';
  const itemsHtml = (sale.items || [])
    .map(
      (item) => `
        <tr>
            <td style="padding:4px;font-weight:700">${item.producto_nombre || `Producto #${item.producto_id}`}</td>
            <td style="padding:4px;text-align:center;font-weight:700">${item.cantidad}</td>
            <td style="padding:4px;text-align:right;font-weight:700">${formatPrice(item.precio_unitario)}</td>
            <td style="padding:4px;text-align:right;font-weight:700">${formatPrice(item.subtotal)}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Recibo ${invoiceNo}</title>
<style>
body{font-family:"Courier New",monospace;width:80mm;margin:0 auto;padding:8px}
.sep{border-top:1px dashed #000;margin:8px 0}
.title{font-size:14px;text-align:center;font-weight:700}
table{width:100%;font-size:11px;border-collapse:collapse}
.footer{text-align:center;margin-top:10px}
</style></head><body>
<div class="title">RECIBO DE VENTA<br>${business.name}
${business.nit ? `<br><small>NIT: ${business.nit}</small>` : ''}
${business.phone ? `<br><small>Tel: ${business.phone}</small>` : ''}
</div>
<div class="sep"></div>
<p>Factura: ${invoiceNo}<br>Fecha: ${formatDate(sale.fecha_venta)}
${sale.cliente_nombre ? `<br>Cliente: ${sale.cliente_nombre}` : ''}</p>
<div class="sep"></div>
<table><thead><tr><th>Producto</th><th>Cant</th><th>P/U</th><th>Total</th></tr></thead>
<tbody>${itemsHtml}</tbody></table>
<div class="sep"></div>
<p style="text-align:center;font-weight:700">Valor venta: ${formatPrice(sale.total)}</p>
<div class="sep"></div>
<div class="footer">Pago: ${String(sale.metodo_pago || '').toUpperCase()}<br>Gracias por su compra</div>
</body></html>`;
};

module.exports = {
  generateInvoice,
  generateInvoiceHTML,
  resolveBusiness,
  formatPrice,
  formatDate,
};
