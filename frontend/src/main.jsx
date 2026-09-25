/**
 * ============================================================
 * ARCHIVO: main.jsx
 * UBICACIÓN: frontend/src/
 * ROL: entry
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Punto de entrada de la aplicación — main.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   (API interna / sin export nombrado detectado)
 *
 * DEPENDENCIAS CLAVE:
 *   App, ThemeContext, ModulesContext, SiteContext, CartContext
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
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ModulesProvider } from './context/ModulesContext';
import { SiteProvider } from './context/SiteContext';
import { CartProvider } from './context/CartContext';
import './index.css';
import './styles/theme.css';
import './styles/globals.css';
import './styles/design-system.css';
import './styles/mr-tatoo.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ModulesProvider>
        <SiteProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </SiteProvider>
      </ModulesProvider>
    </ThemeProvider>
  </React.StrictMode>
);
