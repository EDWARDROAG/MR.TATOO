/**
 * ============================================================
 * ARCHIVO: generateToken.js
 * UBICACIÓN: backend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — generateToken.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   generateToken, generateRefreshToken, verifyToken, decodeToken,
 *   getTokenExpirationTime, refreshToken, extractUserFromToken,
 *   generateTokenPair
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

const jwt = require('jsonwebtoken');

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '8h';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET no está definido en las variables de entorno');
    process.exit(1);
}

/* ========================================================================== */
/*  GENERAR TOKEN DE ACCESO                                                   */
/* ========================================================================== */

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
    
    return token;
};

/* ========================================================================== */
/*  GENERAR TOKEN DE REFRESCO                                                 */
/* ========================================================================== */

const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        type: 'refresh'
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRE
    });
    
    return token;
};

/* ========================================================================== */
/*  VERIFICAR TOKEN                                                           */
/* ========================================================================== */

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            valid: true,
            decoded: decoded,
            expired: false
        };
    } catch (error) {
        return {
            valid: false,
            decoded: null,
            expired: error.name === 'TokenExpiredError',
            error: error.message
        };
    }
};

/* ========================================================================== */
/*  DECODIFICAR TOKEN SIN VERIFICAR                                           */
/* ========================================================================== */

const decodeToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch (error) {
        return null;
    }
};

/* ========================================================================== */
/*  OBTENER TIEMPO DE EXPIRACIÓN RESTANTE                                     */
/* ========================================================================== */

const getTokenExpirationTime = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;
    
    return timeLeft > 0 ? timeLeft : 0;
};

/* ========================================================================== */
/*  REFRESCAR TOKEN                                                           */
/* ========================================================================== */

const refreshToken = (refreshToken) => {
    const verification = verifyToken(refreshToken);
    
    if (!verification.valid || verification.decoded?.type !== 'refresh') {
        return {
            success: false,
            message: 'Refresh token inválido o expirado'
        };
    }
    
    // Generar nuevo token de acceso
    const user = {
        id: verification.decoded.id,
        email: verification.decoded.email
    };
    
    // Obtener información adicional del usuario (si es necesario)
    // Esto debería consultarse a la base de datos
    
    const newToken = generateToken(user);
    
    return {
        success: true,
        token: newToken,
        expiresIn: getTokenExpirationTime(newToken)
    };
};

/* ========================================================================== */
/*  EXTRAER USUARIO DESDE TOKEN                                               */
/* ========================================================================== */

const extractUserFromToken = (token) => {
    const decoded = decodeToken(token);
    
    if (!decoded) {
        return null;
    }
    
    return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        nombre: decoded.nombre
    };
};

/* ========================================================================== */
/*  GENERAR PAR DE TOKENS (ACCESO + REFRESCO)                                 */
/* ========================================================================== */

const generateTokenPair = (user) => {
    return {
        accessToken: generateToken(user),
        refreshToken: generateRefreshToken(user),
        expiresIn: JWT_EXPIRE,
        refreshExpiresIn: JWT_REFRESH_EXPIRE
    };
};

/* ========================================================================== */
/*  EXPORTAR FUNCIONES                                                        */
/* ========================================================================== */

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    getTokenExpirationTime,
    refreshToken,
    extractUserFromToken,
    generateTokenPair
};