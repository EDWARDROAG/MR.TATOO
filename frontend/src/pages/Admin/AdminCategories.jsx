/**
 * ============================================================
 * ARCHIVO: AdminCategories.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminCategories.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminCategories (default)
 *
 * DEPENDENCIAS CLAVE:
 *   adminInventoryService
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

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  fetchCategoryTree,
  updateCategory,
  updateSubcategory,
} from '../../services/adminInventoryService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingSubId, setEditingSubId] = useState(null);
  const [addingSubForCategoryId, setAddingSubForCategoryId] = useState(null);
  const [parentCategoryName, setParentCategoryName] = useState('');
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' });
  const [subForm, setSubForm] = useState({ nombre: '', descripcion: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);

  const flash = useCallback((text, isError = false) => {
    setMessage(text);
    setMessageError(isError);
    setTimeout(() => setMessage(''), 4000);
  }, []);

  const load = useCallback(async () => {
    try {
      const tree = await fetchCategoryTree();
      setCategories(tree);
    } catch {
      flash('Error al cargar categorías', true);
    }
  }, [flash]);

  useEffect(() => {
    load();
  }, [load]);

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCatForm({ nombre: '', descripcion: '' });
  };

  const cancelSubForm = () => {
    setAddingSubForCategoryId(null);
    setEditingSubId(null);
    setSubForm({ nombre: '', descripcion: '' });
  };

  const saveCategory = async () => {
    const nombre = catForm.nombre.trim();
    if (!nombre) {
      flash('El nombre es obligatorio', true);
      return;
    }
    setSaving(true);
    try {
      const payload = { nombre, descripcion: catForm.descripcion.trim() };
      const res = editingCategoryId
        ? await updateCategory(editingCategoryId, payload)
        : await createCategory(payload);
      flash(res.message || 'Guardado');
      cancelCategoryEdit();
      cancelSubForm();
      load();
    } catch (err) {
      flash(err.response?.data?.message || 'Error al guardar', true);
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (c) => {
    if ((c.total_productos ?? 0) > 0) {
      flash('No se puede eliminar: tiene productos asignados', true);
      return;
    }
    if (!window.confirm(`¿Eliminar categoría "${c.nombre}" y sus subcategorías vacías?`)) return;
    try {
      await deleteCategory(c.id);
      flash('Categoría eliminada');
      load();
    } catch (err) {
      flash(err.response?.data?.message || 'Error al eliminar', true);
    }
  };

  const startAddSub = (c) => {
    setAddingSubForCategoryId(c.id);
    setParentCategoryName(c.nombre);
    setEditingSubId(null);
    setSubForm({ nombre: '', descripcion: '' });
    cancelCategoryEdit();
  };

  const startEditCategory = (c) => {
    setEditingCategoryId(c.id);
    setCatForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    cancelSubForm();
  };

  const startEditSub = (c, s) => {
    setAddingSubForCategoryId(c.id);
    setParentCategoryName(c.nombre);
    setEditingSubId(s.id);
    setSubForm({ nombre: s.nombre, descripcion: s.descripcion || '' });
  };

  const saveSubcategory = async () => {
    const nombre = subForm.nombre.trim();
    if (!nombre || !addingSubForCategoryId) {
      flash('El nombre de subcategoría es obligatorio', true);
      return;
    }
    setSaving(true);
    try {
      const payload = { nombre, descripcion: subForm.descripcion.trim() };
      const res = editingSubId
        ? await updateSubcategory(editingSubId, payload)
        : await createSubcategory(addingSubForCategoryId, payload);
      flash(res.message || 'Subcategoría guardada');
      cancelSubForm();
      load();
    } catch (err) {
      flash(err.response?.data?.message || 'Error al guardar subcategoría', true);
    } finally {
      setSaving(false);
    }
  };

  const removeSub = async (s) => {
    if ((s.total_productos ?? 0) > 0) {
      flash('No se puede eliminar: tiene productos asignados', true);
      return;
    }
    if (!window.confirm(`¿Eliminar subcategoría "${s.nombre}"?`)) return;
    try {
      await deleteSubcategory(s.id);
      flash('Subcategoría eliminada');
      load();
    } catch (err) {
      flash(err.response?.data?.message || 'Error al eliminar', true);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ej: categoría <strong>Xbox</strong> → subcategorías <strong>Juegos</strong>, <strong>Controles</strong>…
          </p>
        </div>
        <Link
          to="/admin/products"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Volver a inventario
        </Link>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-800">
          {editingCategoryId ? 'Editar categoría' : 'Nueva categoría'}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Nombre *</span>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={catForm.nombre}
              onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })}
              placeholder="Ej. Xbox, PlayStation, PC..."
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Descripción (opcional)</span>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={catForm.descripcion}
              onChange={(e) => setCatForm({ ...catForm, descripcion: e.target.value })}
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={saveCategory}
            className="admin-btn-primary rounded-lg px-4 py-2 text-sm font-medium"
          >
            {saving ? 'Guardando…' : editingCategoryId ? 'Actualizar categoría' : 'Crear categoría'}
          </button>
          {editingCategoryId && (
            <button type="button" onClick={cancelCategoryEdit} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {addingSubForCategoryId && (
        <div className="mb-4 rounded-xl border border-primary-200 border-l-4 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold">Subcategoría en «{parentCategoryName}»</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Nombre *</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={subForm.nombre}
                onChange={(e) => setSubForm({ ...subForm, nombre: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Descripción (opcional)</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={subForm.descripcion}
                onChange={(e) => setSubForm({ ...subForm, descripcion: e.target.value })}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={saveSubcategory}
              className="admin-btn-primary rounded-lg px-4 py-2 text-sm font-medium"
            >
              {saving ? 'Guardando…' : editingSubId ? 'Actualizar subcategoría' : 'Crear subcategoría'}
            </button>
            <button type="button" onClick={cancelSubForm} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${messageError ? 'bg-error-100 text-error-800' : 'bg-success-100 text-success-800'}`}>
          {message}
        </p>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No hay categorías. Crea la primera arriba.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="border-b border-gray-100 py-4 last:border-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <strong className="text-gray-900">{c.nombre}</strong>
                  {c.descripcion && <span className="text-gray-500"> — {c.descripcion}</span>}
                  <small className="mt-1 block text-xs text-gray-500">
                    {c.total_productos ?? 0} producto(s) directos
                  </small>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startAddSub(c)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                    + Subcategoría
                  </button>
                  <button type="button" onClick={() => startEditCategory(c)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={(c.total_productos ?? 0) > 0}
                    onClick={() => removeCategory(c)}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {c.subcategorias?.length > 0 && (
                <ul className="mt-2 ml-4 space-y-2 border-t border-dashed border-gray-200 pt-2">
                  {c.subcategorias.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="min-w-[140px] text-gray-700">↳ {s.nombre}</span>
                      <small className="text-xs text-gray-500">{s.total_productos ?? 0} producto(s)</small>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEditSub(c, s)} className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-50">
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={(s.total_productos ?? 0) > 0}
                          onClick={() => removeSub(s)}
                          className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-700 disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
