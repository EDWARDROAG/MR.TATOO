/**
 * ============================================================
 * ARCHIVO: categoryRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — categoryRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   categoryController, authMiddleware, roleMiddleware
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
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoriesTree);
router.get('/with-count', categoryController.getCategoriesWithCount);
router.get('/public', categoryController.getPublicCategories);
router.get('/public/:categoryId/subcategories', categoryController.listPublicSubcategories);

router.get('/:categoryId/subcategories', categoryController.listSubcategories);
router.post(
    '/:categoryId/subcategories',
    authMiddleware,
    isAdmin,
    categoryController.createSubcategory
);

router.get('/:id', categoryController.getCategoryById);

router.post(
    '/',
    authMiddleware,
    isAdmin,
    categoryController.createCategory
);

router.put(
    '/:id',
    authMiddleware,
    isAdmin,
    categoryController.updateCategory
);

router.delete(
    '/:id',
    authMiddleware,
    isAdmin,
    categoryController.deleteCategory
);

module.exports = router;
