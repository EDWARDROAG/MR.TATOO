/**
 * ============================================================
 * ARCHIVO: MaintenancePage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — MaintenancePage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   MaintenancePage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useWhatsApp, SiteContext, whatsappHelper, PageHero, homeContent
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
import { useParams, Link } from 'react-router-dom';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { useSite } from '../../context/SiteContext';
import { getWhatsAppLink, getWhatsAppRuntimePhone } from '../../utils/whatsappHelper';
import PageHero from '../../components/ui/PageHero';
import { services as homeServices } from '../../data/homeContent';

/* ========================================================================== */
/*  DATOS DE SERVICIOS DE MANTENIMIENTO                                       */
/* ========================================================================== */

const MAINTENANCE_SERVICES = {
  celulares: {
    title: 'Mantenimiento de Celulares',
    icon: '📱',
    color: 'bg-blue-500',
    description: 'Servicio técnico especializado para todo tipo de celulares',
    services: [
      {
        name: 'Diagnóstico General',
        price: 'Gratis',
        description: 'Revisión completa del equipo sin compromiso',
        features: ['Evaluación de daños', 'Presupuesto sin costo', 'Tiempo estimado: 30min']
      },
      {
        name: 'Cambio de Pantalla',
        price: 'Desde $80.000',
        description: 'Reemplazo de pantalla rota o con fallas',
        features: ['Piezas originales', 'Garantía 3 meses', 'Tiempo: 1-2 horas']
      },
      {
        name: 'Cambio de Batería',
        price: 'Desde $60.000',
        description: 'Reemplazo de batería desgastada',
        features: ['Batería nueva original', 'Prueba de carga', 'Tiempo: 1 hora']
      },
      {
        name: 'Limpieza Interna',
        price: '$40.000',
        description: 'Limpieza de conector de carga y componentes',
        features: ['Eliminación de polvo', 'Limpieza de puertos', 'Tiempo: 1 hora']
      },
      {
        name: 'Reparación de Placa',
        price: 'Desde $120.000',
        description: 'Reparación de fallas en placa madre',
        features: ['Microsoldadura', 'Diagnóstico avanzado', 'Tiempo: 2-3 días']
      },
      {
        name: 'Recuperación de Datos',
        price: 'Desde $150.000',
        description: 'Recuperación de fotos, contactos y archivos',
        features: ['Software especializado', 'Confidencialidad', 'Tiempo: 2-5 días']
      }
    ]
  },
  computadores: {
    title: 'Mantenimiento de Computadores',
    icon: '💻',
    color: 'bg-green-500',
    description: 'Servicio técnico para PC de escritorio',
    services: [
      {
        name: 'Diagnóstico General',
        price: 'Gratis',
        description: 'Revisión completa del equipo',
        features: ['Evaluación de hardware', 'Presupuesto sin costo', 'Tiempo: 30min']
      },
      {
        name: 'Mantenimiento Preventivo',
        price: '$60.000',
        description: 'Limpieza y optimización del sistema',
        features: ['Limpieza física', 'Optimización de software', 'Tiempo: 2 horas']
      },
      {
        name: 'Formateo e Instalación',
        price: '$80.000',
        description: 'Instalación limpia de Windows',
        features: ['Drivers actualizados', 'Software básico', 'Tiempo: 3-4 horas']
      },
      {
        name: 'Actualización de RAM/SSD',
        price: 'Desde $100.000 + pieza',
        description: 'Mejora de rendimiento del equipo',
        features: ['Instalación profesional', 'Pruebas de rendimiento', 'Tiempo: 1-2 horas']
      },
      {
        name: 'Reparación de Fuente',
        price: 'Desde $80.000',
        description: 'Reparación o cambio de fuente de poder',
        features: ['Pruebas de voltaje', 'Piezas de calidad', 'Tiempo: 2 horas']
      },
      {
        name: 'Eliminación de Virus',
        price: '$50.000',
        description: 'Limpieza de malware y virus',
        features: ['Antivirus especializado', 'Optimización', 'Tiempo: 2 horas']
      }
    ]
  },
  laptops: {
    title: 'Mantenimiento de Laptops',
    icon: '🖥️',
    color: 'bg-purple-500',
    description: 'Servicio técnico para portátiles',
    services: [
      {
        name: 'Diagnóstico General',
        price: 'Gratis',
        description: 'Revisión completa del portátil',
        features: ['Evaluación completa', 'Presupuesto sin costo', 'Tiempo: 30min']
      },
      {
        name: 'Limpieza y Mantenimiento',
        price: '$70.000',
        description: 'Limpieza de ventiladores y disipador',
        features: ['Pasta térmica nueva', 'Limpieza interna', 'Tiempo: 2 horas']
      },
      {
        name: 'Cambio de Teclado',
        price: 'Desde $90.000',
        description: 'Reemplazo de teclado dañado',
        features: ['Teclado original', 'Prueba de teclas', 'Tiempo: 2-3 horas']
      },
      {
        name: 'Reparación de Bisagras',
        price: 'Desde $70.000',
        description: 'Reparación de bisagras rotas',
        features: ['Refuerzo estructural', 'Alineación', 'Tiempo: 2 horas']
      },
      {
        name: 'Cambio de Pantalla',
        price: 'Desde $180.000',
        description: 'Reemplazo de pantalla rota',
        features: ['Pantalla compatible', 'Garantía 3 meses', 'Tiempo: 2 horas']
      },
      {
        name: 'Recuperación de Datos',
        price: 'Desde $150.000',
        description: 'Recuperación de información',
        features: ['Disco duro dañado', 'Software especializado', 'Tiempo: 2-5 días']
      }
    ]
  },
  impresoras: {
    title: 'Mantenimiento de Impresoras',
    icon: '🖨️',
    color: 'bg-orange-500',
    description: 'Servicio técnico para impresoras',
    services: [
      {
        name: 'Diagnóstico General',
        price: 'Gratis',
        description: 'Revisión completa de la impresora',
        features: ['Evaluación de fallas', 'Presupuesto sin costo', 'Tiempo: 30min']
      },
      {
        name: 'Limpieza de Cabezales',
        price: '$50.000',
        description: 'Limpieza profunda de cabezales',
        features: ['Mejora de calidad', 'Prueba de impresión', 'Tiempo: 1-2 horas']
      },
      {
        name: 'Recarga de Tóner/Tinta',
        price: 'Desde $30.000',
        description: 'Recarga de cartuchos',
        features: ['Tinta de calidad', 'Prueba incluida', 'Tiempo: 30min']
      },
      {
        name: 'Reparación de Atascos',
        price: 'Desde $40.000',
        description: 'Eliminación de papel atascado',
        features: ['Limpieza de rodillos', 'Prueba de alimentación', 'Tiempo: 1 hora']
      },
      {
        name: 'Cambio de Cabezal',
        price: 'Desde $120.000',
        description: 'Reemplazo de cabezal dañado',
        features: ['Cabezal compatible', 'Alineación', 'Tiempo: 2 horas']
      },
      {
        name: 'Instalación y Configuración',
        price: '$40.000',
        description: 'Configuración en red',
        features: ['USB/WiFi', 'Prueba de conexión', 'Tiempo: 1 hora']
      }
    ]
  }
};

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const MaintenancePage = () => {
  const { type } = useParams();
  const { generateServiceInquiryLink } = useWhatsApp();
  const { whatsapp, contact } = useSite();
  const sitePhone = getWhatsAppRuntimePhone({ whatsapp, contact });

  const service = type ? MAINTENANCE_SERVICES[type] : null;
  const isSpecificService = Boolean(type && MAINTENANCE_SERVICES[type]);

  const handleServiceInquiry = () => {
    const link = generateServiceInquiryLink(type || 'celulares', sitePhone);
    window.open(link, '_blank');
  };

  /* ========================================================================= */
  /*  RENDERIZADO                                                              */
  /* ========================================================================= */

  if (!isSpecificService) {
    return (
      <>
        <PageHero
          title="Nuestros Servicios"
          subtitle="Mantenimiento, armado de PCs, consolas y periféricos con estándar profesional CoreX"
          breadcrumbs={[
            { label: 'Inicio', to: '/' },
            { label: 'Servicios' },
          ]}
        />
        <div className="corex-section corex-section-alt">
          <div className="corex-container">
            <div className="corex-grid-4">
              {homeServices.map((item) => (
                <Link key={item.id} to={item.link} className="corex-service-card group relative block">
                  {item.background && (
                    <img src={item.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 transition group-hover:opacity-40" />
                  )}
                  <div className="relative flex min-h-[280px] flex-col p-5">
                    <img src={item.icon} alt={item.title} className="mb-3 h-14 w-14 object-contain" />
                    <h3 className="corex-display text-xl font-bold" style={{ color: item.accent }}>{item.title}</h3>
                    <ul className="mt-3 flex-1 space-y-1.5">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="text-sm text-gray-300">• {bullet}</li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href={getWhatsAppLink('maintenance')} target="_blank" rel="noopener noreferrer" className="corex-btn-gradient corex-btn-gradient--md">
                Cotizar servicio
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={service.title}
        subtitle={service.description}
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Servicios', to: '/maintenance' },
          { label: service.title },
        ]}
      />

      <div className="corex-section corex-section-alt">
        <div className="corex-container">
          <div className="corex-grid-4">
            {service.services.map((item, index) => (
              <div key={index} className="corex-card flex h-full flex-col p-6">
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <p className="corex-price mt-2 text-xl">{item.price}</p>
                <p className="mt-3 text-sm text-gray-600">{item.description}</p>
                <ul className="my-4 flex-1 space-y-2">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="text-emerald-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={handleServiceInquiry} className="corex-btn-gradient corex-btn-gradient--sm w-full">
                  Consultar por WhatsApp
                </button>
              </div>
            ))}
          </div>

          <div className="corex-card mt-10 p-8">
            <h2 className="corex-section-title mb-8 text-center">¿Por qué elegirnos?</h2>
            <div className="corex-grid-4">
              {[
                { icon: '🔧', title: 'Técnicos Especializados', desc: 'Personal capacitado y con experiencia' },
                { icon: '✅', title: 'Garantía Garantizada', desc: 'Todos los servicios tienen garantía' },
                { icon: '⚡', title: 'Servicio Rápido', desc: 'Entregas en el menor tiempo posible' },
                { icon: '💬', title: 'Soporte Directo', desc: 'Atención por WhatsApp en tiempo real' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="mb-3 text-4xl">{item.icon}</div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintenancePage;