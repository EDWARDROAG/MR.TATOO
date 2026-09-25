/**
 * ============================================================
 * ARCHIVO: database.js
 * UBICACIÓN: backend/src/config/
 * ROL: config
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Configuración de entorno / infraestructura — database.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   query, transaction, closeConnection, connectDB, pool
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

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

/* ========================================================================== */
/*  CONFIGURACIÓN DEL POOL                                                    */
/* ========================================================================== */

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'corex_db',
    user: process.env.DB_USER || 'corex_user',
    password: process.env.DB_PASSWORD,
    max: 20, // Máximo de conexiones simultáneas
    idleTimeoutMillis: 30000, // Tiempo de inactividad para cerrar conexión
    connectionTimeoutMillis: 2000, // Timeout de conexión
});

/* ========================================================================== */
/*  EVENTOS DEL POOL                                                          */
/* ========================================================================== */

pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en PostgreSQL:', err.message);
    process.exit(1);
});

/* ========================================================================== */
/*  FUNCIÓN PRINCIPAL DE CONSULTA                                             */
/* ========================================================================== */

const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Consulta ejecutada:', { text, duration, rows: res.rowCount });
        }
        
        return res;
    } catch (error) {
        console.error('❌ Error en consulta:', { text, error: error.message });
        throw error;
    }
};

/* ========================================================================== */
/*  FUNCIÓN PARA TRANSACCIONES                                                */
/* ========================================================================== */

const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/* ========================================================================== */
/*  FUNCIÓN PARA CERRAR LA CONEXIÓN                                           */
/* ========================================================================== */

const closeConnection = async () => {
    await pool.end();
    console.log('🔌 Conexión a PostgreSQL cerrada');
};

/* ========================================================================== */
/*  FUNCIÓN PARA CONECTAR (exportada principal)                               */
/* ========================================================================== */

const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('📦 Base de datos PostgreSQL lista');
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.error('');
            console.error('💡 PostgreSQL no está disponible en', `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
            console.error('');
            console.error('   Opción A — LOCAL (sin Docker):');
            console.error('   1. Instala PostgreSQL para Windows (puerto 5432)');
            console.error('   2. Desde la raíz del proyecto:');
            console.error('      powershell -ExecutionPolicy Bypass -File database/setup-local.ps1');
            console.error('   3. cd backend && npm run seed && npm run dev');
            console.error('');
            console.error('   Opción B — Docker (cuando lo uses):');
            console.error('      docker compose -f docker/docker-compose.dev.yml up -d');
            console.error('');
        }
        throw error;
    }
};

module.exports = {
    query,
    transaction,
    closeConnection,
    connectDB,
    pool
};