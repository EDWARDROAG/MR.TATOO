/**
 * ============================================================
 * ARCHIVO: CajeroPOS.jsx
 * UBICACIÓN: frontend/src/pages/Cajero/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Punto de Venta unificado: galería inventarios + formulario venta equipo
 *
 * FUNCIONES / API (contrato exporta):
 *   CajeroPOS (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useSales, LoadingSpinner, CartItem, ReceiptUploader, PosProductThumb,
 *   api, equipmentService
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: App routes /cajero/pos
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSales } from '../../hooks/useSales';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CartItem from '../../components/cajero/CartItem';
import ReceiptUploader from '../../components/cajero/ReceiptUploader';
import PosProductThumb, {
  resolveProductCoverUrl,
} from '../../components/cajero/PosProductThumb';
import api, { extractList } from '../../services/api';
import {
  EQUIPMENT_TIPOS,
  createEquipmentSale,
  downloadEquipmentSalePdf,
  listEquipmentSales,
} from '../../services/equipmentService';

const emptyClientForm = () => ({
  tipo_equipo: 'portatil',
  numero_serie: '',
  garantia_texto: '',
  observaciones: '',
  nombre: '',
  telefono: '',
  documento: '',
  email: '',
});

const CajeroPOS = () => {
  const { createSale, generateInvoice } = useSales();

  const [searchTerm, setSearchTerm] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showReceiptUploader, setShowReceiptUploader] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [equipDocs, setEquipDocs] = useState([]);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const response = await api.get('/products?limit=120');
      const list = extractList(response.data, 'products');
      setCatalog(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading POS catalog:', err);
      setErrorMessage('Error al cargar productos');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadEquipDocs = useCallback(async () => {
    try {
      setEquipDocs(await listEquipmentSales());
    } catch {
      /* listado opcional */
    }
  }, []);

  useEffect(() => {
    loadCatalog();
    loadEquipDocs();
  }, [loadCatalog, loadEquipDocs]);

  const displayedProducts = useMemo(() => {
    let list = catalog.filter(
      (p) => p && p.activo !== false && (p.stock == null || Number(p.stock) > 0)
    );
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          (p.nombre || '').toLowerCase().includes(term) ||
          (p.codigo_barras || '').toLowerCase().includes(term) ||
          (p.sku || '').toLowerCase().includes(term)
      );
    }
    return list;
  }, [catalog, searchTerm]);

  const unitPrice = (product) =>
    Number(product.precio_display ?? product.precio_venta ?? product.precio ?? 0);

  const getTotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);

  const cartDescription = useMemo(
    () =>
      cart
        .map((i) => `${i.nombre} x${i.quantity}`)
        .join('; '),
    [cart]
  );

  const addToCart = (product) => {
    if (product.stock === 0) {
      setErrorMessage('Este producto ya está vendido');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const precio = unitPrice(product);
    const imagen_url = resolveProductCoverUrl(product);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.precio,
              }
            : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          nombre: product.nombre,
          precio,
          quantity: 1,
          subtotal: precio,
          imagen_url,
        },
      ];
    });

    setSuccessMessage(`"${product.nombre}" agregado`);
    setTimeout(() => setSuccessMessage(''), 1500);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.precio }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const setField = (key, value) =>
    setClientForm((f) => ({ ...f, [key]: value }));

  const validateBeforeSale = () => {
    if (cart.length === 0) {
      setErrorMessage('Agrega al menos un producto del inventario');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }
    if (!clientForm.nombre.trim() || !clientForm.telefono.trim()) {
      setErrorMessage('Nombre y teléfono del cliente son obligatorios');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }
    if (paymentMethod === 'transferencia' && !comprobanteFile) {
      setErrorMessage('Sube el comprobante de transferencia');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }
    return true;
  };

  const handleProcessSale = () => {
    if (!validateBeforeSale()) return;
    setShowConfirm(true);
  };

  const handleConfirmSale = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const saleData = {
        items: cart.map((item) => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_unitario: item.precio,
          subtotal: item.subtotal,
        })),
        cliente_nombre: clientForm.nombre.trim(),
        cliente_telefono: clientForm.telefono.trim(),
        metodo_pago: paymentMethod,
      };

      const result = await createSale(saleData, comprobanteFile);
      const sale = result?.sale;
      if (!sale?.id) {
        throw new Error(result?.message || 'No se obtuvo la venta');
      }

      let equipRow = null;
      try {
        equipRow = await createEquipmentSale({
          tipo_equipo: clientForm.tipo_equipo,
          numero_serie: clientForm.numero_serie,
          objeto_descripcion: cartDescription || 'Venta POS',
          precio: getTotal(),
          metodo_pago: paymentMethod,
          observaciones: clientForm.observaciones,
          garantia_texto: clientForm.garantia_texto,
          cliente_nombre: clientForm.nombre.trim(),
          cliente_telefono: clientForm.telefono.trim(),
          cliente_documento: clientForm.documento,
          cliente_email: clientForm.email,
        });
      } catch (equipErr) {
        console.warn('Documento equipo/garantía:', equipErr);
      }

      setSuccessMessage(`Venta #${sale.factura_numero ?? sale.id} registrada`);
      setCart([]);
      setClientForm(emptyClientForm());
      setComprobanteFile(null);
      setShowConfirm(false);
      setPaymentMethod('efectivo');

      await generateInvoice(sale.id);
      if (equipRow?.id) {
        await downloadEquipmentSalePdf(equipRow.id, equipRow.folio || 'garantia');
      }

      await loadCatalog();
      await loadEquipDocs();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error processing sale:', err);
      setErrorMessage(err.message || 'Error al procesar la venta');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const money = (n) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Punto de Venta
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Galería de inventario + datos de venta / garantía
        </p>
      </div>

      {successMessage && (
        <div className="rounded border border-green-400 bg-green-100 px-4 py-2 text-green-800">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-2 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Galería */}
        <div className="space-y-3 lg:col-span-3">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <input
              type="search"
              placeholder="Buscar por nombre o código…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
              autoFocus
            />
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <h2 className="mb-3 text-lg font-semibold">
              Inventario · {displayedProducts.length}
            </h2>
            {catalogLoading && catalog.length === 0 ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="small" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Sin productos</p>
            ) : (
              <div
                className="grid max-h-[min(68vh,620px)] gap-[0.65rem] overflow-y-auto p-1"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
                }}
              >
                {displayedProducts.map((product) => (
                  <div key={product.id} className="flex justify-center">
                    <PosProductThumb product={product} onAdd={addToCart} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulario + carrito */}
        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <h2 className="mb-2 text-lg font-semibold">Carrito</h2>
            {cart.length === 0 ? (
              <p className="py-6 text-center text-gray-500">Selecciona productos</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
            <div className="mt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">{money(getTotal())}</span>
            </div>
            {cart.length > 0 && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2" title={cartDescription}>
                {cartDescription}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <h2 className="mb-3 text-lg font-semibold">Datos de venta / garantía</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="text-sm sm:col-span-1">
                Tipo de equipo
                <select
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  value={clientForm.tipo_equipo}
                  onChange={(e) => setField('tipo_equipo', e.target.value)}
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
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  value={clientForm.numero_serie}
                  onChange={(e) => setField('numero_serie', e.target.value)}
                />
              </label>
              <label className="text-sm">
                Nombre cliente *
                <input
                  required
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  value={clientForm.nombre}
                  onChange={(e) => setField('nombre', e.target.value)}
                />
              </label>
              <label className="text-sm">
                Teléfono *
                <input
                  required
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  value={clientForm.telefono}
                  onChange={(e) => setField('telefono', e.target.value)}
                />
              </label>
              <label className="text-sm">
                Documento
                <input
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  value={clientForm.documento}
                  onChange={(e) => setField('documento', e.target.value)}
                />
              </label>
              <label className="text-sm">
                Email
                <input
                  type="email"
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  value={clientForm.email}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Garantía
                <input
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Ej. 30 días por fallas de fábrica"
                  value={clientForm.garantia_texto}
                  onChange={(e) => setField('garantia_texto', e.target.value)}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Observaciones
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  value={clientForm.observaciones}
                  onChange={(e) => setField('observaciones', e.target.value)}
                />
              </label>
            </div>

            <div className="mt-3">
              <p className="mb-1 text-sm font-medium">Método de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'efectivo', label: 'Efectivo' },
                  { id: 'tarjeta', label: 'Tarjeta' },
                  { id: 'transferencia', label: 'Transfer.' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`rounded-lg border p-2 text-xs font-medium ${
                      paymentMethod === m.id
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {paymentMethod === 'transferencia' && (
                <button
                  type="button"
                  onClick={() => setShowReceiptUploader(true)}
                  className="mt-2 w-full rounded-lg border border-dashed py-2 text-sm text-blue-600"
                >
                  {comprobanteFile
                    ? `📎 ${comprobanteFile.name}`
                    : 'Subir comprobante'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleProcessSale}
              disabled={cart.length === 0 || isProcessing}
              className="mt-4 w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Finalizar venta
            </button>
          </div>
        </div>
      </div>

      {/* Historial documentos equipo / garantía */}
      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold">Documentos de venta / garantía</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2 pr-3">Folio</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Equipo</th>
                <th className="py-2 pr-3">Precio</th>
                <th className="py-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {equipDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-gray-400">
                    Sin documentos aún
                  </td>
                </tr>
              )}
              {equipDocs.slice(0, 15).map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-medium">{r.folio}</td>
                  <td className="py-2 pr-3">{r.cliente_nombre}</td>
                  <td className="py-2 pr-3">{r.objeto_descripcion}</td>
                  <td className="py-2 pr-3">{money(r.precio)}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      className="text-xs text-blue-600 underline"
                      onClick={() => downloadEquipmentSalePdf(r.id, r.folio)}
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

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Confirmar venta</h2>
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ítems</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-blue-600">{money(getTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Pago</span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente</span>
                <span>{clientForm.nombre}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border px-4 py-2"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSale}
                disabled={isProcessing}
                className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {isProcessing ? 'Procesando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptUploader && (
        <ReceiptUploader
          onFileSelect={setComprobanteFile}
          onClose={() => setShowReceiptUploader(false)}
          existingFile={comprobanteFile}
        />
      )}
    </div>
  );
};

export default CajeroPOS;
