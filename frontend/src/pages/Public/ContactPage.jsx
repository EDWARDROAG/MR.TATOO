/**
 * ============================================================
 * ARCHIVO: ContactPage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — ContactPage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ContactPage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   PageHero, whatsappHelper, siteInfo, SiteContext, media
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

import React, { useState } from 'react';
import PageHero from '../../components/ui/PageHero';
import { getWhatsAppLink, getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';
import { SITE_CONTACT } from '../../data/siteInfo';
import { useSite } from '../../context/SiteContext';
import { getMediaUrl } from '../../utils/media';

const ContactPage = () => {
  const { contact, social } = useSite();
  const info = contact || SITE_CONTACT;
  const networks = (Array.isArray(social) && social.length ? social : []).filter((s) => s.url);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formSent, setFormSent] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const message =
      `📋 *NUEVO CONTACTO DESDE WEB* 📋\n\n` +
      `*Nombre:* ${formData.name}\n` +
      `*Teléfono:* ${formData.phone}\n` +
      `*Email:* ${formData.email}\n` +
      `*Asunto:* ${formData.subject}\n\n` +
      `*Mensaje:*\n${formData.message}`;

    const phone = getWhatsAppRuntimePhone();
    const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
    setFormSent(true);

    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    });

    setTimeout(() => {
      setFormSent(false);
    }, 5000);
  };

  const handleWhatsAppContact = () => {
    window.open(getWhatsAppLink('contact'), '_blank');
  };

  return (
    <>
      <PageHero
        title="Contacto"
        subtitle="Estamos aquí para ayudarte. Escríbenos por cualquiera de nuestros canales."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Contacto' },
        ]}
      />

      <div className="corex-section corex-section-alt">
        <div className="corex-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="corex-card p-6">
                <h2 className="corex-section-title mb-4 text-xl">Información de Contacto</h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <a
                      href={`tel:${String(info.phone || '').replace(/\s/g, '')}`}
                      className="font-semibold text-gray-900 hover:text-purple-600"
                    >
                      {info.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <a href={`mailto:${info.email}`} className="font-semibold text-gray-900 hover:text-purple-600">
                      {info.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-500">Dirección</p>
                    <p className="font-semibold text-gray-900">{info.address}</p>
                    <p className="text-gray-500">{info.city}</p>
                  </div>
                </div>
              </div>

              <div className="corex-card p-6">
                <h2 className="corex-section-title mb-4 text-xl">Horarios</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Lunes a Viernes</span>
                    <span className="font-medium">{info.schedule?.weekdays || '9:00 AM - 7:00 PM'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Sábados</span>
                    <span className="font-medium">{info.schedule?.saturday || '10:00 AM - 4:00 PM'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Domingos</span>
                    <span className="font-medium text-red-500">{info.schedule?.sunday || 'Cerrado'}</span>
                  </div>
                </div>
              </div>

              <div className="corex-card p-6">
                <h2 className="corex-section-title mb-4 text-xl">Síguenos</h2>
                <div className="grid grid-cols-2 gap-3">
                  {networks.map((item) => (
                    <a
                      key={item.id || item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition hover:opacity-90"
                    >
                      {item.logo ? (
                        <img src={getMediaUrl(item.logo)} alt="" className="h-5 w-5 rounded-full object-cover" />
                      ) : null}
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="corex-card p-6">
                <h2 className="corex-section-title mb-4 text-xl">Envíanos un Mensaje</h2>

                {formSent ? (
                  <div className="corex-empty-state">
                    <h3 className="text-xl font-bold text-gray-900">¡Mensaje enviado!</h3>
                    <p className="corex-page-subtitle">Te redirigiremos a WhatsApp para completar tu mensaje</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="corex-label" htmlFor="name">
                          Nombre *
                        </label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          className="corex-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="corex-label" htmlFor="phone">
                          Teléfono *
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          className="corex-input"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="corex-label" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="corex-input"
                      />
                    </div>
                    <div>
                      <label className="corex-label" htmlFor="subject">
                        Asunto *
                      </label>
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleFormChange}
                        className="corex-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="corex-label" htmlFor="message">
                        Mensaje *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleFormChange}
                        rows="5"
                        className="corex-textarea"
                        required
                      />
                    </div>
                    <button type="submit" className="corex-btn-gradient corex-btn-gradient--md w-full sm:w-auto">
                      Enviar por WhatsApp
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="corex-card mt-8 p-6">
            <h2 className="corex-section-title mb-4 text-xl">Nuestra Ubicación</h2>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={info.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación CoreX"
                className="h-full w-full"
              />
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              {info.address}, {info.city}
            </p>
          </div>

          <div className="mt-8 text-center">
            <button type="button" onClick={handleWhatsAppContact} className="corex-btn-whatsapp px-8 py-3">
              Chatear por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
