/**
 * ============================================================
 * ARCHIVO: User.js
 * UBICACIÓN: backend/src/models/
 * ROL: model
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Modelo / acceso a datos — User.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   create, findByEmail, findById, findAll, update, remove, verifyPassword
 *
 * DEPENDENCIAS CLAVE:
 *   database
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

const bcrypt = require('bcrypt');
const { query } = require('../config/database');

/* ========================================================================== */
/*  CREAR USUARIO                                                             */
/* ========================================================================== */

const create = async (userData) => {
    const { nombre, email, password, role } = userData;
    
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await query(
        `INSERT INTO users (nombre, email, password_hash, role, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, nombre, email, role, created_at`,
        [nombre, email, hashedPassword, role]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR USUARIO POR EMAIL                                                  */
/* ========================================================================== */

const findByEmail = async (email) => {
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR USUARIO POR ID                                                     */
/* ========================================================================== */

const findById = async (id) => {
    const result = await query(
        'SELECT id, nombre, email, role, created_at FROM users WHERE id = $1',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  LISTAR TODOS LOS USUARIOS                                                 */
/* ========================================================================== */

const findAll = async () => {
    const result = await query(
        `SELECT id, nombre, email, role, created_at
         FROM users
         WHERE role IS DISTINCT FROM 'super_admin'
         ORDER BY created_at DESC`
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  ACTUALIZAR USUARIO                                                        */
/* ========================================================================== */

const update = async (id, userData) => {
    const { nombre, email, role, password } = userData;
    let queryText = 'UPDATE users SET ';
    const params = [];
    let paramIndex = 1;
    
    if (nombre) {
        queryText += `nombre = $${paramIndex}, `;
        params.push(nombre);
        paramIndex++;
    }
    
    if (email) {
        queryText += `email = $${paramIndex}, `;
        params.push(email);
        paramIndex++;
    }
    
    if (role) {
        queryText += `role = $${paramIndex}, `;
        params.push(role);
        paramIndex++;
    }
    
    if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        queryText += `password_hash = $${paramIndex}, `;
        params.push(hashedPassword);
        paramIndex++;
    }
    
    // Remover última coma y espacio
    queryText = queryText.slice(0, -2);
    queryText += ` WHERE id = $${paramIndex} RETURNING id, nombre, email, role`;
    params.push(id);
    
    const result = await query(queryText, params);
    return result.rows[0];
};

/* ========================================================================== */
/*  ELIMINAR USUARIO                                                          */
/* ========================================================================== */

const remove = async (id) => {
    const result = await query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  VERIFICAR CONTRASEÑA                                                      */
/* ========================================================================== */

const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
    create,
    findByEmail,
    findById,
    findAll,
    update,
    remove,
    verifyPassword
};