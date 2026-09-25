/**
 * ============================================================
 * ARCHIVO: uploadMiddleware.js
 * UBICACIÓN: backend/src/middlewares/
 * ROL: middleware
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Middleware Express — uploadMiddleware.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   uploadProductImage, uploadReceipt, uploadSocialLogo,
 *   uploadMultipleImages, uploadProductMedia, handleMulterError,
 *   validateFileExists, PRODUCTOS_DIR, COMPROBANTES_DIR, BRANDING_DIR
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

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ========================================================================== */
/*  CONFIGURACIÓN DE ALMACENAMIENTO                                           */
/* ========================================================================== */

// Directorios base de uploads
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const PRODUCTOS_DIR = path.join(UPLOADS_DIR, 'productos');
const COMPROBANTES_DIR = path.join(UPLOADS_DIR, 'comprobantes');
const BRANDING_DIR = path.join(UPLOADS_DIR, 'branding');

// Crear directorios si no existen
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDirectoryExists(PRODUCTOS_DIR);
ensureDirectoryExists(COMPROBANTES_DIR);
ensureDirectoryExists(BRANDING_DIR);

/* ========================================================================== */
/*  FUNCIÓN PARA SANITIZAR NOMBRE DE ARCHIVO                                  */
/* ========================================================================== */

const sanitizeFilename = (originalname) => {
    // Eliminar caracteres especiales y espacios
    const name = originalname
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_')
        .replace(/_+/g, '_');
    
    // Agregar timestamp para evitar colisiones
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${timestamp}_${random}_${name}`;
};

/* ========================================================================== */
/*  CONFIGURACIÓN DE STORAGE PARA PRODUCTOS                                   */
/* ========================================================================== */

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PRODUCTOS_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const sanitized = sanitizeFilename(path.basename(file.originalname, ext));
        cb(null, `${sanitized}${ext}`);
    }
});

/* ========================================================================== */
/*  CONFIGURACIÓN DE STORAGE PARA COMPROBANTES                                */
/* ========================================================================== */

const receiptStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, COMPROBANTES_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const sanitized = sanitizeFilename(path.basename(file.originalname, ext));
        cb(null, `receipt_${sanitized}${ext}`);
    }
});

const brandingStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureDirectoryExists(BRANDING_DIR);
        cb(null, BRANDING_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.png';
        const socialId = String(req.body?.social_id || 'social')
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-')
            .slice(0, 40);
        cb(null, `social_${socialId}_${Date.now()}${ext}`);
    }
});

/* ========================================================================== */
/*  FILTRO DE ARCHIVOS (VALIDACIÓN DE TIPO)                                   */
/* ========================================================================== */

const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Use JPG, PNG o WEBP'), false);
    }
};

const videoFileFilter = (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedExtensions = ['.mp4', '.webm', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de video no permitido. Use MP4 o WEBM'), false);
    }
};

const productMediaFileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        return videoFileFilter(req, file, cb);
    }
    return imageFileFilter(req, file, cb);
};

const fileFilter = imageFileFilter;

/* ========================================================================== */
/*  CONFIGURACIÓN DE LIMITES                                                  */
/* ========================================================================== */

const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Máximo 1 archivo por petición
};

/* ========================================================================== */
/*  MIDDLEWARES DE SUBIDA                                                     */
/* ========================================================================== */

/**
 * Middleware para subir imagen de producto
 * Uso: uploadProductImage.single('imagen')
 */
const uploadProductImage = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: limits
});

/**
 * Middleware para subir comprobante de transferencia
 * Uso: uploadReceipt.single('comprobante')
 */
const uploadReceipt = multer({
    storage: receiptStorage,
    fileFilter: fileFilter,
    limits: limits
});

/**
 * Logo de red social / branding
 * Uso: uploadSocialLogo.single('logo')
 */
const uploadSocialLogo = multer({
    storage: brandingStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 }
});

/**
 * Middleware para subir múltiples imágenes de productos
 * Uso: uploadMultipleImages.array('imagenes', 5)
 */
const uploadMultipleImages = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    }
});

const uploadProductMedia = multer({
    storage: productStorage,
    fileFilter: productMediaFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 11
    }
}).fields([
    { name: 'imagenes', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]);

/* ========================================================================== */
/*  MANEJADOR DE ERRORES DE MULTER                                            */
/* ========================================================================== */

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 5MB',
                code: 'FILE_TOO_LARGE'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Demasiados archivos en la solicitud',
                code: 'LIMIT_FILE_COUNT'
            });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Archivo demasiado grande (imagen 5MB, video 50MB)',
                code: 'FILE_TOO_LARGE'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Error al subir archivo: ${err.message}`,
            code: err.code
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            code: 'INVALID_FILE'
        });
    }
    
    next();
};

/* ========================================================================== */
/*  MIDDLEWARE PARA VALIDAR QUE HAYA ARCHIVO                                  */
/* ========================================================================== */

const validateFileExists = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No se ha subido ningún archivo',
            code: 'NO_FILE'
        });
    }
    next();
};

/* ========================================================================== */
/*  EXPORTAR MIDDLEWARES                                                      */
/* ========================================================================== */

module.exports = {
    uploadProductImage,
    uploadReceipt,
    uploadSocialLogo,
    uploadMultipleImages,
    uploadProductMedia,
    handleMulterError,
    validateFileExists,
    PRODUCTOS_DIR,
    COMPROBANTES_DIR,
    BRANDING_DIR
};