/**
 * ============================================================
 * ARCHIVO: EquipmentReceptionsPage.jsx
 * UBICACIÓN: frontend/src/pages/shared/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — EquipmentReceptionsPage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   EquipmentReceptionsPage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   PatternPad, equipmentService
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
import PatternPad from '../../components/common/PatternPad';
import {
  EQUIPMENT_TIPOS,
  createReception,
  downloadReceptionPdf,
  listReceptions,
} from '../../services/equipmentService';

const emptyForm = () => ({
  tipo_equipo: 'portatil',
  numero_serie: '',
  objeto_descripcion: '',
  descripcion_dano: '',
  cliente_nombre: '',
  cliente_telefono: '',
  cliente_documento: '',
  cliente_email: '',
  cliente_direccion: '',
  unlock_tipo: 'ninguno',
  unlock_valor: '',
  unlock_patron: [],
  fecha_notificacion: '',
  fecha_entrega: '',
  acc_bateria: false,
  acc_cargador: false,
  acc_disco_gb: '',
  acc_ram_gb: '',
  valor_estimado: '',
  acepta_condiciones: false,
});

const labelUnlock = (r) => {
  const t = r.unlock_tipo || 'ninguno';
  if (t === 'ninguno') return '—';
  if (t === 'patron') return `Patrón ${r.unlock_valor || ''}`.trim();
  if (t === 'pin') return `PIN ${r.unlock_valor || ''}`.trim();
  if (t === 'password') return 'Contraseña';
  return t;
};

const EquipmentReceptionsPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await listReceptions();
      setItems(data);
    } catch {
      setError('No se pudo cargar el listado');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onUnlockTipoChange = (tipo) => {
    setForm((f) => ({
      ...f,
      unlock_tipo: tipo,
      unlock_valor: '',
      unlock_patron: [],
    }));
  };

  const onPattern = (seq) => {
    setForm((f) => ({
      ...f,
      unlock_patron: seq,
      unlock_valor: seq.map((n) => n + 1).join('-'),
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (form.unlock_tipo === 'patron' && form.unlock_patron.length < 4) {
      setError('El patrón debe tener al menos 4 puntos');
      setSaving(false);
      return;
    }
    if (
      (form.unlock_tipo === 'pin' || form.unlock_tipo === 'password') &&
      !String(form.unlock_valor || '').trim()
    ) {
      setError(form.unlock_tipo === 'pin' ? 'PIN requerido' : 'Contraseña requerida');
      setSaving(false);
      return;
    }
    if (!form.acepta_condiciones) {
      setError('Marca que el cliente leyó las condiciones de servicio y venta');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        unlock_patron: form.unlock_tipo === 'patron' ? form.unlock_patron : null,
        unlock_valor: form.unlock_tipo === 'ninguno' ? '' : form.unlock_valor,
        fecha_notificacion: form.fecha_notificacion || null,
        fecha_entrega: form.fecha_entrega || null,
        valor_estimado: form.valor_estimado === '' ? null : form.valor_estimado,
      };
      const row = await createReception(payload);
      setMessage(`Recepción ${row.folio} creada`);
      setForm(emptyForm());
      await load();
      if (row?.id) await downloadReceptionPdf(row.id, row.folio);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const labelTipo = (v) => EQUIPMENT_TIPOS.find((t) => t.value === v)?.label || v;

  return (
    <div className="p-4 md:p-6">
      <h1 className="corex-display mb-1 text-2xl font-bold text-gray-900">Recepción de equipos</h1>
      <p className="mb-6 text-sm text-gray-500">
        Orden de servicio · PDF con condiciones · aviso 30 días
      </p>

      <form onSubmit={save} className="corex-card mb-6 grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-semibold">Nueva recepción</h2>
        <label className="text-sm">
          Tipo de equipo *
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.tipo_equipo}
            onChange={(e) => setField('tipo_equipo', e.target.value)}
            required
          >
            {EQUIPMENT_TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Número de serie
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.numero_serie}
            onChange={(e) => setField('numero_serie', e.target.value)}
            placeholder="O N/A"
          />
        </label>
        <label className="md:col-span-2 text-sm">
          Objeto / descripción *
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.objeto_descripcion}
            onChange={(e) => setField('objeto_descripcion', e.target.value)}
            required
          />
        </label>
        <label className="md:col-span-2 text-sm">
          Daño / trabajo a reparar *
          <textarea
            className="mt-1 w-full rounded border px-3 py-2"
            rows={3}
            value={form.descripcion_dano}
            onChange={(e) => setField('descripcion_dano', e.target.value)}
            required
          />
        </label>

        <fieldset className="md:col-span-2 rounded-lg border border-gray-200 p-3">
          <legend className="px-1 text-sm font-medium text-gray-700">Accesorios recibidos</legend>
          <div className="mt-1 flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.acc_bateria}
                onChange={(e) => setField('acc_bateria', e.target.checked)}
              />
              Batería
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.acc_cargador}
                onChange={(e) => setField('acc_cargador', e.target.checked)}
              />
              Cargador
            </label>
            <label className="inline-flex items-center gap-2">
              Disco (GB)
              <input
                className="w-20 rounded border px-2 py-1"
                value={form.acc_disco_gb}
                onChange={(e) => setField('acc_disco_gb', e.target.value)}
                placeholder="512"
              />
            </label>
            <label className="inline-flex items-center gap-2">
              RAM (GB)
              <input
                className="w-20 rounded border px-2 py-1"
                value={form.acc_ram_gb}
                onChange={(e) => setField('acc_ram_gb', e.target.value)}
                placeholder="16"
              />
            </label>
          </div>
        </fieldset>

        <label className="text-sm">
          Fecha notificación
          <input
            type="date"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.fecha_notificacion}
            onChange={(e) => setField('fecha_notificacion', e.target.value)}
          />
        </label>
        <label className="text-sm">
          Fecha entrega estimada
          <input
            type="date"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.fecha_entrega}
            onChange={(e) => setField('fecha_entrega', e.target.value)}
          />
        </label>
        <label className="text-sm">
          Valor estimado (COP)
          <input
            type="number"
            min="0"
            step="1000"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.valor_estimado}
            onChange={(e) => setField('valor_estimado', e.target.value)}
            placeholder="Opcional"
          />
        </label>

        <label className="md:col-span-2 text-sm">
          Desbloqueo del equipo
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.unlock_tipo}
            onChange={(e) => onUnlockTipoChange(e.target.value)}
          >
            <option value="ninguno">Ninguno / sin bloqueo</option>
            <option value="patron">Patrón (dibujar)</option>
            <option value="pin">PIN</option>
            <option value="password">Contraseña</option>
          </select>
        </label>

        {form.unlock_tipo === 'patron' && (
          <div className="md:col-span-2 rounded-lg border border-dashed border-gray-300 p-3">
            <p className="mb-2 text-sm text-gray-500">Dibuja el patrón (mínimo 4 puntos)</p>
            <PatternPad value={form.unlock_patron} onChange={onPattern} />
          </div>
        )}
        {form.unlock_tipo === 'pin' && (
          <label className="md:col-span-2 text-sm">
            PIN *
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.unlock_valor}
              onChange={(e) => setField('unlock_valor', e.target.value)}
              inputMode="numeric"
              placeholder="Ej. 2580"
              autoComplete="off"
            />
          </label>
        )}
        {form.unlock_tipo === 'password' && (
          <label className="md:col-span-2 text-sm">
            Contraseña *
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.unlock_valor}
              onChange={(e) => setField('unlock_valor', e.target.value)}
              placeholder="Cualquier texto / caracteres"
              autoComplete="off"
            />
          </label>
        )}

        <label className="text-sm">
          Cliente — nombre *
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.cliente_nombre}
            onChange={(e) => setField('cliente_nombre', e.target.value)}
            required
          />
        </label>
        <label className="text-sm">
          Teléfono *
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.cliente_telefono}
            onChange={(e) => setField('cliente_telefono', e.target.value)}
            required
          />
        </label>
        <label className="text-sm">
          Documento
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.cliente_documento}
            onChange={(e) => setField('cliente_documento', e.target.value)}
          />
        </label>
        <label className="text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.cliente_email}
            onChange={(e) => setField('cliente_email', e.target.value)}
          />
        </label>
        <label className="md:col-span-2 text-sm">
          Dirección
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.cliente_direccion}
            onChange={(e) => setField('cliente_direccion', e.target.value)}
          />
        </label>

        <label className="md:col-span-2 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.acepta_condiciones}
            onChange={(e) => setField('acepta_condiciones', e.target.checked)}
            required
          />
          <span>
            El cliente declara haber leído las <strong>condiciones de servicio técnico</strong> y de{' '}
            <strong>venta</strong> que aparecen en el PDF (pie del documento).
          </span>
        </label>

        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="corex-btn-mono corex-btn-mono--md">
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
              <th className="py-2 pr-3">Desbloqueo</th>
              <th className="py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-gray-400">
                  Sin recepciones aún.
                </td>
              </tr>
            )}
            {items.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium">{r.folio}</td>
                <td className="py-2 pr-3">
                  {r.created_at ? new Date(r.created_at).toLocaleString('es-CO') : '—'}
                </td>
                <td className="py-2 pr-3">
                  {r.cliente_nombre}
                  <br />
                  <span className="text-xs text-gray-500">{r.cliente_telefono}</span>
                </td>
                <td className="py-2 pr-3">
                  {labelTipo(r.tipo_equipo)} — {r.objeto_descripcion}
                </td>
                <td className="py-2 pr-3">{labelUnlock(r)}</td>
                <td className="py-2">
                  <button
                    type="button"
                    className="corex-btn-outline px-2 py-1 text-xs"
                    onClick={() => downloadReceptionPdf(r.id, r.folio)}
                  >
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

export default EquipmentReceptionsPage;
