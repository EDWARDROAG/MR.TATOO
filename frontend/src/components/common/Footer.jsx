/**
 * ============================================================
 * ARCHIVO: Footer.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.3 — anclas HOME
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 20:45
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — Footer.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   Footer (default)
 *
 * DEPENDENCIAS CLAVE:
 *   tattooContent, siteInfo, whatsappHelper, SiteContext, media, SectionLink
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
 * [2.3] - 2026-09-22 20:45
 *    ✅ HU-020 — footer usa las mismas anclas que el nav
 * [2.2] - 2026-09-22 20:30
 *    ✅ HU-013 — logo local en footer
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import React from 'react';
import { SITE_CONTACT, FOOTER_NAV } from '../../data/siteInfo';
import { generateWhatsAppUrl, getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';
import { useSite } from '../../context/SiteContext';
import { getMediaUrl } from '../../utils/media';
import { BRAND_LOGO_WHITE } from '../../data/tattooContent';
import SectionLink from './SectionLink';

const FooterColumnTitle = ({ children }) => (
  <h3 className="corex-display mb-4 text-sm font-bold uppercase tracking-widest text-white">
    {children}
  </h3>
);

const Footer = () => {
  const year = new Date().getFullYear();
  const { contact, social, whatsapp } = useSite();
  const info = contact || SITE_CONTACT;
  const networks = Array.isArray(social) && social.length
    ? social.filter((s) => s.url)
    : [];
  const waPhone = getWhatsAppRuntimePhone({ whatsapp, contact: info });
  const waHref = generateWhatsAppUrl(
    waPhone,
    whatsapp?.whatsapp_message_default || '¡Hola! Quiero cotizar un tatuaje con Mr. Tatoo.'
  );

  return (
    <footer className="bg-black text-white">
      <div className="border-b border-white/10">
        <div className="corex-container corex-footer-brand">
          <div className="corex-footer-brand__content">
            <img className="mrtatoo-brand-logo mrtatoo-brand-logo--footer" src={BRAND_LOGO_WHITE} alt="Mr. Tatoo" />
            <p className="max-w-md text-base text-gray-300 sm:text-lg">
              Arte que vive en tu piel. Tatuajes personalizados en Bogotá.
            </p>
            <p className="corex-display text-2xl font-bold sm:text-3xl">
              <span className="corex-gradient-text">INK. ART. IDENTITY.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="corex-container py-10">
        <div className="corex-footer-grid">
          <div>
            <FooterColumnTitle>Secciones</FooterColumnTitle>
            <ul className="space-y-2.5">
              {FOOTER_NAV.map((item) => (
                <li key={item.label}>
                  <SectionLink to={item.path} className="text-sm text-gray-400 transition hover:text-white">
                    {item.label}
                  </SectionLink>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-gray-500">
              Servicio de tatuaje personalizado y merch del estudio. Sitio de muestra.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {networks.map((item) => (
                <a
                  key={item.id || item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-purple-400"
                  title={item.name}
                >
                  {item.logo ? (
                    <img
                      src={getMediaUrl(item.logo)}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : null}
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <FooterColumnTitle>Contacto</FooterColumnTitle>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <span className="mb-0.5 block text-xs uppercase tracking-wide text-gray-500">Teléfono</span>
                <a
                  href={`tel:${String(info.phone || '').replace(/\s/g, '')}`}
                  className="transition hover:text-white"
                >
                  {info.phone}
                </a>
              </li>
              <li>
                <span className="mb-0.5 block text-xs uppercase tracking-wide text-gray-500">Email</span>
                <a href={`mailto:${info.email}`} className="transition hover:text-white">
                  {info.email}
                </a>
              </li>
              <li>
                <span className="mb-0.5 block text-xs uppercase tracking-wide text-gray-500">WhatsApp</span>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-green-400"
                >
                  {info.whatsappDisplay || info.phone || 'Escríbenos ahora'}
                </a>
              </li>
              <li>
                <span className="mb-0.5 block text-xs uppercase tracking-wide text-gray-500">Horario</span>
                <p>{info.schedule?.weekdays}</p>
                <p>{info.schedule?.saturday}</p>
                <p className="text-red-400">{info.schedule?.sunday}</p>
              </li>
            </ul>
          </div>

          <div>
            <FooterColumnTitle>Ubicación</FooterColumnTitle>
            <address className="not-italic text-sm leading-relaxed text-gray-400">
              <p>{info.address}</p>
              <p className="mt-1 font-medium text-gray-300">{info.city}</p>
            </address>
            <a
              href={info.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="corex-footer-map"
              aria-label="Abrir ubicación en Google Maps"
            >
              <iframe
                src={info.mapsEmbedUrl}
                title="Mapa de ubicación CoreX"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
            <p className="mt-2 text-xs text-gray-500">Clic en el mapa para abrir en Google Maps</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="corex-container flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-gray-500 sm:flex-row sm:text-left">
          <p>© {year} CoreX Technologies. Todos los derechos reservados.</p>
          <p>Tecnología • Gaming • Servicio Técnico</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
