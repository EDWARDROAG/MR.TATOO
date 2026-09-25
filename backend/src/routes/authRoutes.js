/**
 * ============================================================
 * ARCHIVO: authRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — authRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   authController, authMiddleware, roleMiddleware, validationMiddleware
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
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const {
  validateLogin,
  validateUser,
  validateChangePassword,
} = require('../middlewares/validationMiddleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
  },
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de recuperación. Intenta más tarde.',
  },
});

/* ========================================================================== */
/*  RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)                               */
/* ========================================================================== */

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión - Autentica usuario y retorna token JWT
 * @access  Public
 * @body    { email, password }
 * @returns { token, user }
 */
router.post('/login', loginLimiter, validateLogin, authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT activo
 * @access  Private
 * @returns { valid, user }
 */
router.get('/verify', authController.verify);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (solo accesible por admin)
 * @access  Private (Admin)
 * @body    { nombre, email, password, role }
 * @returns { user }
 */
router.post('/register', authMiddleware, isAdmin, validateUser, authController.register);

/* ========================================================================== */
/*  RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)                                */
/* ========================================================================== */

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 * @returns { user }
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 * @body    { nombre, email, currentPassword, newPassword }
 * @returns { user }
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 * @body    { currentPassword, newPassword }
 * @returns { message }
 */
router.post('/change-password', authMiddleware, validateChangePassword, authController.changePassword);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Renovar token JWT (extender sesión)
 * @access  Private
 * @returns { token }
 */
router.post('/refresh-token', authMiddleware, authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (invalida token en cliente)
 * @access  Private
 * @returns { message }
 */
router.post('/logout', authMiddleware, authController.logout);

/* ========================================================================== */
/*  RUTAS DE RECUPERACIÓN DE CONTRASEÑA (OPCIONAL)                            */
/* ========================================================================== */

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 * @body    { email }
 * @returns { message }
 */
router.post('/forgot-password', forgotLimiter, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Public
 * @body    { token, newPassword }
 * @returns { message }
 */
router.post('/reset-password', authController.resetPassword);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;