/**
 * ============================================================
 * ARCHIVO: navConfig.js
 * UBICACIÓN: frontend/src/config/
 * ROL: config
 * VERSIÓN: 2.3 — anclas HOME Mr. Tatoo
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 20:45
 * ============================================================
 * PROPÓSITO:
 *   Configuración de entorno / infraestructura — navConfig.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   DEFAULT_MODULES, LOCKED_MODULE_KEYS, PUBLIC_NAV, ADMIN_NAV, CAJERO_NAV,
 *   MODULE_LABELS, ROUTE_MODULE_MAP, mergeModules, isModuleEnabled,
 *   filterNavByModules, getDefaultPublicPath, getDefaultAdminPath,
 *   getDefaultCajeroPath, resolveRouteModule, isNavPathActive,
 *   slugifyCategory
 *
 * DEPENDENCIAS CLAVE:
 *   —
 *
 * CONSUMIDORES / RELACIONES:
 *   Sidebar, Navbar, ModulesContext, ModuleRouteGuard
 *
 * NOTAS:
 *   Frontend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.3] - 2026-09-22 20:45
 *    ✅ HU-020 — Cotizar, Contacto y Tienda van a secciones HOME
 * [2.2] - 2026-08-05 21:40
 *    ✅ HU-065 — ítem Documentación en ADMIN_NAV + módulo docs
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

/**
 * Pestañas del sistema — claves usadas en Configuración > Módulos
 * @notes HU-048 · HU-059 categorías dinámicas en Productos
 */

export const DEFAULT_MODULES = {
  public: {
    home: true,
    products: true,
    printers: true,
    laptops: true,
    desktops: true,
    services: true,
    contact: true,
  },
  admin: {
    dashboard: true,
    products: true,
    categories: true,
    users: true,
    sales: true,
    reports: true,
    logs: true,
    backup: true,
    docs: true,
    settings: true,
  },
  cajero: {
    pos: true,
    history: true,
  },
};

export const LOCKED_MODULE_KEYS = {
  admin: ['dashboard', 'settings'],
  public: [],
  cajero: [],
};

/**
 * Nav público: hijos de Productos se rellenan en Navbar (HU-059).
 */
export const PUBLIC_NAV = [
  { path: '/', label: 'Inicio', end: true, moduleKey: 'home' },
  { path: '/#portafolio', label: 'Portafolio', moduleKey: 'home' },
  { path: '/#artista', label: 'El artista', moduleKey: 'home' },
  { path: '/#tienda', label: 'Tienda', moduleKey: 'products' },
  { path: '/#cotizar', label: 'Cotizar', moduleKey: 'home' },
  { path: '/#contacto', label: 'Contacto', moduleKey: 'home' },
];

export const ADMIN_NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', moduleKey: 'dashboard' },
  { path: '/admin/products', label: 'Productos', icon: '📦', moduleKey: 'products' },
  { path: '/admin/categories', label: 'Categorías', icon: '📁', moduleKey: 'categories' },
  { path: '/admin/users', label: 'Usuarios', icon: '👥', moduleKey: 'users' },
  { path: '/admin/sales', label: 'Pedidos', icon: '💰', moduleKey: 'sales' },
  { path: '/admin/reports', label: 'Reportes', icon: '📈', moduleKey: 'reports' },
  { path: '/admin/logs', label: 'Auditoría', icon: '📋', moduleKey: 'logs' },
  { path: '/admin/backup', label: 'Backups', icon: '💾', moduleKey: 'backup' },
  { path: '/admin/documentacion', label: 'Documentación', icon: '📚', moduleKey: 'docs' },
  { path: '/admin/settings', label: 'Configuración', icon: '⚙️', moduleKey: 'settings' },
];

export const CAJERO_NAV = [
  { path: '/cajero/pos', label: 'Punto de Venta', icon: '🛒', moduleKey: 'pos' },
  { path: '/cajero/history', label: 'Mis Ventas', icon: '📜', moduleKey: 'history' },
  { path: '/cajero/recepciones', label: 'Recepción equipos', icon: '🔧' },
];

export const MODULE_LABELS = {
  public: {
    home: 'Inicio (sitio público)',
    products: 'Productos (catálogo)',
    printers: 'Productos → Impresoras (legado)',
    laptops: 'Productos → Portátiles (legado)',
    desktops: 'Productos → PC escritorio (legado)',
    services: 'Servicios',
    contact: 'Contacto',
  },
  admin: {
    dashboard: 'Dashboard',
    products: 'Productos / Inventario',
    categories: 'Categorías',
    users: 'Usuarios',
    sales: 'Ventas',
    reports: 'Reportes',
    logs: 'Auditoría',
    backup: 'Backups',
    docs: 'Documentación (MkDocs)',
    settings: 'Configuración',
  },
  cajero: {
    pos: 'Punto de venta (cajero)',
    history: 'Historial de ventas (cajero)',
  },
};

export const ROUTE_MODULE_MAP = [
  { pattern: /^\/admin\/settings/, area: 'admin', moduleKey: 'settings' },
  { pattern: /^\/admin\/dashboard/, area: 'admin', moduleKey: 'dashboard' },
  { pattern: /^\/admin\/products/, area: 'admin', moduleKey: 'products' },
  { pattern: /^\/admin\/categories/, area: 'admin', moduleKey: 'categories' },
  { pattern: /^\/admin\/users/, area: 'admin', moduleKey: 'users' },
  { pattern: /^\/admin\/sales/, area: 'admin', moduleKey: 'sales' },
  { pattern: /^\/admin\/reports/, area: 'admin', moduleKey: 'reports' },
  { pattern: /^\/admin\/logs/, area: 'admin', moduleKey: 'logs' },
  { pattern: /^\/admin\/backup/, area: 'admin', moduleKey: 'backup' },
  { pattern: /^\/admin\/documentacion/, area: 'admin', moduleKey: 'docs' },
  { pattern: /^\/cajero\/pos/, area: 'cajero', moduleKey: 'pos' },
  { pattern: /^\/cajero\/history/, area: 'cajero', moduleKey: 'history' },
  { pattern: /^\/cotizar/, area: 'public', moduleKey: 'home' },
  { pattern: /^\/contact/, area: 'public', moduleKey: 'contact' },
  { pattern: /^\/maintenance/, area: 'public', moduleKey: 'services' },
  { pattern: /^\/products/, area: 'public', moduleKey: 'products' },
  { pattern: /^\/$/, area: 'public', moduleKey: 'home' },
];

export function mergeModules(partial) {
  const base = JSON.parse(JSON.stringify(DEFAULT_MODULES));
  if (!partial || typeof partial !== 'object') return base;
  for (const area of ['public', 'admin', 'cajero']) {
    if (partial[area] && typeof partial[area] === 'object') {
      base[area] = { ...base[area], ...partial[area] };
    }
  }
  for (const [area, keys] of Object.entries(LOCKED_MODULE_KEYS)) {
    keys.forEach((key) => {
      base[area][key] = true;
    });
  }
  return base;
}

export function isModuleEnabled(modules, area, moduleKey) {
  if (!moduleKey) return true;
  const locked = LOCKED_MODULE_KEYS[area] || [];
  if (locked.includes(moduleKey)) return true;
  return modules?.[area]?.[moduleKey] !== false;
}

export function filterNavByModules(navItems, area, modules) {
  return navItems
    .map((item) => {
      if (item.children?.length) {
        if (!isModuleEnabled(modules, area, item.moduleKey)) return null;
        const children = item.children.filter((child) =>
          isModuleEnabled(modules, area, child.moduleKey || item.moduleKey)
        );
        return { ...item, children: children.length ? children : item.children };
      }
      return isModuleEnabled(modules, area, item.moduleKey) ? item : null;
    })
    .filter(Boolean);
}

export function getDefaultPublicPath(modules) {
  const enabled = filterNavByModules(PUBLIC_NAV, 'public', modules);
  const first = enabled[0];
  if (!first) return '/';
  if (first.children?.length) return first.children[0].path || first.path || '/';
  return first.path || '/';
}

export function getDefaultAdminPath(modules) {
  const enabled = filterNavByModules(ADMIN_NAV, 'admin', modules);
  return enabled[0]?.path || '/admin/dashboard';
}

export function getDefaultCajeroPath(modules) {
  const enabled = filterNavByModules(CAJERO_NAV, 'cajero', modules);
  return enabled[0]?.path || '/cajero/pos';
}

export function resolveRouteModule(pathname, search = '') {
  for (const rule of ROUTE_MODULE_MAP) {
    if (!rule.pattern.test(pathname)) continue;
    const moduleKey =
      typeof rule.moduleKey === 'function' ? rule.moduleKey(pathname, search) : rule.moduleKey;
    return { area: rule.area, moduleKey };
  }
  return null;
}

export function isNavPathActive(itemPath, pathname, search = '') {
  const [path, qs] = String(itemPath).split('?');
  if (pathname !== path) return false;
  const want = new URLSearchParams(qs || '').get('categoria');
  const got = new URLSearchParams(search).get('categoria');
  if (!want) return !got;
  return got === want;
}

/** @contract slugifyCategory */
export function slugifyCategory(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const CATEGORY_NAV_SLUGS = {
  impresoras: ['impresora'],
  portatiles: ['laptop', 'portatil'],
  'pc-escritorio': ['escritorio', 'torre'],
};

/** @contract matchCategoryBySlug */
export function matchCategoryBySlug(categories, slug) {
  if (!slug || !Array.isArray(categories)) return null;

  const asId = Number(slug);
  if (!Number.isNaN(asId) && asId > 0 && String(asId) === String(slug)) {
    return categories.find((c) => Number(c.id) === asId) || null;
  }

  const want = slugifyCategory(slug);
  const stem = (s) => s.replace(/s$/, '') || s;

  const bySlug = categories.find((c) => {
    const s = slugifyCategory(c.nombre);
    return s === want || stem(s) === stem(want);
  });
  if (bySlug) return bySlug;

  const keys = CATEGORY_NAV_SLUGS[slug] || CATEGORY_NAV_SLUGS[want];
  if (!keys) return null;

  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  return (
    categories.find((c) => {
      const name = norm(c.nombre);
      return keys.some((k) => name.includes(norm(k)));
    }) || null
  );
}

export function buildProductNavChildren(categories) {
  const list = Array.isArray(categories) ? categories : [];
  return [
    { path: '/products', label: 'Todos', moduleKey: 'products' },
    ...list.map((c) => ({
      path: `/products?categoria=${slugifyCategory(c.nombre)}`,
      label: c.nombre,
      moduleKey: 'products',
    })),
  ];
}
