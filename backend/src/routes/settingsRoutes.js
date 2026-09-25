/**
 * ============================================================
 * ARCHIVO: settingsRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — settingsRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   settingsController, authMiddleware, roleMiddleware, uploadMiddleware
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
const settingsController = require('../controllers/settingsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const {
  uploadSocialLogo,
  handleMulterError,
} = require('../middlewares/uploadMiddleware');

router.get('/modules', settingsController.getModules);
router.put('/modules', authMiddleware, isAdmin, settingsController.updateModules);

router.get('/site', settingsController.getSite);
router.put('/site', authMiddleware, isAdmin, settingsController.updateSite);
router.post(
  '/social-logo',
  authMiddleware,
  isAdmin,
  uploadSocialLogo.single('logo'),
  handleMulterError,
  settingsController.uploadSocialLogo
);

module.exports = router;
