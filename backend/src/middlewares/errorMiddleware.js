/**
 * ============================================================
 * ARCHIVO: errorMiddleware.js
 * UBICACIÓN: backend/src/middlewares/
 * ROL: middleware
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Middleware Express — errorMiddleware.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   errorMiddleware
 *
 * DEPENDENCIAS CLAVE:
 *   —
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

const winston = require('winston');
const path = require('path');

/* ========================================================================== */
/*  CONFIGURACIÓN DE LOGGER                                                   */
/* ========================================================================== */

const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/access.log')
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

/* ========================================================================== */
/*  MIDDLEWARE DE ERRORES                                                     */
/* ========================================================================== */

const errorMiddleware = (err, req, res, next) => {
    // Loggear error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    
    // Determinar código de estado
    const statusCode = err.statusCode || 500;
    
    // Construir respuesta
    const response = {
        success: false,
        message: err.message || 'Error interno del servidor',
        timestamp: new Date().toISOString()
    };
    
    // En desarrollo, incluir stack trace
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }
    
    res.status(statusCode).json(response);
};

module.exports = { errorMiddleware };