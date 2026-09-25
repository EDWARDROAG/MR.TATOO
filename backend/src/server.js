/**
 * ============================================================
 * ARCHIVO: server.js
 * UBICACIÓN: backend/src/
 * ROL: entry
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Punto de entrada de la aplicación — server.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   buildCorsOrigins
 *
 * DEPENDENCIAS CLAVE:
 *   database, errorMiddleware, authRoutes, productRoutes, categoryRoutes,
 *   subcategoryRoutes, saleRoutes, userRoutes, reportRoutes, backupRoutes
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

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');

// Cargar variables de entorno
dotenv.config();

// Importar configuración de base de datos
const { connectDB } = require('./config/database');

// Importar middlewares
const { errorMiddleware } = require('./middlewares/errorMiddleware');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const saleRoutes = require('./routes/saleRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const backupRoutes = require('./routes/backupRoutes');
const logRoutes = require('./routes/logRoutes');
const brandRoutes = require('./routes/brandRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3011;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5510';
const NODE_ENV = process.env.NODE_ENV || 'development';

function buildCorsOrigins() {
  const fromEnv = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origins = new Set(fromEnv);
  if (FRONTEND_URL) origins.add(FRONTEND_URL);

  if (NODE_ENV !== 'production') {
    [
      'http://localhost:5510',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5510',
    ].forEach((o) => origins.add(o));
  }

  return [...origins];
}

const CORS_ORIGINS = buildCorsOrigins();

/* ========================================================================== */
/*  MIDDLEWARES GLOBALES                                                      */
/* ========================================================================== */

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));

app.use(morgan('combined'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ========================================================================== */
/*  RUTAS DE LA API                                                           */
/* ========================================================================== */

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/equipment', equipmentRoutes);

/* ========================================================================== */
/*  RUTA DE PRUEBA                                                            */
/* ========================================================================== */

app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', message: 'Mr. Tatoo API funcionando', db: 'up' });
  } catch (err) {
    res.status(503).json({ status: 'DEGRADED', message: 'API up, DB no responde', db: 'down' });
  }
});

/* ========================================================================== */
/*  MANEJO DE ERRORES GLOBAL                                                  */
/* ========================================================================== */

app.use(errorMiddleware);

/* ========================================================================== */
/*  INICIO DEL SERVIDOR                                                       */
/* ========================================================================== */

const startServer = async () => {
    try {
        if (process.env.NODE_ENV === 'production') {
            const dbPass = process.env.DB_PASSWORD || '';
            const jwtSecret = process.env.JWT_SECRET || '';
            if (!dbPass || dbPass.includes('cambiar_password')) {
                console.error('❌ DB_PASSWORD no configurado en backend/.env.production');
                process.exit(1);
            }
            if (!jwtSecret || jwtSecret.includes('cambiar_jwt')) {
                console.error('❌ JWT_SECRET no configurado en backend/.env.production');
                process.exit(1);
            }
        }

        await connectDB();

        try {
          const { ensureSuperAdmin } = require('./services/superAdmin.service');
          await ensureSuperAdmin();
        } catch (saErr) {
          console.warn('⚠️ Super admin:', saErr.message);
        }
        
        const server = app.listen(PORT, () => {
            console.log(`Servidor Mr. Tatoo en puerto ${PORT}`);
            console.log(`📁 Modo: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API disponible en http://localhost:${PORT}/api`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ El puerto ${PORT} ya está en uso. Cierra la otra instancia o cambia PORT en backend/.env`);
            } else {
                console.error('❌ Error al iniciar el servidor HTTP:', error.message);
            }
            process.exit(1);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        if (error.message?.includes('password authentication failed')) {
            console.error('');
            console.error('💡 Contraseña Postgres desincronizada → ./stop-prod.sh -v && ./bootstrap-prod.sh --fresh');
        }
        process.exit(1);
    }
};

startServer();