/**
 * ============================================================
 * ARCHIVO: equipmentRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Rutas recepción / venta de equipo — admin y cajero.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   equipmentController, authMiddleware, roleMiddleware
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: server.js → /api/equipment
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
const equipmentController = require('../controllers/equipmentController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isCajero } = require('../middlewares/roleMiddleware');

router.use(authMiddleware, isCajero);

router.get('/receptions', equipmentController.listReceptions);
router.post('/receptions', equipmentController.createReception);
router.get('/receptions/:id', equipmentController.getReception);
router.get('/receptions/:id/pdf', equipmentController.downloadReceptionPdf);

router.get('/sales', equipmentController.listSales);
router.post('/sales', equipmentController.createSale);
router.get('/sales/:id', equipmentController.getSale);
router.get('/sales/:id/pdf', equipmentController.downloadSalePdf);

module.exports = router;
