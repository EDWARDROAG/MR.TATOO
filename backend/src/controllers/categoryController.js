/**
 * ============================================================
 * ARCHIVO: categoryController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Controlador HTTP — endpoints de category.
 *
 * FUNCIONES / API (contrato exporta):
 *   createCategory, getCategories, getCategoryById, updateCategory,
 *   deleteCategory, getCategoriesWithCount, getCategoriesTree,
 *   getPublicCategories, listPublicSubcategories, listSubcategories,
 *   createSubcategory
 *
 * DEPENDENCIAS CLAVE:
 *   Category, Subcategory, Product, Log
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

const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');
const Log = require('../models/Log');

/* ========================================================================== */
/*  CREAR CATEGORÍA                                                           */
/* ========================================================================== */

const DEFAULT_CATEGORY_TYPE = 'general';

const normalizeTipo = (tipo) => {
    const value = (tipo || DEFAULT_CATEGORY_TYPE).trim().toLowerCase();
    return value || DEFAULT_CATEGORY_TYPE;
};

const createCategory = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const tipo = normalizeTipo(req.body.tipo);

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es obligatorio',
            });
        }

        const nombreTrim = nombre.trim();

        const existingCategory = await Category.findByName(nombreTrim);
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre',
            });
        }

        const category = await Category.create({
            nombre: nombreTrim,
            tipo,
            descripcion: descripcion || '',
        });
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'CREAR_CATEGORIA',
            detalle: `Categoría creada: ${nombre} (Tipo: ${tipo}, ID: ${category.id})`
        });
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: category
        });
        
    } catch (error) {
        console.error('Error en createCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER TODAS LAS CATEGORÍAS                                             */
/* ========================================================================== */

const getCategories = async (req, res) => {
    try {
        const { tipo } = req.query;
        
        let categories;
        if (tipo) {
            const tiposPermitidos = ['venta', 'mantenimiento', 'accesorio', 'general'];
            if (!tiposPermitidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}`,
                });
            }
            categories = await Category.findByType(tipo);
        } else {
            categories = await Category.findAll();
        }
        
        res.status(200).json({
            success: true,
            data: categories,
            total: categories.length
        });
        
    } catch (error) {
        console.error('Error en getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las categorías',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER CATEGORÍA POR ID                                                  */
/* ========================================================================== */

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findById(parseInt(id));
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Obtener cantidad de productos en esta categoría
        const products = await Product.findAll({ categoria_id: parseInt(id) }, 1, 1000);
        
        res.status(200).json({
            success: true,
            data: {
                ...category,
                total_productos: products.pagination.total
            }
        });
        
    } catch (error) {
        console.error('Error en getCategoryById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ACTUALIZAR CATEGORÍA                                                      */
/* ========================================================================== */

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, descripcion } = req.body;
        
        // Verificar si la categoría existe
        const existingCategory = await Category.findById(parseInt(id));
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        if (tipo) {
            const tiposPermitidos = ['venta', 'mantenimiento', 'accesorio', 'general'];
            if (!tiposPermitidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}`,
                });
            }
        }

        if (nombre && nombre !== existingCategory.nombre) {
            const duplicateCategory = await Category.findByName(nombre);
            if (duplicateCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
            }
        }
        
        // Preparar datos de actualización
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (tipo !== undefined) updateData.tipo = normalizeTipo(tipo);
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        
        const category = await Category.update(parseInt(id), updateData);
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ACTUALIZAR_CATEGORIA',
            detalle: `Categoría actualizada: ${existingCategory.nombre} -> ${nombre || existingCategory.nombre} (ID: ${id})`
        });
        
        res.status(200).json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: category
        });
        
    } catch (error) {
        console.error('Error en updateCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  ELIMINAR CATEGORÍA                                                        */
/* ========================================================================== */

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la categoría existe
        const existingCategory = await Category.findById(parseInt(id));
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Verificar si tiene productos asociados
        const products = await Product.findAll({ categoria_id: parseInt(id) }, 1, 1);
        if (products.pagination.total > 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar la categoría porque tiene ${products.pagination.total} producto(s) asociado(s)`,
            });
        }

        const subs = await Subcategory.findByCategoryId(parseInt(id));
        for (const sub of subs) {
            if (await Subcategory.hasProducts(sub.id)) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede eliminar: la subcategoría "${sub.nombre}" tiene productos asignados`,
                });
            }
        }
        
        await Category.remove(parseInt(id));
        
        // Registrar en log
        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_CATEGORIA',
            detalle: `Categoría eliminada: ${existingCategory.nombre} (ID: ${id})`
        });
        
        res.status(200).json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('Error en deleteCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* ========================================================================== */
/*  OBTENER CATEGORÍAS CON CONTEO DE PRODUCTOS                                */
/* ========================================================================== */

const getCategoriesWithCount = async (req, res) => {
    try {
        const categories = await Category.findAllWithProductCount();
        
        res.status(200).json({
            success: true,
            data: categories
        });
        
    } catch (error) {
        console.error('Error en getCategoriesWithCount:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las categorías con conteo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getCategoriesTree = async (req, res) => {
    try {
        const categories = await Category.findAllWithProductCount();
        const tree = await Promise.all(
            categories.map(async (cat) => ({
                ...cat,
                subcategorias: await Subcategory.findByCategoryWithProductCount(cat.id),
            }))
        );

        res.status(200).json({ success: true, data: tree });
    } catch (error) {
        console.error('Error en getCategoriesTree:', error);
        res.status(500).json({ success: false, message: 'Error al obtener árbol de categorías' });
    }
};

/** Categorías visibles en el catálogo público (solo con productos activos) */
const getPublicCategories = async (req, res) => {
    try {
        const data = await Category.findAllForPublicCatalog();
        res.status(200).json({ success: true, data, total: data.length });
    } catch (error) {
        console.error('Error en getPublicCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías del catálogo público',
        });
    }
};

/** Subcategorías visibles en catálogo público para una categoría */
const listPublicSubcategories = async (req, res) => {
    try {
        const categoriaId = parseInt(req.params.categoryId, 10);
        const category = await Category.findById(categoriaId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }

        const data = await Subcategory.findByCategoryForPublicCatalog(categoriaId);
        res.status(200).json({ success: true, data, total: data.length });
    } catch (error) {
        console.error('Error en listPublicSubcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar subcategorías del catálogo público',
        });
    }
};

const listSubcategories = async (req, res) => {
    try {
        const categoriaId = parseInt(req.params.categoryId, 10);
        const category = await Category.findById(categoriaId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }

        const data = await Subcategory.findByCategoryId(categoriaId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error en listSubcategories:', error);
        res.status(500).json({ success: false, message: 'Error al listar subcategorías' });
    }
};

const createSubcategory = async (req, res) => {
    try {
        const categoriaId = parseInt(req.params.categoryId, 10);
        const { nombre, descripcion } = req.body;

        const category = await Category.findById(categoriaId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        }

        const nombreTrim = nombre.trim();
        const existing = await Subcategory.findByCategoryAndName(categoriaId, nombreTrim);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe esa subcategoría en esta categoría',
            });
        }

        const sub = await Subcategory.create({
            categoria_id: categoriaId,
            nombre: nombreTrim,
            descripcion: descripcion || '',
        });

        await Log.create({
            usuario_id: req.user.id,
            accion: 'CREAR_SUBCATEGORIA',
            detalle: `Subcategoría "${nombreTrim}" en ${category.nombre} (ID: ${sub.id})`,
        });

        res.status(201).json({
            success: true,
            message: 'Subcategoría creada',
            data: await Subcategory.findById(sub.id),
        });
    } catch (error) {
        console.error('Error en createSubcategory:', error);
        res.status(500).json({ success: false, message: 'Error al crear subcategoría' });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoriesWithCount,
    getCategoriesTree,
    getPublicCategories,
    listPublicSubcategories,
    listSubcategories,
    createSubcategory,
};