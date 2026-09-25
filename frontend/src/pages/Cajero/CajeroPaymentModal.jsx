/**
 * ============================================================
 * ARCHIVO: CajeroPaymentModal.jsx
 * UBICACIÓN: frontend/src/pages/Cajero/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — CajeroPaymentModal.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   CajeroPaymentModal (default)
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

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const CajeroPaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  cart,
  total,
  clientData,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [comprobanteFile, setComprobanteFile] = useState(null);
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
  /*  VALIDAR FORMULARIO                                                       */
  /* ========================================================================= */

  const validateForm = () => {
    const newErrors = {};
    
    if (paymentMethod === 'efectivo') {
      if (!amountReceived) {
        newErrors.amountReceived = 'Ingrese el monto recibido';
      } else {
        const received = parseFloat(amountReceived);
        if (isNaN(received)) {
          newErrors.amountReceived = 'Monto inválido';
        } else if (received < total) {
          newErrors.amountReceived = 'El monto es insuficiente';
        }
      }
    } else if (paymentMethod === 'transferencia') {
      if (!comprobanteFile) {
        newErrors.comprobante = 'Debe subir el comprobante de transferencia';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ========================================================================= */
  /*  MANEJAR CONFIRMACIÓN                                                     */
  /* ========================================================================= */

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({
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
      // Validar tipo y tamaño
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, comprobante: 'Formato no permitido. Use JPG, PNG o WEBP' });
        return;
      }
      
      if (file.size > maxSize) {
        setErrors({ ...errors, comprobante: 'El archivo es demasiado grande. Máximo 5MB' });
        return;
      }
      
      setComprobanteFile(file);
      setErrors({ ...errors, comprobante: null });
    }
  };

  /* ========================================================================= */
  /*  RESET FORMULARIO                                                         */
  /* ========================================================================= */

  const handleClose = () => {
    setPaymentMethod('efectivo');
    setAmountReceived('');
    setComprobanteFile(null);
    setErrors({});
    onClose();
  };

  /* ========================================================================= */
  /*  FORMATEAR FUNCIONES                                                      */
  /* ========================================================================= */

  const formatCurrency = (amount) => {
    return `$${amount?.toLocaleString('es-CO') || 0}`;
  };

  /* ========================================================================= */
  /*  RENDERIZADO                                                              */
  /* ========================================================================= */

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Encabezado */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Confirmar Pago
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={isProcessing}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          
          {/* Resumen de venta */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Resumen de venta
            </h3>
            <div className="space-y-1 text-sm">
              {cart.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.nombre} x{item.quantity}</span>
                  <span>{formatCurrency(item.precio * item.quantity)}</span>
                </div>
              ))}
              {cart.length > 3 && (
                <div className="text-gray-500 text-xs">
                  y {cart.length - 3} producto(s) más
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del cliente */}
          {clientData?.nombre && (
            <div className="text-sm">
              <span className="text-gray-500">Cliente:</span>
              <span className="ml-2 font-medium">{clientData.nombre}</span>
              {clientData.telefono && (
                <span className="ml-2 text-gray-500">({clientData.telefono})</span>
              )}
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
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
                onClick={() => setPaymentMethod('transferencia')}
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
              <label className="block text-sm font-medium mb-1">
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
                    errors.amountReceived ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.amountReceived && (
                <p className="text-xs text-red-500 mt-1">{errors.amountReceived}</p>
              )}
              
              {amountReceived && parseFloat(amountReceived) >= total && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Cambio:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(change)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subida de comprobante (Transferencia) */}
          {paymentMethod === 'transferencia' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Comprobante de transferencia
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                errors.comprobante
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {comprobanteFile ? (
                  <div>
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-sm font-medium">{comprobanteFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(comprobanteFile.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => setComprobanteFile(null)}
                      className="mt-2 text-red-600 text-sm hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="text-3xl mb-2">📎</div>
                    <p className="text-sm">Haz clic para subir el comprobante</p>
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
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Verifique que el cliente haya enviado el comprobante por WhatsApp
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
    </div>
  );
};

export default CajeroPaymentModal;