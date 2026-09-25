/**
 * ============================================================
 * ARCHIVO: superAdmin.service.js
 * UBICACIÓN: backend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Upsert super_admin desde SUPER_ADMIN_
 *
 * FUNCIONES / API (contrato exporta):
 *   ensureSuperAdmin
 *
 * DEPENDENCIAS CLAVE:
 *   database, roles
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: server.js, scripts/ensure-super-admin.js
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

const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { ROLES } = require('../constants/roles');

async function ensureSuperAdmin() {
  const email = String(process.env.SUPER_ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const password = String(process.env.SUPER_ADMIN_PASSWORD || '').trim();
  const name = String(process.env.SUPER_ADMIN_NAME || 'Super Admin Lamakinet').trim();

  if (!email || !password) {
    return { skipped: true, reason: 'SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD no definidos' };
  }
  if (password.length < 8) {
    throw new Error('SUPER_ADMIN_PASSWORD debe tener al menos 8 caracteres');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await query('SELECT id, role FROM users WHERE email = $1', [email]);

  if (existing.rows[0]) {
    await query(
      `UPDATE users
       SET nombre = $1, password_hash = $2, role = $3
       WHERE email = $4`,
      [name, hashedPassword, ROLES.SUPER_ADMIN, email]
    );
    console.log('🔑 Super admin: OK (actualizado)');
    return { updated: true };
  }

  await query(
    `INSERT INTO users (nombre, email, password_hash, role, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [name, email, hashedPassword, ROLES.SUPER_ADMIN]
  );
  console.log('🔑 Super admin: OK (creado)');
  return { created: true };
}

module.exports = { ensureSuperAdmin };
