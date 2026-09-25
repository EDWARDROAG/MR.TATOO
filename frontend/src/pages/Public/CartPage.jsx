/**
 * ============================================================
 * ARCHIVO: CartPage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — CartPage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   CartPage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   PageHero, CartContext, SiteContext, media, whatsappHelper,
 *   publicOrderWhatsApp
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: ruta /cart
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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/ui/PageHero';
import { useCart } from '../../context/CartContext';
import { useSite } from '../../context/SiteContext';
import { getMediaUrl } from '../../utils/media';
import { generateWhatsAppUrl, getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';
import { buildPurchaseWhatsAppMessage } from '../../utils/publicOrderWhatsApp';

const emptyBilling = () => ({
  nombre: '',
  tipoDocumento: 'CC',
  documento: '',
  telefono: '',
  email: '',
  ciudad: '',
  direccion: '',
  notas: '',
});

const CartPage = () => {
  const {
    cartItems,
    isEmpty,
    subtotalLista,
    subtotal,
    descuento,
    total,
    formatPrice,
    updateQuantity,
    removeFromCart,
    cartRemainingMs,
    cartTtlMinutes,
  } = useCart();
  const { whatsapp, contact } = useSite();
  const [billing, setBilling] = useState(emptyBilling);
  const [error, setError] = useState('');

  const cartMinutesLeft =
    cartRemainingMs > 0 ? Math.ceil(cartRemainingMs / 60000) : 0;

  const onBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmPurchase = (e) => {
    e.preventDefault();
    setError('');

    if (isEmpty) {
      setError('El carrito está vacío');
      return;
    }
    if (!billing.nombre.trim() || !billing.telefono.trim()) {
      setError('Nombre y teléfono son obligatorios para facturación');
      return;
    }

    const phone = getWhatsAppRuntimePhone({ whatsapp, contact });
    const message = buildPurchaseWhatsAppMessage({
      items: cartItems,
      totals: { subtotalLista, subtotal, descuento, total },
      billing,
    });
    const url = generateWhatsAppUrl(phone, message);
    window.open(url, '_blank');
  };

  return (
    <>
      <PageHero
        title="Carrito"
        subtitle={
          !isEmpty && cartMinutesLeft > 0
            ? `Revisa tu pedido. El carrito se vacía en ~${cartMinutesLeft} min (máx. ${cartTtlMinutes} min desde el último cambio).`
            : 'Revisa tu pedido, descuentos y datos de facturación. Al hacer la compra te redirigimos a WhatsApp.'
        }
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Productos', to: '/products' },
          { label: 'Carrito' },
        ]}
      />

      <div className="corex-section corex-section-alt">
        <div className="corex-container">
          {isEmpty ? (
            <div className="corex-card mx-auto max-w-lg p-8 text-center">
              <p className="mb-4 text-gray-600">No hay productos en el carrito.</p>
              <Link to="/products" className="corex-btn-gradient corex-btn-gradient--md inline-flex">
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <article key={item.id} className="corex-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.imagen_url ? (
                        <img
                          src={getMediaUrl(item.imagen_url)}
                          alt={item.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-gray-300">📦</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">{item.nombre}</h3>
                      <div className="mt-1 text-sm text-gray-600">
                        {item.en_promocion && item.precio_lista > item.precio_unitario ? (
                          <>
                            <span className="mr-2 text-gray-400 line-through">
                              {formatPrice(item.precio_lista)}
                            </span>
                            <span className="corex-price">
                              {formatPrice(item.precio_unitario)}
                            </span>
                            <span className="ml-2 text-emerald-600">-{item.descuento_porcentaje}%</span>
                          </>
                        ) : (
                          <span className="corex-price">{formatPrice(item.precio_unitario)}</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="text-sm text-gray-600">
                          Cantidad
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(ev) => updateQuantity(item.id, ev.target.value)}
                            className="ml-2 w-20 rounded border border-gray-300 px-2 py-1"
                          />
                        </label>
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:underline"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-gray-900">
                      {formatPrice(item.precio_unitario * item.quantity)}
                    </div>
                  </article>
                ))}
              </div>

              <aside className="corex-card h-fit space-y-6 p-6">
                <div>
                  <h2 className="corex-section-title mb-3 text-lg">Resumen</h2>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <dt>Subtotal lista</dt>
                      <dd>{formatPrice(subtotalLista)}</dd>
                    </div>
                    {descuento > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <dt>Descuentos</dt>
                        <dd>-{formatPrice(descuento)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                      <dt>Total</dt>
                      <dd className="corex-price">{formatPrice(total)}</dd>
                    </div>
                  </dl>
                </div>

                <form onSubmit={handleConfirmPurchase} className="space-y-3">
                  <h2 className="corex-section-title text-lg">Datos de facturación</h2>
                  <input
                    name="nombre"
                    value={billing.nombre}
                    onChange={onBillingChange}
                    required
                    placeholder="Nombre o razón social *"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <select
                      name="tipoDocumento"
                      value={billing.tipoDocumento}
                      onChange={onBillingChange}
                      className="rounded border border-gray-300 px-2 py-2 text-sm"
                    >
                      <option value="CC">CC</option>
                      <option value="NIT">NIT</option>
                      <option value="CE">CE</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                    <input
                      name="documento"
                      value={billing.documento}
                      onChange={onBillingChange}
                      placeholder="Número de documento"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    name="telefono"
                    value={billing.telefono}
                    onChange={onBillingChange}
                    required
                    placeholder="Teléfono / WhatsApp *"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="email"
                    type="email"
                    value={billing.email}
                    onChange={onBillingChange}
                    placeholder="Email"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="ciudad"
                    value={billing.ciudad}
                    onChange={onBillingChange}
                    placeholder="Ciudad"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="direccion"
                    value={billing.direccion}
                    onChange={onBillingChange}
                    placeholder="Dirección"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    name="notas"
                    value={billing.notas}
                    onChange={onBillingChange}
                    rows={3}
                    placeholder="Notas del pedido"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button type="submit" className="corex-btn-whatsapp w-full px-4 py-3">
                    Hacer compra por WhatsApp
                  </button>
                  <p className="text-xs text-gray-500">
                    Consultar (en el producto) solo pregunta. Este botón confirma intención de compra con el detalle del carrito.
                  </p>
                </form>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
