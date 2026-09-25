/**
 * ============================================================
 * ARCHIVO: EquipmentSalesPage.jsx
 * UBICACIÓN: frontend/src/pages/shared/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — EquipmentSalesPage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   EquipmentSalesPage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   equipmentService
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: App routes admin/cajero
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

import React, { useCallback, useEffect, useState } from 'react';
import {
  EQUIPMENT_TIPOS,
  createEquipmentSale,
  downloadEquipmentSalePdf,
  listEquipmentSales,
} from '../../services/equipmentService';

const emptyForm = () => ({
  tipo_equipo: 'portatil',
  numero_serie: '',
  objeto_descripcion: '',
  precio: '',
  metodo_pago: 'efectivo',
  observaciones: '',
  garantia_texto: '',
  cliente_nombre: '',
  cliente_telefono: '',
  cliente_documento: '',
  cliente_email: '',
});

const EquipmentSalesPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await listEquipmentSales());
    } catch {
      setError('No se pudo cargar el listado');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = { ...form, precio: Number(form.precio) };
      const row = await createEquipmentSale(payload);
      setMessage(`Venta ${row.folio} creada`);
      setForm(emptyForm());
      await load();
      if (row?.id) await downloadEquipmentSalePdf(row.id, row.folio);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const labelTipo = (v) => EQUIPMENT_TIPOS.find((t) => t.value === v)?.label || v;
  const money = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n) || 0);

  return (
    <div className="p-4 md:p-6">
      <h1 className="corex-display mb-1 text-2xl font-bold text-gray-900">Venta / entrega de equipo</h1>
      <p className="mb-6 text-sm text-gray-500">Documento de compraventa unitaria · PDF (distinto del POS de catálogo)</p>

      <form onSubmit={save} className="corex-card mb-6 grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-semibold">Nueva venta de equipo</h2>
        <label className="text-sm">
          Tipo de equipo *
          <select className="mt-1 w-full rounded border px-3 py-2" value={form.tipo_equipo} onChange={(e) => setField('tipo_equipo', e.target.value)} required>
            {EQUIPMENT_TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Número de serie
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.numero_serie} onChange={(e) => setField('numero_serie', e.target.value)} />
        </label>
        <label className="md:col-span-2 text-sm">
          Objeto / descripción *
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.objeto_descripcion} onChange={(e) => setField('objeto_descripcion', e.target.value)} required />
        </label>
        <label className="text-sm">
          Precio (COP) *
          <input type="number" min="0" step="1" className="mt-1 w-full rounded border px-3 py-2" value={form.precio} onChange={(e) => setField('precio', e.target.value)} required />
        </label>
        <label className="text-sm">
          Método de pago *
          <select className="mt-1 w-full rounded border px-3 py-2" value={form.metodo_pago} onChange={(e) => setField('metodo_pago', e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className="text-sm">
          Cliente — nombre *
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.cliente_nombre} onChange={(e) => setField('cliente_nombre', e.target.value)} required />
        </label>
        <label className="text-sm">
          Teléfono *
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.cliente_telefono} onChange={(e) => setField('cliente_telefono', e.target.value)} required />
        </label>
        <label className="text-sm">
          Documento
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.cliente_documento} onChange={(e) => setField('cliente_documento', e.target.value)} />
        </label>
        <label className="text-sm">
          Email
          <input type="email" className="mt-1 w-full rounded border px-3 py-2" value={form.cliente_email} onChange={(e) => setField('cliente_email', e.target.value)} />
        </label>
        <label className="md:col-span-2 text-sm">
          Garantía
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.garantia_texto} onChange={(e) => setField('garantia_texto', e.target.value)} placeholder="Ej. 30 días por fallas de fábrica" />
        </label>
        <label className="md:col-span-2 text-sm">
          Observaciones
          <textarea className="mt-1 w-full rounded border px-3 py-2" rows={2} value={form.observaciones} onChange={(e) => setField('observaciones', e.target.value)} />
        </label>
        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="corex-btn-gradient corex-btn-gradient--md">
            {saving ? 'Guardando…' : 'Guardar y generar PDF'}
          </button>
        </div>
      </form>

      {message && <p className="mb-3 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="corex-card overflow-x-auto p-4">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2 pr-3">Folio</th>
              <th className="py-2 pr-3">Fecha</th>
              <th className="py-2 pr-3">Cliente</th>
              <th className="py-2 pr-3">Equipo</th>
              <th className="py-2 pr-3">Precio</th>
              <th className="py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-gray-400">Sin ventas de equipo aún.</td></tr>
            )}
            {items.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium">{r.folio}</td>
                <td className="py-2 pr-3">{r.created_at ? new Date(r.created_at).toLocaleString('es-CO') : '—'}</td>
                <td className="py-2 pr-3">{r.cliente_nombre}</td>
                <td className="py-2 pr-3">{labelTipo(r.tipo_equipo)} — {r.objeto_descripcion}</td>
                <td className="py-2 pr-3">{money(r.precio)}</td>
                <td className="py-2">
                  <button type="button" className="corex-btn-outline px-2 py-1 text-xs" onClick={() => downloadEquipmentSalePdf(r.id, r.folio)}>
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentSalesPage;
