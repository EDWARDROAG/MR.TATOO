/**
 * ============================================================
 * ARCHIVO: index.js
 * UBICACIÓN: backend/src/models/
 * ROL: model
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Modelo / acceso a datos — index.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   User, Product, Category, Sale, SaleItem, Log, initializeRelations
 *
 * DEPENDENCIAS CLAVE:
 *   User, Product, Category, Sale, SaleItem, Log
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

// Importar modelos individuales
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Log = require('./Log');

/* ========================================================================== */
/*  DEFINICIÓN DE RELACIONES ENTRE MODELOS                                    */
/* ========================================================================== */

/**
 * RELACIONES DE USUARIO
 * Un usuario (admin o cajero) puede tener muchas ventas y muchos logs
 */
User.hasMany = () => {
    // Relación con Sale: un usuario puede tener muchas ventas
    Sale.belongsTo(User, { foreignKey: 'vendedor_id', as: 'vendedor' });
    
    // Relación con Log: un usuario puede tener muchos logs
    Log.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
};

/**
 * RELACIONES DE CATEGORÍA
 * Una categoría puede tener muchos productos
 */
Category.hasMany = () => {
    Product.belongsTo(Category, { foreignKey: 'categoria_id', as: 'categoria' });
};

/**
 * RELACIONES DE PRODUCTO
 * Un producto puede aparecer en muchos items de venta
 */
Product.hasMany = () => {
    SaleItem.belongsTo(Product, { foreignKey: 'producto_id', as: 'producto' });
};

/**
 * RELACIONES DE VENTA
 * Una venta tiene muchos items de venta y pertenece a un vendedor
 */
Sale.hasMany = () => {
    SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });
};

/**
 * RELACIONES DE SALE_ITEM
 * Un item de venta pertenece a una venta y a un producto
 */
SaleItem.belongsTo = () => {
    // Relaciones ya definidas en los métodos anteriores
};

/**
 * RELACIONES DE LOG
 * Un log pertenece a un usuario
 */
Log.belongsTo = () => {
    // Relación ya definida en User.hasMany()
};

/* ========================================================================== */
/*  INICIALIZAR TODAS LAS RELACIONES                                          */
/* ========================================================================== */

const initializeRelations = () => {
    User.hasMany();
    Category.hasMany();
    Product.hasMany();
    Sale.hasMany();
    // Nota: Las relaciones de pertenencia se definen en los métodos hasMany
};

// Ejecutar inicialización de relaciones
initializeRelations();

/* ========================================================================== */
/*  EXPORTAR TODOS LOS MODELOS                                                */
/* ========================================================================== */

module.exports = {
    User,
    Product,
    Category,
    Sale,
    SaleItem,
    Log,
    initializeRelations
};