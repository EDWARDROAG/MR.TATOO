/**
 * ============================================================
 * ARCHIVO: CajeroCart.jsx
 * UBICACIÓN: frontend/src/pages/Cajero/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — CajeroCart.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   CajeroCart (default)
 *
 * DEPENDENCIAS CLAVE:
 *   CartItem
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

import React from 'react';
import CartItem from '../../components/cajero/CartItem';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const CajeroCart = ({ cart, onUpdateQuantity, onRemove, onClearCart }) => {
  /* ========================================================================= */
  /*  CALCULAR TOTAL                                                           */
  /* ========================================================================= */

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE CARRITO VACÍO                                             */
  /* ========================================================================= */

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-500 dark:text-gray-400">El carrito está vacío</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Agrega productos desde la búsqueda
        </p>
      </div>
    );
  }

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="flex flex-col h-full">
      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto max-h-96 space-y-2 mb-4">
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Resumen del carrito */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Total productos:</span>
            <span>{getTotalItems()} unidades</span>
          </div>
          
          <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white">
            <span>Total a pagar:</span>
            <span className="text-blue-600 dark:text-blue-400">
              ${getTotal().toLocaleString('es-CO')}
            </span>
          </div>
          
          {onClearCart && cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="w-full mt-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition text-sm"
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CajeroCart;