/**
 * ============================================================
 * ARCHIVO: Subcategory.js
 * UBICACIÓN: backend/src/models/
 * ROL: model
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Modelo / acceso a datos — Subcategory.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   create, findById, findByCategoryId, findByCategoryAndName,
 *   findByCategoryWithProductCount, findByCategoryForPublicCatalog, update,
 *   remove, hasProducts, countByCategory
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

const { query } = require('../config/database');

const create = async ({ categoria_id, nombre, descripcion }) => {
    const result = await query(
        `INSERT INTO subcategories (categoria_id, nombre, descripcion, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [categoria_id, nombre, descripcion || '']
    );
    return result.rows[0];
};

const findById = async (id) => {
    const result = await query(
        `SELECT s.*, c.nombre AS categoria_nombre
         FROM subcategories s
         JOIN categories c ON c.id = s.categoria_id
         WHERE s.id = $1`,
        [id]
    );
    return result.rows[0];
};

const findByCategoryId = async (categoriaId) => {
    const result = await query(
        `SELECT id, categoria_id, nombre, descripcion, created_at
         FROM subcategories
         WHERE categoria_id = $1
         ORDER BY nombre ASC`,
        [categoriaId]
    );
    return result.rows;
};

const findByCategoryAndName = async (categoriaId, nombre) => {
    const result = await query(
        `SELECT * FROM subcategories WHERE categoria_id = $1 AND nombre = $2`,
        [categoriaId, nombre]
    );
    return result.rows[0];
};

const findByCategoryWithProductCount = async (categoriaId) => {
    const result = await query(
        `SELECT s.id, s.categoria_id, s.nombre, s.descripcion, s.created_at,
                COUNT(p.id)::int AS total_productos
         FROM subcategories s
         LEFT JOIN products p ON p.subcategoria_id = s.id
         WHERE s.categoria_id = $1
         GROUP BY s.id
         ORDER BY s.nombre ASC`,
        [categoriaId]
    );
    return result.rows;
};

/** Subcategorías con al menos un producto activo (frontend público) */
const findByCategoryForPublicCatalog = async (categoriaId) => {
    const result = await query(
        `SELECT s.id, s.categoria_id, s.nombre, s.descripcion, s.created_at,
                COUNT(p.id)::int AS total_productos
         FROM subcategories s
         INNER JOIN products p ON p.subcategoria_id = s.id
         WHERE s.categoria_id = $1
           AND COALESCE(p.activo, true) = true
         GROUP BY s.id
         HAVING COUNT(p.id) > 0
         ORDER BY s.nombre ASC`,
        [categoriaId]
    );
    return result.rows;
};

const update = async (id, data) => {
    const fields = [];
    const params = [];
    let i = 1;

    if (data.nombre !== undefined) {
        fields.push(`nombre = $${i++}`);
        params.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
        fields.push(`descripcion = $${i++}`);
        params.push(data.descripcion);
    }

    if (!fields.length) return findById(id);

    params.push(id);
    const result = await query(
        `UPDATE subcategories SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        params
    );
    return result.rows[0];
};

const remove = async (id) => {
    const result = await query(
        'DELETE FROM subcategories WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0];
};

const hasProducts = async (id) => {
    const result = await query(
        'SELECT COUNT(*)::int AS total FROM products WHERE subcategoria_id = $1',
        [id]
    );
    return result.rows[0].total > 0;
};

const countByCategory = async (categoriaId) => {
    const result = await query(
        'SELECT COUNT(*)::int AS total FROM subcategories WHERE categoria_id = $1',
        [categoriaId]
    );
    return result.rows[0].total;
};

module.exports = {
    create,
    findById,
    findByCategoryId,
    findByCategoryAndName,
    findByCategoryWithProductCount,
    findByCategoryForPublicCatalog,
    update,
    remove,
    hasProducts,
    countByCategory,
};
