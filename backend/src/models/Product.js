/**
 * ============================================================
 * ARCHIVO: Product.js
 * UBICACIÓN: backend/src/models/
 * ROL: model
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Modelo / acceso a datos — Product.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   create, findById, findByBarcode, findAll, update, toggleActivo,
 *   markAsSold, remove, bulkUpdatePrice, getDestacados
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

const PRODUCT_SELECT = `
    SELECT p.*,
           c.nombre AS categoria_nombre,
           s.nombre AS subcategoria_nombre
    FROM products p
    LEFT JOIN categories c ON p.categoria_id = c.id
    LEFT JOIN subcategories s ON p.subcategoria_id = s.id
`;

/* ========================================================================== */
/*  CREAR PRODUCTO                                                            */
/* ========================================================================== */

const create = async (productData) => {
    const {
        nombre,
        descripcion,
        precio,
        precio_compra,
        precio_promocion,
        en_promocion,
        porcentaje_descuento,
        condicion,
        categoria_id,
        subcategoria_id,
        imagen_url,
        imagenes,
        video_url,
        codigo_barras,
        destacado,
        stock,
        activo,
    } = productData;

    const imagenesJson = JSON.stringify(imagenes || (imagen_url ? [imagen_url] : []));

    const result = await query(
        `INSERT INTO products
         (nombre, descripcion, precio, precio_compra, precio_promocion, en_promocion, porcentaje_descuento,
          condicion, categoria_id, subcategoria_id, imagen_url, imagenes, video_url, codigo_barras, destacado, stock, activo, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14, $15, $16, $17, NOW())
         RETURNING *`,
        [
            nombre,
            descripcion || '',
            precio,
            precio_compra ?? null,
            precio_promocion ?? null,
            en_promocion || false,
            porcentaje_descuento || 0,
            condicion || 'nuevo',
            categoria_id || null,
            subcategoria_id || null,
            imagen_url || null,
            imagenesJson,
            video_url || null,
            codigo_barras || null,
            destacado || false,
            stock ?? 1,
            activo !== false,
        ]
    );

    return result.rows[0];
};

/* ========================================================================== */
/*  BUSCAR PRODUCTO POR ID                                                    */
/* ========================================================================== */

const findByBarcode = async (codigo) => {
    const result = await query(
        `${PRODUCT_SELECT} WHERE p.codigo_barras = $1`,
        [codigo]
    );

    return result.rows[0];
};

const findById = async (id) => {
    const result = await query(
        `${PRODUCT_SELECT} WHERE p.id = $1`,
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  LISTAR PRODUCTOS CON FILTROS Y PAGINACIÓN                                 */
/* ========================================================================== */

const findAll = async (filters = {}, page = 1, limit = 20) => {
    const { categoria_id, subcategoria_id, condicion, destacado, search, solo_activos } = filters;
    const offset = (page - 1) * limit;

    let queryText = `${PRODUCT_SELECT} WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (solo_activos !== false) {
        queryText += ` AND COALESCE(p.activo, true) = true`;
    }

    if (categoria_id) {
        queryText += ` AND p.categoria_id = $${paramIndex}`;
        params.push(categoria_id);
        paramIndex++;
    }

    if (subcategoria_id) {
        queryText += ` AND p.subcategoria_id = $${paramIndex}`;
        params.push(subcategoria_id);
        paramIndex++;
    }

    if (condicion) {
        queryText += ` AND p.condicion = $${paramIndex}`;
        params.push(condicion);
        paramIndex++;
    }

    if (destacado !== undefined) {
        queryText += ` AND p.destacado = $${paramIndex}`;
        params.push(destacado);
        paramIndex++;
    }

    if (search) {
        queryText += ` AND (p.nombre ILIKE $${paramIndex} OR p.codigo_barras ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }

    queryText += ` ORDER BY p.fecha_registro DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    let countQuery = `SELECT COUNT(*) FROM products p WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (solo_activos !== false) {
        countQuery += ` AND COALESCE(p.activo, true) = true`;
    }

    if (categoria_id) {
        countQuery += ` AND p.categoria_id = $${countIndex}`;
        countParams.push(categoria_id);
        countIndex++;
    }

    if (subcategoria_id) {
        countQuery += ` AND p.subcategoria_id = $${countIndex}`;
        countParams.push(subcategoria_id);
        countIndex++;
    }

    if (condicion) {
        countQuery += ` AND p.condicion = $${countIndex}`;
        countParams.push(condicion);
        countIndex++;
    }

    if (destacado !== undefined) {
        countQuery += ` AND p.destacado = $${countIndex}`;
        countParams.push(destacado);
        countIndex++;
    }

    if (search) {
        countQuery += ` AND (p.nombre ILIKE $${countIndex} OR p.codigo_barras ILIKE $${countIndex})`;
        countParams.push(`%${search}%`);
        countIndex++;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    return {
        products: result.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/* ========================================================================== */
/*  ACTUALIZAR PRODUCTO                                                       */
/* ========================================================================== */

const update = async (id, productData) => {
    const allowed = {
        nombre: 'nombre',
        descripcion: 'descripcion',
        precio: 'precio',
        precio_compra: 'precio_compra',
        precio_promocion: 'precio_promocion',
        en_promocion: 'en_promocion',
        porcentaje_descuento: 'porcentaje_descuento',
        condicion: 'condicion',
        categoria_id: 'categoria_id',
        subcategoria_id: 'subcategoria_id',
        imagen_url: 'imagen_url',
        imagenes: 'imagenes',
        video_url: 'video_url',
        codigo_barras: 'codigo_barras',
        destacado: 'destacado',
        stock: 'stock',
        activo: 'activo',
    };

    let queryText = 'UPDATE products SET ';
    const params = [];
    let paramIndex = 1;

    for (const [key, column] of Object.entries(allowed)) {
        if (productData[key] !== undefined) {
            if (key === 'imagenes') {
                queryText += `${column} = $${paramIndex}::jsonb, `;
                params.push(JSON.stringify(productData[key]));
            } else {
                queryText += `${column} = $${paramIndex}, `;
                params.push(productData[key]);
            }
            paramIndex++;
        }
    }

    if (params.length === 0) {
        return findById(id);
    }

    queryText = queryText.slice(0, -2);
    queryText += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    const result = await query(queryText, params);
    return result.rows[0];
};

const toggleActivo = async (id) => {
    const result = await query(
        `UPDATE products SET activo = NOT COALESCE(activo, true) WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
};

/* ========================================================================== */
/*  MARCAR PRODUCTO COMO VENDIDO                                              */
/* ========================================================================== */

const markAsSold = async (id, client = null) => {
    const exec = client ? client.query.bind(client) : query;
    const result = await exec(
        `UPDATE products 
         SET stock = 0, vendido_en = NOW() 
         WHERE id = $1 AND stock > 0
         RETURNING *`,
        [id]
    );

    if (!result.rows[0]) {
        throw new Error(`No se pudo marcar como vendido el producto ${id} (sin stock o no existe)`);
    }
    
    return result.rows[0];
};

/* ========================================================================== */
/*  ELIMINAR PRODUCTO                                                         */
/* ========================================================================== */

const remove = async (id) => {
    const result = await query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
    );
    
    return result.rows[0];
};

/* ========================================================================== */
/*  ACTUALIZAR PRECIOS EN MASA                                                */
/* ========================================================================== */

const bulkUpdatePrice = async (percentage) => {
    const multiplier = 1 + (percentage / 100);
    
    const result = await query(
        `UPDATE products 
         SET precio = precio * $1 
         WHERE stock = 1 
         RETURNING id, nombre, precio`,
        [multiplier]
    );
    
    return result.rows;
};

/* ========================================================================== */
/*  PRODUCTOS DESTACADOS PARA HOME                                            */
/* ========================================================================== */

const getDestacados = async (limit = 8) => {
    const result = await query(
        `${PRODUCT_SELECT}
         WHERE p.destacado = true AND COALESCE(p.activo, true) = true AND p.stock > 0
         ORDER BY p.fecha_registro DESC
         LIMIT $1`,
        [limit]
    );

    return result.rows;
};

module.exports = {
    create,
    findById,
    findByBarcode,
    findAll,
    update,
    toggleActivo,
    markAsSold,
    remove,
    bulkUpdatePrice,
    getDestacados,
};