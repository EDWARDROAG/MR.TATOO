/**
 * ============================================================
 * ARCHIVO: emailService.js
 * UBICACIÓN: backend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — emailService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   sendRecoveryEmail
 *
 * DEPENDENCIAS CLAVE:
 *   logger
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

const { logger } = require('../utils/logger');

const sendRecoveryEmail = async (email, resetUrl) => {
  logger.info(`[emailService] Recuperación de contraseña para ${email}: ${resetUrl}`);
  return { success: true };
};

module.exports = {
  sendRecoveryEmail,
};
