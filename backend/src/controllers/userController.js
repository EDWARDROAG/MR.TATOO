/**
 * ============================================================
 * ARCHIVO: userController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Controlador HTTP — endpoints de user.
 *
 * FUNCIONES / API (contrato exporta):
 *   getProfile, updateProfile, getUsers, getUserById, createUser,
 *   updateUser, deleteUser
 *
 * DEPENDENCIAS CLAVE:
 *   User, logger, roles
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

const User = require('../models/User');
const { logger } = require('../utils/logger');
const { ROLES } = require('../constants/roles');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    logger.error(`Error en getProfile: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const user = await User.update(req.user.id, { nombre, email });
    return res.json({ success: true, user });
  } catch (error) {
    logger.error(`Error en updateProfile: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.json({ success: true, users, total: users.length });
  } catch (error) {
    logger.error(`Error en getUsers: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === ROLES.SUPER_ADMIN) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    logger.error(`Error en getUserById: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, email, password, role = 'cajero' } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' });
    }
    if (role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'No se puede crear un super_admin desde el panel',
      });
    }
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }
    const user = await User.create({ nombre, email, password, role });
    return res.status(201).json({ success: true, user });
  } catch (error) {
    logger.error(`Error en createUser: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target || target.role === ROLES.SUPER_ADMIN) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    if (req.body.role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'No se puede asignar rol super_admin desde el panel',
      });
    }
    const user = await User.update(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    logger.error(`Error en updateUser: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const admins = (await User.findAll()).filter((user) => user.role === 'admin');
    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    if (target.role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar el super admin',
      });
    }
    if (target.role === 'admin' && admins.length <= 1) {
      return res.status(400).json({ success: false, message: 'No se puede eliminar el último administrador' });
    }
    await User.remove(req.params.id);
    return res.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    logger.error(`Error en deleteUser: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
