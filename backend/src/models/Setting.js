/**
 * ============================================================
 * ARCHIVO: Setting.js
 * UBICACIÓN: backend/src/models/
 * ROL: model
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Modelo / acceso a datos — Setting.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   MODULES_KEY, SITE_KEY, DEFAULT_MODULES, DEFAULT_SITE, mergeModules,
 *   mergeSite, getModules, updateModules, getSite, updateSite
 *
 * DEPENDENCIAS CLAVE:
 *   database
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

const { query } = require('../config/database');

const MODULES_KEY = 'modules';
const SITE_KEY = 'site';

const DEFAULT_MODULES = {
  public: {
    home: true,
    pc_gamer: true,
    services: true,
    consoles: true,
    peripherals: true,
    contact: true,
  },
  admin: {
    dashboard: true,
    products: true,
    categories: true,
    users: true,
    sales: true,
    reports: true,
    logs: true,
    backup: true,
    settings: true,
  },
  cajero: {
    pos: true,
    history: true,
  },
};

const LOCKED = {
  admin: ['dashboard', 'settings'],
};

const DEFAULT_SITE = {
  general: {
    site_name: 'CoreX',
    site_description: 'Soluciones Tecnológicas',
    contact_email: 'corextechs@gmail.com',
    contact_phone: '3023705751',
    address: 'Cra 78 K #37A-68 Sur, frente al Éxito Kennedy Central, Local 202',
    city: 'Bogotá, Colombia',
    nit: '',
  },
  whatsapp: {
    whatsapp_number: '573023705751',
    whatsapp_message_default: 'Hola, me gustaría obtener más información sobre sus productos y servicios.',
    whatsapp_button_text: 'Consultar por WhatsApp',
  },
  schedule: {
    weekdays: 'Lun - Vie: 9:00 AM - 7:00 PM',
    saturday: 'Sáb: 10:00 AM - 4:00 PM',
    sunday: 'Dom: Cerrado',
  },
  /** HU-054 — paridad Pañalera carrito.minutosExpiracion */
  carrito: {
    minutosExpiracion: 10,
  },
  social: [
    { id: 'facebook', name: 'Facebook', url: 'https://facebook.com/corex', logo: null },
    { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/corex', logo: null },
    { id: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/573023705751', logo: null },
    { id: 'tiktok', name: 'TikTok', url: 'https://tiktok.com/@corex', logo: null },
  ],
};

function mergeModules(partial) {
  const base = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  if (!partial || typeof partial !== 'object') return base;
  for (const area of ['public', 'admin', 'cajero']) {
    if (partial[area] && typeof partial[area] === 'object') {
      base[area] = { ...base[area], ...partial[area] };
    }
  }
  for (const [area, keys] of Object.entries(LOCKED)) {
    keys.forEach((key) => {
      base[area][key] = true;
    });
  }
  return base;
}

function buildMapsUrls(address, city) {
  const queryText = [address, city].filter(Boolean).join(', ');
  const encoded = encodeURIComponent(queryText || 'Bogotá Colombia');
  return {
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    mapsEmbedUrl: `https://www.google.com/maps?q=${encoded}&output=embed`,
  };
}

function formatPhoneDisplay(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('57') && local.length >= 12) local = local.slice(2);
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone || '';
}

function formatPhoneHref(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (!digits.startsWith('57') && digits.length === 10) digits = `57${digits}`;
  return digits;
}

function mergeSite(partial) {
  const base = JSON.parse(JSON.stringify(DEFAULT_SITE));
  if (!partial || typeof partial !== 'object') return enrichSite(base);

  if (partial.general && typeof partial.general === 'object') {
    base.general = { ...base.general, ...partial.general };
  }
  if (partial.whatsapp && typeof partial.whatsapp === 'object') {
    base.whatsapp = { ...base.whatsapp, ...partial.whatsapp };
  }
  if (partial.schedule && typeof partial.schedule === 'object') {
    base.schedule = { ...base.schedule, ...partial.schedule };
  }
  if (partial.carrito && typeof partial.carrito === 'object') {
    const mins = Number(partial.carrito.minutosExpiracion);
    base.carrito = {
      minutosExpiracion:
        Number.isFinite(mins) && mins >= 1 && mins <= 120
          ? Math.round(mins)
          : base.carrito.minutosExpiracion,
    };
  }
  if (Array.isArray(partial.social)) {
    base.social = partial.social
      .filter((s) => s && (s.name || s.id))
      .map((s, index) => ({
        id: String(s.id || s.name || `social-${index}`).toLowerCase().replace(/\s+/g, '-'),
        name: String(s.name || s.id || 'Red'),
        url: String(s.url || '').trim(),
        logo: s.logo ? String(s.logo) : null,
      }));
  }

  return enrichSite(base);
}

function enrichSite(site) {
  const maps = buildMapsUrls(site.general.address, site.general.city);
  const phoneHref = formatPhoneHref(site.general.contact_phone || site.whatsapp.whatsapp_number);
  const waDigits = formatPhoneHref(site.whatsapp.whatsapp_number || site.general.contact_phone);

  const social = (Array.isArray(site.social) ? site.social : []).map((s) => {
    const id = String(s.id || '').toLowerCase();
    if (id === 'whatsapp' && waDigits) {
      return { ...s, url: `https://wa.me/${waDigits}` };
    }
    return s;
  });

  return {
    ...site,
    social,
    contact: {
      phone: formatPhoneDisplay(site.general.contact_phone || site.whatsapp.whatsapp_number),
      phoneHref,
      email: site.general.contact_email,
      address: site.general.address,
      city: site.general.city,
      mapsUrl: maps.mapsUrl,
      mapsEmbedUrl: maps.mapsEmbedUrl,
      schedule: site.schedule,
      whatsappDisplay: formatPhoneDisplay(waDigits),
      whatsappHref: waDigits,
    },
    whatsapp: {
      ...site.whatsapp,
      whatsapp_number: waDigits || site.whatsapp.whatsapp_number,
    },
  };
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(64) PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getByKey(key) {
  await ensureTable();
  const result = await query('SELECT value FROM app_settings WHERE key = $1', [key]);
  if (!result.rows.length) return null;
  return result.rows[0].value;
}

async function setByKey(key, value) {
  await ensureTable();
  await query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, JSON.stringify(value)]
  );
  return value;
}

async function getModules() {
  const stored = await getByKey(MODULES_KEY);
  return mergeModules(stored);
}

async function updateModules(partial) {
  const current = await getModules();
  const next = mergeModules({ ...current, ...partial });
  await setByKey(MODULES_KEY, next);
  return next;
}

async function getSite() {
  const stored = await getByKey(SITE_KEY);
  return mergeSite(stored);
}

async function updateSite(partial) {
  const current = await getSite();
  const nextGeneral = { ...current.general, ...(partial.general || {}) };
  const nextWhatsapp = { ...current.whatsapp, ...(partial.whatsapp || {}) };

  // Una sola fuente: si cambia teléfono en General o en WhatsApp, sincronizar ambos
  if (partial.whatsapp?.whatsapp_number) {
    nextGeneral.contact_phone = String(partial.whatsapp.whatsapp_number).replace(/\D/g, '').replace(/^57/, '') || nextGeneral.contact_phone;
  } else if (partial.general?.contact_phone) {
    nextWhatsapp.whatsapp_number = formatPhoneHref(partial.general.contact_phone) || nextWhatsapp.whatsapp_number;
  }

  const next = mergeSite({
    general: nextGeneral,
    whatsapp: nextWhatsapp,
    schedule: { ...current.schedule, ...(partial.schedule || {}) },
    carrito: partial.carrito
      ? { ...current.carrito, ...partial.carrito }
      : current.carrito,
    social: partial.social !== undefined ? partial.social : current.social,
  });
  await setByKey(SITE_KEY, {
    general: next.general,
    whatsapp: next.whatsapp,
    schedule: next.schedule,
    carrito: next.carrito,
    social: next.social,
  });
  return next;
}

module.exports = {
  MODULES_KEY,
  SITE_KEY,
  DEFAULT_MODULES,
  DEFAULT_SITE,
  mergeModules,
  mergeSite,
  getModules,
  updateModules,
  getSite,
  updateSite,
};
