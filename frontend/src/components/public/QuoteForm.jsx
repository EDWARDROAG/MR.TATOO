/**
 * ============================================================
 * ARCHIVO: QuoteForm.jsx
 * UBICACIÓN: frontend/src/components/public/
 * ROL: component
 * VERSIÓN: 1.0 — cotización demo
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 13:10
 * ============================================================
 * PROPÓSITO:
 *   Formulario estructurado de cotización. En el demo arma un WhatsApp ordenado.
 *
 * FUNCIONES / API (contrato exporta):
 *   QuoteForm (default)
 *
 * DEPENDENCIAS CLAVE:
 *   TATTOO_STYLES, whatsappHelper
 *
 * CONSUMIDORES / RELACIONES:
 *   HomePage.jsx, QuotePage.jsx
 *
 * NOTAS:
 *   HU-040. Persistencia admin (HU-042) queda para después.
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [1.0] - 2026-09-22 13:10
 *    ✅ Formulario + envío WhatsApp estructurado
 * ============================================================
 */

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TATTOO_STYLES } from '../../data/tattooContent';
import { generateWhatsAppUrl, getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';
import { useSite } from '../../context/SiteContext';

const ZONES = ['Brazo', 'Antebrazo', 'Pierna', 'Espalda', 'Pecho', 'Mano', 'Otra'];
const SIZES = ['Pequeño (hasta 8 cm)', 'Mediano (8–15 cm)', 'Grande (más de 15 cm)', 'Aún no sé'];

const QuoteForm = ({ compact = false }) => {
  const { whatsapp, contact } = useSite();
  const [params] = useSearchParams();
  const preset = params.get('estilo') || '';
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    whatsapp: '',
    idea: '',
    estilo: preset,
    zona: '',
    tamano: '',
  });

  const phone = useMemo(
    () => getWhatsAppRuntimePhone({ whatsapp, contact }) || import.meta.env.VITE_WHATSAPP_PHONE,
    [whatsapp, contact]
  );

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const msg = [
      '*Cotización Mr. Tatoo*',
      `Nombre: ${form.nombre}`,
      `WhatsApp: ${form.whatsapp}`,
      `Estilo: ${form.estilo || 'por definir'}`,
      `Zona: ${form.zona || 'por definir'}`,
      `Tamaño: ${form.tamano || 'por definir'}`,
      `Idea: ${form.idea}`,
    ].join('\n');
    const url = generateWhatsAppUrl(phone, msg);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <form className="mrtatoo-form" onSubmit={onSubmit}>
      <input name="nombre" required placeholder="Nombre completo" value={form.nombre} onChange={onChange} />
      <input name="whatsapp" required placeholder="WhatsApp" value={form.whatsapp} onChange={onChange} />
      {!compact && (
        <>
          <select name="estilo" value={form.estilo} onChange={onChange}>
            <option value="">Estilo de tatuaje</option>
            {TATTOO_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select name="zona" value={form.zona} onChange={onChange}>
            <option value="">Zona del cuerpo</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <select name="tamano" value={form.tamano} onChange={onChange}>
            <option value="">Tamaño aproximado</option>
            {SIZES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </>
      )}
      {compact && (
        <select name="estilo" value={form.estilo} onChange={onChange}>
          <option value="">Estilo de tatuaje</option>
          {TATTOO_STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
      {compact && (
        <select name="zona" value={form.zona} onChange={onChange}>
          <option value="">Zona del cuerpo</option>
          {ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      )}
      <textarea
        name="idea"
        required
        rows={compact ? 3 : 5}
        placeholder="Cuéntanos tu idea"
        value={form.idea}
        onChange={onChange}
      />
      <button className="mrtatoo-btn mrtatoo-btn--primary" type="submit">
        Enviar solicitud →
      </button>
      {sent && (
        <p style={{ color: '#9a9a9a', fontSize: '0.85rem' }}>
          Solicitud armada. Si WhatsApp no abrió, escríbenos al número del estudio.
        </p>
      )}
    </form>
  );
};

export default QuoteForm;
