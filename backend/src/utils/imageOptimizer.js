/**
 * ============================================================
 * ARCHIVO: imageOptimizer.js
 * UBICACIÓN: backend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — imageOptimizer.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   optimizeImage, optimizeImageWithSizes, deleteImage, deleteMediaFiles,
 *   saveProductVideo, uploadReceipt, deleteReceipt, validateImage, CONFIG
 *
 * DEPENDENCIAS CLAVE:
 *   —
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

const fs = require('fs');
const path = require('path');

/** Carga sharp solo al optimizar — evita que el API no arranque si falta libvips en Docker */
const getSharp = () => require('sharp');

const isSharpDisabled = () => {
    const v = String(process.env.DISABLE_SHARP || '').toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
};

/** Guarda el archivo subido sin procesar (fallback si sharp crashea en la MV) */
const storeUploadedFile = (file, folder) => {
    const outputDir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const outputFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const outputPath = path.join(outputDir, outputFilename);
    fs.renameSync(file.path, outputPath);
    return `/uploads/${folder}/${outputFilename}`;
};

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const CONFIG = {
    // Tamaños de imagen
    SIZES: {
        THUMBNAIL: { width: 150, height: 150, fit: 'cover' },
        MEDIUM: { width: 400, height: 400, fit: 'inside' },
        LARGE: { width: 800, height: 800, fit: 'inside' }
    },
    // Calidad de compresión (1-100)
    QUALITY: 80,
    // Formato de salida
    OUTPUT_FORMAT: 'webp',
    // Tamaño máximo de archivo original (5MB)
    MAX_FILE_SIZE: 5 * 1024 * 1024
};

/* ========================================================================== */
/*  OPTIMIZAR IMAGEN                                                          */
/* ========================================================================== */

/**
 * Optimiza una imagen subida: redimensiona, comprime y convierte a WebP
 * @param {Object} file - Archivo subido por multer
 * @param {string} folder - Carpeta destino ('productos' o 'comprobantes')
 * @returns {Promise<string>} - Ruta de la imagen optimizada
 */
const optimizeImage = async (file, folder = 'productos') => {
    if (!file || !file.path) {
        throw new Error('Archivo no válido para optimizar');
    }

    if (isSharpDisabled()) {
        return storeUploadedFile(file, folder);
    }
    
    const outputDir = path.join(__dirname, '../../uploads', folder);
    const outputFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${CONFIG.OUTPUT_FORMAT}`;
    const outputPath = path.join(outputDir, outputFilename);
    
    try {
        // Verificar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Procesar imagen con sharp
        await getSharp()(file.path)
            .resize(CONFIG.SIZES.LARGE.width, CONFIG.SIZES.LARGE.height, {
                fit: CONFIG.SIZES.LARGE.fit,
                withoutEnlargement: true
            })
            .webp({ quality: CONFIG.QUALITY })
            .toFile(outputPath);
        
        // Eliminar archivo original
        fs.unlinkSync(file.path);
        
        return `/uploads/${folder}/${outputFilename}`;
    } catch (error) {
        console.error('Error al optimizar imagen (fallback sin sharp):', error.message);

        if (fs.existsSync(file.path)) {
            return storeUploadedFile(file, folder);
        }

        throw new Error('No se pudo procesar la imagen');
    }
};

/* ========================================================================== */
/*  OPTIMIZAR IMAGEN CON MÚLTIPLES TAMAÑOS                                    */
/* ========================================================================== */

/**
 * Optimiza una imagen y genera múltiples tamaños (thumbnail, medium, large)
 * @param {Object} file - Archivo subido por multer
 * @param {string} folder - Carpeta destino
 * @returns {Promise<Object>} - Objeto con rutas de todos los tamaños
 */
const optimizeImageWithSizes = async (file, folder = 'productos') => {
    if (!file || !file.path) {
        throw new Error('Archivo no válido para optimizar');
    }
    
    const outputDir = path.join(__dirname, '../../uploads', folder);
    const baseName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const result = {};
    
    try {
        // Verificar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Leer imagen original
        const image = getSharp()(file.path);
        const metadata = await image.metadata();
        
        // Generar cada tamaño
        for (const [sizeName, sizeConfig] of Object.entries(CONFIG.SIZES)) {
            const outputFilename = `${baseName}_${sizeName.toLowerCase()}.${CONFIG.OUTPUT_FORMAT}`;
            const outputPath = path.join(outputDir, outputFilename);
            
            let resizeOptions = {
                width: sizeConfig.width,
                height: sizeConfig.height,
                fit: sizeConfig.fit,
                withoutEnlargement: true
            };
            
            // Para tamaño large, mantener proporción
            if (sizeName === 'LARGE') {
                resizeOptions = {
                    width: sizeConfig.width,
                    withoutEnlargement: true
                };
            }
            
            await getSharp()(file.path)
                .resize(resizeOptions)
                .webp({ quality: CONFIG.QUALITY })
                .toFile(outputPath);
            
            result[sizeName.toLowerCase()] = {
                path: outputPath,
                url: `/uploads/${folder}/${outputFilename}`,
                width: sizeConfig.width,
                height: sizeConfig.height
            };
        }
        
        // Eliminar archivo original
        fs.unlinkSync(file.path);
        
        return result;
    } catch (error) {
        console.error('Error al optimizar imagen con múltiples tamaños:', error);
        
        // Si falla, intentar optimización simple
        try {
            const simplePath = await optimizeImage(file, folder);
            return {
                simple: {
                    path: simplePath,
                    url: `/uploads/${folder}/${path.basename(simplePath)}`
                }
            };
        } catch (fallbackError) {
            throw new Error('No se pudo procesar la imagen');
        }
    }
};

/* ========================================================================== */
/*  ELIMINAR IMAGEN                                                           */
/* ========================================================================== */

/**
 * Elimina una imagen del servidor
 * @param {string} imageUrl - URL o ruta de la imagen
 * @returns {Promise<boolean>} - true si se eliminó, false si no existía
 */
const deleteImage = async (imageUrl) => {
    if (!imageUrl) {
        return false;
    }
    
    try {
        // Extraer ruta del archivo desde la URL
        let filePath;
        
        if (imageUrl.startsWith('/uploads/')) {
            filePath = path.join(__dirname, '../../', imageUrl);
        } else if (imageUrl.startsWith('http')) {
            // Si es URL completa, extraer la parte de la ruta
            const urlPath = new URL(imageUrl).pathname;
            filePath = path.join(__dirname, '../../', urlPath);
        } else {
            filePath = imageUrl;
        }
        
        // Verificar si el archivo existe
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            
            // También eliminar versiones adicionales si existen (thumbnail, medium)
            const dir = path.dirname(filePath);
            const basename = path.basename(filePath, path.extname(filePath));
            const baseNameWithoutSize = basename.replace(/_(thumbnail|medium|large)$/, '');
            
            const files = fs.readdirSync(dir);
            for (const file of files) {
                if (file.startsWith(baseNameWithoutSize) && file !== path.basename(filePath)) {
                    fs.unlinkSync(path.join(dir, file));
                }
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        return false;
    }
};

/* ========================================================================== */
/*  SUBIR Y OPTIMIZAR COMPROBANTE                                             */
/* ========================================================================== */

/**
 * Sube y optimiza un comprobante de pago (sin redimensionar drásticamente)
 * @param {Object} file - Archivo subido por multer
 * @param {string} folder - Carpeta destino
 * @returns {Promise<string>} - Ruta del comprobante optimizado
 */
const uploadReceipt = async (file, folder = 'comprobantes') => {
    if (!file || !file.path) {
        throw new Error('Archivo no válido para subir');
    }
    
    const outputDir = path.join(__dirname, '../../uploads', folder);
    const outputFilename = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const outputPath = path.join(outputDir, outputFilename);
    
    try {
        // Verificar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Para comprobantes, solo comprimir sin cambiar dimensiones
        await getSharp()(file.path)
            .jpeg({ quality: 85 })
            .toFile(outputPath);
        
        // Eliminar archivo original
        fs.unlinkSync(file.path);
        
        return outputPath;
    } catch (error) {
        console.error('Error al subir comprobante:', error);
        
        // Si falla, mantener el original
        if (fs.existsSync(file.path)) {
            const originalExt = path.extname(file.path);
            const originalOutputPath = path.join(outputDir, `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${originalExt}`);
            fs.renameSync(file.path, originalOutputPath);
            return originalOutputPath;
        }
        
        throw new Error('No se pudo procesar el comprobante');
    }
};

/* ========================================================================== */
/*  ELIMINAR COMPROBANTE                                                      */
/* ========================================================================== */

/**
 * Elimina un comprobante de pago
 * @param {string} receiptUrl - URL o ruta del comprobante
 * @returns {Promise<boolean>} - true si se eliminó
 */
const deleteReceipt = async (receiptUrl) => {
    return deleteImage(receiptUrl);
};

/* ========================================================================== */
/*  VALIDAR IMAGEN                                                            */
/* ========================================================================== */

/**
 * Valida si un archivo es una imagen válida
 * @param {Object} file - Archivo subido por multer
 * @returns {Promise<boolean>} - true si es válida
 */
const validateImage = async (file) => {
    if (!file || !file.path) {
        return false;
    }
    
    try {
        const metadata = await getSharp()(file.path).metadata();
        const isValidFormat = ['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format);
        const isValidSize = file.size <= CONFIG.MAX_FILE_SIZE;
        
        return isValidFormat && isValidSize;
    } catch (error) {
        return false;
    }
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

const saveProductVideo = async (file) => {
    if (!file || !file.path) {
        throw new Error('Archivo de video no válido');
    }

    const outputDir = path.join(__dirname, '../../uploads/productos');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const outputFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const outputPath = path.join(outputDir, outputFilename);

    fs.renameSync(file.path, outputPath);
    return `/uploads/productos/${outputFilename}`;
};

const deleteMediaFiles = async (urls = []) => {
    for (const url of urls) {
        if (url) await deleteImage(url);
    }
};

module.exports = {
    optimizeImage,
    optimizeImageWithSizes,
    deleteImage,
    deleteMediaFiles,
    saveProductVideo,
    uploadReceipt,
    deleteReceipt,
    validateImage,
    CONFIG
};