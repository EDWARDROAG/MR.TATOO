/**
 * ============================================================
 * ARCHIVO: backupRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — backupRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   backupController, authMiddleware, roleMiddleware
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

const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

/* ========================================================================== */
/*  RUTAS DE BACKUPS (SOLO ADMINISTRADORES)                                   */
/* ========================================================================== */

/**
 * @route   POST /api/backup/create
 * @desc    Crear un nuevo backup completo
 * @access  Private (Admin)
 * @body    { include_uploads (boolean) }
 * @returns { filename, path, size, created_at }
 */
router.post(
    '/create',
    authMiddleware,
    isAdmin,
    backupController.createBackup
);

/**
 * @route   GET /api/backup/list
 * @desc    Listar todos los backups disponibles
 * @access  Private (Admin)
 * @returns { backups, total }
 */
router.get(
    '/list',
    authMiddleware,
    isAdmin,
    backupController.listBackups
);

/**
 * @route   GET /api/backup/download/:filename
 * @desc    Descargar un backup específico
 * @access  Private (Admin)
 * @param   { filename }
 * @returns { file (SQL) }
 */
router.get(
    '/download/:filename',
    authMiddleware,
    isAdmin,
    backupController.downloadBackup
);

/**
 * @route   POST /api/backup/restore
 * @desc    Restaurar un backup (base de datos)
 * @access  Private (Admin)
 * @body    { filename, restore_uploads (boolean) }
 * @returns { message }
 */
router.post(
    '/restore',
    authMiddleware,
    isAdmin,
    backupController.restoreBackup
);

/**
 * @route   DELETE /api/backup/delete/:filename
 * @desc    Eliminar un backup específico
 * @access  Private (Admin)
 * @param   { filename }
 * @returns { message }
 */
router.delete(
    '/delete/:filename',
    authMiddleware,
    isAdmin,
    backupController.deleteBackup
);

/**
 * @route   DELETE /api/backup/clean
 * @desc    Limpiar backups antiguos (retención configurable)
 * @access  Private (Admin)
 * @query   { days (retención en días, default 30) }
 * @returns { deleted_count, retention_days }
 */
router.delete(
    '/clean',
    authMiddleware,
    isAdmin,
    backupController.cleanOldBackups
);

/**
 * @route   GET /api/backup/info/:filename
 * @desc    Obtener información detallada de un backup
 * @access  Private (Admin)
 * @param   { filename }
 * @returns { filename, size, created_at, preview }
 */
router.get(
    '/info/:filename',
    authMiddleware,
    isAdmin,
    backupController.getBackupInfo
);

/**
 * @route   POST /api/backup/schedule
 * @desc    Configurar backup automático programado
 * @access  Private (Admin)
 * @body    { enabled, time, retention_days }
 * @returns { config }
 */
router.post(
    '/schedule',
    authMiddleware,
    isAdmin,
    backupController.scheduleAutoBackup
);

/**
 * @route   GET /api/backup/config
 * @desc    Obtener configuración actual de backups
 * @access  Private (Admin)
 * @returns { enabled, time, retention_days, last_backup }
 */
router.get(
    '/config',
    authMiddleware,
    isAdmin,
    backupController.getBackupConfig
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;