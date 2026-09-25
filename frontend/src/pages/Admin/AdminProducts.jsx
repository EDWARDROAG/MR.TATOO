/**
 * ============================================================
 * ARCHIVO: AdminProducts.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminProducts.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminProducts (default)
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
  buildProductFormData,
  calcDiscountPreview,
  createProductForm,
  deleteProduct,
  emptyProductForm,
  fetchCategoriesList,
  fetchInventory,
  fetchProductByBarcode,
  fetchSubcategories,
  normalizeImages,
  toggleProductStatus,
  updateProductForm,
  uploadUrl,
} from '../../services/adminInventoryService';

const formatCop = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n) || 0);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProductForm());
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [keptImages, setKeptImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);

  const flash = useCallback((text, isError = false) => {
    setMessage(text);
    setMessageError(isError);
    setTimeout(() => setMessage(''), 4000);
  }, []);

  const load = useCallback(async () => {
    try {
      const list = await fetchInventory(search.trim());
      setProducts(list);
    } catch {
      flash('Error al cargar inventario', true);
    }
  }, [search, flash]);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await fetchCategoriesList());
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    load();
  }, [load]);

  const loadSubcategories = async (categoriaId) => {
    if (!categoriaId) {
      setSubcategories([]);
      return;
    }
    try {
      setSubcategories(await fetchSubcategories(categoriaId));
    } catch {
      setSubcategories([]);
    }
  };

  const resetMedia = () => {
    setNewImages([]);
    setNewVideo(null);
    setExistingImages([]);
    setKeptImages([]);
    setEditingVideo(false);
    setRemoveVideo(false);
    setSubcategories([]);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyProductForm());
    resetMedia();
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio_compra: p.precio_compra ?? '',
      precio: p.precio,
      stock: p.stock ?? 1,
      codigo_barras: p.codigo_barras || '',
      en_promocion: !!p.en_promocion,
      precio_promocion: p.precio_promocion ?? '',
      categoria_id: p.categoria_id ?? '',
      subcategoria_id: p.subcategoria_id ?? '',
      condicion: p.condicion || 'nuevo',
      destacado: !!p.destacado,
    });
    loadSubcategories(p.categoria_id);
    const imgs = normalizeImages(p.imagenes, p.imagen_url);
    setExistingImages(imgs);
    setKeptImages([...imgs]);
    setEditingVideo(!!p.video_url);
    setRemoveVideo(false);
    setNewImages([]);
    setNewVideo(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetMedia();
  };

  const onCategoryChange = (categoriaId) => {
    setForm((f) => ({ ...f, categoria_id: categoriaId, subcategoria_id: '' }));
    loadSubcategories(categoriaId ? Number(categoriaId) : null);
  };

  const toggleKeepImage = (url, checked) => {
    setKeptImages((prev) => (checked ? [...prev, url].filter((u, i, a) => a.indexOf(u) === i) : prev.filter((u) => u !== url)));
  };

  const lookupBarcode = async () => {
    const code = form.codigo_barras.trim();
    if (!code) return;
    try {
      const p = await fetchProductByBarcode(code);
      if (p) {
        openEdit(p);
        flash('Producto encontrado — modo edición');
      }
    } catch {
      flash('No hay producto con ese código', true);
    }
  };

  const save = async () => {
    if (!form.nombre?.trim() || form.precio === '' || form.precio == null) {
      flash('Nombre y precio de venta son obligatorios', true);
      return;
    }
    setSaving(true);
    try {
      const fd = buildProductFormData(form, {
        editingId,
        keptImages,
        removeVideo,
        newImages,
        newVideo,
      });
      const res = editingId
        ? await updateProductForm(editingId, fd)
        : await createProductForm(fd);
      flash(res.message || 'Guardado correctamente');
      closeForm();
      load();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.data) {
        flash('Ese código ya existe — abriendo producto…', true);
        openEdit(err.response.data.data);
        return;
      }
      const validationErrors = err.response?.data?.errors;
      const detail =
        Array.isArray(validationErrors) && validationErrors.length
          ? validationErrors.map((e) => e.message).join(' · ')
          : err.response?.data?.message || 'Error al guardar';
      flash(detail, true);
    } finally {
      setSaving(false);
    }
  };

  const togglePause = async (p) => {
    try {
      await toggleProductStatus(p.id);
      load();
    } catch {
      flash('No se pudo cambiar el estado', true);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await deleteProduct(p.id);
      flash('Producto eliminado');
      load();
    } catch {
      flash('Error al eliminar', true);
    }
  };

  const thumb = (p) => normalizeImages(p.imagenes, p.imagen_url)[0] ?? null;
  const discountPreview = calcDiscountPreview(form.precio, form.precio_promocion, form.en_promocion);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <Link
          to="/admin/categories"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Gestionar categorías
        </Link>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Agregar producto</h2>
            <p className="mt-1 text-sm text-gray-600">
              Fotos (hasta 10), video, código de barras, promociones y subcategoría.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="admin-btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold">
            + Nuevo producto
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
            placeholder="Buscar nombre o código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <button type="button" onClick={load} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Buscar / actualizar
          </button>
        </div>
      </div>

      {message && (
        <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${messageError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-2">Img</th>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Venta</th>
              <th className="px-3 py-2">Promo</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                  No hay productos en inventario.
                  <button type="button" onClick={openCreate} className="admin-btn-primary ml-2 rounded-lg px-4 py-2 text-sm font-medium">
                    Crear el primero
                  </button>
                </td>
              </tr>
            ) : (
            products.map((p) => (
              <tr key={p.id} className={`border-b ${p.activo === false ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2">
                  {thumb(p) && (
                    <img src={uploadUrl(thumb(p))} alt="" className="h-12 w-12 rounded object-cover" />
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{p.codigo_barras || '—'}</td>
                <td className="px-3 py-2">{p.nombre}</td>
                <td className="px-3 py-2">{formatCop(p.precio)}</td>
                <td className="px-3 py-2">
                  {p.en_promocion && p.precio_promocion ? (
                    <>
                      {formatCop(p.precio_promocion)}
                      <small className="ml-1 text-gray-500">(-{p.porcentaje_descuento}%)</small>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-2">{p.stock}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.activo === false ? 'bg-gray-200' : 'bg-green-100 text-green-800'}`}>
                    {p.activo === false ? 'Pausado' : 'Activo'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => openEdit(p)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                      Editar
                    </button>
                    <button type="button" onClick={() => togglePause(p)} className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                      {p.activo === false ? 'Activar' : 'Pausar'}
                    </button>
                    <button type="button" onClick={() => remove(p)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-700">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeForm}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-bold text-gray-900">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-gray-700">
                Nombre *
                <input className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </label>
              <label className="text-sm text-gray-700">
                Código de barras
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                  value={form.codigo_barras}
                  placeholder="Vacío = auto-generar"
                  onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Precio compra
                <input type="number" className="mt-1 w-full rounded border px-3 py-2" value={form.precio_compra} onChange={(e) => setForm({ ...form, precio_compra: e.target.value })} />
              </label>
              <label className="text-sm">
                Precio venta *
                <input type="number" className="mt-1 w-full rounded border px-3 py-2" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </label>
              <label className="text-sm">
                Stock
                <input type="number" min="0" className="mt-1 w-full rounded border px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </label>
              <label className="text-sm">
                Categoría
                <select className="mt-1 w-full rounded border px-3 py-2" value={form.categoria_id} onChange={(e) => onCategoryChange(e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Subcategoría (opcional)
                <select
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={form.subcategoria_id}
                  disabled={!form.categoria_id || !subcategories.length}
                  onChange={(e) => setForm({ ...form, subcategoria_id: e.target.value })}
                >
                  <option value="">Sin subcategoría</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Condición
                <select className="mt-1 w-full rounded border px-3 py-2" value={form.condicion} onChange={(e) => setForm({ ...form, condicion: e.target.value })}>
                  <option value="nuevo">Nuevo</option>
                  <option value="segunda">Segunda</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.en_promocion} onChange={(e) => setForm({ ...form, en_promocion: e.target.checked })} />
                En promoción
              </label>
              {form.en_promocion && (
                <>
                  <label className="text-sm">
                    Precio promoción
                    <input type="number" className="mt-1 w-full rounded border px-3 py-2" value={form.precio_promocion} onChange={(e) => setForm({ ...form, precio_promocion: e.target.value })} />
                  </label>
                  {discountPreview > 0 && (
                    <p className="text-sm text-gray-500 sm:col-span-2">Descuento calculado: <strong>{discountPreview}%</strong></p>
                  )}
                </>
              )}
            </div>

            <label className="mt-3 block text-sm">
              Descripción
              <textarea className="mt-1 w-full rounded border px-3 py-2" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </label>

            {existingImages.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-gray-600">Imágenes actuales (desmarca para quitar):</p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img) => (
                    <label key={img} className="flex flex-col items-center gap-1 text-xs">
                      <input type="checkbox" checked={keptImages.includes(img)} onChange={(e) => toggleKeepImage(img, e.target.checked)} />
                      <img src={uploadUrl(img)} alt="" className="h-16 w-16 rounded object-cover" />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="mt-3 block text-sm text-gray-700">
              Agregar fotos (máx. 10)
              <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                <input type="file" accept="image/*" multiple className="block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-[#1d4ed8]" onChange={(e) => setNewImages(Array.from(e.target.files || []))} />
                {newImages.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">{newImages.length} archivo(s) seleccionado(s)</p>
                )}
              </div>
            </label>
            <label className="mt-2 block text-sm text-gray-700">
              Video (opcional)
              <div className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-3">
                <input type="file" accept="video/mp4,video/webm" className="block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-700 file:px-3 file:py-1.5 file:text-sm file:text-white" onChange={(e) => { setNewVideo(e.target.files?.[0] ?? null); if (e.target.files?.[0]) setRemoveVideo(false); }} />
                {newVideo && <p className="mt-2 text-xs text-gray-600">{newVideo.name}</p>}
              </div>
            </label>
            {editingId && editingVideo && (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={removeVideo} onChange={(e) => setRemoveVideo(e.target.checked)} />
                Eliminar video actual
              </label>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={saving} onClick={save} className="admin-btn-primary rounded-lg px-4 py-2 text-sm font-medium">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button type="button" onClick={lookupBarcode} disabled={!form.codigo_barras?.trim()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Buscar por código
              </button>
              <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
