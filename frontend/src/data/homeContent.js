/**
 * ============================================================
 * ARCHIVO: homeContent.js
 * UBICACIÓN: frontend/src/data/
 * ROL: data
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Datos estáticos / contenido — homeContent.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   trustFeatures, pcTiers, services, randomPads
 *
 * DEPENDENCIAS CLAVE:
 *   assets
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

import { IMAGES } from '../utils/assets';

export const trustFeatures = [
  {
    icon: IMAGES.envioGratis,
    title: 'Envío Gratis',
    description: 'En productos seleccionados',
    color: '#a855f7',
  },
  {
    icon: IMAGES.soporteTecnico,
    title: 'Soporte Técnico',
    description: 'Asesoría personalizada',
    color: '#3b82f6',
  },
  {
    icon: IMAGES.garantia,
    title: 'Garantía',
    description: 'En todos nuestros servicios',
    color: '#ec4899',
  },
  {
    icon: IMAGES.pagoSeguro,
    title: 'Pago Seguro',
    description: 'Múltiples métodos de pago',
    color: '#22c55e',
  },
];

export const pcTiers = [
  {
    id: 'entry',
    label: 'ENTRY PC',
    labelColor: 'bg-emerald-500',
    image: IMAGES.entryPc,
    title: 'Entry PC',
    description: 'Ideal para gaming casual y tareas diarias con excelente relación precio-rendimiento.',
    link: '/products?categoria=entry-pc',
  },
  {
    id: 'performance',
    label: 'PERFORMANCE PC',
    labelColor: 'bg-blue-500',
    image: IMAGES.performancePc,
    title: 'Performance PC',
    description: 'Potencia equilibrada para gaming en 1080p/1440p y productividad exigente.',
    link: '/products?categoria=performance-pc',
  },
  {
    id: 'elite',
    label: 'ELITE PC',
    labelColor: 'bg-purple-500',
    image: IMAGES.elitePc,
    title: 'Elite PC',
    description: 'Máximo rendimiento para gaming competitivo y streaming profesional.',
    link: '/products?categoria=elite-pc',
  },
  {
    id: 'workstation',
    label: 'WORKSTATION PC',
    labelColor: 'bg-orange-500',
    image: IMAGES.workstationPc,
    title: 'Workstation PC',
    description: 'Diseñada para edición, renderizado y trabajo profesional intensivo.',
    link: '/products?categoria=workstation-pc',
  },
];

export const services = [
  {
    id: 'mantenimiento',
    title: 'Mantenimiento',
    accent: '#22c55e',
    icon: IMAGES.logoMantenimiento,
    background: IMAGES.fondoMantenimiento,
    bullets: [
      'Limpieza profunda',
      'Cambio de pasta térmica',
      'Optimización del sistema',
      'Diagnóstico completo',
    ],
    link: '/maintenance',
  },
  {
    id: 'armado',
    title: 'Armado de PCs',
    accent: '#3b82f6',
    icon: IMAGES.logoArmadoPcs,
    background: IMAGES.fondoArmadoPcs,
    bullets: [
      'Equipos personalizados',
      'Gestión de cables',
      'Pruebas de rendimiento',
      'Asesoría de componentes',
    ],
    link: '/maintenance/armado',
  },
  {
    id: 'impresoras',
    title: 'Impresoras',
    accent: '#a855f7',
    icon: IMAGES.logoPerifericos,
    background: null,
    bullets: [
      'Láser y tinta',
      'Multifuncionales',
      'Repuestos y tóner',
      'Mantenimiento',
    ],
    link: '/products?categoria=impresoras',
  },
  {
    id: 'portatiles',
    title: 'Portátiles',
    accent: '#f97316',
    icon: IMAGES.logoArmadoPcs,
    background: IMAGES.fondoArmadoPcs,
    bullets: [
      'Nuevos y usados',
      'Oficina y estudio',
      'Gaming liviano',
      'Asesoría de compra',
    ],
    link: '/products?categoria=portatiles',
  },
];

export const randomPads = [
  { id: 1, name: 'Mousepad Topo Blanco', price: '$ 29.900', gradient: 'from-gray-100 via-white to-gray-200' },
  { id: 2, name: 'Mousepad Topo Negro', price: '$ 29.900', gradient: 'from-gray-800 via-gray-900 to-black' },
  { id: 3, name: 'Mousepad Líquido Azul', price: '$ 34.900', gradient: 'from-cyan-400 via-blue-500 to-indigo-600' },
  { id: 4, name: 'Mousepad Líquido Morado', price: '$ 34.900', gradient: 'from-purple-400 via-fuchsia-500 to-violet-700' },
];
