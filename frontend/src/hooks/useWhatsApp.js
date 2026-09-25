/**
 * ============================================================
 * ARCHIVO: useWhatsApp.js
 * UBICACIÓN: frontend/src/hooks/
 * ROL: hook
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Hook React — useWhatsApp.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   useWhatsApp (default)
 *
 * DEPENDENCIAS CLAVE:
 *   env, formatters, whatsappHelper, whatsappProductLinks
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: ProductDetailPage, ProductCard, MaintenancePage,
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

// frontend/src/hooks/useWhatsApp.js
import { useState, useCallback } from 'react';
import { APP_ENV } from '../config/env';
import { currencyFormatter } from '../utils/formatters';
import { getWhatsAppRuntimePhone } from '../utils/whatsappHelper';
import {
  generateQuickBuyLink as buildQuickBuyLink,
  generateProductInquiryLink as buildProductInquiryLink,
  generateServiceInquiryLink as buildServiceInquiryLink
} from '../utils/whatsappProductLinks';

const formatMoney = (amount) => currencyFormatter.formatSimple(amount);

const useWhatsApp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageStatus, setMessageStatus] = useState(null);

  // Número de teléfono por defecto (configurable)
  const DEFAULT_PHONE = APP_ENV.WHATSAPP_PHONE;

  // Configuración de WhatsApp Business API (si se usa)
  const WHATSAPP_API_URL = APP_ENV.WHATSAPP_API_URL;
  const WHATSAPP_API_TOKEN = APP_ENV.WHATSAPP_API_TOKEN;

  // Formatear número de teléfono
  const formatPhoneNumber = useCallback((phoneNumber) => {
    // Eliminar cualquier carácter no numérico
    let cleaned = phoneNumber.toString().replace(/\D/g, '');
    
    // Eliminar el '+' si existe
    cleaned = cleaned.replace(/^\+/, '');
    
    // Si el número comienza con 00, reemplazar con el código del país
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }
    
    // Asegurar que tenga el código de país (asumimos España si no tiene)
    if (!cleaned.startsWith('57') && cleaned.length === 10) {
      cleaned = `57${cleaned}`;
    }
    
    return cleaned;
  }, []);

  // Validar número de teléfono
  const validatePhoneNumber = useCallback((phoneNumber) => {
    const formatted = formatPhoneNumber(phoneNumber);
    const phoneRegex = /^[1-9][0-9]{10,14}$/; // Código país + número
    return phoneRegex.test(formatted);
  }, [formatPhoneNumber]);

  // Generar URL para abrir WhatsApp Web/App
  const generateWhatsAppUrl = useCallback((phoneNumber, message = '') => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    
    // Usar WhatsApp Web en desktop, WhatsApp App en mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      return `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    } else {
      return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    }
  }, [formatPhoneNumber]);

  // Abrir WhatsApp con mensaje
  const openWhatsApp = useCallback((phoneNumber, message = '') => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Número de teléfono inválido');
      return false;
    }
    
    const url = generateWhatsAppUrl(phoneNumber, message);
    window.open(url, '_blank');
    return true;
  }, [validatePhoneNumber, generateWhatsAppUrl]);

  // Enviar mensaje vía API (requiere WhatsApp Business API)
  const sendMessage = useCallback(async (phoneNumber, message, options = {}) => {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
      console.warn('WhatsApp API no configurada');
      setError('API de WhatsApp no configurada');
      return { success: false, error: 'API no configurada' };
    }
    
    setLoading(true);
    setError(null);
    setMessageStatus(null);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          },
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }
      
      const data = await response.json();
      setMessageStatus({ success: true, data });
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Error al enviar mensaje por WhatsApp';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [WHATSAPP_API_URL, WHATSAPP_API_TOKEN, formatPhoneNumber]);

  // Enviar mensaje con plantilla (para WhatsApp Business)
  const sendTemplateMessage = useCallback(async (phoneNumber, templateName, components = {}) => {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
      console.warn('WhatsApp API no configurada');
      setError('API de WhatsApp no configurada');
      return { success: false, error: 'API no configurada' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es'
            },
            components
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar mensaje plantilla');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Error al enviar mensaje plantilla';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [WHATSAPP_API_URL, WHATSAPP_API_TOKEN, formatPhoneNumber]);

  // Compartir producto por WhatsApp
  const shareProduct = useCallback((product, phoneNumber = null) => {
    const message = createProductMessage(product);
    const targetPhone = getWhatsAppRuntimePhone(phoneNumber ? { phone: phoneNumber } : undefined);
    return openWhatsApp(targetPhone, message);
  }, [openWhatsApp]);

  // Compartir carrito por WhatsApp
  const shareCart = useCallback((cartItems, total, phoneNumber = null) => {
    const message = createCartMessage(cartItems, total);
    const targetPhone = getWhatsAppRuntimePhone(phoneNumber ? { phone: phoneNumber } : undefined);
    return openWhatsApp(targetPhone, message);
  }, [openWhatsApp]);

  // Crear mensaje de producto
  const createProductMessage = useCallback((product) => {
    let message = `*${product.name}*\n`;
    message += `Precio: ${formatMoney(product.price)}\n`;
    if (product.description) {
      message += `\n${product.description}\n`;
    }
    if (product.url) {
      message += `\nVer producto: ${product.url}\n`;
    }
    message += `\n¡Interesado! Contáctame para más información.`;
    return message;
  }, []);

  // Crear mensaje de carrito
  const createCartMessage = useCallback((cartItems, total) => {
    let message = '*Mi Carrito de Compras*\n\n';
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} x${item.quantity} - ${formatMoney(item.price * item.quantity)}\n`;
      if (item.selectedOptions?.size) message += `   Talla: ${item.selectedOptions.size}\n`;
      if (item.selectedOptions?.color) message += `   Color: ${item.selectedOptions.color}\n`;
    });
    
    message += `\n*Total: ${formatMoney(total)}*\n`;
    message += `\n¡Hola! Me interesa este pedido. ¿Podrían ayudarme?`;
    
    return message;
  }, []);

  // Crear mensaje de contacto
  const createContactMessage = useCallback((customerData) => {
    let message = '*Información de Contacto*\n\n';
    message += `Nombre: ${customerData.name}\n`;
    message += `Email: ${customerData.email}\n`;
    if (customerData.phone) message += `Teléfono: ${customerData.phone}\n`;
    if (customerData.message) message += `\nMensaje: ${customerData.message}\n`;
    
    return message;
  }, []);

  // Enviar mensaje de bienvenida
  const sendWelcomeMessage = useCallback(async (phoneNumber, customerName) => {
    const message = `¡Bienvenido ${customerName}! 🎉\n\nGracias por contactarnos. ¿En qué podemos ayudarte hoy?`;
    
    if (WHATSAPP_API_URL && WHATSAPP_API_TOKEN) {
      return await sendMessage(phoneNumber, message);
    } else {
      return openWhatsApp(phoneNumber, message);
    }
  }, [sendMessage, openWhatsApp, WHATSAPP_API_URL, WHATSAPP_API_TOKEN]);

  // Enviar mensaje de confirmación de pedido
  const sendOrderConfirmation = useCallback(async (phoneNumber, orderData) => {
    let message = '*¡Pedido Confirmado!* 🎉\n\n';
    message += `Hola ${orderData.customerName},\n`;
    message += `Tu pedido #${orderData.orderId} ha sido confirmado.\n\n`;
    message += '*Detalles del pedido:*\n';
    
    orderData.items.forEach(item => {
      message += `• ${item.name} x${item.quantity} - ${formatMoney(item.price * item.quantity)}\n`;
    });
    
    message += `\n*Total: ${formatMoney(orderData.total)}*\n`;
    message += `*Método de pago:* ${orderData.paymentMethod}\n`;
    message += `*Dirección de envío:* ${orderData.shippingAddress}\n\n`;
    message += `Te mantendremos informado sobre el estado de tu pedido.\n`;
    message += `¡Gracias por tu compra! 🙌`;
    
    if (WHATSAPP_API_URL && WHATSAPP_API_TOKEN) {
      return await sendMessage(phoneNumber, message);
    } else {
      return openWhatsApp(phoneNumber, message);
    }
  }, [sendMessage, openWhatsApp, WHATSAPP_API_URL, WHATSAPP_API_TOKEN]);

  // Enviar mensaje de actualización de estado de pedido
  const sendOrderStatusUpdate = useCallback(async (phoneNumber, orderId, status, trackingUrl = null) => {
    const statusMessages = {
      'processing': 'está siendo procesado',
      'shipped': 'ha sido enviado',
      'delivered': 'ha sido entregado',
      'cancelled': 'ha sido cancelado'
    };
    
    let message = `*Actualización de Pedido #${orderId}*\n\n`;
    message += `Tu pedido ${statusMessages[status] || 'ha sido actualizado'}.\n`;
    
    if (trackingUrl) {
      message += `\nPuedes rastrear tu pedido aquí: ${trackingUrl}\n`;
    }
    
    message += `\n¡Gracias por confiar en nosotros! 📦`;
    
    if (WHATSAPP_API_URL && WHATSAPP_API_TOKEN) {
      return await sendMessage(phoneNumber, message);
    } else {
      return openWhatsApp(phoneNumber, message);
    }
  }, [sendMessage, openWhatsApp, WHATSAPP_API_URL, WHATSAPP_API_TOKEN]);

  // Enviar mensaje de soporte
  const sendSupportMessage = useCallback((phoneNumber, customerName, issue) => {
    let message = `*Soporte Técnico*\n\n`;
    message += `Hola, soy ${customerName}.\n`;
    message += `Necesito ayuda con lo siguiente:\n\n`;
    message += `${issue}\n\n`;
    message += `Quedo atento a su respuesta. ¡Gracias!`;
    
    return openWhatsApp(phoneNumber, message);
  }, [openWhatsApp]);

  // Generar enlace de WhatsApp flotante
  const generateFloatingButton = useCallback((phoneNumber = DEFAULT_PHONE, message = '') => {
    const url = generateWhatsAppUrl(phoneNumber, message);
    return url;
  }, [generateWhatsAppUrl, DEFAULT_PHONE]);

  // Obtener código QR para WhatsApp Business (útil para escritorio)
  const getQRCode = useCallback(async (sessionId) => {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
      setError('API de WhatsApp no configurada');
      return null;
    }
    
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/sessions/${sessionId}/qr`, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener código QR');
      }
      
      const data = await response.json();
      return data.qrCode;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [WHATSAPP_API_URL, WHATSAPP_API_TOKEN]);

  // Verificar estado de sesión de WhatsApp Business
  const checkSessionStatus = useCallback(async (sessionId) => {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
      return { connected: false };
    }
    
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/sessions/${sessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al verificar sesión');
      }
      
      const data = await response.json();
      return { connected: data.connected, status: data.status };
    } catch (err) {
      console.error('Error checking session:', err);
      return { connected: false, error: err.message };
    }
  }, [WHATSAPP_API_URL, WHATSAPP_API_TOKEN]);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Limpiar estado del mensaje
  const clearMessageStatus = useCallback(() => {
    setMessageStatus(null);
  }, []);

  const getDefaultWhatsAppNumber = useCallback(
    () => getWhatsAppRuntimePhone(),
    []
  );

  /** Enlaces producto/servicio — delega en whatsappProductLinks (HU-039) */
  const generateQuickBuyLink = useCallback(
    (product, phoneNumber = null) => buildQuickBuyLink(product, phoneNumber),
    []
  );

  const generateProductInquiryLink = useCallback(
    (product, phoneNumber = null) => buildProductInquiryLink(product, phoneNumber),
    []
  );

  const generateServiceInquiryLink = useCallback(
    (serviceType, phoneNumber = null) => buildServiceInquiryLink(serviceType, phoneNumber),
    []
  );

  return {
    // Estado
    loading,
    error,
    messageStatus,
    
    // Métodos básicos
    openWhatsApp,
    sendMessage,
    sendTemplateMessage,
    formatPhoneNumber,
    validatePhoneNumber,
    generateWhatsAppUrl,
    
    // Métodos de negocio
    shareProduct,
    shareCart,
    sendWelcomeMessage,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendSupportMessage,
    generateQuickBuyLink,
    generateProductInquiryLink,
    generateServiceInquiryLink,
    
    // Métodos de utilidad
    createProductMessage,
    createCartMessage,
    createContactMessage,
    generateFloatingButton,
    getDefaultWhatsAppNumber,
    
    // Métodos de WhatsApp Business
    getQRCode,
    checkSessionStatus,
    
    // Utils
    clearError,
    clearMessageStatus,
    
    // Constantes
    defaultPhone: DEFAULT_PHONE
  };
};

export { useWhatsApp };
export default useWhatsApp;