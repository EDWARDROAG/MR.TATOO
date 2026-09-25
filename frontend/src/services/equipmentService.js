/**
 * ============================================================
 * ARCHIVO: equipmentService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — equipmentService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   EQUIPMENT_TIPOS, listReceptions, createReception, downloadReceptionPdf,
 *   listEquipmentSales, createEquipmentSale, downloadEquipmentSalePdf
 *
 * DEPENDENCIAS CLAVE:
 *   api
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: EquipmentReceptionsPage, EquipmentSalesPage
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

export const EQUIPMENT_TIPOS = [
  { value: 'computador', label: 'Computador de escritorio' },
  { value: 'portatil', label: 'Portátil' },
  { value: 'impresora', label: 'Impresora' },
  { value: 'pc_gamer', label: 'PC Gamer' },
  { value: 'celular', label: 'Celular' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'otro', label: 'Otro' },
];

export async function listReceptions() {
  const { data } = await api.get('/equipment/receptions');
  return data?.data ?? [];
}

export async function createReception(payload) {
  const { data } = await api.post('/equipment/receptions', payload);
  return data?.data;
}

export async function downloadReceptionPdf(id, folio = 'recepcion') {
  const res = await api.get(`/equipment/receptions/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folio}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function listEquipmentSales() {
  const { data } = await api.get('/equipment/sales');
  return data?.data ?? [];
}

export async function createEquipmentSale(payload) {
  const { data } = await api.post('/equipment/sales', payload);
  return data?.data;
}

export async function downloadEquipmentSalePdf(id, folio = 'venta-equipo') {
  const res = await api.get(`/equipment/sales/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folio}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}
