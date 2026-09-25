/**
 * ============================================================
 * ARCHIVO: comparePassword.js
 * UBICACIÓN: backend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — comparePassword.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   comparePassword, comparePasswordWithLogging, comparePasswordSync,
 *   compareWithMultipleHashes, isValidBcryptHash
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

const bcrypt = require('bcrypt');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const SALT_ROUNDS = 10; // Mismo valor que en hashPassword.js

/* ========================================================================== */
/*  COMPARAR CONTRASEÑA (ASÍNCRONA)                                           */
/* ========================================================================== */

/**
 * Compara una contraseña en texto plano con su hash almacenado
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado en la base de datos
 * @returns {Promise<boolean>} - true si coinciden, false en caso contrario
 */
const comparePassword = async (plainPassword, hashedPassword) => {
    // Validar parámetros
    if (!plainPassword || typeof plainPassword !== 'string') {
        console.error('comparePassword: Contraseña en texto plano inválida');
        return false;
    }
    
    if (!hashedPassword || typeof hashedPassword !== 'string') {
        console.error('comparePassword: Hash de contraseña inválido');
        return false;
    }
    
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        return isValid;
    } catch (error) {
        console.error('Error en comparePassword:', error.message);
        return false;
    }
};

/* ========================================================================== */
/*  COMPARAR CONTRASEÑA CON LOGGING                                           */
/* ========================================================================== */

/**
 * Compara contraseñas y registra intentos fallidos (útil para auditoría)
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado
 * @param {object} context - Información de contexto (usuario, IP, etc.)
 * @returns {Promise<{success: boolean, message: string}>}
 */
const comparePasswordWithLogging = async (plainPassword, hashedPassword, context = {}) => {
    if (!plainPassword || !hashedPassword) {
        return {
            success: false,
            message: 'Parámetros inválidos para comparación'
        };
    }
    
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        
        if (!isValid) {
            // Registrar intento fallido (el consumidor puede manejar el log)
            console.warn(`Intento de autenticación fallido para usuario: ${context.email || 'desconocido'}`);
        }
        
        return {
            success: isValid,
            message: isValid ? 'Contraseña correcta' : 'Contraseña incorrecta'
        };
    } catch (error) {
        console.error('Error en comparePasswordWithLogging:', error.message);
        return {
            success: false,
            message: 'Error al verificar la contraseña'
        };
    }
};

/* ========================================================================== */
/*  COMPARAR CONTRASEÑA (SÍNCRONA)                                            */
/* ========================================================================== */

/**
 * Versión síncrona de comparación (solo para scripts y pruebas)
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Hash almacenado
 * @returns {boolean} - true si coinciden, false en caso contrario
 */
const comparePasswordSync = (plainPassword, hashedPassword) => {
    if (!plainPassword || !hashedPassword) {
        return false;
    }
    
    try {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error en comparePasswordSync:', error.message);
        return false;
    }
};

/* ========================================================================== */
/*  VERIFICAR MÚLTIPLES INTENTOS                                              */
/* ========================================================================== */

/**
 * Verifica si una contraseña coincide con alguno de múltiples hashes
 * Útil para migraciones o cuando hay múltiples formatos de hash
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string[]} hashedPasswords - Array de hashes a comparar
 * @returns {Promise<{success: boolean, index: number}>}
 */
const compareWithMultipleHashes = async (plainPassword, hashedPasswords) => {
    if (!plainPassword || !hashedPasswords || !Array.isArray(hashedPasswords)) {
        return { success: false, index: -1 };
    }
    
    for (let i = 0; i < hashedPasswords.length; i++) {
        const isValid = await comparePassword(plainPassword, hashedPasswords[i]);
        if (isValid) {
            return { success: true, index: i };
        }
    }
    
    return { success: false, index: -1 };
};

/* ========================================================================== */
/*  VALIDAR FORMATO DE HASH                                                   */
/* ========================================================================== */

/**
 * Valida si una cadena tiene formato de hash bcrypt válido
 * @param {string} hash - Posible hash bcrypt
 * @returns {boolean} - true si es un hash bcrypt válido
 */
const isValidBcryptHash = (hash) => {
    if (!hash || typeof hash !== 'string') {
        return false;
    }
    
    // El formato bcrypt comienza con $2b$, $2a$ o $2y$ seguido de $ y 2 dígitos
    // Ejemplo: $2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
    const bcryptRegex = /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/;
    return bcryptRegex.test(hash);
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    comparePassword,
    comparePasswordWithLogging,
    comparePasswordSync,
    compareWithMultipleHashes,
    isValidBcryptHash
};