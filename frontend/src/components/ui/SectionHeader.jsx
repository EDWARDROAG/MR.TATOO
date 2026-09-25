/**
 * ============================================================
 * ARCHIVO: SectionHeader.jsx
 * UBICACIÓN: frontend/src/components/ui/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — SectionHeader.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   SectionHeader (default)
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
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, linkTo, linkLabel = 'Ver todas →', centered = false }) => (
  <div className={`mb-8 flex items-end justify-between gap-4 ${centered ? 'flex-col items-center text-center' : ''}`}>
    <h2 className="corex-section-title">{title}</h2>
    {linkTo && (
      <Link to={linkTo} className="corex-link whitespace-nowrap">
        {linkLabel}
      </Link>
    )}
  </div>
);

export default SectionHeader;
