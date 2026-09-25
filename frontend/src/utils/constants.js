/**
 * ============================================================
 * ARCHIVO: constants.js
 * UBICACIÓN: frontend/src/utils/
 * ROL: util
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Utilidades — constants.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   API_CONFIG, AUTH, ORDER_STATUS, ORDER_STATUS_LABELS,
 *   ORDER_STATUS_COLORS, USER_STATUS, USER_STATUS_LABELS, PRODUCT_STATUS,
 *   PAYMENT_METHODS, PAYMENT_METHODS_LABELS, PAGINATION, FORM, MESSAGES,
 *   THEMES, THEMES_LABELS, COLORS
 *
 * DEPENDENCIAS CLAVE:
 *   env
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

// frontend/src/utils/constants.js
import { APP_ENV } from '../config/env';

// ============================================
// CONSTANTES DE API
// ============================================

export const API_CONFIG = {
  BASE_URL: APP_ENV.API_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      VERIFY: '/auth/verify',
      REFRESH_TOKEN: '/auth/refresh-token',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password',
      PROFILE: '/auth/profile',
      VERIFY_EMAIL: '/auth/verify-email',
      SEND_VERIFICATION: '/auth/send-verification'
    },
    USERS: {
      BASE: '/users',
      PROFILE: '/users/profile',
      ADDRESSES: '/users/addresses',
      PREFERENCES: '/users/preferences',
      ACTIVITY: '/users/activity',
      ROLES: '/users/roles'
    },
    PRODUCTS: {
      BASE: '/products',
      CATEGORIES: '/products/categories',
      BRANDS: '/products/brands',
      FEATURED: '/products/featured',
      BEST_SELLERS: '/products/best-sellers',
      ON_SALE: '/products/on-sale',
      SEARCH: '/products/search',
      FILTERS: '/products/filters',
      REVIEWS: '/products/reviews'
    },
    SALES: {
      ORDERS: '/sales/orders',
      CART: '/sales/cart',
      CHECKOUT: '/sales/checkout',
      PAYMENT: '/sales/payment',
      INVOICES: '/sales/invoices',
      COUPONS: '/sales/coupons',
      SHIPPING: '/sales/shipping',
      STATS: '/sales/stats'
    },
    UPLOAD: {
      BASE: '/upload',
      IMAGE: '/upload/image',
      DOCUMENT: '/upload/document',
      AVATAR: '/upload/avatar',
      MULTIPLE: '/upload/multiple'
    },
    REPORTS: {
      BASE: '/reports',
      SALES: '/reports/sales',
      PRODUCTS: '/reports/products',
      CUSTOMERS: '/reports/customers',
      INVENTORY: '/reports/inventory',
      FINANCIAL: '/reports/financial',
      EXPORT: '/reports/export'
    }
  }
};

// ============================================
// CONSTANTES DE AUTENTICACIÓN
// ============================================

export const AUTH = {
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
  REMEMBERED_EMAIL_KEY: 'rememberedEmail',
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator',
    EDITOR: 'editor',
    VIEWER: 'viewer'
  },
  PERMISSIONS: {
    // Usuarios
    VIEW_USERS: 'view_users',
    CREATE_USERS: 'create_users',
    EDIT_USERS: 'edit_users',
    DELETE_USERS: 'delete_users',
    // Productos
    VIEW_PRODUCTS: 'view_products',
    CREATE_PRODUCTS: 'create_products',
    EDIT_PRODUCTS: 'edit_products',
    DELETE_PRODUCTS: 'delete_products',
    // Ventas
    VIEW_SALES: 'view_sales',
    PROCESS_SALES: 'process_sales',
    REFUND_SALES: 'refund_sales',
    // Reportes
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',
    // Configuración
    VIEW_SETTINGS: 'view_settings',
    EDIT_SETTINGS: 'edit_settings'
  }
};

// ============================================
// CONSTANTES DE ESTADOS
// ============================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  RETURNED: 'returned'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.PROCESSING]: 'Procesando',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregado',
  [ORDER_STATUS.COMPLETED]: 'Completado',
  [ORDER_STATUS.CANCELLED]: 'Cancelado',
  [ORDER_STATUS.REFUNDED]: 'Reembolsado',
  [ORDER_STATUS.RETURNED]: 'Devuelto'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#f59e0b',
  [ORDER_STATUS.PROCESSING]: '#3b82f6',
  [ORDER_STATUS.SHIPPED]: '#8b5cf6',
  [ORDER_STATUS.DELIVERED]: '#10b981',
  [ORDER_STATUS.COMPLETED]: '#059669',
  [ORDER_STATUS.CANCELLED]: '#ef4444',
  [ORDER_STATUS.REFUNDED]: '#6b7280',
  [ORDER_STATUS.RETURNED]: '#6b7280'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  PENDING: 'pending'
};

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Activo',
  [USER_STATUS.INACTIVE]: 'Inactivo',
  [USER_STATUS.SUSPENDED]: 'Suspendido',
  [USER_STATUS.BLOCKED]: 'Bloqueado',
  [USER_STATUS.PENDING]: 'Pendiente'
};

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  OUT_OF_STOCK: 'out_of_stock'
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  STRIPE: 'stripe'
};

export const PAYMENT_METHODS_LABELS = {
  [PAYMENT_METHODS.CREDIT_CARD]: 'Tarjeta de crédito/débito',
  [PAYMENT_METHODS.PAYPAL]: 'PayPal',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Transferencia bancaria',
  [PAYMENT_METHODS.CASH]: 'Efectivo',
  [PAYMENT_METHODS.STRIPE]: 'Stripe'
};

// ============================================
// CONSTANTES DE PAGINACIÓN
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
  USERS_PER_PAGE: 10
};

// ============================================
// CONSTANTES DE FORMULARIOS
// ============================================

export const FORM = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
  PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL_REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
};

// ============================================
// CONSTANTES DE MENSAJES
// ============================================

export const MESSAGES = {
  // Éxito
  SUCCESS: {
    LOGIN: 'Inicio de sesión exitoso',
    REGISTER: 'Registro exitoso',
    LOGOUT: 'Sesión cerrada correctamente',
    PROFILE_UPDATE: 'Perfil actualizado correctamente',
    PASSWORD_CHANGE: 'Contraseña cambiada correctamente',
    EMAIL_VERIFIED: 'Email verificado correctamente',
    PRODUCT_CREATED: 'Producto creado correctamente',
    PRODUCT_UPDATED: 'Producto actualizado correctamente',
    PRODUCT_DELETED: 'Producto eliminado correctamente',
    ORDER_CREATED: 'Pedido creado correctamente',
    ORDER_UPDATED: 'Pedido actualizado correctamente',
    PAYMENT_PROCESSED: 'Pago procesado correctamente',
    FILE_UPLOADED: 'Archivo subido correctamente'
  },
  // Error
  ERROR: {
    NETWORK: 'Error de conexión. Verifica tu internet',
    SERVER: 'Error del servidor. Intenta más tarde',
    UNAUTHORIZED: 'No autorizado. Inicia sesión nuevamente',
    FORBIDDEN: 'No tienes permisos para realizar esta acción',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION: 'Por favor, revisa los campos del formulario',
    EMAIL_EXISTS: 'El email ya está registrado',
    INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Inicia sesión nuevamente'
  }
};

// ============================================
// CONSTANTES DE TEMAS
// ============================================

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const THEMES_LABELS = {
  [THEMES.LIGHT]: 'Claro',
  [THEMES.DARK]: 'Oscuro',
  [THEMES.SYSTEM]: 'Sistema'
};

export const COLORS = {
  PRIMARY: '#3b82f6',
  PRIMARY_DARK: '#2563eb',
  PRIMARY_LIGHT: '#60a5fa',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827'
};

// ============================================
// CONSTANTES DE MONEDA
// ============================================

export const CURRENCY = {
  DEFAULT: 'COP',
  SYMBOLS: {
    COP: '$',
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥'
  },
  LOCALES: {
    COP: 'es-CO',
    EUR: 'es-ES',
    USD: 'en-US',
    GBP: 'en-GB',
    JPY: 'ja-JP'
  }
};

// ============================================
// CONSTANTES DE FECHAS
// ============================================

export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm',
  FULL: 'DD/MM/YYYY HH:mm:ss',
  API: 'YYYY-MM-DD',
  API_FULL: 'YYYY-MM-DDTHH:mm:ss',
  HUMAN: 'DD [de] MMMM [de] YYYY',
  HUMAN_TIME: 'DD [de] MMMM [de] YYYY [a las] HH:mm'
};

// ============================================
// CONSTANTES DE STORAGE
// ============================================

export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  CART: 'cart',
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  PREFERENCES: 'preferences',
  SEARCH_HISTORY: 'searchHistory',
  RECENT_PRODUCTS: 'recentProducts'
};

// ============================================
// CONSTANTES DE RUTAS
// ============================================

export const ROUTES = {
  // Públicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  ABOUT: '/about',
  CONTACT: '/contact',
  // Privadas
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  WISHLIST: '/wishlist',
  SETTINGS: '/settings',
  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_EDIT: '/admin/users/:id',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id',
  ADMIN_PRODUCT_CREATE: '/admin/products/create',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_DETAIL: '/admin/orders/:id',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings'
};

// ============================================
// CONSTANTES DE SORT
// ============================================

export const SORT_OPTIONS = {
  PRODUCTS: [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'name_asc', label: 'Nombre: A-Z' },
    { value: 'name_desc', label: 'Nombre: Z-A' },
    { value: 'rating', label: 'Mejor valorados' },
    { value: 'newest', label: 'Más nuevos' },
    { value: 'best_selling', label: 'Más vendidos' }
  ],
  ORDERS: [
    { value: 'createdAt_desc', label: 'Más recientes' },
    { value: 'createdAt_asc', label: 'Más antiguos' },
    { value: 'total_desc', label: 'Mayor valor' },
    { value: 'total_asc', label: 'Menor valor' },
    { value: 'status', label: 'Por estado' }
  ],
  USERS: [
    { value: 'createdAt_desc', label: 'Más recientes' },
    { value: 'createdAt_asc', label: 'Más antiguos' },
    { value: 'name_asc', label: 'Nombre A-Z' },
    { value: 'name_desc', label: 'Nombre Z-A' }
  ]
};

// ============================================
// CONSTANTES DE FILTROS
// ============================================

export const FILTERS = {
  RATING_OPTIONS: [
    { value: 0, label: 'Todas las valoraciones' },
    { value: 4, label: '4 estrellas o más' },
    { value: 3, label: '3 estrellas o más' },
    { value: 2, label: '2 estrellas o más' },
    { value: 1, label: '1 estrella o más' }
  ],
  STOCK_STATUS: [
    { value: 'all', label: 'Todos' },
    { value: 'in_stock', label: 'En stock' },
    { value: 'out_stock', label: 'Sin stock' },
    { value: 'low_stock', label: 'Stock bajo' }
  ]
};

// ============================================
// CONSTANTES DE STOCK
// ============================================

export const STOCK = {
  LOW_STOCK_THRESHOLD: 5,
  CRITICAL_STOCK_THRESHOLD: 2,
  STATUS: {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock'
  }
};

// ============================================
// CONSTANTES DE REDES SOCIALES
// ============================================

export const SOCIAL_MEDIA = {
  FACEBOOK: 'https://facebook.com/miempresa',
  INSTAGRAM: 'https://instagram.com/miempresa',
  TWITTER: 'https://twitter.com/miempresa',
  YOUTUBE: 'https://youtube.com/miempresa',
  LINKEDIN: 'https://linkedin.com/company/miempresa'
};

// ============================================
// CONSTANTES DE CONTACTO
// ============================================

export const CONTACT = {
  EMAIL: 'info@miempresa.com',
  PHONE: '+34 900 123 456',
  ADDRESS: {
    STREET: 'Calle Principal 123',
    CITY: 'Madrid',
    ZIP_CODE: '28001',
    COUNTRY: 'España'
  },
  BUSINESS_HOURS: {
    WEEKDAYS: '9:00 - 18:00',
    SATURDAY: '10:00 - 14:00',
    SUNDAY: 'Cerrado'
  }
};

// ============================================
// CONSTANTES DE REGEX
// ============================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/,
  DNI: /^\d{8}[A-Za-z]$/,
  NIE: /^[XYZ]\d{7}[A-Za-z]$/,
  CIF: /^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ZIP_CODE_SPAIN: /^[0-9]{5}$/
};

// ============================================
// CONSTANTES DE ANIMACIONES
// ============================================

export const ANIMATIONS = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
  },
  EASING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
};

// ============================================
// CONSTANTES DE BREAKPOINTS (responsive)
// ============================================

export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1200,
  HD: 1440
};

export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE}px)`,
  TABLET: `(max-width: ${BREAKPOINTS.TABLET}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.DESKTOP}px)`,
  MOBILE_AND_TABLET: `(max-width: ${BREAKPOINTS.TABLET}px)`
};

// ============================================
// CONSTANTES DE IDIOMAS
// ============================================

export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
  FR: 'fr',
  DE: 'de',
  IT: 'it'
};

export const LANGUAGE_LABELS = {
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.FR]: 'Français',
  [LANGUAGES.DE]: 'Deutsch',
  [LANGUAGES.IT]: 'Italiano'
};

// ============================================
// CONSTANTES DE NOTIFICACIONES
// ============================================

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 8000,
  PERSISTENT: 0
};

// ============================================
// CONSTANTES DE LOGGING
// ============================================

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

// ============================================
// EXPORTAR TODAS LAS CONSTANTES JUNTAS
// ============================================

export const constants = {
  API_CONFIG,
  AUTH,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  USER_STATUS,
  USER_STATUS_LABELS,
  PRODUCT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_METHODS_LABELS,
  PAGINATION,
  FORM,
  MESSAGES,
  THEMES,
  THEMES_LABELS,
  COLORS,
  CURRENCY,
  DATE_FORMATS,
  STORAGE_KEYS,
  ROUTES,
  SORT_OPTIONS,
  FILTERS,
  STOCK,
  SOCIAL_MEDIA,
  CONTACT,
  REGEX,
  ANIMATIONS,
  BREAKPOINTS,
  MEDIA_QUERIES,
  LANGUAGES,
  LANGUAGE_LABELS,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  LOG_LEVELS
};

export default constants;