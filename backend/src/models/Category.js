/**
 * ============================================================
 * ARCHIVO: Category.js
 * UBICACIÓN: backend/src/models/
 * ROL: model
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Modelo / acceso a datos — Category.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   create, findById, findByName, findAll, findByType, update, remove,
 *   findAllWithProductCount, findAllForPublicCatalog, hasProducts,
 *   findByTypeWithCount, getCategoryWithDetails
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

/* ========================================================================== */
/*  CREAR CATEGORÍA                                                           */
/* ========================================================================== */

const create = async (categoryData) => {
    const { nombre, tipo, descripcion } = categoryData;
    
    const result = await query(
        `INSERT INTO categories (nombre, tipo, descripcion, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, nombre, tipo, descripcion, created_at`,
        [nombre, tipo, descripcion || '']
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR CATEGORÍA POR ID                                                   */
/* ========================================================================== */

const findById = async (id) => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         WHERE id = $1`,
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR CATEGORÍA POR NOMBRE                                               */
/* ========================================================================== */

const findByName = async (nombre) => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         WHERE nombre = $1`,
        [nombre]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  LISTAR TODAS LAS CATEGORÍAS                                               */
/* ========================================================================== */

const findAll = async () => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         ORDER BY nombre ASC`
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  LISTAR CATEGORÍAS POR TIPO                                                */
/* ========================================================================== */

const findByType = async (tipo) => {
    const result = await query(
        `SELECT id, nombre, tipo, descripcion, created_at 
         FROM categories 
         WHERE tipo = $1 
         ORDER BY nombre ASC`,
        [tipo]
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  ACTUALIZAR CATEGORÍA                                                      */
/* ========================================================================== */

const update = async (id, categoryData) => {
    const { nombre, tipo, descripcion } = categoryData;
    
    let queryText = 'UPDATE categories SET ';
    const params = [];
    let paramIndex = 1;
    
    if (nombre !== undefined) {
        queryText += `nombre = $${paramIndex}, `;
        params.push(nombre);
        paramIndex++;
    }
    
    if (tipo !== undefined) {
        queryText += `tipo = $${paramIndex}, `;
        params.push(tipo);
        paramIndex++;
    }
    
    if (descripcion !== undefined) {
        queryText += `descripcion = $${paramIndex}, `;
        params.push(descripcion);
        paramIndex++;
    }
    
    // Remover última coma y espacio
    queryText = queryText.slice(0, -2);
    queryText += ` WHERE id = $${paramIndex} RETURNING id, nombre, tipo, descripcion, created_at`;
    params.push(id);
    
    const result = await query(queryText, params);
    return result.rows[0];
};

/* ========================================================================== */
/*  ELIMINAR CATEGORÍA                                                        */
/* ========================================================================== */

const remove = async (id) => {
    const result = await query(
        'DELETE FROM categories WHERE id = $1 RETURNING id',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  OBTENER CATEGORÍAS CON CONTEO DE PRODUCTOS                                */
/* ========================================================================== */

const findAllWithProductCount = async () => {
    const result = await query(`
        SELECT 
            c.id,
            c.nombre,
            c.tipo,
            c.descripcion,
            c.created_at,
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.stock = 1 THEN 1 END) as disponibles,
            COUNT(CASE WHEN p.stock = 0 THEN 1 END) as vendidos
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoria_id
        GROUP BY c.id, c.nombre, c.tipo, c.descripcion, c.created_at
        ORDER BY c.nombre ASC
    `);
    
    return result.rows;
};

/* ========================================================================== */
/*  CATEGORÍAS CON PRODUCTOS ACTIVOS (frontend público)                       */
/* ========================================================================== */

const findAllForPublicCatalog = async () => {
    const result = await query(`
        SELECT
            c.id,
            c.nombre,
            c.tipo,
            c.descripcion,
            c.created_at,
            COUNT(p.id)::int AS total_productos
        FROM categories c
        INNER JOIN products p ON p.categoria_id = c.id
        WHERE COALESCE(p.activo, true) = true
        GROUP BY c.id, c.nombre, c.tipo, c.descripcion, c.created_at
        HAVING COUNT(p.id) > 0
        ORDER BY c.nombre ASC
    `);
    return result.rows;
};

/* ========================================================================== */
/*  VERIFICAR SI CATEGORÍA TIENE PRODUCTOS                                    */
/* ========================================================================== */

const hasProducts = async (id) => {
    const result = await query(
        'SELECT COUNT(*) as total FROM products WHERE categoria_id = $1',
        [id]
    );
    
    return parseInt(result.rows[0].total) > 0;
};

/* ========================================================================== */
/*  OBTENER CATEGORÍAS POR TIPO CON CONTEO                                    */
/* ========================================================================== */

const findByTypeWithCount = async (tipo) => {
    const result = await query(`
        SELECT 
            c.id,
            c.nombre,
            c.tipo,
            c.descripcion,
            c.created_at,
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.stock = 1 THEN 1 END) as disponibles,
            COUNT(CASE WHEN p.stock = 0 THEN 1 END) as vendidos
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoria_id
        WHERE c.tipo = $1
        GROUP BY c.id, c.nombre, c.tipo, c.descripcion, c.created_at
        ORDER BY c.nombre ASC
    `, [tipo]);
    
    return result.rows;
};

/* ========================================================================== */
/*  OBTENER CATEGORÍA CON DETALLE COMPLETO                                    */
/* ========================================================================== */

const getCategoryWithDetails = async (id) => {
    const result = await query(`
        SELECT 
            c.id,
            c.nombre,
            c.tipo,
            c.descripcion,
            c.created_at,
            COUNT(p.id) as total_productos,
            COUNT(CASE WHEN p.stock = 1 THEN 1 END) as disponibles,
            COUNT(CASE WHEN p.stock = 0 THEN 1 END) as vendidos,
            json_agg(
                json_build_object(
                    'id', p.id,
                    'nombre', p.nombre,
                    'precio', p.precio,
                    'condicion', p.condicion,
                    'stock', p.stock
                ) ORDER BY p.fecha_registro DESC
            ) FILTER (WHERE p.id IS NOT NULL) as ultimos_productos
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoria_id
        WHERE c.id = $1
        GROUP BY c.id, c.nombre, c.tipo, c.descripcion, c.created_at
    `, [id]);
    
    return result.rows[0];
};

/* ========================================================================== */
/*  EXPORTAR MODELO                                                           */
/* ========================================================================== */

module.exports = {
    create,
    findById,
    findByName,
    findAll,
    findByType,
    update,
    remove,
    findAllWithProductCount,
    findAllForPublicCatalog,
    hasProducts,
    findByTypeWithCount,
    getCategoryWithDetails
};