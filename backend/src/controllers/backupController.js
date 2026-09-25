/**
 * ============================================================
 * ARCHIVO: backupController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Controlador HTTP — endpoints de backup.
 *
 * FUNCIONES / API (contrato exporta):
 *   createBackup, listBackups, downloadBackup, restoreBackup, deleteBackup,
 *   cleanOldBackups, getBackupInfo, scheduleAutoBackup, getBackupConfig
 *
 * DEPENDENCIAS CLAVE:
 *   backupManager, Log
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

const backupManager = require('../utils/backupManager');
const Log = require('../models/Log');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.resolve(__dirname, '../../backups/database');
const SAFE_BACKUP_NAME = /^[a-zA-Z0-9._-]+\.(sql|gz|zip|json)$/;

/** Resuelve filename seguro dentro de backups/database (anti path traversal). */
function resolveSafeBackupPath(filename) {
    const base = path.basename(String(filename || ''));
    if (!SAFE_BACKUP_NAME.test(base)) {
        return null;
    }
    const full = path.resolve(BACKUP_DIR, base);
    const rootWithSep = BACKUP_DIR.endsWith(path.sep) ? BACKUP_DIR : BACKUP_DIR + path.sep;
    if (full !== BACKUP_DIR && !full.startsWith(rootWithSep)) {
        return null;
    }
    return { filename: base, fullPath: full };
}

/* ========================================================================== */
/*  CREAR BACKUP COMPLETO                                                     */
/* ========================================================================== */

const createBackup = async (req, res) => {
    try {
        const { include_uploads = true } = req.body;
        
        // Registrar inicio del backup en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'INICIAR_BACKUP',
            detalle: `Creando backup - Incluir archivos: ${include_uploads}`
        });
        
        // Crear backup
        const backupResult = await backupManager.createFullBackup(include_uploads);
        
        // Registrar éxito en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'BACKUP_COMPLETADO',
            detalle: `Backup creado: ${backupResult.filename} - Tamaño: ${backupResult.size}`
        });
        
        res.status(201).json({
            success: true,
            message: 'Backup creado exitosamente',
            data: {
                filename: backupResult.filename,
                path: backupResult.path,
                size: backupResult.size,
                created_at: backupResult.created_at,
                include_uploads: include_uploads
            }
        });
        
    } catch (error) {
        console.error('Error en createBackup:', error);
        
        // Registrar error en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'BACKUP_ERROR',
            detalle: `Error al crear backup: ${error.message}`
        });
        
        res.status(500).json({
            success: false,
            message: 'Error al crear el backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  LISTAR BACKUPS DISPONIBLES                                                */
/* ========================================================================== */

const listBackups = async (req, res) => {
    try {
        const backups = await backupManager.listBackups();
        
        res.status(200).json({
            success: true,
            data: backups,
            total: backups.length
        });
        
    } catch (error) {
        console.error('Error en listBackups:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar los backups',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  DESCARGAR BACKUP                                                          */
/* ========================================================================== */

const downloadBackup = async (req, res) => {
    try {
        const resolved = resolveSafeBackupPath(req.params.filename);
        if (!resolved) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de backup inválido'
            });
        }
        const { filename, fullPath: backupPath } = resolved;
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup no encontrado'
            });
        }
        
        await Log.create({
            usuario_id: req.user.id,
            accion: 'DESCARGAR_BACKUP',
            detalle: `Backup descargado: ${filename}`
        });
        
        res.download(backupPath, filename, (err) => {
            if (err) {
                console.error('Error al descargar backup:', err);
                if (!res.headersSent) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error al descargar el backup'
                    });
                }
            }
        });
        
    } catch (error) {
        console.error('Error en downloadBackup:', error);
        res.status(500).json({
            success: false,
            message: 'Error al descargar el backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  RESTAURAR BACKUP                                                          */
/* ========================================================================== */

const restoreBackup = async (req, res) => {
    return res.status(501).json({
        success: false,
        message: 'Restaurar backup desde la API está deshabilitado por seguridad (HU-036). Usa restore manual en el servidor con un procedimiento documentado.'
    });
};

/* ========================================================================== */
/*  ELIMINAR BACKUP                                                           */
/* ========================================================================== */

const deleteBackup = async (req, res) => {
    try {
        const resolved = resolveSafeBackupPath(req.params.filename);
        if (!resolved) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de backup inválido'
            });
        }
        const { filename, fullPath: backupPath } = resolved;
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup no encontrado'
            });
        }
        
        const stats = fs.statSync(backupPath);
        fs.unlinkSync(backupPath);
        
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_BACKUP',
            detalle: `Backup eliminado: ${filename} (Tamaño: ${stats.size} bytes)`
        });
        
        res.status(200).json({
            success: true,
            message: 'Backup eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error en deleteBackup:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  LIMPIAR BACKUPS ANTIGUOS                                                  */
/* ========================================================================== */

const cleanOldBackups = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const deletedCount = await backupManager.cleanOldBackups(parseInt(days));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'LIMPIAR_BACKUPS',
            detalle: `${deletedCount} backups eliminados (retención: ${days} días)`
        });
        
        res.status(200).json({
            success: true,
            message: `${deletedCount} backups antiguos eliminados`,
            data: {
                deleted_count: deletedCount,
                retention_days: parseInt(days)
            }
        });
        
    } catch (error) {
        console.error('Error en cleanOldBackups:', error);
        res.status(500).json({
            success: false,
            message: 'Error al limpiar backups antiguos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER INFORMACIÓN DE BACKUP                                             */
/* ========================================================================== */

const getBackupInfo = async (req, res) => {
    try {
        const resolved = resolveSafeBackupPath(req.params.filename);
        if (!resolved) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de backup inválido'
            });
        }
        const { filename, fullPath: backupPath } = resolved;
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                message: 'Backup no encontrado'
            });
        }
        
        const stats = fs.statSync(backupPath);
        
        const content = fs.readFileSync(backupPath, 'utf8');
        const lines = content.split('\n').slice(0, 20);
        
        res.status(200).json({
            success: true,
            data: {
                filename: filename,
                size: stats.size,
                size_formatted: backupManager.formatBytes(stats.size),
                created_at: stats.birthtime,
                modified_at: stats.mtime,
                preview: lines
            }
        });
        
    } catch (error) {
        console.error('Error en getBackupInfo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  PROGRAMAR BACKUP AUTOMÁTICO                                               */
/* ========================================================================== */

const scheduleAutoBackup = async (req, res) => {
    return res.status(501).json({
        success: false,
        message: 'El schedule de backup automático no está implementado (no hay cron runner). Configúralo en el host o usa create manual (HU-036).'
    });
};

/* ========================================================================== */
/*  OBTENER CONFIGURACIÓN DE BACKUP                                           */
/* ========================================================================== */

const getBackupConfig = async (req, res) => {
    try {
        const configPath = path.join(__dirname, '../../backups/backup_config.json');
        
        let config = {
            enabled: true,
            time: '02:00',
            retention_days: 30,
            last_backup: null
        };
        
        if (fs.existsSync(configPath)) {
            const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config = { ...config, ...fileConfig };
        }
        
        // Obtener último backup
        const backups = await backupManager.listBackups();
        if (backups.length > 0) {
            config.last_backup = backups[0].created_at;
            config.last_backup_size = backups[0].size;
        }
        
        res.status(200).json({
            success: true,
            data: config
        });
        
    } catch (error) {
        console.error('Error en getBackupConfig:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración de backup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  EXPORTAR CONTROLADORES                                                    */
/* ========================================================================== */

module.exports = {
    createBackup,
    listBackups,
    downloadBackup,
    restoreBackup,
    deleteBackup,
    cleanOldBackups,
    getBackupInfo,
    scheduleAutoBackup,
    getBackupConfig
};