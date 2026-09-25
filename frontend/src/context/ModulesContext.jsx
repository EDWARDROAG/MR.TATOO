/**
 * ============================================================
 * ARCHIVO: ModulesContext.jsx
 * UBICACIÓN: frontend/src/context/
 * ROL: context
 * VERSIÓN: 2.2 — vitrina sin API
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   Contexto React — ModulesContext.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   ModulesProvider, useModules, ModulesContext (default)
 *
 * DEPENDENCIAS CLAVE:
 *   navConfig, settingsService, env
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
 *    ✅ HU-092 — no llama API en modo vitrina
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { APP_ENV } from '../config/env';
import {
  DEFAULT_MODULES,
  filterNavByModules,
  isModuleEnabled,
  mergeModules,
  resolveRouteModule,
} from '../config/navConfig';
import { fetchModules, updateModules as saveModulesApi } from '../services/settingsService';

const ModulesContext = createContext(null);

export function ModulesProvider({ children }) {
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(async () => {
    if (APP_ENV.isVitrina) {
      setModules(DEFAULT_MODULES);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchModules();
      setModules(mergeModules(data));
    } catch {
      setModules(DEFAULT_MODULES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const updateModules = useCallback(async (partial) => {
    const saved = await saveModulesApi(partial);
    const merged = mergeModules(saved);
    setModules(merged);
    return merged;
  }, []);

  const checkEnabled = useCallback(
    (area, moduleKey) => isModuleEnabled(modules, area, moduleKey),
    [modules]
  );

  const isRouteEnabled = useCallback(
    (pathname, search = '') => {
      const resolved = resolveRouteModule(pathname, search);
      if (!resolved) return true;
      return checkEnabled(resolved.area, resolved.moduleKey);
    },
    [checkEnabled]
  );

  const value = useMemo(
    () => ({
      modules,
      loading,
      loadModules,
      updateModules,
      isModuleEnabled: checkEnabled,
      isRouteEnabled,
      filterNavByModules: (navItems, area) => filterNavByModules(navItems, area, modules),
    }),
    [modules, loading, loadModules, updateModules, checkEnabled, isRouteEnabled]
  );

  return <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>;
}

export function useModules() {
  const ctx = useContext(ModulesContext);
  if (!ctx) {
    throw new Error('useModules debe usarse dentro de ModulesProvider');
  }
  return ctx;
}

export default ModulesContext;
