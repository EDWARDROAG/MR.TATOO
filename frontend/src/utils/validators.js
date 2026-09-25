/**
 * ============================================================
 * ARCHIVO: validators.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — validators.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   textValidators, emailValidators, passwordValidators, numberValidators,
 *   dateValidators, phoneValidators, documentValidators, urlValidators,
 *   creditCardValidators, zipCodeValidators, ipValidators, formValidators,
 *   arrayValidators, validators, validators (default)
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

// frontend/src/utils/validators.js

/**
 * Validadores de texto
 */
export const textValidators = {
  /**
   * Validar que no esté vacío
   * @param {string} value - Valor a validar
   * @returns {boolean}
   */
  isNotEmpty: (value) => {
    return value !== null && value !== undefined && value.trim().length > 0;
  },

  /**
   * Validar longitud mínima
   * @param {string} value - Valor a validar
   * @param {number} min - Longitud mínima
   * @returns {boolean}
   */
  minLength: (value, min) => {
    return value && value.length >= min;
  },

  /**
   * Validar longitud máxima
   * @param {string} value - Valor a validar
   * @param {number} max - Longitud máxima
   * @returns {boolean}
   */
  maxLength: (value, max) => {
    return value && value.length <= max;
  },

  /**
   * Validar rango de longitud
   * @param {string} value - Valor a validar
   * @param {number} min - Longitud mínima
   * @param {number} max - Longitud máxima
   * @returns {boolean}
   */
  lengthRange: (value, min, max) => {
    return value && value.length >= min && value.length <= max;
  },

  /**
   * Validar que sea solo letras
   * @param {string} value - Valor a validar
   * @returns {boolean}
   */
  isOnlyLetters: (value) => {
    return /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(value);
  },

  /**
   * Validar que sea solo números
   * @param {string} value - Valor a validar
   * @returns {boolean}
   */
  isOnlyNumbers: (value) => {
    return /^\d+$/.test(value);
  },

  /**
   * Validar que sea alfanumérico
   * @param {string} value - Valor a validar
   * @returns {boolean}
   */
  isAlphanumeric: (value) => {
    return /^[a-zA-Z0-9]+$/.test(value);
  },

  /**
   * Validar que no contenga caracteres especiales
   * @param {string} value - Valor a validar
   * @returns {boolean}
   */
  noSpecialChars: (value) => {
    return /^[a-zA-Z0-9\s]+$/.test(value);
  }
};

/**
 * Validadores de email
 */
export const emailValidators = {
  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  isValid: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validar dominio de email
   * @param {string} email - Email a validar
   * @param {string[]} allowedDomains - Dominios permitidos
   * @returns {boolean}
   */
  hasValidDomain: (email, allowedDomains) => {
    if (!email) return false;
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  },

  /**
   * Validar que no sea de dominio temporal
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  isNotTempEmail: (email) => {
    const tempDomains = [
      'tempmail.com', 'throwaway.com', 'mailinator.com',
      'guerrillamail.com', '10minutemail.com', 'yopmail.com'
    ];
    if (!email) return false;
    const domain = email.split('@')[1];
    return !tempDomains.includes(domain);
  }
};

/**
 * Validadores de contraseña
 */
export const passwordValidators = {
  /**
   * Validar longitud mínima
   * @param {string} password - Contraseña a validar
   * @param {number} min - Longitud mínima (default: 6)
   * @returns {boolean}
   */
  minLength: (password, min = 6) => {
    return password && password.length >= min;
  },

  /**
   * Validar que contenga mayúscula
   * @param {string} password - Contraseña a validar
   * @returns {boolean}
   */
  hasUppercase: (password) => {
    return /[A-Z]/.test(password);
  },

  /**
   * Validar que contenga minúscula
   * @param {string} password - Contraseña a validar
   * @returns {boolean}
   */
  hasLowercase: (password) => {
    return /[a-z]/.test(password);
  },

  /**
   * Validar que contenga número
   * @param {string} password - Contraseña a validar
   * @returns {boolean}
   */
  hasNumber: (password) => {
    return /[0-9]/.test(password);
  },

  /**
   * Validar que contenga caracter especial
   * @param {string} password - Contraseña a validar
   * @returns {boolean}
   */
  hasSpecialChar: (password) => {
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
  },

  /**
   * Validar contraseña fuerte
   * @param {string} password - Contraseña a validar
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  isStrong: (password) => {
    const errors = [];
    
    if (!password) {
      errors.push('La contraseña es requerida');
      return { isValid: false, errors };
    }
    
    if (!passwordValidators.minLength(password, 8)) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!passwordValidators.hasUppercase(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    if (!passwordValidators.hasLowercase(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }
    if (!passwordValidators.hasNumber(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    if (!passwordValidators.hasSpecialChar(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validar que las contraseñas coincidan
   * @param {string} password - Contraseña
   * @param {string} confirmPassword - Confirmación de contraseña
   * @returns {boolean}
   */
  match: (password, confirmPassword) => {
    return password === confirmPassword;
  }
};

/**
 * Validadores de números
 */
export const numberValidators = {
  /**
   * Validar que sea número
   * @param {any} value - Valor a validar
   * @returns {boolean}
   */
  isNumber: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  /**
   * Validar que sea entero
   * @param {any} value - Valor a validar
   * @returns {boolean}
   */
  isInteger: (value) => {
    return Number.isInteger(Number(value));
  },

  /**
   * Validar rango mínimo
   * @param {number} value - Valor a validar
   * @param {number} min - Valor mínimo
   * @returns {boolean}
   */
  min: (value, min) => {
    return Number(value) >= min;
  },

  /**
   * Validar rango máximo
   * @param {number} value - Valor a validar
   * @param {number} max - Valor máximo
   * @returns {boolean}
   */
  max: (value, max) => {
    return Number(value) <= max;
  },

  /**
   * Validar rango
   * @param {number} value - Valor a validar
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @returns {boolean}
   */
  range: (value, min, max) => {
    const num = Number(value);
    return num >= min && num <= max;
  },

  /**
   * Validar que sea positivo
   * @param {number} value - Valor a validar
   * @returns {boolean}
   */
  isPositive: (value) => {
    return Number(value) > 0;
  },

  /**
   * Validar que sea negativo
   * @param {number} value - Valor a validar
   * @returns {boolean}
   */
  isNegative: (value) => {
    return Number(value) < 0;
  },

  /**
   * Validar que sea decimal con máximo de decimales
   * @param {number} value - Valor a validar
   * @param {number} maxDecimals - Máximo de decimales
   * @returns {boolean}
   */
  maxDecimals: (value, maxDecimals = 2) => {
    const str = value.toString();
    const decimals = str.split('.')[1];
    return !decimals || decimals.length <= maxDecimals;
  }
};

/**
 * Validadores de fechas
 */
export const dateValidators = {
  /**
   * Validar que sea fecha válida
   * @param {string|Date} date - Fecha a validar
   * @returns {boolean}
   */
  isValid: (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  },

  /**
   * Validar que no sea futura
   * @param {string|Date} date - Fecha a validar
   * @returns {boolean}
   */
  isPast: (date) => {
    const d = new Date(date);
    const now = new Date();
    return d < now;
  },

  /**
   * Validar que no sea pasada
   * @param {string|Date} date - Fecha a validar
   * @returns {boolean}
   */
  isFuture: (date) => {
    const d = new Date(date);
    const now = new Date();
    return d > now;
  },

  /**
   * Validar rango de fechas
   * @param {string|Date} date - Fecha a validar
   * @param {string|Date} start - Fecha de inicio
   * @param {string|Date} end - Fecha de fin
   * @returns {boolean}
   */
  isBetween: (date, start, end) => {
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    return d >= s && d <= e;
  },

  /**
   * Validar edad mínima
   * @param {string|Date} birthDate - Fecha de nacimiento
   * @param {number} minAge - Edad mínima
   * @returns {boolean}
   */
  minAge: (birthDate, minAge = 18) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= minAge;
  }
};

/**
 * Validadores de teléfono
 */
export const phoneValidators = {
  /**
   * Validar teléfono español
   * @param {string} phone - Teléfono a validar
   * @returns {boolean}
   */
  isSpanishPhone: (phone) => {
    const cleaned = phone.toString().replace(/\D/g, '');
    return /^[67]\d{8}$/.test(cleaned);
  },

  /**
   * Validar teléfono fijo español
   * @param {string} phone - Teléfono a validar
   * @returns {boolean}
   */
  isSpanishLandline: (phone) => {
    const cleaned = phone.toString().replace(/\D/g, '');
    return /^[89]\d{8}$/.test(cleaned);
  },

  /**
   * Validar teléfono móvil español
   * @param {string} phone - Teléfono a validar
   * @returns {boolean}
   */
  isSpanishMobile: (phone) => {
    const cleaned = phone.toString().replace(/\D/g, '');
    return /^[67]\d{8}$/.test(cleaned);
  },

  /**
   * Validar formato internacional
   * @param {string} phone - Teléfono a validar
   * @returns {boolean}
   */
  isInternational: (phone) => {
    const cleaned = phone.toString().replace(/\D/g, '');
    return /^\+\d{1,3}\d{7,12}$/.test(phone) || cleaned.length >= 10;
  }
};

/**
 * Validadores de documentos
 */
export const documentValidators = {
  /**
   * Validar DNI español
   * @param {string} dni - DNI a validar
   * @returns {boolean}
   */
  isValidDNI: (dni) => {
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
   * Validar NIE español
   * @param {string} nie - NIE a validar
   * @returns {boolean}
   */
  isValidNIE: (nie) => {
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const cleaned = nie.toString().toUpperCase().replace(/\s/g, '');
    
    if (cleaned.length !== 9) return false;
    
    const firstChar = cleaned.charAt(0);
    if (!['X', 'Y', 'Z'].includes(firstChar)) return false;
    
    const numberMap = { X: '0', Y: '1', Z: '2' };
    const numbers = numberMap[firstChar] + cleaned.slice(1, 8);
    const letter = cleaned.slice(8);
    
    const expectedLetter = letters[parseInt(numbers) % 23];
    return letter === expectedLetter;
  },

  /**
   * Validar CIF español
   * @param {string} cif - CIF a validar
   * @returns {boolean}
   */
  isValidCIF: (cif) => {
    const cleaned = cif.toString().toUpperCase().replace(/\s/g, '');
    
    if (cleaned.length !== 9) return false;
    
    const letters = 'JABCDEFGHI';
    const firstChar = cleaned.charAt(0);
    if (!/^[ABCDEFGHJKLMNPQRSUVW]$/.test(firstChar)) return false;
    
    const numbers = cleaned.slice(1, 8);
    const control = cleaned.slice(8);
    
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
      const digit = parseInt(numbers[i]);
      if (i % 2 === 0) {
        const doubled = digit * 2;
        sum += doubled > 9 ? doubled - 9 : doubled;
      } else {
        sum += digit;
      }
    }
    
    const expectedControl = (10 - (sum % 10)) % 10;
    const expectedLetter = letters.charAt(expectedControl);
    
    return /^\d$/.test(control) 
      ? parseInt(control) === expectedControl 
      : control === expectedLetter;
  },

  /**
   * Validar NIF (DNI o NIE)
   * @param {string} nif - NIF a validar
   * @returns {boolean}
   */
  isValidNIF: (nif) => {
    return documentValidators.isValidDNI(nif) || documentValidators.isValidNIE(nif);
  }
};

/**
 * Validadores de URL
 */
export const urlValidators = {
  /**
   * Validar URL
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  isValid: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validar protocolo HTTP/HTTPS
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  hasHttpProtocol: (url) => {
    return /^https?:\/\//i.test(url);
  },

  /**
   * Validar dominio
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  hasValidDomain: (url) => {
    try {
      const parsed = new URL(url);
      return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(parsed.hostname);
    } catch {
      return false;
    }
  }
};

/**
 * Validadores de tarjetas de crédito
 */
export const creditCardValidators = {
  /**
   * Validar número de tarjeta (Luhn)
   * @param {string} number - Número de tarjeta
   * @returns {boolean}
   */
  isValidLuhn: (number) => {
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
  },

  /**
   * Validar fecha de expiración
   * @param {string} month - Mes (MM)
   * @param {string} year - Año (YY o YYYY)
   * @returns {boolean}
   */
  isValidExpiryDate: (month, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let expiryYear = parseInt(year);
    if (year.length === 2) {
      expiryYear = 2000 + expiryYear;
    }
    
    const expiryMonth = parseInt(month);
    
    if (expiryMonth < 1 || expiryMonth > 12) return false;
    
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    
    return true;
  },

  /**
   * Validar CVV
   * @param {string} cvv - CVV a validar
   * @returns {boolean}
   */
  isValidCVV: (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  }
};

/**
 * Validadores de código postal
 */
export const zipCodeValidators = {
  /**
   * Validar código postal español
   * @param {string} zipCode - Código postal
   * @returns {boolean}
   */
  isSpanishZipCode: (zipCode) => {
    return /^[0-9]{5}$/.test(zipCode);
  },

  /**
   * Validar código postal internacional (genérico)
   * @param {string} zipCode - Código postal
   * @returns {boolean}
   */
  isGenericZipCode: (zipCode) => {
    return /^[a-zA-Z0-9\s-]{3,10}$/.test(zipCode);
  }
};

/**
 * Validadores de IP
 */
export const ipValidators = {
  /**
   * Validar IPv4
   * @param {string} ip - IP a validar
   * @returns {boolean}
   */
  isValidIPv4: (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255 && part === num.toString();
    });
  },

  /**
   * Validar IPv6
   * @param {string} ip - IP a validar
   * @returns {boolean}
   */
  isValidIPv6: (ip) => {
    const regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return regex.test(ip);
  }
};

/**
 * Validadores generales de formulario
 */
export const formValidators = {
  /**
   * Validar campo requerido
   * @param {any} value - Valor a validar
   * @returns {boolean}
   */
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  /**
   * Validar que sea igual a otro campo
   * @param {any} value - Valor a validar
   * @param {any} compareValue - Valor de comparación
   * @returns {boolean}
   */
  equals: (value, compareValue) => {
    return value === compareValue;
  },

  /**
   * Validar que sea diferente de otro campo
   * @param {any} value - Valor a validar
   * @param {any} compareValue - Valor de comparación
   * @returns {boolean}
   */
  notEquals: (value, compareValue) => {
    return value !== compareValue;
  },

  /**
   * Validar que esté incluido en lista
   * @param {any} value - Valor a validar
   * @param {Array} allowedValues - Valores permitidos
   * @returns {boolean}
   */
  isInList: (value, allowedValues) => {
    return allowedValues.includes(value);
  }
};

/**
 * Validadores de arrays
 */
export const arrayValidators = {
  /**
   * Validar que no esté vacío
   * @param {Array} array - Array a validar
   * @returns {boolean}
   */
  isNotEmpty: (array) => {
    return Array.isArray(array) && array.length > 0;
  },

  /**
   * Validar longitud mínima
   * @param {Array} array - Array a validar
   * @param {number} min - Longitud mínima
   * @returns {boolean}
   */
  minLength: (array, min) => {
    return Array.isArray(array) && array.length >= min;
  },

  /**
   * Validar longitud máxima
   * @param {Array} array - Array a validar
   * @param {number} max - Longitud máxima
   * @returns {boolean}
   */
  maxLength: (array, max) => {
    return Array.isArray(array) && array.length <= max;
  },

  /**
   * Validar que contenga valor
   * @param {Array} array - Array a validar
   * @param {any} value - Valor a buscar
   * @returns {boolean}
   */
  contains: (array, value) => {
    return Array.isArray(array) && array.includes(value);
  }
};

// Exportar todos los validadores juntos
export const validators = {
  text: textValidators,
  email: emailValidators,
  password: passwordValidators,
  number: numberValidators,
  date: dateValidators,
  phone: phoneValidators,
  document: documentValidators,
  url: urlValidators,
  creditCard: creditCardValidators,
  zipCode: zipCodeValidators,
  ip: ipValidators,
  form: formValidators,
  array: arrayValidators
};

// Export default con todos los validadores
export default validators;