/**
 * ============================================================
 * ARCHIVO: formatters.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — formatters.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   currencyFormatter, dateFormatter, textFormatter, phoneFormatter,
 *   addressFormatter, documentFormatter, colorFormatter, fileFormatter,
 *   measurementFormatter, creditCardFormatter, urlFormatter, formatters,
 *   formatters (default)
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

// frontend/src/utils/formatters.js

/**
 * Formateadores de moneda (COP — Colombia por defecto)
 */
export const currencyFormatter = {
  /**
   * Formatear como moneda (COP)
   * @param {number} value - Valor a formatear
   * @param {string} currency - Código de moneda (COP, USD, etc.)
   * @returns {string}
   */
  format: (value, currency = 'COP') => {
    if (value === null || value === undefined) return '$0';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },

  /**
   * Formatear como moneda sin decimales
   * @param {number} value - Valor a formatear
   * @param {string} currency - Código de moneda
   * @returns {string}
   */
  formatSimple: (value, currency = 'COP') => {
    if (value === null || value === undefined) return '$0';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },

  /**
   * Formatear como número con separador de miles
   * @param {number} value - Valor a formatear
   * @param {number} decimals - Número de decimales
   * @returns {string}
   */
  formatNumber: (value, decimals = 0) => {
    if (value === null || value === undefined) return '0';
    
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  /**
   * Formatear como porcentaje
   * @param {number} value - Valor a formatear (ej: 0.15 = 15%)
   * @param {number} decimals - Número de decimales
   * @returns {string}
   */
  formatPercentage: (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  },

  /**
   * Formatear como porcentaje (pasando valor directo)
   * @param {number} value - Valor a formatear (ej: 15 = 15%)
   * @param {number} decimals - Número de decimales
   * @returns {string}
   */
  formatPercentageDirect: (value, decimals = 0) => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
  }
};

/**
 * Formateadores de fechas
 */
export const dateFormatter = {
  /**
   * Formatear fecha completa
   * @param {string|Date} date - Fecha a formatear
   * @returns {string}
   */
  formatFull: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formatear fecha corta (DD/MM/YYYY)
   * @param {string|Date} date - Fecha a formatear
   * @returns {string}
   */
  formatShort: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  /**
   * Formatear fecha larga (D de Mes de Año)
   * @param {string|Date} date - Fecha a formatear
   * @returns {string}
   */
  formatLong: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Formatear hora
   * @param {string|Date} date - Fecha a formatear
   * @returns {string}
   */
  formatTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formatear fecha y hora
   * @param {string|Date} date - Fecha a formatear
   * @returns {string}
   */
  formatDateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${dateFormatter.formatShort(d)} ${dateFormatter.formatTime(d)}`;
  },

  /**
   * Formatear fecha relativa (hace X días)
   * @param {string|Date} date - Fecha a formatear
   * @returns {string}
   */
  formatRelative: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((now - d) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Justo ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) !== 1 ? 'es' : ''}`;
    
    return dateFormatter.formatShort(date);
  },

  /**
   * Obtener edad a partir de fecha de nacimiento
   * @param {string|Date} birthDate - Fecha de nacimiento
   * @returns {number}
   */
  getAge: (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
};

/**
 * Formateadores de texto
 */
export const textFormatter = {
  /**
   * Capitalizar primera letra de cada palabra
   * @param {string} text - Texto a formatear
   * @returns {string}
   */
  capitalize: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Capitalizar primera letra de la frase
   * @param {string} text - Texto a formatear
   * @returns {string}
   */
  capitalizeFirst: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Truncar texto
   * @param {string} text - Texto a truncar
   * @param {number} length - Longitud máxima
   * @param {string} suffix - Sufijo a añadir
   * @returns {string}
   */
  truncate: (text, length = 100, suffix = '...') => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  },

  /**
   * Eliminar espacios extras
   * @param {string} text - Texto a limpiar
   * @returns {string}
   */
  cleanSpaces: (text) => {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Convertir a slug para URLs
   * @param {string} text - Texto a convertir
   * @returns {string}
   */
  slugify: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  },

  /**
   * Extraer iniciales
   * @param {string} text - Texto (ej: "Juan Pérez")
   * @returns {string}
   */
  getInitials: (text) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Enmascarar texto (ej: tarjeta de crédito)
   * @param {string} text - Texto a enmascarar
   * @param {number} visibleStart - Caracteres visibles al inicio
   * @param {number} visibleEnd - Caracteres visibles al final
   * @param {string} mask - Carácter de máscara
   * @returns {string}
   */
  mask: (text, visibleStart = 4, visibleEnd = 4, mask = '*') => {
    if (!text) return '';
    if (text.length <= visibleStart + visibleEnd) return text;
    
    const start = text.slice(0, visibleStart);
    const end = text.slice(-visibleEnd);
    const middleLength = text.length - visibleStart - visibleEnd;
    const middle = mask.repeat(middleLength);
    
    return start + middle + end;
  }
};

/**
 * Formateadores de números de teléfono
 */
export const phoneFormatter = {
  /**
   * Formatear número de teléfono español
   * @param {string} phone - Número de teléfono
   * @returns {string}
   */
  formatSpanish: (phone) => {
    if (!phone) return '';
    const cleaned = phone.toString().replace(/\D/g, '');
    
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    if (cleaned.length === 11 && cleaned.startsWith('34')) {
      const number = cleaned.slice(2);
      return `+34 ${number.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}`;
    }
    return phone;
  },

  /**
   * Formatear número internacional
   * @param {string} phone - Número de teléfono
   * @param {string} countryCode - Código de país
   * @returns {string}
   */
  formatInternational: (phone, countryCode = '34') => {
    if (!phone) return '';
    const cleaned = phone.toString().replace(/\D/g, '');
    const number = cleaned.replace(new RegExp(`^${countryCode}`), '');
    return `+${countryCode} ${number.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}`;
  }
};

/**
 * Formateadores de direcciones
 */
export const addressFormatter = {
  /**
   * Formatear dirección completa
   * @param {Object} address - Objeto de dirección
   * @returns {string}
   */
  formatFull: (address) => {
    if (!address) return '';
    const parts = [];
    
    if (address.address) parts.push(address.address);
    if (address.number) parts.push(address.number);
    if (address.floor) parts.push(`${address.floor}º`);
    if (address.city) parts.push(address.city);
    if (address.zipCode) parts.push(`(${address.zipCode})`);
    if (address.country) parts.push(address.country);
    
    return parts.join(' ');
  },

  /**
   * Formatear dirección corta
   * @param {Object} address - Objeto de dirección
   * @returns {string}
   */
  formatShort: (address) => {
    if (!address) return '';
    const parts = [];
    
    if (address.address) parts.push(address.address);
    if (address.city) parts.push(address.city);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  }
};

/**
 * Formateadores de documentos
 */
export const documentFormatter = {
  /**
   * Formatear DNI/NIF español
   * @param {string} dni - Número de DNI
   * @returns {string}
   */
  formatDNI: (dni) => {
    if (!dni) return '';
    const cleaned = dni.toString().toUpperCase().replace(/\s/g, '');
    
    if (cleaned.length === 9) {
      const numbers = cleaned.slice(0, 8);
      const letter = cleaned.slice(8);
      return `${numbers}${letter}`;
    }
    return dni;
  },

  /**
   * Validar DNI/NIF español
   * @param {string} dni - DNI a validar
   * @returns {boolean}
   */
  validateDNI: (dni) => {
    if (!dni) return false;
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const cleaned = dni.toString().toUpperCase().replace(/\s/g, '');
    
    if (cleaned.length !== 9) return false;
    
    const numbers = cleaned.slice(0, 8);
    const letter = cleaned.slice(8);
    
    if (!/^\d+$/.test(numbers)) return false;
    
    const expectedLetter = letters[parseInt(numbers) % 23];
    return letter === expectedLetter;
  },

  /**
   * Formatear CIF español
   * @param {string} cif - Número de CIF
   * @returns {string}
   */
  formatCIF: (cif) => {
    if (!cif) return '';
    const cleaned = cif.toString().toUpperCase().replace(/\s/g, '');
    
    if (cleaned.length === 9) {
      const letter = cleaned.slice(0, 1);
      const numbers = cleaned.slice(1, 8);
      const control = cleaned.slice(8);
      return `${letter}${numbers}${control}`;
    }
    return cif;
  }
};

/**
 * Formateadores de colores
 */
export const colorFormatter = {
  /**
   * Convertir hex a rgb
   * @param {string} hex - Color en hexadecimal
   * @returns {string}
   */
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
      : hex;
  },

  /**
   * Convertir rgb a hex
   * @param {string} rgb - Color en rgb
   * @returns {string}
   */
  rgbToHex: (rgb) => {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    return result 
      ? '#' + ((1 << 24) + (parseInt(result[1]) << 16) + (parseInt(result[2]) << 8) + parseInt(result[3])).toString(16).slice(1)
      : rgb;
  },

  /**
   * Determinar si el color es claro u oscuro
   * @param {string} color - Color en hex o rgb
   * @returns {boolean} true = claro, false = oscuro
   */
  isLightColor: (color) => {
    let r, g, b;
    
    if (color.startsWith('#')) {
      const rgb = colorFormatter.hexToRgb(color);
      const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(rgb);
      if (match) {
        [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
    } else if (color.startsWith('rgb')) {
      const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);
      if (match) {
        [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
    }
    
    if (r === undefined) return true;
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
};

/**
 * Formateadores de archivos
 */
export const fileFormatter = {
  /**
   * Formatear tamaño de archivo
   * @param {number} bytes - Tamaño en bytes
   * @returns {string}
   */
  formatSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Obtener extensión de archivo
   * @param {string} filename - Nombre del archivo
   * @returns {string}
   */
  getExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  },

  /**
   * Obtener icono según tipo de archivo
   * @param {string} mimeType - Tipo MIME
   * @returns {string}
   */
  getIcon: (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📁';
  }
};

/**
 * Formateadores de medidas
 */
export const measurementFormatter = {
  /**
   * Formatear peso
   * @param {number} grams - Peso en gramos
   * @returns {string}
   */
  formatWeight: (grams) => {
    if (grams < 1000) return `${grams}g`;
    return `${(grams / 1000).toFixed(2)}kg`;
  },

  /**
   * Formatear longitud
   * @param {number} cm - Longitud en centímetros
   * @returns {string}
   */
  formatLength: (cm) => {
    if (cm < 100) return `${cm}cm`;
    return `${(cm / 100).toFixed(2)}m`;
  },

  /**
   * Formatear talla
   * @param {string} size - Talla (XS, S, M, L, XL)
   * @returns {string}
   */
  formatSize: (size) => {
    const sizeMap = {
      'XS': 'Extra Small',
      'S': 'Small',
      'M': 'Medium',
      'L': 'Large',
      'XL': 'Extra Large',
      'XXL': 'Double Extra Large'
    };
    return sizeMap[size] || size;
  }
};

/**
 * Formateador de tarjetas de crédito
 */
export const creditCardFormatter = {
  /**
   * Formatear número de tarjeta
   * @param {string} number - Número de tarjeta
   * @returns {string}
   */
  formatNumber: (number) => {
    const cleaned = number.toString().replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : number;
  },

  /**
   * Enmascarar número de tarjeta
   * @param {string} number - Número de tarjeta
   * @returns {string}
   */
  maskNumber: (number) => {
    const cleaned = number.toString().replace(/\D/g, '');
    if (cleaned.length < 12) return number;
    
    const last4 = cleaned.slice(-4);
    const stars = '*'.repeat(cleaned.length - 4);
    const grouped = (stars + last4).match(/.{1,4}/g);
    return grouped ? grouped.join(' ') : stars + last4;
  },

  /**
   * Obtener tipo de tarjeta
   * @param {string} number - Número de tarjeta
   * @returns {string}
   */
  getCardType: (number) => {
    const cleaned = number.toString().replace(/\D/g, '');
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleaned)) return type;
    }
    
    return 'unknown';
  },

  /**
   * Obtener nombre del tipo de tarjeta
   * @param {string} number - Número de tarjeta
   * @returns {string}
   */
  getCardTypeName: (number) => {
    const types = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unknown: 'Tarjeta'
    };
    
    const type = creditCardFormatter.getCardType(number);
    return types[type];
  },

  /**
   * Validar número de tarjeta (algoritmo de Luhn)
   * @param {string} number - Número de tarjeta
   * @returns {boolean}
   */
  validateLuhn: (number) => {
    const cleaned = number.toString().replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }
};

/**
 * Formateador de URL
 */
export const urlFormatter = {
  /**
   * Extraer dominio de URL
   * @param {string} url - URL completa
   * @returns {string}
   */
  getDomain: (url) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url;
    }
  },

  /**
   * Validar URL
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// Exportar todos los formateadores juntos
export const formatters = {
  currency: currencyFormatter,
  date: dateFormatter,
  text: textFormatter,
  phone: phoneFormatter,
  address: addressFormatter,
  document: documentFormatter,
  color: colorFormatter,
  file: fileFormatter,
  measurement: measurementFormatter,
  creditCard: creditCardFormatter,
  url: urlFormatter
};

// Export default con todos los formateadores
export default formatters;