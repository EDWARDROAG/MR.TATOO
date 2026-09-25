/**
 * ============================================================
 * ARCHIVO: userRoutes.js
 * UBICACIÓN: backend/src/routes/
 * ROL: route
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Definición de rutas Express — userRoutes.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   userController, authMiddleware, roleMiddleware, validationMiddleware
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
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const {
    validateUser,
    validateUserUpdate,
} = require('../middlewares/validationMiddleware');

/* ========================================================================== */
/*  RUTAS DE PERFIL PROPIO (USUARIO AUTENTICADO)                              */
/* ========================================================================== */

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 * @returns { user }
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 * @body    { nombre, email, currentPassword, newPassword }
 * @returns { user }
 */
router.put('/profile', authMiddleware, userController.updateProfile);

/* ========================================================================== */
/*  RUTAS DE ADMINISTRACIÓN (SOLO ADMINISTRADORES)                            */
/* ========================================================================== */

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios del sistema
 * @access  Private (Admin)
 * @returns { users, total }
 */
router.get('/', authMiddleware, isAdmin, userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Admin)
 * @param   { id }
 * @returns { user }
 */
router.get('/:id', authMiddleware, isAdmin, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario (admin o cajero)
 * @access  Private (Admin)
 * @body    { nombre, email, password, role }
 * @returns { user }
 */
router.post('/', authMiddleware, isAdmin, validateUser, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario existente
 * @access  Private (Admin)
 * @param   { id }
 * @body    { nombre, email, role, password }
 * @returns { user }
 */
router.put('/:id', authMiddleware, isAdmin, validateUserUpdate, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario (no permite eliminar último admin)
 * @access  Private (Admin)
 * @param   { id }
 * @returns { message }
 */
router.delete('/:id', authMiddleware, isAdmin, userController.deleteUser);

/* ========================================================================== */
/*  EXPORTAR ROUTER                                                           */
/* ========================================================================== */

module.exports = router;