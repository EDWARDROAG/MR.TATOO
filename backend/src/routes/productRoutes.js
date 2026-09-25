/**
 * ============================================================
 * ARCHIVO: productRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — productRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   productController, authMiddleware, roleMiddleware, uploadMiddleware,
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
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin, isCajero } = require('../middlewares/roleMiddleware');
const {
    uploadProductMedia,
    handleMulterError,
} = require('../middlewares/uploadMiddleware');
const {
    validateProduct,
    validateProductId,
    validateBulkPriceUpdate,
} = require('../middlewares/validationMiddleware');

router.get('/', productController.getProducts);
router.get('/destacados', productController.getDestacados);
router.get('/barcode/:code', productController.getProductByBarcode);

router.get(
    '/inventory/all',
    authMiddleware,
    isAdmin,
    productController.getInventory
);

router.get('/:id', validateProductId, productController.getProductById);

router.post(
    '/',
    authMiddleware,
    isAdmin,
    uploadProductMedia,
    handleMulterError,
    validateProduct,
    productController.createProduct
);

router.put(
    '/:id',
    authMiddleware,
    isAdmin,
    uploadProductMedia,
    handleMulterError,
    validateProductId,
    productController.updateProduct
);

router.patch(
    '/:id/toggle-status',
    authMiddleware,
    isAdmin,
    validateProductId,
    productController.toggleProductStatus
);

router.delete(
    '/:id',
    authMiddleware,
    isAdmin,
    validateProductId,
    productController.deleteProduct
);

router.patch(
    '/:id/sold',
    authMiddleware,
    isCajero,
    validateProductId,
    productController.markProductAsSold
);

router.post(
    '/bulk/update-prices',
    authMiddleware,
    isAdmin,
    validateBulkPriceUpdate,
    productController.bulkUpdatePrices
);

module.exports = router;
