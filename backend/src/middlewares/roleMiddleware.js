/**
 * ============================================================
 * ARCHIVO: roleMiddleware.js
 * UBICACIÓN: backend/src/middlewares/
 * ROL: middleware
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Roles admin / cajero / super_admin (HU-052).
 *
 * FUNCIONES / API (contrato exporta):
 *   isAdmin, isCajero, checkRoles
 *
 * DEPENDENCIAS CLAVE:
 *   roles
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: routes/
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

const { ROLES, isStaffAdmin } = require('../constants/roles');

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado.',
    });
  }

  if (!isStaffAdmin(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de administrador.',
    });
  }

  next();
};

const isCajero = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado.',
    });
  }

  if (
    req.user.role !== ROLES.CAJERO &&
    req.user.role !== ROLES.ADMIN &&
    req.user.role !== ROLES.SUPER_ADMIN
  ) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de cajero.',
    });
  }

  next();
};

const checkRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado.',
      });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  isAdmin,
  isCajero,
  checkRoles,
};
