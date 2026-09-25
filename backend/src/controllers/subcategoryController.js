/**
 * ============================================================
 * ARCHIVO: subcategoryController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Controlador HTTP — endpoints de subcategory.
 *
 * FUNCIONES / API (contrato exporta):
 *   updateSubcategory, deleteSubcategory
 *
 * DEPENDENCIAS CLAVE:
 *   Subcategory, Category, Log
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

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Log = require('../models/Log');

const updateSubcategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await Subcategory.findById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Subcategoría no encontrada' });
        }

        const { nombre, descripcion } = req.body;
        if (nombre && nombre.trim() !== existing.nombre) {
            const dup = await Subcategory.findByCategoryAndName(existing.categoria_id, nombre.trim());
            if (dup && dup.id !== id) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe esa subcategoría en esta categoría',
                });
            }
        }

        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion;

        const sub = await Subcategory.update(id, updateData);

        await Log.create({
            usuario_id: req.user.id,
            accion: 'ACTUALIZAR_SUBCATEGORIA',
            detalle: `Subcategoría actualizada: ${sub.nombre} (ID: ${id})`,
        });

        res.status(200).json({
            success: true,
            message: 'Subcategoría actualizada',
            data: await Subcategory.findById(id),
        });
    } catch (error) {
        console.error('Error en updateSubcategory:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar subcategoría' });
    }
};

const deleteSubcategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await Subcategory.findById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Subcategoría no encontrada' });
        }

        if (await Subcategory.hasProducts(id)) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar: hay productos con esta subcategoría',
            });
        }

        await Subcategory.remove(id);

        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_SUBCATEGORIA',
            detalle: `Subcategoría eliminada: ${existing.nombre} (ID: ${id})`,
        });

        res.status(200).json({ success: true, message: 'Subcategoría eliminada' });
    } catch (error) {
        console.error('Error en deleteSubcategory:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar subcategoría' });
    }
};

module.exports = {
    updateSubcategory,
    deleteSubcategory,
};
