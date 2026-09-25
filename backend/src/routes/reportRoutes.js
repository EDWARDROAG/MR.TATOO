/**
 * ============================================================
 * ARCHIVO: reportRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — reportRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   reportController, authMiddleware, roleMiddleware
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
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

/* ========================================================================== */
/*  RUTAS DE REPORTES (SOLO ADMINISTRADORES)                                  */
/* ========================================================================== */

/**
 * @route   GET /api/reports/dashboard
 * @desc    Obtener métricas rápidas del dashboard
 * @access  Private (Admin)
 * @returns { ventas_hoy, ventas_semana, ventas_mes, inventario, usuarios }
 */
router.get(
    '/dashboard',
    authMiddleware,
    isAdmin,
    reportController.getDashboardMetrics
);

/**
 * @route   GET /api/reports/sales
 * @desc    Reporte de ventas por período
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, formato (json/csv) }
 * @returns { periodo, resumen, por_metodo_pago, ventas }
 */
router.get(
    '/sales',
    authMiddleware,
    isAdmin,
    reportController.getSalesReport
);

/**
 * @route   GET /api/reports/sales-by-seller
 * @desc    Reporte de ventas agrupado por vendedor
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, vendedor_id }
 * @returns { periodo, vendedores }
 */
router.get(
    '/sales-by-seller',
    authMiddleware,
    isAdmin,
    reportController.getSalesBySellerReport
);

/**
 * @route   GET /api/reports/top-products
 * @desc    Reporte de productos más vendidos
 * @access  Private (Admin)
 * @query   { fecha_desde, fecha_hasta, limit }
 * @returns { periodo, top_productos }
 */
router.get(
    '/top-products',
    authMiddleware,
    isAdmin,
    reportController.getTopProductsReport
);

/**
 * @route   GET /api/reports/inventory
 * @desc    Reporte de inventario (disponibles y vendidos)
 * @access  Private (Admin)
 * @query   { condicion, categoria_id, formato (json/csv) }
 * @returns { resumen, productos }
 */
router.get(
    '/inventory',
    authMiddleware,
    isAdmin,
    reportController.getInventoryReport
);

/**
 * @route   GET /api/reports/cashier-closure
 * @desc    Reporte de cierre de caja por día
 * @access  Private (Admin)
 * @query   { fecha (YYYY-MM-DD) }
 * @returns { fecha, resumen_general, por_vendedor, ventas }
 */
router.get(
    '/cashier-closure',
    authMiddleware,
    isAdmin,
    reportController.getCashierClosureReport
);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;