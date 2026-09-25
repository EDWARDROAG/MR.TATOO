/**
 * ============================================================
 * ARCHIVO: adminInventoryService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — adminInventoryService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   uploadUrl, fetchCategoryTree, createCategory, updateCategory,
 *   deleteCategory, createSubcategory, updateSubcategory, deleteSubcategory,
 *   fetchSubcategories, fetchCategoriesList, fetchInventory,
 *   fetchProductByBarcode, createProductForm, updateProductForm,
 *   toggleProductStatus, deleteProduct
 *
 * DEPENDENCIAS CLAVE:
 *   api, media
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

export const uploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export { normalizeImages } from '../utils/media';

// ——— Categorías ———

export async function fetchCategoryTree() {
  const { data } = await api.get('/categories/tree');
  return data?.data ?? [];
}

export async function createCategory(payload) {
  const { data } = await api.post('/categories', { ...payload, tipo: 'general' });
  return data;
}

export async function updateCategory(id, payload) {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}

export async function createSubcategory(categoriaId, payload) {
  const { data } = await api.post(`/categories/${categoriaId}/subcategories`, payload);
  return data;
}

export async function updateSubcategory(id, payload) {
  const { data } = await api.put(`/subcategories/${id}`, payload);
  return data;
}

export async function deleteSubcategory(id) {
  const { data } = await api.delete(`/subcategories/${id}`);
  return data;
}

export async function fetchSubcategories(categoriaId) {
  const { data } = await api.get(`/categories/${categoriaId}/subcategories`);
  return data?.data ?? [];
}

export async function fetchCategoriesList() {
  const { data } = await api.get('/categories');
  return data?.data ?? [];
}

// ——— Productos ———

export async function fetchInventory(search = '') {
  const params = search ? { search } : {};
  const { data } = await api.get('/products/inventory/all', { params });
  return data?.data ?? [];
}

export async function fetchProductByBarcode(code) {
  const { data } = await api.get(`/products/barcode/${encodeURIComponent(code)}`);
  return data?.data;
}

async function sendProductForm(method, url, formData) {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const { data } = method === 'put'
    ? await api.put(url, formData, config)
    : await api.post(url, formData, config);
  return data;
}

export async function createProductForm(formData) {
  return sendProductForm('post', '/products', formData);
}

export async function updateProductForm(id, formData) {
  return sendProductForm('put', `/products/${id}`, formData);
}

export async function toggleProductStatus(id) {
  const { data } = await api.patch(`/products/${id}/toggle-status`);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

export function calcDiscountPreview(precio, precioPromo, enPromocion) {
  const venta = Number(precio);
  const promo = Number(precioPromo);
  if (!enPromocion || !promo || venta <= 0 || promo >= venta) return 0;
  return Math.round((1 - promo / venta) * 100);
}

export const emptyProductForm = () => ({
  nombre: '',
  descripcion: '',
  precio_compra: '',
  precio: '',
  stock: 1,
  codigo_barras: '',
  en_promocion: false,
  precio_promocion: '',
  categoria_id: '',
  subcategoria_id: '',
  condicion: 'nuevo',
  destacado: false,
});

export function buildProductFormData(form, { editingId, keptImages, removeVideo, newImages, newVideo }) {
  const fd = new FormData();
  fd.append('nombre', form.nombre);
  fd.append('descripcion', form.descripcion || '');
  if (form.precio_compra !== '' && form.precio_compra != null) {
    fd.append('precio_compra', String(form.precio_compra));
  }
  fd.append('precio', String(form.precio));
  fd.append('stock', String(form.stock ?? 1));
  fd.append('condicion', form.condicion);
  fd.append('destacado', String(form.destacado));
  fd.append('en_promocion', String(form.en_promocion));
  if (form.en_promocion && form.precio_promocion !== '' && form.precio_promocion != null) {
    fd.append('precio_promocion', String(form.precio_promocion));
  }
  if (form.categoria_id) fd.append('categoria_id', String(form.categoria_id));
  if (form.subcategoria_id) fd.append('subcategoria_id', String(form.subcategoria_id));
  if (form.codigo_barras?.trim()) fd.append('codigo_barras', form.codigo_barras.trim());

  if (editingId) {
    fd.append('imagenes_existentes', JSON.stringify(keptImages));
    if (removeVideo) fd.append('eliminar_video', 'true');
  }

  (newImages || []).forEach((file) => fd.append('imagenes', file));
  if (newVideo) fd.append('video', newVideo);

  return fd;
}
