/**
 * ============================================================
 * ARCHIVO: validationMiddleware.js
 * UBICACIÓN: backend/src/middlewares/
 * ROL: middleware
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Middleware Express — validationMiddleware.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   validateProductId, validateBulkPriceUpdate, validateUserUpdate,
 *   validateLogin, validateChangePassword, validateSaleId,
 *   validateCancelSale, validateCategoryId
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

const { body, param, query, validationResult } = require('express-validator');

/* ========================================================================== */
/*  MANEJADOR DE ERRORES DE VALIDACIÓN                                        */
/* ========================================================================== */

const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

/* ========================================================================== */
/*  VALIDACIONES PARA PRODUCTOS                                               */
/* ========================================================================== */

const validateProduct = [
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
        .trim()
        .escape(),

    body('descripcion')
        .optional({ values: 'falsy' })
        .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
        .trim()
        .escape(),

    body('precio')
        .notEmpty().withMessage('El precio es requerido')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
        .toFloat(),

    body('condicion')
        .notEmpty().withMessage('La condición es requerida')
        .isIn(['nuevo', 'segunda']).withMessage('La condición debe ser "nuevo" o "segunda"')
        .trim(),

    // FormData: categoría opcional (string vacío = sin categoría)
    body('categoria_id')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido')
        .toInt(),

    // FormData envía "true"/"false" (string) — isBoolean estricto falla (HU-058)
    body('destacado')
        .optional({ values: 'falsy' })
        .isBoolean({ loose: true }).withMessage('El campo destacado debe ser verdadero o falso')
        .toBoolean(),

    body('en_promocion')
        .optional({ values: 'falsy' })
        .isBoolean({ loose: true }).withMessage('El campo en_promocion debe ser verdadero o falso')
        .toBoolean(),

    validateResult
];

const validateProductId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID de producto inválido')
        .toInt(),
    validateResult
];

const validateBulkPriceUpdate = [
    body('percentage')
        .notEmpty().withMessage('El porcentaje es requerido')
        .isFloat({ min: -100, max: 100 }).withMessage('El porcentaje debe estar entre -100 y 100')
        .toFloat(),
    validateResult
];

/* ========================================================================== */
/*  VALIDACIONES PARA USUARIOS                                                */
/* ========================================================================== */

const validateUser = [
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .trim()
        .escape(),
    
    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('role')
        .notEmpty().withMessage('El rol es requerido')
        .isIn(['admin', 'cajero']).withMessage('El rol debe ser "admin" o "cajero"'),
    
    validateResult
];

const validateUserUpdate = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID de usuario inválido')
        .toInt(),
    
    body('nombre')
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .trim()
        .escape(),
    
    body('email')
        .optional()
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('role')
        .optional()
        .isIn(['admin', 'cajero']).withMessage('El rol debe ser "admin" o "cajero"'),
    
    validateResult
];

const validateLogin = [
    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),
    
    validateResult
];

const validateChangePassword = [
    body('currentPassword')
        .notEmpty().withMessage('La contraseña actual es requerida'),
    
    body('newPassword')
        .notEmpty().withMessage('La nueva contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    
    validateResult
];

/* ========================================================================== */
/*  VALIDACIONES PARA VENTAS                                                  */
/* ========================================================================== */

const validateSale = [
    body('items')
        .customSanitizer((value) => {
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            }
            return value;
        })
        .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    
    body('items.*.producto_id')
        .isInt({ min: 1 }).withMessage('ID de producto inválido')
        .toInt(),
    
    body('items.*.cantidad')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1')
        .toInt(),
    
    body('cliente_nombre')
        .optional({ values: 'falsy' })
        .isLength({ max: 100 }).withMessage('El nombre del cliente no puede exceder 100 caracteres')
        .trim()
        .escape(),
    
    body('cliente_telefono')
        .optional({ values: 'falsy' })
        .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres')
        .trim(),
    
    body('metodo_pago')
        .notEmpty().withMessage('El método de pago es requerido')
        .isIn(['efectivo', 'transferencia', 'tarjeta']).withMessage('Método de pago inválido'),
    
    body('total')
        .optional({ values: 'falsy' })
        .isFloat({ min: 0 }).withMessage('El total debe ser un número positivo')
        .toFloat(),
    
    validateResult
];

const validateSaleId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID de venta inválido')
        .toInt(),
    validateResult
];

const validateCancelSale = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID de venta inválido')
        .toInt(),
    
    body('motivo')
        .optional()
        .isLength({ max: 255 }).withMessage('El motivo no puede exceder 255 caracteres')
        .trim()
        .escape(),
    
    validateResult
];

/* ========================================================================== */
/*  VALIDACIONES PARA CATEGORÍAS                                              */
/* ========================================================================== */

const validateCategory = [
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .trim()
        .escape(),
    
    body('tipo')
        .notEmpty().withMessage('El tipo es requerido')
        .isIn(['venta', 'mantenimiento', 'accesorio']).withMessage('Tipo inválido'),
    
    body('descripcion')
        .optional()
        .isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres')
        .trim()
        .escape(),
    
    validateResult
];

const validateCategoryId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID de categoría inválido')
        .toInt(),
    validateResult
];

/* ========================================================================== */
/*  VALIDACIONES PARA REPORTES                                                */
/* ========================================================================== */

const validateDateRange = [
    query('fecha_desde')
        .optional()
        .isISO8601().withMessage('Fecha desde inválida')
        .toDate(),
    
    query('fecha_hasta')
        .optional()
        .isISO8601().withMessage('Fecha hasta inválida')
        .toDate(),
    
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número positivo')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
        .toInt(),
    
    validateResult
];

/* ========================================================================== */
/*  VALIDACIONES PARA BACKUPS                                                 */
/* ========================================================================== */

const validateBackupRestore = [
    body('filename')
        .notEmpty().withMessage('El nombre del backup es requerido')
        .matches(/^backup_\d{8}_\d{6}\.sql$/).withMessage('Nombre de backup inválido'),
    
    body('restore_uploads')
        .optional()
        .isBoolean().withMessage('restore_uploads debe ser verdadero o falso')
        .toBoolean(),
    
    validateResult
];

/* ========================================================================== */
/*  EXPORTAR VALIDACIONES                                                     */
/* ========================================================================== */

module.exports = {
    // Productos
    validateProduct,
    validateProductId,
    validateBulkPriceUpdate,
    
    // Usuarios
    validateUser,
    validateUserUpdate,
    validateLogin,
    validateChangePassword,
    
    // Ventas
    validateSale,
    validateSaleId,
    validateCancelSale,
    
    // Categorías
    validateCategory,
    validateCategoryId,
    
    // Reportes
    validateDateRange,
    
    // Backups
    validateBackupRestore,
    
    // Utilidad
    validateResult
};