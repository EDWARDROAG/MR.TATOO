/**
 * ============================================================
 * ARCHIVO: AdminDocumentation.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2026-08-05 21:40
 * ============================================================
 * PROPÓSITO:
 *   Página admin que embebe / enlaza el sitio MkDocs en /docs/ (HU-065).
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminDocumentation (default)
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   App.jsx ruta /admin/documentacion · Sidebar vía ADMIN_NAV
 *
 * NOTAS:
 *   Requiere `.\scripts\docs-build.ps1` para poblar frontend/public/docs/
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [1.0] - 2026-08-05 21:40
 *    ✅ HU-065 — iframe + enlace a /docs/
 * ============================================================
 */

import React, { useState } from 'react';

const DOCS_PATH = '/docs/';

export default function AdminDocumentation() {
  const [iframeOk, setIframeOk] = useState(true);

  return (
    <div className="flex h-full min-h-[70vh] flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentación</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Memory, historias y guías técnicas (MkDocs · HU-065)
          </p>
        </div>
        <a
          href={DOCS_PATH}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Abrir en pestaña nueva
        </a>
      </header>

      {!iframeOk && (
        <div
          className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
          role="status"
        >
          No se cargó <code className="font-mono">/docs/</code>. En la raíz del repo ejecutá{' '}
          <code className="font-mono">.\scripts\docs-build.ps1</code> y recargá (o usá{' '}
          <code className="font-mono">.\scripts\docs-serve.ps1</code> en el puerto 8000).
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <iframe
          title="CoreX documentación MkDocs"
          src={DOCS_PATH}
          className="h-[calc(100vh-12rem)] w-full min-h-[480px] border-0"
          onLoad={(e) => {
            try {
              const doc = e.currentTarget.contentDocument;
              const text = doc?.body?.innerText || '';
              if (text.includes('docs-build.ps1') && !doc?.querySelector('.md-header')) {
                setIframeOk(false);
              }
            } catch {
              /* cross-origin o vacío: dejar iframe */
            }
          }}
          onError={() => setIframeOk(false)}
        />
      </div>
    </div>
  );
}
