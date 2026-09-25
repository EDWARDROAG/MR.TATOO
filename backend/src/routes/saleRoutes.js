/**
 * ============================================================
 * ARCHIVO: saleRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — saleRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   saleController, authMiddleware, roleMiddleware, uploadMiddleware,
 *   validationMiddleware
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
const saleController = require('../controllers/saleController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin, isCajero } = require('../middlewares/roleMiddleware');
const { uploadReceipt } = require('../middlewares/uploadMiddleware');
const {
    validateSale,
    validateSaleId,
    validateCancelSale,
} = require('../middlewares/validationMiddleware');

/* ========================================================================== */
/*  RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)                                */
/* ========================================================================== */

/**
 * @route   POST /api/sales
 * @desc    Registrar nueva venta (múltiples productos)
 * @access  Private (Admin o Cajero)
 * @body    { items, cliente_nombre, cliente_telefono, metodo_pago, total }
 * @returns { sale, factura_pdf }
 */
router.post(
    '/',
    authMiddleware,
    isCajero,
    uploadReceipt.single('comprobante'),
    validateSale,
    saleController.createSale
);

/**
 * @route   GET /api/sales
 * @desc    Obtener todas las ventas con filtros y paginación
 * @access  Private (Admin o Cajero)
 * @query   { vendedor_id, metodo_pago, fecha_desde, fecha_hasta, page, limit }
 * @returns { sales, pagination }
 */
router.get(
    '/',
    authMiddleware,
    isCajero,
    saleController.getSales
);

/**
 * @route   GET /api/sales/orders
 * @desc    Alias de listado de ventas (compatibilidad frontend)
 * @access  Private (Admin o Cajero)
 */
router.get(
    '/orders',
    authMiddleware,
    isCajero,
    saleController.getSales
);

/**
 * @route   GET /api/sales/summary/seller
 * @desc    Obtener resumen de ventas por vendedor
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, vendedor_id }
 * @returns { summary }
 */
router.get(
    '/summary/seller',
    authMiddleware,
    isAdmin,
    saleController.getSalesSummaryBySeller
);

/**
 * @route   GET /api/sales/:id
 * @desc    Obtener venta por ID con detalles completos
 * @access  Private (Admin o Cajero)
 * @param   { id }
 * @returns { sale }
 */
router.get(
    '/:id',
    authMiddleware,
    isCajero,
    validateSaleId,
    saleController.getSaleById
);

/**
 * @route   POST /api/sales/:id/receipt
 * @desc    Subir comprobante de transferencia para una venta existente
 * @access  Private (Admin o Cajero)
 * @param   { id }
 * @body    { comprobante (file) }
 * @returns { sale }
 */
router.post(
    '/:id/receipt',
    authMiddleware,
    isCajero,
    validateSaleId,
    uploadReceipt.single('comprobante'),
    saleController.uploadTransferReceipt
);

/**
 * @route   GET /api/sales/:id/invoice
 * @desc    Generar y descargar factura PDF de una venta
 * @access  Private (Admin o Cajero)
 * @param   { id }
 * @returns { PDF file }
 */
router.get(
    '/:id/invoice',
    authMiddleware,
    isCajero,
    validateSaleId,
    saleController.generateSaleInvoice
);

/**
 * @route   DELETE /api/sales/:id/cancel
 * @desc    Cancelar venta (restaura stock de productos)
 * @access  Private (Admin)
 * @param   { id }
 * @body    { motivo }
 * @returns { sale }
 */
router.delete(
    '/:id/cancel',
    authMiddleware,
    isAdmin,
    validateCancelSale,
    saleController.cancelSale
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;