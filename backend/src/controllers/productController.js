/**
 * ============================================================
 * ARCHIVO: productController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Controlador HTTP — endpoints de product.
 *
 * FUNCIONES / API (contrato exporta):
 *   createProduct, getProducts, getInventory, getProductById,
 *   getProductByBarcode, updateProduct, toggleProductStatus,
 *   markProductAsSold, deleteProduct, bulkUpdatePrices, getDestacados
 *
 * DEPENDENCIAS CLAVE:
 *   Product, Subcategory, Log, imageOptimizer, productHelpers
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

const Product = require('../models/Product');
const Subcategory = require('../models/Subcategory');
const Log = require('../models/Log');
const {
    optimizeImage,
    deleteMediaFiles,
    saveProductVideo,
} = require('../utils/imageOptimizer');
const {
    calcDiscountPercent,
    generateBarcode,
    enrichProduct,
    parseImagenes,
    parseBool,
    parseNumber,
} = require('../utils/productHelpers');

const mapProduct = (row) => enrichProduct(row);

const mapProducts = (rows) => (rows || []).map(mapProduct);

const processUploadedMedia = async (files) => {
    const imagenes = [];
    let video_url = null;

    if (files?.imagenes?.length) {
        for (const file of files.imagenes) {
            imagenes.push(await optimizeImage(file, 'productos'));
        }
    }

    if (files?.video?.[0]) {
        video_url = await saveProductVideo(files.video[0]);
    }

    return {
        imagenes,
        imagen_url: imagenes[0] || null,
        video_url,
    };
};

const resolveBarcode = async (rawCode) => {
    const trimmed = (rawCode || '').trim();
    if (trimmed) {
        const existing = await Product.findByBarcode(trimmed);
        if (existing) {
            const err = new Error('BARCODE_EXISTS');
            err.existing = existing;
            throw err;
        }
        return trimmed;
    }

    let code = generateBarcode();
    let attempts = 0;
    while (await Product.findByBarcode(code)) {
        code = generateBarcode();
        attempts += 1;
        if (attempts > 5) break;
    }
    return code;
};

const resolveSubcategoria = async (categoriaId, subcategoriaId) => {
    if (!subcategoriaId) return { categoria_id: categoriaId || null, subcategoria_id: null };

    const sub = await Subcategory.findById(subcategoriaId);
    if (!sub) {
        const err = new Error('SUBCATEGORIA_NOT_FOUND');
        throw err;
    }

    if (categoriaId && sub.categoria_id !== categoriaId) {
        const err = new Error('SUBCATEGORIA_MISMATCH');
        throw err;
    }

    return {
        categoria_id: categoriaId || sub.categoria_id,
        subcategoria_id: subcategoriaId,
    };
};

const buildProductPayload = (body, media = {}) => {
    const precioVenta = parseNumber(body.precio ?? body.precio_venta, 0);
    const enPromocion = parseBool(body.en_promocion);
    const precioPromocion = enPromocion ? parseNumber(body.precio_promocion) : null;
    const porcentaje = calcDiscountPercent(precioVenta, precioPromocion, enPromocion);

    return {
        nombre: body.nombre,
        descripcion: body.descripcion || '',
        precio: precioVenta,
        precio_compra: parseNumber(body.precio_compra),
        precio_promocion: precioPromocion,
        en_promocion: enPromocion,
        porcentaje_descuento: porcentaje,
        condicion: body.condicion || 'nuevo',
        categoria_id: body.categoria_id ? parseInt(body.categoria_id, 10) : null,
        subcategoria_id: body.subcategoria_id ? parseInt(body.subcategoria_id, 10) : null,
        destacado: parseBool(body.destacado),
        stock: parseNumber(body.stock, 1),
        activo: body.activo === undefined ? true : parseBool(body.activo, true),
        imagenes: media.imagenes || [],
        imagen_url: media.imagen_url || null,
        video_url: media.video_url || null,
    };
};

const createProduct = async (req, res) => {
    try {
        const { nombre, precio, precio_venta } = req.body;
        const salePrice = precio ?? precio_venta;

        if (!nombre || salePrice === undefined || salePrice === '') {
            return res.status(400).json({
                success: false,
                message: 'Nombre y precio de venta son obligatorios',
            });
        }

        const media = await processUploadedMedia(req.files);
        const codigo_barras = await resolveBarcode(req.body.codigo_barras);
        const payload = buildProductPayload(req.body, media);

        const subResolved = await resolveSubcategoria(payload.categoria_id, payload.subcategoria_id);
        payload.categoria_id = subResolved.categoria_id;
        payload.subcategoria_id = subResolved.subcategoria_id;

        payload.codigo_barras = codigo_barras;

        const product = await Product.create(payload);

        await Log.create({
            usuario_id: req.user.id,
            accion: 'CREAR_PRODUCTO',
            detalle: `Producto creado: ${nombre} (ID: ${product.id}, barcode: ${codigo_barras})`,
        });

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: mapProduct(product),
        });
    } catch (error) {
        if (error.message === 'BARCODE_EXISTS') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un producto con ese código de barras',
                data: mapProduct(error.existing),
            });
        }
        if (error.message === 'SUBCATEGORIA_NOT_FOUND') {
            return res.status(400).json({ success: false, message: 'Subcategoría no encontrada' });
        }
        if (error.message === 'SUBCATEGORIA_MISMATCH') {
            return res.status(400).json({
                success: false,
                message: 'La subcategoría no pertenece a la categoría seleccionada',
            });
        }
        console.error('Error en createProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const {
            categoria_id,
            condicion,
            destacado,
            subcategoria_id,
            search,
            page = 1,
            limit = 20,
        } = req.query;

        const filters = { solo_activos: true };
        if (categoria_id) filters.categoria_id = parseInt(categoria_id, 10);
        if (subcategoria_id) filters.subcategoria_id = parseInt(subcategoria_id, 10);
        if (condicion) filters.condicion = condicion;
        if (destacado !== undefined) filters.destacado = destacado === 'true';
        if (search) filters.search = search;

        const result = await Product.findAll(filters, parseInt(page, 10), parseInt(limit, 10));

        res.status(200).json({
            success: true,
            data: mapProducts(result.products),
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
        });
    }
};

const getInventory = async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const filters = { solo_activos: false };
        if (search) filters.search = search;

        const result = await Product.findAll(filters, parseInt(page, 10), parseInt(limit, 10));

        res.status(200).json({
            success: true,
            data: mapProducts(result.products),
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('Error en getInventory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener inventario',
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(parseInt(req.params.id, 10));

        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        res.status(200).json({ success: true, data: mapProduct(product) });
    } catch (error) {
        console.error('Error en getProductById:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el producto' });
    }
};

const getProductByBarcode = async (req, res) => {
    try {
        const product = await Product.findByBarcode(req.params.code.trim());

        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        res.status(200).json({ success: true, data: mapProduct(product) });
    } catch (error) {
        console.error('Error en getProductByBarcode:', error);
        res.status(500).json({ success: false, message: 'Error al buscar por código de barras' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await Product.findById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const media = await processUploadedMedia(req.files);
        const existingImagenes = parseImagenes(existing.imagenes);
        if (!existingImagenes.length && existing.imagen_url) {
            existingImagenes.push(existing.imagen_url);
        }

        let imagenes = [...existingImagenes];
        if (req.body.imagenes_existentes !== undefined) {
            imagenes = parseImagenes(req.body.imagenes_existentes);
        }
        if (media.imagenes.length) {
            imagenes = [...imagenes, ...media.imagenes];
        }

        const removedImagenes = existingImagenes.filter((url) => !imagenes.includes(url));
        await deleteMediaFiles(removedImagenes);

        let video_url = existing.video_url;
        if (parseBool(req.body.eliminar_video)) {
            if (existing.video_url) await deleteMediaFiles([existing.video_url]);
            video_url = null;
        } else if (media.video_url) {
            if (existing.video_url) await deleteMediaFiles([existing.video_url]);
            video_url = media.video_url;
        }

        const body = { ...req.body };
        if (body.precio === undefined && body.precio_venta === undefined) body.precio = existing.precio;
        if (body.precio_compra === undefined) body.precio_compra = existing.precio_compra;
        if (body.precio_promocion === undefined) body.precio_promocion = existing.precio_promocion;
        if (body.en_promocion === undefined) body.en_promocion = existing.en_promocion;
        if (body.nombre === undefined) body.nombre = existing.nombre;
        if (body.descripcion === undefined) body.descripcion = existing.descripcion;
        if (body.stock === undefined) body.stock = existing.stock;
        if (body.condicion === undefined) body.condicion = existing.condicion;
        if (body.categoria_id === undefined) body.categoria_id = existing.categoria_id;
        if (body.subcategoria_id === undefined) body.subcategoria_id = existing.subcategoria_id;
        if (body.destacado === undefined) body.destacado = existing.destacado;

        const updateData = buildProductPayload(body, {
            imagenes,
            imagen_url: imagenes[0] || null,
            video_url,
        });

        if (req.body.codigo_barras !== undefined) {
            const newCode = (req.body.codigo_barras || '').trim();
            if (newCode) {
                const other = await Product.findByBarcode(newCode);
                if (other && other.id !== id) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ese código de barras ya está en uso',
                    });
                }
                updateData.codigo_barras = newCode;
            }
        }

        const subResolved = await resolveSubcategoria(updateData.categoria_id, updateData.subcategoria_id);
        updateData.categoria_id = subResolved.categoria_id;
        updateData.subcategoria_id = subResolved.subcategoria_id;

        const product = await Product.update(id, updateData);

        await Log.create({
            usuario_id: req.user.id,
            accion: 'ACTUALIZAR_PRODUCTO',
            detalle: `Producto actualizado: ${product.nombre} (ID: ${id})`,
        });

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: mapProduct(product),
        });
    } catch (error) {
        if (error.message === 'SUBCATEGORIA_NOT_FOUND') {
            return res.status(400).json({ success: false, message: 'Subcategoría no encontrada' });
        }
        if (error.message === 'SUBCATEGORIA_MISMATCH') {
            return res.status(400).json({
                success: false,
                message: 'La subcategoría no pertenece a la categoría seleccionada',
            });
        }
        console.error('Error en updateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

const toggleProductStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await Product.findById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const product = await Product.toggleActivo(id);

        await Log.create({
            usuario_id: req.user.id,
            accion: 'PAUSAR_PRODUCTO',
            detalle: `Producto ${product.activo ? 'activado' : 'pausado'}: ${product.nombre} (ID: ${id})`,
        });

        res.status(200).json({
            success: true,
            message: product.activo ? 'Producto activado' : 'Producto pausado',
            data: mapProduct(product),
        });
    } catch (error) {
        console.error('Error en toggleProductStatus:', error);
        res.status(500).json({ success: false, message: 'Error al cambiar estado del producto' });
    }
};

const markProductAsSold = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await Product.findById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        if (existing.stock === 0) {
            return res.status(400).json({ success: false, message: 'El producto ya está agotado' });
        }

        const product = await Product.markAsSold(id);

        await Log.create({
            usuario_id: req.user.id,
            accion: 'MARCAR_VENDIDO',
            detalle: `Producto marcado como vendido: ${existing.nombre} (ID: ${id})`,
        });

        res.status(200).json({
            success: true,
            message: 'Producto marcado como vendido',
            data: mapProduct(product),
        });
    } catch (error) {
        console.error('Error en markProductAsSold:', error);
        res.status(500).json({ success: false, message: 'Error al marcar el producto como vendido' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existing = await Product.findById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const imagenes = parseImagenes(existing.imagenes);
        if (!imagenes.length && existing.imagen_url) imagenes.push(existing.imagen_url);
        const media = [...imagenes];
        if (existing.video_url) media.push(existing.video_url);
        await deleteMediaFiles(media);

        await Product.remove(id);

        await Log.create({
            usuario_id: req.user.id,
            accion: 'ELIMINAR_PRODUCTO',
            detalle: `Producto eliminado: ${existing.nombre} (ID: ${id})`,
        });

        res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el producto' });
    }
};

const bulkUpdatePrices = async (req, res) => {
    try {
        const { percentage } = req.body;

        if (percentage === undefined || Number.isNaN(parseFloat(percentage))) {
            return res.status(400).json({
                success: false,
                message: 'El porcentaje de actualización es requerido',
            });
        }

        const updatedProducts = await Product.bulkUpdatePrice(parseFloat(percentage));

        await Log.create({
            usuario_id: req.user.id,
            accion: 'ACTUALIZAR_PRECIOS_MASIVO',
            detalle: `Actualización masiva de precios: ${percentage}% - ${updatedProducts.length} productos`,
        });

        res.status(200).json({
            success: true,
            message: `Precios actualizados (${updatedProducts.length} productos)`,
            data: updatedProducts,
        });
    } catch (error) {
        console.error('Error en bulkUpdatePrices:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar los precios' });
    }
};

const getDestacados = async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        const products = await Product.getDestacados(parseInt(limit, 10));

        res.status(200).json({
            success: true,
            data: mapProducts(products),
        });
    } catch (error) {
        console.error('Error en getDestacados:', error);
        res.status(500).json({ success: false, message: 'Error al obtener productos destacados' });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getInventory,
    getProductById,
    getProductByBarcode,
    updateProduct,
    toggleProductStatus,
    markProductAsSold,
    deleteProduct,
    bulkUpdatePrices,
    getDestacados,
};
