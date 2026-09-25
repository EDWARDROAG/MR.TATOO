/**
 * ============================================================
 * ARCHIVO: CartContext.jsx
 * UBICACIÓN: frontend/src/context/
 * ROL: context
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Contexto React — CartContext.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   useCart, CartProvider, CartContext (default)
 *
 * DEPENDENCIAS CLAVE:
 *   formatters, SiteContext
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: ProductCard, ProductDetailPage, CartPage, Navbar
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

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { currencyFormatter } from '../utils/formatters';
import { useSite } from './SiteContext';

const STORAGE_KEY = 'corex_public_cart';
const EXPIRES_KEY = 'corex_public_cart_expires';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

function normalizeCartProduct(product, quantity = 1) {
  const listPrice = Number(product.precio) || 0;
  const onPromo = Boolean(product.en_promocion && product.precio_promocion != null);
  const unitPrice = onPromo ? Number(product.precio_promocion) : listPrice;
  const discountPercent = onPromo
    ? Number(product.porcentaje_descuento) ||
      (listPrice > 0 ? Math.round((1 - unitPrice / listPrice) * 100) : 0)
    : 0;

  return {
    id: product.id,
    nombre: product.nombre || product.name || 'Producto',
    name: product.nombre || product.name || 'Producto',
    imagen_url: product.imagen_url || null,
    precio_lista: listPrice,
    precio_unitario: unitPrice,
    price: unitPrice,
    descuento_porcentaje: discountPercent,
    en_promocion: onPromo,
    quantity: Math.max(1, Number(quantity) || 1),
    addedAt: new Date().toISOString(),
  };
}

function readStoredCart() {
  try {
    const expires = Number(localStorage.getItem(EXPIRES_KEY));
    if (expires && Date.now() > expires) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      return [];
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const { site } = useSite();
  const ttlMinutes = useMemo(() => {
    const m = Number(site?.carrito?.minutosExpiracion);
    return Number.isFinite(m) && m >= 1 && m <= 120 ? m : 10;
  }, [site?.carrito?.minutosExpiracion]);

  const [cartItems, setCartItems] = useState(readStoredCart);
  const [expiresAt, setExpiresAt] = useState(() => {
    const e = Number(localStorage.getItem(EXPIRES_KEY));
    return e > Date.now() ? e : null;
  });
  const tickRef = useRef(null);

  const bumpExpiry = useCallback(
    (items) => {
      if (!items.length) {
        setExpiresAt(null);
        localStorage.removeItem(EXPIRES_KEY);
        return;
      }
      const next = Date.now() + ttlMinutes * 60 * 1000;
      setExpiresAt(next);
      localStorage.setItem(EXPIRES_KEY, String(next));
    },
    [ttlMinutes]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setExpiresAt(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!expiresAt || cartItems.length === 0) return undefined;
    tickRef.current = setInterval(() => {
      if (Date.now() >= expiresAt) {
        clearCart();
      }
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [expiresAt, cartItems.length, clearCart]);

  const totals = useMemo(() => {
    let subtotalLista = 0;
    let subtotal = 0;
    cartItems.forEach((item) => {
      const qty = item.quantity || 1;
      subtotalLista += (Number(item.precio_lista) || Number(item.price) || 0) * qty;
      subtotal += (Number(item.precio_unitario) || Number(item.price) || 0) * qty;
    });
    const descuento = Math.max(0, subtotalLista - subtotal);
    return {
      subtotalLista,
      subtotal,
      descuento,
      total: subtotal,
      itemCount: cartItems.reduce((n, item) => n + (item.quantity || 0), 0),
    };
  }, [cartItems]);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!product?.id) return { success: false, error: 'Producto inválido' };
      if (Number(product.stock) === 0) {
        return { success: false, error: 'Producto no disponible' };
      }

      setCartItems((prev) => {
        const idx = prev.findIndex((item) => String(item.id) === String(product.id));
        let next;
        if (idx >= 0) {
          next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + Math.max(1, quantity),
          };
        } else {
          next = [...prev, normalizeCartProduct(product, quantity)];
        }
        bumpExpiry(next);
        return next;
      });
      return { success: true };
    },
    [bumpExpiry]
  );

  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      const qty = Number(newQuantity);
      setCartItems((prev) => {
        let next;
        if (qty < 1) {
          next = prev.filter((item) => String(item.id) !== String(itemId));
        } else {
          next = prev.map((item) =>
            String(item.id) === String(itemId) ? { ...item, quantity: qty } : item
          );
        }
        bumpExpiry(next);
        return next;
      });
    },
    [bumpExpiry]
  );

  const removeFromCart = useCallback(
    (itemId) => {
      setCartItems((prev) => {
        const next = prev.filter((item) => String(item.id) !== String(itemId));
        bumpExpiry(next);
        return next;
      });
    },
    [bumpExpiry]
  );

  const formatPrice = useCallback((price) => currencyFormatter.formatSimple(price), []);

  const remainingMs = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;

  const value = {
    cartItems,
    ...totals,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    isEmpty: cartItems.length === 0,
    cartExpiresAt: expiresAt,
    cartRemainingMs: remainingMs,
    cartTtlMinutes: ttlMinutes,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
