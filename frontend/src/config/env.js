/**
 * ============================================================
 * ARCHIVO: env.js
 * UBICACIÓN: frontend/src/config/
 * ROL: config
 * VERSIÓN: 2.2 — flag vitrina
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   Configuración de entorno / infraestructura — env.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   APP_ENV
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: Revisar imports en el resto del proyecto
 *
 * NOTAS:
 *   Frontend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.2] - 2026-09-25 10:00
 *    ✅ HU-092 — APP_ENV.isVitrina (GitHub Pages sin API)
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

const getEnv = (key, fallback = '') => {
  const value = import.meta.env[key];
  return value !== undefined && value !== '' ? value : fallback;
};

export const APP_ENV = {
  APP_NAME: getEnv('VITE_APP_NAME', 'Mr. Tatoo'),
  API_URL: getEnv('VITE_API_URL', 'http://localhost:3011/api'),
  API_TIMEOUT: Number(getEnv('VITE_API_TIMEOUT', '30000')),
  WHATSAPP_PHONE: getEnv('VITE_WHATSAPP_PHONE', '573000000000'),
  WHATSAPP_API_URL: getEnv('VITE_WHATSAPP_API_URL', ''),
  WHATSAPP_API_TOKEN: getEnv('VITE_WHATSAPP_API_TOKEN', ''),
  WHATSAPP_BUSINESS_ACCOUNT: getEnv('VITE_WHATSAPP_BUSINESS_ACCOUNT', 'false') === 'true',
  WHATSAPP_WEBHOOK_URL: getEnv('VITE_WHATSAPP_WEBHOOK_URL', ''),
  isVitrina: getEnv('VITE_VITRINA', 'false') === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  baseUrl: import.meta.env.BASE_URL,
};
