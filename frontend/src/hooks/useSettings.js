/**
 * ============================================================
 * ARCHIVO: useSettings.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useSettings.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useSettings, useSettings (default)
 *
 * DEPENDENCIAS CLAVE:
 *   siteInfo, env, settingsService
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
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import { useState, useCallback } from 'react';
import { SITE_CONTACT } from '../data/siteInfo';
import { APP_ENV } from '../config/env';
import { fetchSiteSettings, updateSiteSettings } from '../services/settingsService';

const defaultSettings = () => ({
  general: {
    site_name: 'CoreX',
    site_description: 'Soluciones Tecnológicas',
    contact_email: SITE_CONTACT.email,
    contact_phone: SITE_CONTACT.phoneHref.replace(/^57/, ''),
    address: SITE_CONTACT.address,
    city: SITE_CONTACT.city,
    nit: '',
  },
  whatsapp: {
    whatsapp_number: APP_ENV.WHATSAPP_PHONE,
    whatsapp_message_default: 'Hola, me gustaría obtener más información sobre sus productos y servicios.',
    whatsapp_button_text: 'Consultar por WhatsApp',
  },
  preferences: {
    notifications_enabled: true,
    email_notifications: true,
    low_stock_alert: true,
    daily_summary: false,
    items_per_page: 12,
    default_currency: 'COP',
  },
  schedule: { ...SITE_CONTACT.schedule },
  carrito: { minutosExpiracion: 10 },
  social: [],
});

export const useSettings = () => {
  const [loading, setLoading] = useState(false);

  const getSettings = useCallback(async () => {
    setLoading(true);
    try {
      const site = await fetchSiteSettings();
      const base = defaultSettings();
      if (!site) return base;
      return {
        ...base,
        general: { ...base.general, ...(site.general || {}) },
        whatsapp: { ...base.whatsapp, ...(site.whatsapp || {}) },
        schedule: { ...base.schedule, ...(site.schedule || {}) },
        carrito: {
          minutosExpiracion: 10,
          ...(site.carrito || {}),
        },
        social: Array.isArray(site.social) ? site.social : [],
        contact: site.contact,
      };
    } catch {
      return defaultSettings();
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (partial) => {
    setLoading(true);
    try {
      if (partial.preferences) {
        localStorage.setItem('corex_preferences', JSON.stringify(partial.preferences));
      }

      const payload = {};
      if (partial.general) payload.general = partial.general;
      if (partial.whatsapp) payload.whatsapp = partial.whatsapp;
      if (partial.schedule) payload.schedule = partial.schedule;
      if (partial.social) payload.social = partial.social;
      if (partial.carrito) payload.carrito = partial.carrito;

      if (Object.keys(payload).length) {
        const updated = await updateSiteSettings(payload);
        return updated || defaultSettings();
      }

      return {
        ...defaultSettings(),
        preferences: partial.preferences || defaultSettings().preferences,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getSettings,
    updateSettings,
  };
};

export default useSettings;
