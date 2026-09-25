/**
 * ============================================================
 * ARCHIVO: CartItem.jsx
 * UBICACIÓN: frontend/src/components/cajero/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — CartItem.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   CartItem (default)
 *
 * DEPENDENCIAS CLAVE:
 *   PosProductThumb
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
import PropTypes from 'prop-types';
import { POS_IMG_PLACEHOLDER } from './PosProductThumb';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  
  /* ========================================================================= */
  /*  FORMATEAR PRECIO                                                         */
  /* ========================================================================= */

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  /* ========================================================================= */
  /*  INCREMENTAR CANTIDAD                                                     */
  /* ========================================================================= */

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  /* ========================================================================= */
  /*  DECREMENTAR CANTIDAD                                                     */
  /* ========================================================================= */

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  /* ========================================================================= */
  /*  CAMBIAR CANTIDAD DIRECTAMENTE                                            */
  /* ========================================================================= */

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    onUpdateQuantity(item.id, value);
  };

  /* ========================================================================= */
  /*  MANEJAR ELIMINAR                                                         */
  /* ========================================================================= */

  const handleRemove = () => {
    onRemove(item.id);
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE IMAGEN                                                    */
  /* ========================================================================= */

  const handleImageError = (e) => {
    if (e.currentTarget.dataset.fallback === '1') return;
    e.currentTarget.dataset.fallback = '1';
    e.currentTarget.src = POS_IMG_PLACEHOLDER;
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
      
      {/* Imagen */}
      <img
        src={item.imagen_url || POS_IMG_PLACEHOLDER}
        alt=""
        className="h-12 w-12 shrink-0 rounded object-cover bg-slate-200"
        onError={handleImageError}
      />
      
      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 dark:text-white truncate">
          {item.nombre}
        </p>
        <p className="text-sm text-gray-500">
          {formatPrice(item.precio)}
        </p>
      </div>
      
      {/* Controles de cantidad */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition text-lg font-bold"
          aria-label="Disminuir cantidad"
        >
          -
        </button>
        
        <input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          min="1"
          className="w-12 text-center px-1 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
          aria-label="Cantidad"
        />
        
        <button
          onClick={handleIncrement}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition text-lg font-bold"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      
      {/* Subtotal */}
      <div className="min-w-[100px] text-right">
        <p className="font-semibold text-blue-600 dark:text-blue-400">
          {formatPrice(item.precio * item.quantity)}
        </p>
      </div>
      
      {/* Botón eliminar */}
      <button
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 transition p-1"
        aria-label="Eliminar producto"
      >
        🗑️
      </button>
    </div>
  );
};

/* ========================================================================== */
/*  PROPTYPES                                                                 */
/* ========================================================================== */

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    precio: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    imagen_url: PropTypes.string
  }).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};

/* ========================================================================== */
/*  EXPORTAR COMPONENTE                                                       */
/* ========================================================================== */

export default CartItem;