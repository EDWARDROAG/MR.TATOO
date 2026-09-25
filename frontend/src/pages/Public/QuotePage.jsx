/**
 * ============================================================
 * ARCHIVO: QuotePage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 13:10
 * ============================================================
 * PROPÓSITO:
 *   Página /cotizar con formulario completo.
 *
 * FUNCIONES / API (contrato exporta):
 *   QuotePage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   QuoteForm
 *
 * CONSUMIDORES / RELACIONES:
 *   App.jsx ruta /cotizar
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [1.0] - 2026-09-22 13:10
 *    ✅ HU-040 página de cotización
 * ============================================================
 */

import React from 'react';
import QuoteForm from '../../components/public/QuoteForm';

const QuotePage = () => (
  <section className="mrtatoo-section" style={{ maxWidth: 720, margin: '0 auto' }}>
    <h2>
      Cotiza tu <span>tatuaje</span>
    </h2>
    <p style={{ color: '#9a9a9a', marginBottom: '1.4rem' }}>
      Completa los datos. Recibimos la idea ordenada (estilo, zona, tamaño) en lugar de un mensaje suelto.
    </p>
    <QuoteForm />
  </section>
);

export default QuotePage;
