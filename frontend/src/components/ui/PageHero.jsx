/**
 * ============================================================
 * ARCHIVO: PageHero.jsx
 * UBICACIÓN: frontend/src/components/ui/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — PageHero.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   PageHero (default)
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

const PageHero = ({ title, subtitle, breadcrumbs = [] }) => (
  <section className="corex-page-hero">
    <div className="corex-container">
      {breadcrumbs.length > 0 && (
        <nav className="corex-breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <span>/</span>}
              {crumb.to ? (
                <Link to={crumb.to}>{crumb.label}</Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <h1 className="corex-page-title text-white">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-gray-400">{subtitle}</p>}
    </div>
  </section>
);

export default PageHero;
