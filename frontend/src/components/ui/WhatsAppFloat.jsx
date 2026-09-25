/**
 * ============================================================
 * ARCHIVO: WhatsAppFloat.jsx
 * UBICACIÓN: frontend/src/components/ui/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — WhatsAppFloat.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   WhatsAppFloat (default)
 *
 * DEPENDENCIAS CLAVE:
 *   SiteContext, whatsappHelper, WhatsAppIcon
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

import React, { useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { generateWhatsAppUrl, getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';
import WhatsAppIcon from './WhatsAppIcon';

const WhatsAppFloat = () => {
  const { whatsapp, contact } = useSite();

  const href = useMemo(() => {
    const phone = getWhatsAppRuntimePhone({ whatsapp, contact });
    const message =
      whatsapp?.whatsapp_message_default ||
      '¡Hola! Me gustaría obtener más información sobre CoreX.';
    return generateWhatsAppUrl(phone, message);
  }, [whatsapp, contact]);

  const label = whatsapp?.whatsapp_button_text || 'Contactar por WhatsApp';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="corex-whatsapp-float"
      aria-label={label}
      title={label}
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
};

export default WhatsAppFloat;
