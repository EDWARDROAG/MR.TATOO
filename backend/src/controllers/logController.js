/**
 * ============================================================
 * ARCHIVO: logController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Controlador HTTP — endpoints de log.
 *
 * FUNCIONES / API (contrato exporta):
 *   getLogs, getLogStats
 *
 * DEPENDENCIAS CLAVE:
 *   Log
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

const Log = require('../models/Log');

const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, usuario_id, accion, fecha_desde, fecha_hasta } = req.query;
    const result = await Log.findAll(
      { usuario_id, accion, fecha_desde, fecha_hasta },
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener logs' });
  }
};

const getLogStats = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const by_action = await Log.getStatsByAction(fecha_desde, fecha_hasta);
    const total = await Log.getTotalCount();

    res.json({
      success: true,
      data: { by_action, total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas de logs' });
  }
};

module.exports = {
  getLogs,
  getLogStats,
};
