/**
 * ============================================================
 * ARCHIVO: SiteContext.jsx
 * UBICACIÓN: frontend/src/context/
 * ROL: context
 * VERSIÓN: 2.2 — vitrina sin API
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   Contexto React — SiteContext.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   SiteProvider, useSite, SiteContext (default)
 *
 * DEPENDENCIAS CLAVE:
 *   siteInfo, env, settingsService, whatsappHelper
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
 *    ✅ HU-092 — fallback Mr. Tatoo; no llama API en vitrina
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SITE_CONTACT, FOOTER_SOCIAL } from '../data/siteInfo';
import { APP_ENV } from '../config/env';
import { fetchSiteSettings } from '../services/settingsService';
import { setWhatsAppRuntimePhone } from '../utils/whatsappHelper';

const SiteContext = createContext(null);

const fallbackSite = () => ({
  general: {
    site_name: APP_ENV.APP_NAME || 'Mr. Tatoo',
    site_description: 'Arte que vive en tu piel',
    contact_email: SITE_CONTACT.email,
    contact_phone: SITE_CONTACT.phoneHref.replace(/^57/, ''),
    address: SITE_CONTACT.address,
    city: SITE_CONTACT.city,
  },
  whatsapp: {
    whatsapp_number: APP_ENV.WHATSAPP_PHONE,
    whatsapp_message_default: 'Hola, me gustaría obtener más información sobre sus productos y servicios.',
    whatsapp_button_text: 'Consultar por WhatsApp',
  },
  schedule: { ...SITE_CONTACT.schedule },
  social: FOOTER_SOCIAL.map((s) => {
    const id = s.name.toLowerCase();
    const url =
      id === 'whatsapp' && !s.url
        ? `https://wa.me/${String(APP_ENV.WHATSAPP_PHONE || '').replace(/\D/g, '')}`
        : s.url;
    return {
      id,
      name: s.name,
      url,
      logo: null,
    };
  }),
  carrito: { minutosExpiracion: 10 },
  contact: { ...SITE_CONTACT },
});

export function SiteProvider({ children }) {
  const [site, setSite] = useState(fallbackSite);
  const [loading, setLoading] = useState(true);

  const refreshSite = useCallback(async () => {
    if (APP_ENV.isVitrina) {
      const fb = fallbackSite();
      setSite(fb);
      setWhatsAppRuntimePhone(fb.whatsapp.whatsapp_number);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchSiteSettings();
      if (data) {
        setSite(data);
        setWhatsAppRuntimePhone(data?.whatsapp?.whatsapp_number || data?.contact?.phoneHref);
      }
    } catch {
      const fb = fallbackSite();
      setSite(fb);
      setWhatsAppRuntimePhone(fb.whatsapp.whatsapp_number);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSite();
  }, [refreshSite]);

  const value = useMemo(
    () => ({
      site,
      contact: site.contact || SITE_CONTACT,
      social: Array.isArray(site.social) ? site.social : [],
      whatsapp: site.whatsapp,
      carrito: site.carrito || { minutosExpiracion: 10 },
      loading,
      refreshSite,
      setSiteFromAdmin: (next) => {
        setSite(next);
        setWhatsAppRuntimePhone(next?.whatsapp?.whatsapp_number || next?.contact?.phoneHref);
      },
    }),
    [site, loading, refreshSite]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite debe usarse dentro de SiteProvider');
  }
  return ctx;
}

export default SiteContext;
