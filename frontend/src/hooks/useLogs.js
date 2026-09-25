/**
 * ============================================================
 * ARCHIVO: useLogs.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useLogs.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useLogs, useLogs (default)
 *
 * DEPENDENCIAS CLAVE:
 *   api
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

import { useState, useCallback } from 'react';
import api from '../services/api';

const unwrap = (payload) => payload?.data ?? payload;

export const useLogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/logs', { params });
      const payload = response.data;
      return {
        data: unwrap(payload)?.logs || unwrap(payload) || [],
        pagination: payload.pagination || unwrap(payload)?.pagination,
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar logs');
      return { data: [], pagination: { page: 1, totalPages: 1, total: 0 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const getLogStats = useCallback(async (params = {}) => {
    try {
      const response = await api.get('/logs/stats', { params });
      return unwrap(response.data);
    } catch (err) {
      console.error('Error loading log stats:', err);
      return { by_action: [], total: 0 };
    }
  }, []);

  const exportLogsToCSV = useCallback(async (filters = {}) => {
    const result = await getLogs({ ...filters, page: 1, limit: 1000 });
    const rows = result.data || [];
    const header = ['id', 'fecha', 'usuario', 'accion', 'detalle'];
    const lines = [
      header.join(','),
      ...rows.map((log) => [
        log.id,
        log.created_at,
        `"${(log.usuario_nombre || '').replace(/"/g, '""')}"`,
        log.accion,
        `"${(log.detalle || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corex-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  }, [getLogs]);

  return {
    loading,
    error,
    getLogs,
    getLogStats,
    exportLogsToCSV,
  };
};

export default useLogs;
