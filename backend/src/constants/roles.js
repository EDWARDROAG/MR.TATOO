/**
 * ============================================================
 * ARCHIVO: roles.js
 * UBICACIÓN: backend/src/constants/
 * ROL: constants
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Constantes de roles CoreX (HU-052).
 *
 * FUNCIONES / API (contrato exporta):
 *   ROLES, isStaffAdmin
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: roleMiddleware, superAdmin.service, userController,
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

const ROLES = Object.freeze({
  ADMIN: 'admin',
  CAJERO: 'cajero',
  SUPER_ADMIN: 'super_admin',
});

/** Admin de negocio o super Lamakinet */
function isStaffAdmin(role) {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

module.exports = { ROLES, isStaffAdmin };
