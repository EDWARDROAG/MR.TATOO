/**
 * ============================================================
 * ARCHIVO: equipmentDocGenerator.js
 * UBICACIÓN: backend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   PDF comprobantes — recepción (2 copias en Letter) y venta equipo.
 *
 * FUNCIONES / API (contrato exporta):
 *   generateReceptionPdf, generateEquipmentSalePdf
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: equipmentController
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

const BUSINESS = {
  name: process.env.BUSINESS_NAME || 'CoreX Technologies',
  phone: process.env.WHATSAPP_NUMBER || '302 370 5751',
};

/** Letter = 612 × 792 pt; 5 mm ≈ 14.17 pt */
const MM = 2.834645669;
const MARGIN = 5 * MM;
const LETTER = { w: 612, h: 792 };
const HALF_H = LETTER.h / 2;
const NAVY = '#1e3a5f';
const NAVY_SOFT = '#e8eef5';
const LINE = '#94a3b8';

const ensureTempDir = () => {
  const dir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const formatDateParts = (value) => {
  const d = value ? new Date(value) : new Date();
  const fecha = d.toLocaleDateString('es-CO', { timeZone: 'America/Bogota' });
  const hora = d.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });
  return { fecha, hora };
};

const formatMoney = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
    Number(n) || 0
  );

const unlockTipoLabel = (tipo) => {
  switch (tipo) {
    case 'patron':
      return 'Patrón';
    case 'pin':
      return 'PIN';
    case 'password':
      return 'Contraseña';
    default:
      return 'Ninguno';
  }
};

const parsePatron = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(Number).filter((n) => n >= 0 && n <= 8);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => n >= 0 && n <= 8);
    } catch {
      return [];
    }
  }
  return [];
};

const clip = (text, max) => {
  const s = String(text ?? '—').replace(/\s+/g, ' ').trim() || '—';
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

const drawDashedRect = (doc, x, y, w, h) => {
  doc.save();
  doc.lineWidth(1).strokeColor(NAVY).dash(3, { space: 2 });
  doc.rect(x, y, w, h).stroke();
  doc.undash();
  doc.restore();
};

const drawSectionHeader = (doc, x, y, w, title) => {
  doc.save();
  doc.rect(x, y, w, 14).fill(NAVY);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(7).text(title, x + 4, y + 3.5, { width: w - 8 });
  doc.restore();
  return y + 14;
};

/** Línea compacta Label: valor */
const drawKv = (doc, x, y, w, label, value, maxLen = 42) => {
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(6.5).text(`${label}:`, x, y, { width: w, continued: false });
  const labelW = Math.min(doc.widthOfString(`${label}: `), w * 0.45);
  doc.fillColor('#111').font('Helvetica').fontSize(6.5).text(clip(value, maxLen), x + labelW, y, {
    width: w - labelW,
    lineBreak: false,
  });
  return y + 9;
};

/** Dibuja patrón 3×3 en (originX, originY) — tamaño fijo compacto */
const drawPatternPadAt = (doc, originX, originY, sequence, size = 58) => {
  const gap = size / 2;
  const r = 4;
  const centers = [];
  for (let i = 0; i < 9; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    centers.push({ x: originX + col * gap, y: originY + row * gap });
  }
  doc.save();
  if (sequence.length > 1) {
    doc.strokeColor(NAVY).lineWidth(1.8);
    doc.moveTo(centers[sequence[0]].x, centers[sequence[0]].y);
    for (let i = 1; i < sequence.length; i++) {
      doc.lineTo(centers[sequence[i]].x, centers[sequence[i]].y);
    }
    doc.stroke();
  }
  centers.forEach((c, idx) => {
    const used = sequence.includes(idx);
    doc.circle(c.x, c.y, r).fillAndStroke(used ? NAVY : '#fff', NAVY);
  });
  doc.restore();
};

/**
 * Dibuja una media carta (copia) de recepción dentro del recuadro en boxY.
 * @param {string} copyLabel — p.ej. 'COPIA CLIENTE' | 'COPIA COREX'
 */
const drawReceptionHalf = (doc, row, boxY, copyLabel) => {
  const boxX = MARGIN;
  const boxW = LETTER.w - 2 * MARGIN;
  const boxH = HALF_H - 2 * MARGIN;

  drawDashedRect(doc, boxX, boxY, boxW, boxH);

  const pad = 6;
  let y = boxY + pad;
  const innerX = boxX + pad;
  const innerW = boxW - 2 * pad;
  const gap = 5;
  const { fecha, hora } = formatDateParts(row.created_at);

  /* —— Cabecera —— */
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10).text(BUSINESS.name, innerX, y, {
    width: innerW * 0.55,
  });
  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#334155')
    .text(`Tel: ${BUSINESS.phone}`, innerX, y + 12, { width: innerW * 0.55 });

  /* Etiqueta de copia bajo el teléfono */
  const copyBadgeW = 92;
  doc.save();
  doc.roundedRect(innerX, y + 22, copyBadgeW, 11, 2).fill(NAVY);
  doc
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(5.5)
    .text(copyLabel, innerX, y + 24.5, { width: copyBadgeW, align: 'center' });
  doc.restore();

  const metaX = innerX + innerW * 0.58;
  const metaW = innerW * 0.42;
  doc.save();
  doc.roundedRect(metaX, y, metaW, 36, 3).strokeColor(NAVY).lineWidth(0.8).stroke();
  doc.restore();
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(6.5).text(`Fecha: ${fecha}`, metaX + 4, y + 4, {
    width: metaW - 8,
  });
  doc.font('Helvetica').fontSize(6.5).text(`Hora: ${hora}`, metaX + 4, y + 14, { width: metaW - 8 });
  doc.text(`Recibido por: ${clip(row.registrado_por || '—', 28)}`, metaX + 4, y + 24, {
    width: metaW - 8,
  });

  y += 40;
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8).text('COMPROBANTE DE RECEPCIÓN PARA REPARACIÓN', innerX, y, {
    width: innerW * 0.62,
  });
  const folioW = 150;
  const folioX = innerX + innerW - folioW;
  doc.save();
  doc.roundedRect(folioX, y - 2, folioW, 14, 7).fill(NAVY);
  doc.fillColor('#fff').fontSize(7).text(`Folio: ${row.folio}`, folioX, y + 1.5, {
    width: folioW,
    align: 'center',
  });
  doc.restore();

  y += 16;
  doc.moveTo(innerX, y).lineTo(innerX + innerW, y).strokeColor(LINE).lineWidth(0.5).stroke();
  y += 6;

  /* —— Tres columnas —— */
  const colW = (innerW - 2 * gap) / 3;
  const col1X = innerX;
  const col2X = innerX + colW + gap;
  const col3X = innerX + 2 * (colW + gap);
  const colTop = y;
  const colBodyH = 100;

  const drawColBox = (x) => {
    doc.save();
    doc.rect(x, colTop, colW, colBodyH).strokeColor(LINE).lineWidth(0.6).stroke();
    doc.restore();
  };
  drawColBox(col1X);
  drawColBox(col2X);
  drawColBox(col3X);

  let cy = drawSectionHeader(doc, col1X, colTop, colW, 'DATOS DEL CLIENTE');
  cy = drawKv(doc, col1X + 4, cy + 3, colW - 8, 'Nombre', row.cliente_nombre, 36);
  cy = drawKv(doc, col1X + 4, cy, colW - 8, 'Teléfono', row.cliente_telefono, 36);
  cy = drawKv(doc, col1X + 4, cy, colW - 8, 'Documento', row.cliente_documento, 36);
  cy = drawKv(doc, col1X + 4, cy, colW - 8, 'Email', row.cliente_email, 36);
  drawKv(doc, col1X + 4, cy, colW - 8, 'Dirección', row.cliente_direccion, 36);

  cy = drawSectionHeader(doc, col2X, colTop, colW, 'EQUIPO RECIBIDO');
  cy = drawKv(doc, col2X + 4, cy + 3, colW - 8, 'Tipo', row.tipo_equipo, 28);
  cy = drawKv(doc, col2X + 4, cy, colW - 8, 'Descripción', row.objeto_descripcion, 40);
  cy = drawKv(doc, col2X + 4, cy, colW - 8, 'N° serie', row.numero_serie || 'N/A', 28);
  cy = drawKv(doc, col2X + 4, cy, colW - 8, 'Daño / trabajo', row.descripcion_dano, 48);
  drawKv(doc, col2X + 4, cy, colW - 8, 'Estado', row.estado || 'recibido', 20);

  cy = drawSectionHeader(doc, col3X, colTop, colW, 'DESBLOQUEO DEL EQUIPO');
  const unlockTipo = row.unlock_tipo || 'ninguno';
  const textW = colW * 0.48;
  let uy = cy + 3;
  uy = drawKv(doc, col3X + 4, uy, textW - 4, 'Tipo', unlockTipoLabel(unlockTipo), 20);

  if (unlockTipo === 'pin' || unlockTipo === 'password') {
    uy = drawKv(
      doc,
      col3X + 4,
      uy,
      textW - 4,
      unlockTipo === 'pin' ? 'PIN' : 'Clave',
      row.unlock_valor || '—',
      24
    );
  } else if (unlockTipo === 'patron') {
    const seq = parsePatron(row.unlock_patron);
    uy = drawKv(
      doc,
      col3X + 4,
      uy,
      textW - 4,
      'Secuencia',
      row.unlock_valor || (seq.length ? seq.map((n) => n + 1).join('-') : '—'),
      28
    );
    const patternSize = 52;
    const px = col3X + colW - patternSize - 10;
    const py = colTop + 22;
    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(5.5)
      .text('Patrón', px, py - 8, { width: patternSize, align: 'center' });
    if (seq.length) {
      drawPatternPadAt(doc, px + 4, py, seq, patternSize - 8);
    }
  } else {
    doc.fillColor('#64748b').font('Helvetica').fontSize(6).text('Sin bloqueo registrado', col3X + 4, uy, {
      width: colW - 8,
    });
  }

  y = colTop + colBodyH + 4;

  /* —— Accesorios + fechas + valor —— */
  const accBits = [
    row.acc_bateria ? 'Batería' : null,
    row.acc_cargador ? 'Cargador' : null,
    row.acc_disco_gb ? `Disco ${row.acc_disco_gb} GB` : null,
    row.acc_ram_gb ? `RAM ${row.acc_ram_gb} GB` : null,
  ].filter(Boolean);
  y = drawKv(doc, innerX, y, innerW * 0.55, 'Accesorios', accBits.length ? accBits.join(' · ') : 'Ninguno', 70);
  drawKv(
    doc,
    innerX + innerW * 0.55,
    y - 9,
    innerW * 0.45,
    'Valor est.',
    row.valor_estimado != null ? formatMoney(row.valor_estimado) : '—',
    28
  );
  y = drawKv(
    doc,
    innerX,
    y,
    innerW * 0.5,
    'F. notificación',
    row.fecha_notificacion ? formatDateParts(row.fecha_notificacion).fecha : '—',
    24
  );
  drawKv(
    doc,
    innerX + innerW * 0.5,
    y - 9,
    innerW * 0.5,
    'F. entrega',
    row.fecha_entrega ? formatDateParts(row.fecha_entrega).fecha : '—',
    24
  );

  /* —— Aviso 30 días + firmas —— */
  const avisoText =
    row.aviso_30_dias ||
    'El cliente declara haber dejado el equipo descrito en este documento. Transcurridos treinta (30) días calendario desde la fecha de recepción sin que el equipo sea reclamado, CoreX Technologies podrá disponer del mismo conforme a su política interna, sin responsabilidad adicional frente al cliente.';
  const avisoH = 44;
  const blockW = innerW * 0.58;
  const firmX = innerX + blockW + gap;
  const firmW = innerW - blockW - gap;

  doc.save();
  doc.rect(innerX, y, blockW, avisoH).fill(NAVY_SOFT).strokeColor(LINE).stroke();
  doc.restore();
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(5.5).text('AVISO 30 DÍAS', innerX + 3, y + 2, {
    width: blockW - 6,
  });
  doc
    .fillColor('#1e293b')
    .font('Helvetica')
    .fontSize(4.7)
    .text(avisoText, innerX + 3, y + 10, {
      width: blockW - 6,
      height: avisoH - 12,
      align: 'justify',
    });

  doc.save();
  doc.rect(firmX, y, firmW, avisoH).strokeColor(LINE).lineWidth(0.6).stroke();
  doc.restore();
  doc.fillColor(NAVY).font('Helvetica').fontSize(5);
  doc.text('Firma quien recibe: ___________', firmX + 3, y + 5, { width: firmW - 6 });
  doc.text('Autoriza cliente*: ____________', firmX + 3, y + 16, { width: firmW - 6 });
  doc.text('Recibió cliente: ______________', firmX + 3, y + 27, { width: firmW - 6 });
  doc
    .fillColor('#64748b')
    .fontSize(4)
    .text(
      row.acepta_condiciones ? '* Leyó las condiciones de abajo.' : '* Pendiente aceptación condiciones.',
      firmX + 3,
      y + avisoH - 8,
      { width: firmW - 6 }
    );

  y += avisoH + 3;

  /* —— Condiciones —— */
  const condServicio = [
    '1. El cliente autoriza la intervención del equipo y se pactan los alcances por escrito al dejarlo.',
    '2. El cliente acepta la responsabilidad del origen de cualquier dispositivo dejado para revisión.',
    '3. El precio inicial de revisión puede variar si aparecen fallas secundarias; el cliente puede aceptar o rechazar reparaciones adicionales.',
    '4. Un equipo diagnosticado puede no ser reparable; no se garantiza devolverlo con los mismos síntomas si no estaba en condiciones de funcionar.',
    '5. Plazo de 30 días para retirar equipo reparado o en devolución; luego no hay responsabilidad por equipo abandonado.',
  ];
  const condVenta = [
    '1. El plazo de garantía se acuerda en la venta y consta por escrito en la factura.',
    '2. El producto puede llevar sellos de autenticidad; el cliente debe conservarlos durante la garantía.',
    '3. Para hacer efectiva la garantía: mínimo 3 días hábiles de validación y respuesta por el medio que elija el cliente.',
    '4. La garantía no cubre: humedades, golpes, recalentamiento por obstrucción de refrigeración, fallas de red eléctrica domiciliaria.',
    '5. El software no tiene garantía salvo acuerdo escrito distinto.',
  ];

  const boxBottom = boxY + boxH - 8;
  const maxCondBottom = boxBottom - 6;

  doc.save();
  doc.rect(innerX, y, innerW, 9).fill(NAVY);
  doc
    .fillColor('#fff')
    .font('Helvetica-Bold')
    .fontSize(5.2)
    .text('CONDICIONES DE SERVICIO TÉCNICO Y DE VENTA', innerX + 3, y + 2, {
      width: innerW - 6,
    });
  doc.restore();
  y += 10;

  const halfW = (innerW - gap) / 2;
  doc
    .fillColor(NAVY)
    .font('Helvetica-Bold')
    .fontSize(4.8)
    .text('CONDICIONES DE SERVICIO TÉCNICO', innerX, y, { width: halfW });
  doc
    .fillColor(NAVY)
    .font('Helvetica-Bold')
    .fontSize(4.8)
    .text('CONDICIONES DE VENTA', innerX + halfW + gap, y, { width: halfW });
  y += 6;

  doc.fillColor('#1e293b').font('Helvetica').fontSize(4.3);
  let leftY = y;
  let rightY = y;
  for (let i = 0; i < 5; i++) {
    if (leftY < maxCondBottom) {
      doc.text(condServicio[i], innerX, leftY, {
        width: halfW,
        align: 'left',
        lineGap: 0.5,
      });
      leftY = doc.y + 1.5;
    }
    if (rightY < maxCondBottom) {
      doc.text(condVenta[i], innerX + halfW + gap, rightY, {
        width: halfW,
        align: 'left',
        lineGap: 0.5,
      });
      rightY = doc.y + 1.5;
    }
  }

  const footLabel =
    copyLabel === 'COPIA COREX'
      ? 'ORDEN DE SERVICIO · COPIA COREX — archivo interno.'
      : 'ORDEN DE SERVICIO · COPIA CLIENTE — conservar.';
  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(4.8)
    .text(footLabel, innerX, boxBottom, {
      width: innerW,
      align: 'center',
    });
};

/**
 * Comprobante de recepción: 1 Letter = 2 medias cartas (cliente + CoreX).
 */
const generateReceptionPdf = (row) =>
  new Promise((resolve, reject) => {
    try {
      const dir = ensureTempDir();
      const filePath = path.join(dir, `recepcion_${row.folio}_${Date.now()}.pdf`);
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 0,
        autoFirstPage: true,
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      /* Mitad superior → cliente · mitad inferior → CoreX */
      drawReceptionHalf(doc, row, MARGIN, 'COPIA CLIENTE');
      drawReceptionHalf(doc, row, HALF_H + MARGIN, 'COPIA COREX');

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

const writeHeader = (doc, title, folio) => {
  doc.fontSize(16).text(BUSINESS.name, { align: 'center' });
  doc.fontSize(10).text(`Tel: ${BUSINESS.phone}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).text(title, { align: 'center' });
  doc.fontSize(11).text(`Folio: ${folio}`, { align: 'center' });
  doc.moveDown();
};

const writeKvLegacy = (doc, label, value) => {
  doc
    .fontSize(10)
    .text(`${label}: `, { continued: true, underline: false })
    .font('Helvetica-Bold')
    .text(String(value || '—'));
  doc.font('Helvetica');
};

const generateEquipmentSalePdf = (row) =>
  new Promise((resolve, reject) => {
    try {
      const dir = ensureTempDir();
      const filePath = path.join(dir, `venta_equipo_${row.folio}_${Date.now()}.pdf`);
      const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      writeHeader(doc, 'COMPROBANTE DE VENTA DE EQUIPO', row.folio);
      writeKvLegacy(doc, 'Fecha', formatDateParts(row.created_at).fecha + ' ' + formatDateParts(row.created_at).hora);
      writeKvLegacy(doc, 'Vendedor', row.registrado_por || '—');
      doc.moveDown(0.5);
      doc.fontSize(12).text('Datos del cliente', { underline: true });
      writeKvLegacy(doc, 'Nombre', row.cliente_nombre);
      writeKvLegacy(doc, 'Teléfono', row.cliente_telefono);
      writeKvLegacy(doc, 'Documento', row.cliente_documento);
      writeKvLegacy(doc, 'Email', row.cliente_email);
      doc.moveDown(0.5);
      doc.fontSize(12).text('Equipo vendido', { underline: true });
      writeKvLegacy(doc, 'Tipo', row.tipo_equipo);
      writeKvLegacy(doc, 'Descripción', row.objeto_descripcion);
      writeKvLegacy(doc, 'Número de serie', row.numero_serie || 'N/A');
      writeKvLegacy(doc, 'Precio', formatMoney(row.precio));
      writeKvLegacy(doc, 'Método de pago', row.metodo_pago);
      writeKvLegacy(doc, 'Garantía', row.garantia_texto);
      writeKvLegacy(doc, 'Observaciones', row.observaciones);
      doc.moveDown(2);
      doc.fontSize(10).text('Firma cliente: ________________________     Firma tienda: ________________________');
      doc.moveDown();
      doc.fontSize(8).fillColor('#666').text('Documento generado por CoreX Technologies — conservar una copia.', { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

module.exports = {
  generateReceptionPdf,
  generateEquipmentSalePdf,
};
