/**
 * ============================================================
 * ARCHIVO: whatsappHelper.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — whatsappHelper.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   WHATSAPP_CONFIG, formatWhatsAppNumber, setWhatsAppRuntimePhone,
 *   getWhatsAppRuntimePhone, isValidWhatsAppNumber, generateWhatsAppUrl,
 *   openWhatsApp, createProductMessage, createCartMessage,
 *   createContactMessage, createSupportMessage,
 *   createOrderConfirmationMessage, createOrderStatusMessage,
 *   createWelcomeMessage, sendWhatsAppMessage, sendTemplateMessage
 *
 * DEPENDENCIAS CLAVE:
 *   env, formatters
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

// frontend/src/utils/whatsappHelper.js
import { APP_ENV } from '../config/env';
import { currencyFormatter } from './formatters';

const formatMoney = (amount) => currencyFormatter.formatSimple(amount);

/**
 * Configuración de WhatsApp
 */
export const WHATSAPP_CONFIG = {
  DEFAULT_PHONE: APP_ENV.WHATSAPP_PHONE,
  DEFAULT_MESSAGE: '¡Hola! Me gustaría obtener más información.',
  API_URL: APP_ENV.WHATSAPP_API_URL,
  API_TOKEN: APP_ENV.WHATSAPP_API_TOKEN,
  BUSINESS_ACCOUNT: APP_ENV.WHATSAPP_BUSINESS_ACCOUNT,
  WEBHOOK_URL: APP_ENV.WHATSAPP_WEBHOOK_URL
};

/**
 * Formatear número de teléfono para WhatsApp
 * @param {string} phone - Número de teléfono
 * @returns {string}
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  
  // Eliminar caracteres no numéricos
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // Eliminar el '+' si existe
  cleaned = cleaned.replace(/^\+/, '');
  
  // Si el número comienza con 00, reemplazar con el código del país
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // Código de país Colombia si el número local tiene 10 dígitos
  if (!cleaned.startsWith('57') && cleaned.length === 10) {
    cleaned = `57${cleaned}`;
  }
  
  return cleaned;
};

/** Número efectivo desde Configuración (SiteProvider → setWhatsAppRuntimePhone) */
let runtimeWhatsAppPhone = null;

export function setWhatsAppRuntimePhone(phone) {
  const digits = phone ? formatWhatsAppNumber(phone) : '';
  runtimeWhatsAppPhone = digits || null;
}

/**
 * Teléfono WhatsApp del sitio (única API pública).
 * Orden: override (phone | whatsapp | contact) → runtime (Configuración) → env.
 *
 * @param {{ phone?: string, whatsapp?: object, contact?: object }|string|null} [source]
 * @returns {string}
 */
export function getWhatsAppRuntimePhone(source) {
  if (typeof source === 'string' && source.trim()) {
    const digits = formatWhatsAppNumber(source);
    if (digits) return digits;
  }

  if (source && typeof source === 'object') {
    const candidates = [
      source.phone,
      source.whatsapp?.whatsapp_number,
      source.contact?.whatsappHref,
      source.contact?.phoneHref,
    ];
    for (const candidate of candidates) {
      if (candidate == null || candidate === '') continue;
      const digits = formatWhatsAppNumber(candidate);
      if (digits) return digits;
    }
  }

  if (runtimeWhatsAppPhone) return runtimeWhatsAppPhone;
  return formatWhatsAppNumber(WHATSAPP_CONFIG.DEFAULT_PHONE) || '';
}

/**
 * Validar número de teléfono para WhatsApp
 * @param {string} phone - Número de teléfono
 * @returns {boolean}
 */
export const isValidWhatsAppNumber = (phone) => {
  const formatted = formatWhatsAppNumber(phone);
  // Debe tener entre 10 y 15 dígitos (código país + número)
  return /^[1-9][0-9]{9,14}$/.test(formatted);
};

/**
 * Generar URL de WhatsApp
 * @param {string} phone - Número de teléfono
 * @param {string} message - Mensaje a enviar
 * @returns {string}
 */
export const generateWhatsAppUrl = (phone, message = '') => {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  
  // Detectar si es dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
  } else {
    return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  }
};

/**
 * Abrir WhatsApp con mensaje
 * @param {string} phone - Número de teléfono
 * @param {string} message - Mensaje a enviar
 * @param {boolean} openInNewTab - Abrir en nueva pestaña
 */
export const openWhatsApp = (phone, message = '', openInNewTab = true) => {
  if (!isValidWhatsAppNumber(phone)) {
    console.error('Número de teléfono inválido:', phone);
    return false;
  }
  
  const url = generateWhatsAppUrl(phone, message);
  
  if (openInNewTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
  
  return true;
};

/**
 * Crear mensaje de producto para WhatsApp
 * @param {Object} product - Datos del producto
 * @returns {string}
 */
export const createProductMessage = (product) => {
  let message = `*${product.name}*\n\n`;
  
  if (product.price) {
    message += `💰 Precio: ${formatMoney(product.price)}\n`;
  }
  
  if (product.discount) {
    const discountedPrice = product.price * (1 - product.discount / 100);
    message += `🎉 Oferta: ${formatMoney(discountedPrice)} (${product.discount}% descuento)\n`;
  }
  
  if (product.description) {
    message += `\n📝 Descripción:\n${product.description.substring(0, 200)}`;
    if (product.description.length > 200) message += '...';
    message += '\n';
  }
  
  if (product.url) {
    message += `\n🔗 Ver producto: ${product.url}\n`;
  }
  
  message += `\n¡Me interesa este producto! ¿Podrían darme más información?`;
  
  return message;
};

/**
 * Crear mensaje de carrito para WhatsApp
 * @param {Array} cartItems - Items del carrito
 * @param {number} total - Total del carrito
 * @param {Object} customer - Datos del cliente (opcional)
 * @returns {string}
 */
export const createCartMessage = (cartItems, total, customer = null) => {
  let message = `*🛒 MI PEDIDO*\n\n`;
  
  if (customer) {
    message += `*Datos del cliente:*\n`;
    if (customer.name) message += `Nombre: ${customer.name}\n`;
    if (customer.email) message += `Email: ${customer.email}\n`;
    if (customer.phone) message += `Teléfono: ${customer.phone}\n`;
    message += `\n`;
  }
  
  message += `*Productos:*\n`;
  
  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Cantidad: ${item.quantity}\n`;
    message += `   Precio unitario: ${formatMoney(item.price)}\n`;
    
    if (item.selectedOptions) {
      if (item.selectedOptions.size) message += `   Talla: ${item.selectedOptions.size}\n`;
      if (item.selectedOptions.color) message += `   Color: ${item.selectedOptions.color}\n`;
    }
    
    const subtotal = item.price * item.quantity;
    message += `   Subtotal: ${formatMoney(subtotal)}\n\n`;
  });
  
  message += `*Total: ${formatMoney(total)}*\n\n`;
  message += `¡Hola! Me gustaría realizar este pedido. ¿Podrían confirmarme disponibilidad y forma de pago?`;
  
  return message;
};

/**
 * Crear mensaje de contacto para WhatsApp
 * @param {Object} contactData - Datos de contacto
 * @returns {string}
 */
export const createContactMessage = (contactData) => {
  let message = `*📞 NUEVO CONTACTO*\n\n`;
  
  message += `*Datos de contacto:*\n`;
  if (contactData.name) message += `Nombre: ${contactData.name}\n`;
  if (contactData.email) message += `Email: ${contactData.email}\n`;
  if (contactData.phone) message += `Teléfono: ${contactData.phone}\n`;
  
  if (contactData.subject) {
    message += `\n*Asunto:*\n${contactData.subject}\n`;
  }
  
  if (contactData.message) {
    message += `\n*Mensaje:*\n${contactData.message}\n`;
  }
  
  return message;
};

/**
 * Crear mensaje de soporte para WhatsApp
 * @param {string} customerName - Nombre del cliente
 * @param {string} issue - Descripción del problema
 * @param {string} orderId - ID del pedido (opcional)
 * @returns {string}
 */
export const createSupportMessage = (customerName, issue, orderId = null) => {
  let message = `*🆘 SOLICITUD DE SOPORTE*\n\n`;
  
  message += `Cliente: ${customerName}\n`;
  if (orderId) message += `Pedido #: ${orderId}\n`;
  message += `\n*Problema:*\n${issue}\n\n`;
  message += `Quedo atento a su respuesta. ¡Gracias!`;
  
  return message;
};

/**
 * Crear mensaje de confirmación de pedido
 * @param {Object} order - Datos del pedido
 * @returns {string}
 */
export const createOrderConfirmationMessage = (order) => {
  let message = `*✅ PEDIDO CONFIRMADO*\n\n`;
  
  message += `¡Gracias por tu compra, ${order.customerName}! 🎉\n\n`;
  message += `*Pedido #: ${order.orderId}*\n`;
  message += `*Fecha: ${new Date(order.date).toLocaleString()}*\n\n`;
  
  message += `*Resumen del pedido:*\n`;
  order.items.forEach(item => {
    message += `• ${item.name} x${item.quantity} - ${formatMoney(item.price * item.quantity)}\n`;
  });
  
  message += `\n*Total: ${formatMoney(order.total)}*\n`;
  message += `*Método de pago:* ${order.paymentMethod}\n`;
  
  if (order.shippingAddress) {
    message += `\n*Dirección de envío:*\n${order.shippingAddress}\n`;
  }
  
  message += `\nTe mantendremos informado sobre el estado de tu pedido.`;
  message += `\n¡Gracias por confiar en nosotros! 🙌`;
  
  return message;
};

/**
 * Crear mensaje de actualización de estado de pedido
 * @param {string} orderId - ID del pedido
 * @param {string} status - Nuevo estado
 * @param {string} trackingUrl - URL de seguimiento (opcional)
 * @returns {string}
 */
export const createOrderStatusMessage = (orderId, status, trackingUrl = null) => {
  const statusMessages = {
    'processing': 'está siendo procesado',
    'shipped': 'ha sido enviado',
    'in_transit': 'está en tránsito',
    'delivered': 'ha sido entregado',
    'cancelled': 'ha sido cancelado'
  };
  
  const statusEmojis = {
    'processing': '⚙️',
    'shipped': '📦',
    'in_transit': '🚚',
    'delivered': '✅',
    'cancelled': '❌'
  };
  
  let message = `${statusEmojis[status] || '📢'} *ACTUALIZACIÓN DE PEDIDO*\n\n`;
  message += `Pedido #${orderId} ${statusMessages[status] || 'ha sido actualizado'}.\n\n`;
  
  if (trackingUrl) {
    message += `🔍 Puedes rastrear tu pedido aquí:\n${trackingUrl}\n\n`;
  }
  
  message += `¡Gracias por tu paciencia! 🙏`;
  
  return message;
};

/**
 * Crear mensaje de bienvenida
 * @param {string} customerName - Nombre del cliente
 * @returns {string}
 */
export const createWelcomeMessage = (customerName) => {
  return `¡Bienvenido ${customerName}! 🎉\n\n` +
         `Gracias por contactarnos. Somos *[Nombre de la Empresa]* y estamos aquí para ayudarte.\n\n` +
         `¿En qué podemos ayudarte hoy? Puedes consultarnos sobre:\n` +
         `• Nuestros productos y servicios\n` +
         `• Precios y promociones\n` +
         `• Estado de pedidos\n` +
         `• Devoluciones y garantías\n\n` +
         `¡Estamos encantados de atenderte! 💬`;
};

/**
 * Enviar mensaje vía API de WhatsApp Business
 * @param {string} phone - Número de teléfono
 * @param {string} message - Mensaje a enviar
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>}
 */
export const sendWhatsAppMessage = async (phone, message, options = {}) => {
  if (!WHATSAPP_CONFIG.API_URL || !WHATSAPP_CONFIG.API_TOKEN) {
    console.warn('WhatsApp API no configurada');
    return { success: false, error: 'API no configurada' };
  }
  
  const formattedPhone = formatWhatsAppNumber(phone);
  
  try {
    const response = await fetch(`${WHATSAPP_CONFIG.API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        type: 'text',
        text: { body: message },
        ...options
      })
    });
    
    if (!response.ok) {
      throw new Error('Error al enviar mensaje');
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enviar mensaje con plantilla (WhatsApp Business)
 * @param {string} phone - Número de teléfono
 * @param {string} templateName - Nombre de la plantilla
 * @param {Object} components - Componentes de la plantilla
 * @returns {Promise<Object>}
 */
export const sendTemplateMessage = async (phone, templateName, components = {}) => {
  if (!WHATSAPP_CONFIG.API_URL || !WHATSAPP_CONFIG.API_TOKEN) {
    console.warn('WhatsApp API no configurada');
    return { success: false, error: 'API no configurada' };
  }
  
  const formattedPhone = formatWhatsAppNumber(phone);
  
  try {
    const response = await fetch(`${WHATSAPP_CONFIG.API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es' },
          components
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Error al enviar mensaje plantilla');
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending template message:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generar botón flotante de WhatsApp
 * @param {string} phone - Número de teléfono
 * @param {string} message - Mensaje por defecto
 * @param {Object} options - Opciones de estilo
 * @returns {string} HTML del botón
 */
export const generateWhatsAppButton = (phone = WHATSAPP_CONFIG.DEFAULT_PHONE, message = WHATSAPP_CONFIG.DEFAULT_MESSAGE, options = {}) => {
  const url = generateWhatsAppUrl(phone, message);
  const position = options.position || 'bottom-right';
  const backgroundColor = options.backgroundColor || '#25D366';
  const size = options.size || '60px';
  
  const styles = {
    position: 'fixed',
    [position.includes('right') ? 'right' : 'left']: '20px',
    [position.includes('bottom') ? 'bottom' : 'top']: '20px',
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    zIndex: 1000,
    transition: 'transform 0.3s ease'
  };
  
  return `<a href="${url}" target="_blank" style="${Object.entries(styles).map(([k, v]) => `${k}:${v}`).join(';')}">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.032 2.00195C6.016 2.00195 1.09998 6.91394 1.09998 12.9299C1.09998 14.7419 1.58798 16.4579 2.45998 17.9579L1.09998 22.0019L5.24398 20.6859C6.69998 21.5019 8.35598 21.9579 12.032 21.9579C18.048 21.9579 22.964 17.0459 22.964 11.0299C22.964 5.01394 18.048 2.00195 12.032 2.00195Z" fill="white"/>
      <path d="M17.712 14.7059C17.384 14.5419 16.144 13.9259 15.848 13.8179C15.552 13.7099 15.336 13.6539 15.12 13.9859C14.904 14.3179 14.304 14.8899 14.12 15.0979C13.936 15.3059 13.752 15.3299 13.424 15.1659C13.096 15.0019 11.924 14.5499 10.536 13.3139C9.452 12.3539 8.708 11.1859 8.524 10.8539C8.34 10.5219 8.508 10.3459 8.668 10.1859C8.812 10.0419 8.992 9.80194 9.148 9.60994C9.304 9.41794 9.36 9.27794 9.448 9.04994C9.536 8.82194 9.5 8.61794 9.428 8.45394C9.356 8.28994 8.628 7.04994 8.324 6.49394C8.024 5.94994 7.724 6.02994 7.5 6.02594C7.288 6.02194 7.044 6.01794 6.8 6.01794C6.556 6.01794 6.18 6.09794 5.852 6.45394C5.524 6.80994 4.784 7.50994 4.784 8.92994C4.784 10.3499 5.832 11.7219 5.976 11.9139C6.12 12.1059 8.708 16.1459 12.544 17.5099C13.456 17.8699 14.172 18.0699 14.736 18.2219C15.656 18.4899 16.5 18.4379 17.164 18.3139C17.904 18.1779 19.44 17.6339 19.74 17.0099C20.04 16.3859 20.04 15.8539 19.968 15.7339C19.896 15.6139 19.672 15.5339 19.344 15.3699C19.016 15.2059 17.712 14.7059 17.712 14.7059Z" fill="#25D366"/>
    </svg>
  </a>`;
};

/**
 * Compartir producto por WhatsApp
 * @param {Object} product - Datos del producto
 * @param {string} phone - Número de teléfono (opcional)
 * @returns {boolean}
 */
export const shareProductOnWhatsApp = (product, phone = null) => {
  const message = createProductMessage(product);
  const targetPhone = phone || WHATSAPP_CONFIG.DEFAULT_PHONE;
  return openWhatsApp(targetPhone, message);
};

/**
 * Compartir carrito por WhatsApp
 * @param {Array} cartItems - Items del carrito
 * @param {number} total - Total del carrito
 * @param {Object} customer - Datos del cliente (opcional)
 * @param {string} phone - Número de teléfono (opcional)
 * @returns {boolean}
 */
export const shareCartOnWhatsApp = (cartItems, total, customer = null, phone = null) => {
  const message = createCartMessage(cartItems, total, customer);
  const targetPhone = phone || WHATSAPP_CONFIG.DEFAULT_PHONE;
  return openWhatsApp(targetPhone, message);
};

/**
 * Enviar mensaje de soporte por WhatsApp
 * @param {string} customerName - Nombre del cliente
 * @param {string} issue - Descripción del problema
 * @param {string} orderId - ID del pedido (opcional)
 * @param {string} phone - Número de teléfono (opcional)
 * @returns {boolean}
 */
export const sendSupportOnWhatsApp = (customerName, issue, orderId = null, phone = null) => {
  const message = createSupportMessage(customerName, issue, orderId);
  const targetPhone = phone || WHATSAPP_CONFIG.DEFAULT_PHONE;
  return openWhatsApp(targetPhone, message);
};

/**
 * Obtener código QR para WhatsApp Business (escritorio)
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<string|null>}
 */
export const getWhatsAppQRCode = async (sessionId) => {
  if (!WHATSAPP_CONFIG.API_URL || !WHATSAPP_CONFIG.API_TOKEN) {
    console.warn('WhatsApp API no configurada');
    return null;
  }
  
  try {
    const response = await fetch(`${WHATSAPP_CONFIG.API_URL}/sessions/${sessionId}/qr`, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.API_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener código QR');
    }
    
    const data = await response.json();
    return data.qrCode;
  } catch (error) {
    console.error('Error getting QR code:', error);
    return null;
  }
};

/**
 * Verificar estado de sesión de WhatsApp Business
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object>}
 */
export const checkWhatsAppSession = async (sessionId) => {
  if (!WHATSAPP_CONFIG.API_URL || !WHATSAPP_CONFIG.API_TOKEN) {
    return { connected: false };
  }
  
  try {
    const response = await fetch(`${WHATSAPP_CONFIG.API_URL}/sessions/${sessionId}/status`, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.API_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al verificar sesión');
    }
    
    const data = await response.json();
    return { connected: data.connected, status: data.status };
  } catch (error) {
    console.error('Error checking session:', error);
    return { connected: false, error: error.message };
  }
};

export const getWhatsAppLink = (type = 'general', customMessage = '') => {
  const messages = {
    general: '¡Hola! Me gustaría obtener más información sobre CoreX.',
    product: '¡Hola! Me interesa un producto de CoreX.',
    maintenance: '¡Hola! Necesito información sobre mantenimiento.',
    contact: '¡Hola! Quisiera contactar con CoreX.',
  };

  const message = customMessage || messages[type] || messages.general;
  return generateWhatsAppUrl(getWhatsAppRuntimePhone(), message);
};

// Exportar todas las utilidades
export const whatsappHelper = {
  config: WHATSAPP_CONFIG,
  setRuntimePhone: setWhatsAppRuntimePhone,
  getRuntimePhone: getWhatsAppRuntimePhone,
  formatNumber: formatWhatsAppNumber,
  isValidNumber: isValidWhatsAppNumber,
  generateUrl: generateWhatsAppUrl,
  open: openWhatsApp,
  createProductMessage,
  createCartMessage,
  createContactMessage,
  createSupportMessage,
  createOrderConfirmationMessage,
  createOrderStatusMessage,
  createWelcomeMessage,
  sendMessage: sendWhatsAppMessage,
  sendTemplate: sendTemplateMessage,
  generateButton: generateWhatsAppButton,
  shareProduct: shareProductOnWhatsApp,
  shareCart: shareCartOnWhatsApp,
  sendSupport: sendSupportOnWhatsApp,
  getQRCode: getWhatsAppQRCode,
  checkSession: checkWhatsAppSession
};

export default whatsappHelper;