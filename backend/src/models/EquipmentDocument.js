/**
 * ============================================================
 * ARCHIVO: EquipmentDocument.js
 * UBICACIÓN: backend/src/models/
 * ROL: model
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Recepción reparación (HU-022) y venta de equipo (HU-023).
 *
 * FUNCIONES / API (contrato exporta):
 *   DEFAULT_AVISO_30, createReception, listReceptions, findReceptionById,
 *   createSale, listSales, findSaleById
 *
 * DEPENDENCIAS CLAVE:
 *   database
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

const { query } = require('../config/database');

const DEFAULT_AVISO_30 =
  'El cliente declara haber dejado el equipo descrito en este documento. ' +
  'Transcurridos treinta (30) días calendario desde la fecha de recepción sin que el equipo sea reclamado, ' +
  'CoreX Technologies podrá disponer del mismo conforme a su política interna, ' +
  'sin responsabilidad adicional frente al cliente.';

const pad = (n) => String(n).padStart(4, '0');

const nextFolio = async (prefix, table) => {
  const day = new Date();
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, '0');
  const d = String(day.getDate()).padStart(2, '0');
  const stamp = `${y}${m}${d}`;
  const like = `${prefix}-${stamp}-%`;
  const result = await query(
    `SELECT folio FROM ${table} WHERE folio LIKE $1 ORDER BY folio DESC LIMIT 1`,
    [like]
  );
  let seq = 1;
  if (result.rows[0]?.folio) {
    const parts = result.rows[0].folio.split('-');
    const last = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(last)) seq = last + 1;
  }
  return `${prefix}-${stamp}-${pad(seq)}`;
};

const createReception = async (data) => {
  const folio = await nextFolio('REC', 'equipment_receptions');
  const aviso = data.aviso_30_dias || DEFAULT_AVISO_30;
  const unlockTipo = data.unlock_tipo || 'ninguno';
  const unlockValor = data.unlock_valor || '';
  const unlockPatron =
    unlockTipo === 'patron' && Array.isArray(data.unlock_patron)
      ? JSON.stringify(data.unlock_patron)
      : null;

  const result = await query(
    `INSERT INTO equipment_receptions (
      folio, tipo_equipo, objeto_descripcion, numero_serie, descripcion_dano,
      cliente_nombre, cliente_telefono, cliente_documento, cliente_email, cliente_direccion,
      estado, aviso_30_dias, usuario_id,
      unlock_tipo, unlock_valor, unlock_patron,
      fecha_notificacion, fecha_entrega,
      acc_bateria, acc_cargador, acc_disco_gb, acc_ram_gb,
      valor_estimado, acepta_condiciones
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'recibido',$11,$12,$13,$14,$15::jsonb,
      $16,$17,$18,$19,$20,$21,$22,$23
    )
    RETURNING *`,
    [
      folio,
      data.tipo_equipo,
      data.objeto_descripcion,
      data.numero_serie || '',
      data.descripcion_dano,
      data.cliente_nombre,
      data.cliente_telefono,
      data.cliente_documento || '',
      data.cliente_email || '',
      data.cliente_direccion || '',
      aviso,
      data.usuario_id,
      unlockTipo,
      unlockValor,
      unlockPatron,
      data.fecha_notificacion || null,
      data.fecha_entrega || null,
      !!data.acc_bateria,
      !!data.acc_cargador,
      data.acc_disco_gb || '',
      data.acc_ram_gb || '',
      data.valor_estimado != null && data.valor_estimado !== ''
        ? Number(data.valor_estimado)
        : null,
      !!data.acepta_condiciones,
    ]
  );
  return result.rows[0];
};

const listReceptions = async (limit = 100) => {
  const result = await query(
    `SELECT r.*, u.nombre AS registrado_por
     FROM equipment_receptions r
     LEFT JOIN users u ON u.id = r.usuario_id
     ORDER BY r.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const findReceptionById = async (id) => {
  const result = await query(
    `SELECT r.*, u.nombre AS registrado_por
     FROM equipment_receptions r
     LEFT JOIN users u ON u.id = r.usuario_id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0];
};

const createSale = async (data) => {
  const folio = await nextFolio('VTA', 'equipment_sales');
  const result = await query(
    `INSERT INTO equipment_sales (
      folio, tipo_equipo, objeto_descripcion, numero_serie, precio, metodo_pago,
      observaciones, garantia_texto,
      cliente_nombre, cliente_telefono, cliente_documento, cliente_email, usuario_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      folio,
      data.tipo_equipo,
      data.objeto_descripcion,
      data.numero_serie || '',
      data.precio,
      data.metodo_pago,
      data.observaciones || '',
      data.garantia_texto || '',
      data.cliente_nombre,
      data.cliente_telefono,
      data.cliente_documento || '',
      data.cliente_email || '',
      data.usuario_id,
    ]
  );
  return result.rows[0];
};

const listSales = async (limit = 100) => {
  const result = await query(
    `SELECT s.*, u.nombre AS registrado_por
     FROM equipment_sales s
     LEFT JOIN users u ON u.id = s.usuario_id
     ORDER BY s.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const findSaleById = async (id) => {
  const result = await query(
    `SELECT s.*, u.nombre AS registrado_por
     FROM equipment_sales s
     LEFT JOIN users u ON u.id = s.usuario_id
     WHERE s.id = $1`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  DEFAULT_AVISO_30,
  createReception,
  listReceptions,
  findReceptionById,
  createSale,
  listSales,
  findSaleById,
};
