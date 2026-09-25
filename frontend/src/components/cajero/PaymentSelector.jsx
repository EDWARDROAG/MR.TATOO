/**
 * ============================================================
 * ARCHIVO: PaymentSelector.jsx
 * UBICACIÓN: frontend/src/components/cajero/
 * ROL: component
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — PaymentSelector.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   PaymentSelector (default)
 *
 * DEPENDENCIAS CLAVE:
 *   —
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

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/* ========================================================================== */
/*  CONFIGURACIÓN                                                             */
/* ========================================================================== */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const PaymentSelector = ({ 
  total, 
  onPaymentConfirm, 
  onCancel,
  isProcessing = false 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState('');
  const [errors, setErrors] = useState({});

  /* ========================================================================= */
  /*  CALCULAR CAMBIO                                                          */
  /* ========================================================================= */

  useEffect(() => {
    if (paymentMethod === 'efectivo' && amountReceived) {
      const received = parseFloat(amountReceived);
      if (!isNaN(received) && received >= total) {
        setChange(received - total);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [amountReceived, total, paymentMethod]);

  /* ========================================================================= */
  /*  VALIDAR MONTO RECIBIDO                                                   */
  /* ========================================================================= */

  const validateAmount = () => {
    if (paymentMethod === 'efectivo') {
      if (!amountReceived) {
        setErrors(prev => ({ ...prev, amount: 'Ingrese el monto recibido' }));
        return false;
      }
      const received = parseFloat(amountReceived);
      if (isNaN(received)) {
        setErrors(prev => ({ ...prev, amount: 'Monto inválido' }));
        return false;
      }
      if (received < total) {
        setErrors(prev => ({ ...prev, amount: 'Monto insuficiente' }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, amount: '' }));
    return true;
  };

  /* ========================================================================= */
  /*  VALIDAR COMPROBANTE                                                      */
  /* ========================================================================= */

  const validateComprobante = () => {
    if (paymentMethod === 'transferencia' && !comprobanteFile) {
      setErrors(prev => ({ ...prev, comprobante: 'Debe subir el comprobante de transferencia' }));
      return false;
    }
    setErrors(prev => ({ ...prev, comprobante: '' }));
    return true;
  };

  /* ========================================================================= */
  /*  MANEJAR CONFIRMACIÓN                                                     */
  /* ========================================================================= */

  const handleConfirm = () => {
    const isAmountValid = validateAmount();
    const isComprobanteValid = validateComprobante();
    
    if (isAmountValid && isComprobanteValid) {
      onPaymentConfirm({
        paymentMethod,
        amountReceived: paymentMethod === 'efectivo' ? parseFloat(amountReceived) : null,
        change,
        comprobante: paymentMethod === 'transferencia' ? comprobanteFile : null
      });
    }
  };

  /* ========================================================================= */
  /*  MANEJAR SUBIDA DE COMPROBANTE                                            */
  /* ========================================================================= */

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrors(prev => ({ ...prev, comprobante: 'Formato no permitido. Use JPG, PNG o WEBP' }));
        return;
      }
      
      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ ...prev, comprobante: 'El archivo es demasiado grande. Máximo 5MB' }));
        return;
      }
      
      setComprobanteFile(file);
      setErrors(prev => ({ ...prev, comprobante: '' }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setComprobantePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ========================================================================= */
  /*  ELIMINAR COMPROBANTE                                                     */
  /* ========================================================================= */

  const handleRemoveComprobante = () => {
    setComprobanteFile(null);
    setComprobantePreview('');
  };

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
  /*  RENDERIZADO                                                              */
  /* ========================================================================= */

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-5">
      
      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Confirmar Pago
      </h3>

      {/* Total */}
      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span className="text-gray-600 dark:text-gray-300">Total a pagar:</span>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {formatPrice(total)}
        </span>
      </div>

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Método de pago
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('efectivo');
              setErrors({});
            }}
            className={`p-3 rounded-lg border-2 transition ${
              paymentMethod === 'efectivo'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">💰</div>
            <div className="font-medium">Efectivo</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('transferencia');
              setErrors({});
            }}
            className={`p-3 rounded-lg border-2 transition ${
              paymentMethod === 'transferencia'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">📱</div>
            <div className="font-medium">Transferencia</div>
          </button>
        </div>
      </div>

      {/* Monto recibido (Efectivo) */}
      {paymentMethod === 'efectivo' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monto recibido
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              placeholder="0"
              className={`w-full pl-8 pr-3 py-2 border rounded-lg dark:bg-gray-700 ${
                errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              step="1000"
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
          )}
          
          {/* Cambio */}
          {amountReceived && parseFloat(amountReceived) >= total && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Cambio:</span>
                <span className="font-bold text-green-600">
                  {formatPrice(change)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprobante (Transferencia) */}
      {paymentMethod === 'transferencia' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comprobante de transferencia
          </label>
          
          <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
            errors.comprobante
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600'
          }`}>
            {comprobantePreview ? (
              <div>
                <img
                  src={comprobantePreview}
                  alt="Vista previa del comprobante"
                  className="max-h-32 mx-auto rounded-lg mb-2"
                />
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {comprobanteFile?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(comprobanteFile?.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={handleRemoveComprobante}
                  className="mt-2 text-red-600 text-sm hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="text-3xl mb-2">📎</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Haz clic para subir el comprobante
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG o WEBP (máx. 5MB)
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.comprobante && (
            <p className="text-xs text-red-500 mt-1">{errors.comprobante}</p>
          )}
          
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-400">
              ⚠️ Verifica que el cliente haya enviado el comprobante por WhatsApp antes de continuar
            </p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Procesando...
            </>
          ) : (
            'Confirmar Pago'
          )}
        </button>
      </div>
    </div>
  );
};

/* ========================================================================== */
/*  PROPTYPES                                                                 */
/* ========================================================================== */

PaymentSelector.propTypes = {
  total: PropTypes.number.isRequired,
  onPaymentConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool
};

/* ========================================================================== */
/*  EXPORTAR COMPONENTE                                                       */
/* ========================================================================== */

export default PaymentSelector;