/**
 * ============================================================
 * ARCHIVO: useReports.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useReports.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useReports, useReports (default)
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

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (requestFn) => {
    setLoading(true);
    setError(null);
    try {
      return await requestFn();
    } catch (err) {
      const message = err.response?.data?.message || 'Error al cargar el reporte';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboardMetrics = useCallback(
    () => run(async () => {
      const response = await api.get('/reports/dashboard');
      return unwrap(response.data);
    }),
    [run]
  );

  const getSalesReport = useCallback(
    (params = {}) => run(async () => {
      const response = await api.get('/reports/sales', { params });
      return unwrap(response.data);
    }),
    [run]
  );

  const getTopProductsReport = useCallback(
    (params = {}) => run(async () => {
      const response = await api.get('/reports/top-products', { params });
      const data = unwrap(response.data);
      return data?.top_productos || data;
    }),
    [run]
  );

  const getInventoryReport = useCallback(
    (params = {}) => run(async () => {
      const response = await api.get('/reports/inventory', { params });
      return unwrap(response.data);
    }),
    [run]
  );

  const getCashierClosureReport = useCallback(
    (params = {}) => run(async () => {
      const response = await api.get('/reports/cashier-closure', { params });
      return unwrap(response.data);
    }),
    [run]
  );

  return {
    loading,
    error,
    getDashboardMetrics,
    getSalesReport,
    getTopProductsReport,
    getInventoryReport,
    getCashierClosureReport,
  };
};

export default useReports;
