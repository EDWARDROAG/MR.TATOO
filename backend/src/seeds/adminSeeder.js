/**
 * ============================================================
 * ARCHIVO: adminSeeder.js
 * UBICACIÓN: backend/src/seeds/
 * ROL: seed
 * VERSIÓN: 2.2 — merch con fotos demo
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 20:30
 * ============================================================
 * PROPÓSITO:
 *   Seed de datos — adminSeeder.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   seedAdmin, resetAdminPassword, hasSeeded, resetSeeding, DEFAULT_ADMIN,
 *   DEFAULT_CATEGORIES, SAMPLE_PRODUCTS
 *
 * DEPENDENCIAS CLAVE:
 *   User, Category, Product, database
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
 * [2.2] - 2026-09-22 20:30
 *    ✅ HU-013 — imagen_url de merch demo + relleno si ya existían sin foto
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { query } = require('../config/database');

/* ========================================================================== */
/*  CONFIGURACIÓN DEL ADMIN POR DEFECTO                                       */
/* ========================================================================== */

const DEFAULT_ADMIN = {
    nombre: 'Administrador Mr. Tatoo',
    email: process.env.ADMIN_EMAIL || 'admin@mr-tatoo.local',
    password: process.env.ADMIN_PASSWORD || 'MrTatoo2026Admin',
    role: 'admin'
};

const DEFAULT_CATEGORIES = [
    { nombre: 'Camisetas', tipo: 'venta', descripcion: 'Merch del estudio' },
    { nombre: 'Gorras', tipo: 'venta', descripcion: 'Gorras y caps' },
    { nombre: 'Hoodies', tipo: 'venta', descripcion: 'Buzos y hoodies' },
    { nombre: 'Stickers', tipo: 'accesorio', descripcion: 'Stickers y prints' },
    { nombre: 'Aftercare', tipo: 'venta', descripcion: 'Cuidado de tatuaje' },
    { nombre: 'Accesorios', tipo: 'accesorio', descripcion: 'Mugs y extras' }
];

/* ========================================================================== */
/*  PRODUCTOS DE EJEMPLO (OPCIONAL)                                           */
/* ========================================================================== */

const SAMPLE_PRODUCTS = [
    { nombre: 'Camiseta Mr. Tatoo', descripcion: 'Camiseta de muestra del estudio', precio: 55000, condicion: 'nuevo', categoria_nombre: 'Camisetas', destacado: true, imagen_url: '/images/demo/merch-camiseta.jpg' },
    { nombre: 'Gorra Classic', descripcion: 'Gorra demo', precio: 55000, condicion: 'nuevo', categoria_nombre: 'Gorras', destacado: true, imagen_url: '/images/demo/merch-gorra.jpg' },
    { nombre: 'Hoodie Ink Life', descripcion: 'Hoodie de muestra', precio: 120000, condicion: 'nuevo', categoria_nombre: 'Hoodies', destacado: true, imagen_url: '/images/demo/merch-hoodie.jpg' },
    { nombre: 'Mug Tatuador', descripcion: 'Taza demo', precio: 35000, condicion: 'nuevo', categoria_nombre: 'Accesorios', destacado: false, imagen_url: '/images/demo/merch-mug.jpg' },
    { nombre: 'Stickers Pack', descripcion: 'Pack de stickers', precio: 20000, condicion: 'nuevo', categoria_nombre: 'Stickers', destacado: true, imagen_url: '/images/demo/merch-stickers.jpg' },
    { nombre: 'Kit Cuidado', descripcion: 'Aftercare de muestra', precio: 50000, condicion: 'nuevo', categoria_nombre: 'Aftercare', destacado: true, imagen_url: '/images/demo/merch-aftercare.jpg' }
];

/* ========================================================================== */
/*  FUNCIÓN PRINCIPAL DE SEEDING                                              */
/* ========================================================================== */

/**
 * Ejecuta el seeding del administrador y datos iniciales
 * @returns {Promise<Object>} - Resultado del seeding
 */
const seedAdmin = async ({ prodOnly = false } = {}) => {
    const result = {
        adminCreated: false,
        categoriesCreated: 0,
        productsCreated: 0,
        errors: []
    };
    
    try {
        console.log(prodOnly
            ? '🌱 Seed producción (solo administrador)...'
            : '🌱 Iniciando seeding de datos iniciales...');
        
        /* ================================================================== */
        /*  1. CREAR ADMINISTRADOR POR DEFECTO                                */
        /* ================================================================== */
        
        // Verificar si ya existe un administrador
        const existingAdmin = await User.findByEmail(DEFAULT_ADMIN.email);
        
        if (!existingAdmin) {
            const admin = await User.create({
                nombre: DEFAULT_ADMIN.nombre,
                email: DEFAULT_ADMIN.email,
                password: DEFAULT_ADMIN.password,
                role: DEFAULT_ADMIN.role
            });
            
            result.adminCreated = true;
            console.log(`✅ Administrador creado: ${DEFAULT_ADMIN.email}`);
            console.log(`   Contraseña: ${DEFAULT_ADMIN.password} (CAMBIAR DESPUÉS DE INICIAR SESIÓN)`);
        } else {
            console.log(`ℹ️ Administrador ya existe: ${DEFAULT_ADMIN.email}`);
        }
        
        if (!prodOnly) {
        /* ================================================================== */
        /*  2. CREAR CATEGORÍAS INICIALES                                     */
        /* ================================================================== */
        
        for (const categoryData of DEFAULT_CATEGORIES) {
            try {
                // Verificar si la categoría ya existe
                const existingCategory = await Category.findByName(categoryData.nombre);
                
                if (!existingCategory) {
                    await Category.create(categoryData);
                    result.categoriesCreated++;
                    console.log(`✅ Categoría creada: ${categoryData.nombre}`);
                } else {
                    console.log(`ℹ️ Categoría ya existe: ${categoryData.nombre}`);
                }
            } catch (error) {
                result.errors.push(`Error creando categoría ${categoryData.nombre}: ${error.message}`);
                console.error(`❌ Error creando categoría ${categoryData.nombre}:`, error.message);
            }
        }
        
        /* ================================================================== */
        /*  3. CREAR PRODUCTOS DE EJEMPLO (OPCIONAL)                          */
        /* ================================================================== */
        
        // Verificar si ya hay productos
        const existingProducts = await Product.findAll({}, 1, 1);
        
        if (existingProducts.pagination.total === 0) {
            for (const productData of SAMPLE_PRODUCTS) {
                try {
                    // Buscar ID de la categoría por nombre
                    const category = await Category.findByName(productData.categoria_nombre);
                    
                    if (category) {
                        await Product.create({
                            nombre: productData.nombre,
                            descripcion: productData.descripcion,
                            precio: productData.precio,
                            condicion: productData.condicion,
                            categoria_id: category.id,
                            imagen_url: productData.imagen_url || null,
                            destacado: productData.destacado
                        });
                        result.productsCreated++;
                        console.log(`✅ Producto creado: ${productData.nombre}`);
                    } else {
                        console.warn(`⚠️ Categoría no encontrada para producto: ${productData.nombre}`);
                    }
                } catch (error) {
                    result.errors.push(`Error creando producto ${productData.nombre}: ${error.message}`);
                    console.error(`❌ Error creando producto ${productData.nombre}:`, error.message);
                }
            }
        } else {
            console.log(`ℹ️ Ya existen productos en el sistema. No se crearon productos de ejemplo.`);
            for (const productData of SAMPLE_PRODUCTS) {
                if (!productData.imagen_url) continue;
                try {
                    await query(
                        `UPDATE products
                         SET imagen_url = $1,
                             imagenes = $2::jsonb
                         WHERE nombre = $3
                           AND (imagen_url IS NULL OR imagen_url = '')`,
                        [
                            productData.imagen_url,
                            JSON.stringify([productData.imagen_url]),
                            productData.nombre,
                        ]
                    );
                } catch (error) {
                    result.errors.push(`Error actualizando foto ${productData.nombre}: ${error.message}`);
                }
            }
        }
        } else {
            console.log('ℹ️ Modo producción: sin categorías ni productos de ejemplo.');
        }
        
        console.log('🌱 Seeding completado!');
        console.log(`   - Administrador: ${result.adminCreated ? 'Creado' : 'Existente'}`);
        console.log(`   - Categorías creadas: ${result.categoriesCreated}`);
        console.log(`   - Productos creados: ${result.productsCreated}`);
        
        if (result.errors.length > 0) {
            console.warn(`   - Errores: ${result.errors.length}`);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en seeding:', error);
        result.errors.push(`Error general: ${error.message}`);
        throw error;
    }
};

/* ========================================================================== */
/*  FUNCIÓN PARA VERIFICAR SI EL SEEDING YA SE EJECUTÓ                        */
/* ========================================================================== */

/**
 * Verifica si el seeding ya se ha ejecutado
 * @returns {Promise<boolean>} - true si ya se ejecutó
 */
const resetAdminPassword = async () => {
    const admin = await User.findByEmail(DEFAULT_ADMIN.email);

    if (!admin) {
        throw new Error(`No existe el administrador: ${DEFAULT_ADMIN.email}`);
    }

    await User.update(admin.id, { password: DEFAULT_ADMIN.password });
    console.log(`✅ Contraseña de administrador restablecida: ${DEFAULT_ADMIN.email}`);
    return true;
};

const hasSeeded = async () => {
    try {
        // Verificar si existe el administrador por defecto
        const admin = await User.findByEmail(DEFAULT_ADMIN.email);
        
        // Verificar si existen categorías
        const categories = await Category.findAll();
        
        return !!(admin && categories.length > 0);
    } catch (error) {
        console.error('Error verificando seeding:', error);
        return false;
    }
};

/* ========================================================================== */
/*  FUNCIÓN PARA REINICIAR SEEDING (RESET)                                    */
/* ========================================================================== */

/**
 * Reinicia el seeding (elimina datos y los recrea)
 * @param {boolean} resetProducts - Si se deben eliminar productos
 * @returns {Promise<Object>} - Resultado del reset
 */
const resetSeeding = async (resetProducts = false) => {
    try {
        console.log('🔄 Reiniciando seeding...');
        
        if (resetProducts) {
            // Eliminar productos
            await query('TRUNCATE TABLE sale_items CASCADE');
            await query('TRUNCATE TABLE products CASCADE');
            console.log('✅ Productos eliminados');
        }
        
        // Eliminar categorías (excepto las que tienen productos)
        await query('TRUNCATE TABLE categories CASCADE');
        console.log('✅ Categorías eliminadas');
        
        // Eliminar usuarios (excepto el admin por defecto)
        await query("DELETE FROM users WHERE email != $1", [DEFAULT_ADMIN.email]);
        console.log('✅ Usuarios eliminados');
        
        // Volver a ejecutar seeding
        const result = await seedAdmin();
        
        return result;
    } catch (error) {
        console.error('❌ Error reiniciando seeding:', error);
        throw error;
    }
};

/* ========================================================================== */
/*  EJECUCIÓN DIRECTA (SI SE LLAMA EL ARCHIVO)                                */
/* ========================================================================== */

// Si el archivo se ejecuta directamente (no se importa)
if (require.main === module) {
    (async () => {
        try {
            const resetPassword = process.argv.includes('--reset-admin-password');
            const prodOnly = process.argv.includes('--prod');

            if (resetPassword) {
                console.log('🔐 Restableciendo contraseña del administrador...');
                await resetAdminPassword();
            } else {
                console.log('🚀 Ejecutando adminSeeder directamente...');
                await seedAdmin({ prodOnly });
            }

            process.exit(0);
        } catch (error) {
            console.error('❌ Error ejecutando seeder:', error);
            process.exit(1);
        }
    })();
}

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    seedAdmin,
    resetAdminPassword,
    hasSeeded,
    resetSeeding,
    DEFAULT_ADMIN,
    DEFAULT_CATEGORIES,
    SAMPLE_PRODUCTS
};