/**
 * ============================================================
 * ARCHIVO: equipmentController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   API recepción reparación y venta de equipo (HU-022 / HU-023).
 *
 * FUNCIONES / API (contrato exporta):
 *   TIPOS, listReceptions, createReception, getReception,
 *   downloadReceptionPdf, listSales, createSale, getSale, downloadSalePdf
 *
 * DEPENDENCIAS CLAVE:
 *   EquipmentDocument, equipmentDocGenerator, logger
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: equipmentRoutes
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

const fs = require('fs');
const EquipmentDocument = require('../models/EquipmentDocument');
const {
  generateReceptionPdf,
  generateEquipmentSalePdf,
} = require('../utils/equipmentDocGenerator');
const { logger } = require('../utils/logger');

const TIPOS = [
  'computador',
  'portatil',
  'impresora',
  'pc_gamer',
  'celular',
  'tablet',
  'otro',
];

const UNLOCK_TIPOS = ['ninguno', 'patron', 'pin', 'password'];

const validateClientEquipment = (body, { requireDamage = false, requirePrice = false } = {}) => {
  const errors = [];
  if (!body.tipo_equipo || !TIPOS.includes(body.tipo_equipo)) {
    errors.push('tipo_equipo inválido');
  }
  if (!body.objeto_descripcion?.trim()) errors.push('objeto_descripcion requerido');
  if (!body.cliente_nombre?.trim()) errors.push('cliente_nombre requerido');
  if (!body.cliente_telefono?.trim()) errors.push('cliente_telefono requerido');
  if (requireDamage && !body.descripcion_dano?.trim()) errors.push('descripcion_dano requerido');
  if (requirePrice) {
    const precio = Number(body.precio);
    if (Number.isNaN(precio) || precio < 0) errors.push('precio inválido');
    if (!body.metodo_pago?.trim()) errors.push('metodo_pago requerido');
  }
  if (requireDamage) {
    const unlockTipo = body.unlock_tipo || 'ninguno';
    if (!UNLOCK_TIPOS.includes(unlockTipo)) {
      errors.push('unlock_tipo inválido');
    } else if (unlockTipo === 'pin' && !String(body.unlock_valor || '').trim()) {
      errors.push('PIN requerido');
    } else if (unlockTipo === 'password' && !String(body.unlock_valor || '').trim()) {
      errors.push('Contraseña requerida');
    } else if (unlockTipo === 'patron') {
      const patron = Array.isArray(body.unlock_patron) ? body.unlock_patron : [];
      if (patron.length < 4) errors.push('El patrón debe tener al menos 4 puntos');
    }
    if (!body.acepta_condiciones) {
      errors.push('Debe confirmar que el cliente leyó las condiciones');
    }
  }
  return errors;
};

const listReceptions = async (req, res) => {
  try {
    const items = await EquipmentDocument.listReceptions();
    return res.json({ success: true, data: items, total: items.length });
  } catch (error) {
    logger.error(`listReceptions: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al listar recepciones' });
  }
};

const createReception = async (req, res) => {
  try {
    const errors = validateClientEquipment(req.body, { requireDamage: true });
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join('; ') });
    }
    const row = await EquipmentDocument.createReception({
      ...req.body,
      unlock_tipo: req.body.unlock_tipo || 'ninguno',
      unlock_valor: req.body.unlock_valor || '',
      unlock_patron: req.body.unlock_patron || null,
      usuario_id: req.user.id,
    });
    const full = await EquipmentDocument.findReceptionById(row.id);
    return res.status(201).json({ success: true, data: full });
  } catch (error) {
    logger.error(`createReception: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al crear recepción' });
  }
};

const getReception = async (req, res) => {
  try {
    const row = await EquipmentDocument.findReceptionById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Recepción no encontrada' });
    return res.json({ success: true, data: row });
  } catch (error) {
    logger.error(`getReception: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al obtener recepción' });
  }
};

const downloadReceptionPdf = async (req, res) => {
  try {
    const row = await EquipmentDocument.findReceptionById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Recepción no encontrada' });
    const filePath = await generateReceptionPdf(row);
    res.download(filePath, `${row.folio}.pdf`, (err) => {
      fs.unlink(filePath, () => {});
      if (err) logger.error(`downloadReceptionPdf: ${err.message}`);
    });
  } catch (error) {
    logger.error(`downloadReceptionPdf: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al generar PDF' });
  }
};

const listSales = async (req, res) => {
  try {
    const items = await EquipmentDocument.listSales();
    return res.json({ success: true, data: items, total: items.length });
  } catch (error) {
    logger.error(`listEquipmentSales: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al listar ventas de equipo' });
  }
};

const createSale = async (req, res) => {
  try {
    const errors = validateClientEquipment(req.body, { requirePrice: true });
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join('; ') });
    }
    const row = await EquipmentDocument.createSale({
      ...req.body,
      precio: Number(req.body.precio),
      usuario_id: req.user.id,
    });
    const full = await EquipmentDocument.findSaleById(row.id);
    return res.status(201).json({ success: true, data: full });
  } catch (error) {
    logger.error(`createEquipmentSale: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al crear venta de equipo' });
  }
};

const getSale = async (req, res) => {
  try {
    const row = await EquipmentDocument.findSaleById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    return res.json({ success: true, data: row });
  } catch (error) {
    logger.error(`getEquipmentSale: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al obtener venta' });
  }
};

const downloadSalePdf = async (req, res) => {
  try {
    const row = await EquipmentDocument.findSaleById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    const filePath = await generateEquipmentSalePdf(row);
    res.download(filePath, `${row.folio}.pdf`, (err) => {
      fs.unlink(filePath, () => {});
      if (err) logger.error(`downloadSalePdf: ${err.message}`);
    });
  } catch (error) {
    logger.error(`downloadSalePdf: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error al generar PDF' });
  }
};

module.exports = {
  TIPOS,
  listReceptions,
  createReception,
  getReception,
  downloadReceptionPdf,
  listSales,
  createSale,
  getSale,
  downloadSalePdf,
};
