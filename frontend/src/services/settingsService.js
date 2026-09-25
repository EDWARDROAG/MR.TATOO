/**
 * ============================================================
 * ARCHIVO: settingsService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — settingsService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   fetchModules, updateModules, fetchSiteSettings, updateSiteSettings,
 *   uploadSocialLogo
 *
 * DEPENDENCIAS CLAVE:
 *   api, navConfig
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

import api from './api';
import { DEFAULT_MODULES, mergeModules } from '../config/navConfig';

export async function fetchModules() {
  try {
    const { data } = await api.get('/settings/modules');
    return mergeModules(data?.data);
  } catch {
    return DEFAULT_MODULES;
  }
}

export async function updateModules(modules) {
  const { data } = await api.put('/settings/modules', { modules });
  return mergeModules(data?.data);
}

export async function fetchSiteSettings() {
  const { data } = await api.get('/settings/site');
  return data?.data || null;
}

export async function updateSiteSettings(payload) {
  const { data } = await api.put('/settings/site', payload);
  return data?.data || null;
}

export async function uploadSocialLogo(socialId, file) {
  const formData = new FormData();
  formData.append('social_id', socialId);
  formData.append('logo', file);
  const { data } = await api.post('/settings/social-logo', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data?.data || null;
}
