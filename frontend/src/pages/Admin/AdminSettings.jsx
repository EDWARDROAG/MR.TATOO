/**
 * ============================================================
 * ARCHIVO: AdminSettings.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminSettings.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminSettings (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useAuth, useSettings, useTheme, ModulesContext, SiteContext, navConfig,
 *   LoadingSpinner, settingsService, media, siteInfo
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
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useTheme } from '../../hooks/useTheme';
import { useModules } from '../../context/ModulesContext';
import { useSite } from '../../context/SiteContext';
import { LOCKED_MODULE_KEYS, MODULE_LABELS } from '../../config/navConfig';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { uploadSocialLogo } from '../../services/settingsService';
import { getMediaUrl } from '../../utils/media';
import { FOOTER_SOCIAL } from '../../data/siteInfo';
import { APP_ENV } from '../../config/env';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const AdminSettings = () => {
  const { user, changePassword, loading: authLoading } = useAuth();
  const { getSettings, updateSettings, loading: settingsLoading } = useSettings();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { modules, updateModules } = useModules();
  const { setSiteFromAdmin, refreshSite } = useSite();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Configuración general
  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'CoreX',
    site_description: 'Soluciones Tecnológicas',
    contact_email: 'corextechs@gmail.com',
    contact_phone: '3023705751',
    address: 'Cra 78 K #37A-68 Sur, frente al Éxito Kennedy Central, Local 202',
    city: 'Bogotá, Colombia',
    nit: ''
  });

  const [scheduleSettings, setScheduleSettings] = useState({
    weekdays: 'Lun - Vie: 9:00 AM - 7:00 PM',
    saturday: 'Sáb: 10:00 AM - 4:00 PM',
    sunday: 'Dom: Cerrado',
  });

  /** HU-054 */
  const [carritoSettings, setCarritoSettings] = useState({
    minutosExpiracion: 10,
  });

  const [socialSettings, setSocialSettings] = useState(
    FOOTER_SOCIAL.map((s) => ({
      id: s.name.toLowerCase(),
      name: s.name,
      url: s.url,
      logo: null,
    }))
  );
  const [uploadingSocialId, setUploadingSocialId] = useState(null);
  
  // Configuración de WhatsApp
  const [whatsappSettings, setWhatsappSettings] = useState({
    whatsapp_number: APP_ENV.WHATSAPP_PHONE || '',
    whatsapp_message_default: 'Hola, me gustaría obtener más información sobre sus productos y servicios.',
    whatsapp_button_text: 'Consultar por WhatsApp'
  });
  
  // Preferencias
  const [preferences, setPreferences] = useState({
    notifications_enabled: true,
    email_notifications: true,
    low_stock_alert: true,
    daily_summary: false,
    items_per_page: 12,
    default_currency: 'COP'
  });
  
  // Cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [moduleSettings, setModuleSettings] = useState(modules);
  const [savingModules, setSavingModules] = useState(false);

  useEffect(() => {
    setModuleSettings(modules);
  }, [modules]);

  /* ========================================================================= */
  /*  CARGAR CONFIGURACIÓN                                                     */
  /* ========================================================================= */

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const data = await getSettings();
        if (data) {
          if (data.general) setGeneralSettings(prev => ({ ...prev, ...data.general }));
          if (data.whatsapp) setWhatsappSettings(prev => ({ ...prev, ...data.whatsapp }));
          if (data.preferences) setPreferences(prev => ({ ...prev, ...data.preferences }));
          if (data.schedule) setScheduleSettings(prev => ({ ...prev, ...data.schedule }));
          if (data.carrito) setCarritoSettings(prev => ({ ...prev, ...data.carrito }));
          if (Array.isArray(data.social) && data.social.length) setSocialSettings(data.social);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [getSettings]);

  /* ========================================================================= */
  /*  MANEJAR CAMBIOS EN FORMULARIOS                                           */
  /* ========================================================================= */

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsappChange = (e) => {
    const { name, value } = e.target;
    setWhatsappSettings(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (index, field, value) => {
    setSocialSettings((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSocialLogoUpload = async (index, file) => {
    if (!file) return;
    const item = socialSettings[index];
    if (!item?.id) return;
    setUploadingSocialId(item.id);
    try {
      const result = await uploadSocialLogo(item.id, file);
      if (result?.social) {
        setSocialSettings(result.social);
      } else if (result?.logo) {
        setSocialSettings((prev) =>
          prev.map((s, i) => (i === index ? { ...s, logo: result.logo } : s))
        );
      }
      if (result?.site) setSiteFromAdmin(result.site);
      else await refreshSite();
      setSuccessMessage(`Logo de ${item.name} actualizado`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading social logo:', err);
      setErrorMessage(err.message || 'Error al subir el logo');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setUploadingSocialId(null);
    }
  };

  /* ========================================================================= */
  /*  GUARDAR CONFIGURACIÓN                                                    */
  /* ========================================================================= */

  const handleSaveGeneral = async () => {
    try {
      const updated = await updateSettings({
        general: generalSettings,
        schedule: scheduleSettings,
        carrito: carritoSettings,
      });
      if (updated?.contact) setSiteFromAdmin(updated);
      else await refreshSite();
      setSuccessMessage('Contacto, dirección y carrito guardados');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving general settings:', err);
      setErrorMessage('Error al guardar la configuración');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleSaveSocial = async () => {
    try {
      const updated = await updateSettings({ social: socialSettings });
      if (updated) setSiteFromAdmin(updated);
      else await refreshSite();
      setSuccessMessage('Redes sociales actualizadas en el sitio público');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving social settings:', err);
      setErrorMessage('Error al guardar las redes');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleSaveWhatsapp = async () => {
    try {
      const updated = await updateSettings({ whatsapp: whatsappSettings });
      if (updated) setSiteFromAdmin(updated);
      else await refreshSite();
      setSuccessMessage('Configuración de WhatsApp guardada');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving whatsapp settings:', err);
      setErrorMessage('Error al guardar la configuración');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updateSettings({ preferences });
      setSuccessMessage('Preferencias guardadas');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setErrorMessage('Error al guardar las preferencias');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleModuleToggle = (area, key, enabled) => {
    setModuleSettings((prev) => ({
      ...prev,
      [area]: { ...prev[area], [key]: enabled },
    }));
  };

  const handleSaveModules = async () => {
    setSavingModules(true);
    try {
      await updateModules(moduleSettings);
      setSuccessMessage('Pestañas del sistema actualizadas');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving modules:', err);
      setErrorMessage(err.message || 'Error al guardar módulos');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingModules(false);
    }
  };

  const renderModuleGroup = (area, title) => (
    <div key={area} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-2">
        {Object.entries(MODULE_LABELS[area]).map(([key, label]) => {
          const locked = (LOCKED_MODULE_KEYS[area] || []).includes(key);
          return (
            <label
              key={key}
              className={`flex items-center justify-between gap-3 py-2 ${locked ? 'opacity-60' : 'cursor-pointer'}`}
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              <input
                type="checkbox"
                checked={moduleSettings?.[area]?.[key] !== false}
                disabled={locked}
                onChange={(e) => handleModuleToggle(area, key, e.target.checked)}
                className="h-5 w-5"
              />
            </label>
          );
        })}
      </div>
    </div>
  );

  /* ========================================================================= */
  /*  CAMBIAR CONTRASEÑA                                                       */
  /* ========================================================================= */

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      setErrorMessage('La contraseña actual es requerida');
      return;
    }
    
    if (!passwordData.newPassword) {
      setErrorMessage('La nueva contraseña es requerida');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Las contraseñas nuevas no coinciden');
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage('Contraseña actualizada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setErrorMessage(err.message || 'Error al cambiar la contraseña');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  TEMAS                                                                   */
  /* ========================================================================= */

  const themes = [
    { id: 'light', name: 'Claro', icon: '☀️', description: 'Tema claro para ambientes iluminados' },
    { id: 'dark', name: 'Oscuro', icon: '🌙', description: 'Tema oscuro para ambientes con poca luz' },
    { id: 'system', name: 'Sistema', icon: '💻', description: 'Usar la configuración del sistema' }
  ];

  /* ========================================================================= */
  /*  RENDERIZADO DE TABS                                                      */
  /* ========================================================================= */

  const tabs = [
    { id: 'general', label: '⚙️ General', icon: '⚙️' },
    { id: 'social', label: '🔗 Redes', icon: '🔗' },
    { id: 'modules', label: '🧩 Pestañas', icon: '🧩' },
    { id: 'whatsapp', label: '💬 WhatsApp', icon: '💬' },
    { id: 'preferences', label: '🎨 Preferencias', icon: '🎨' },
    { id: 'security', label: '🔒 Seguridad', icon: '🔒' },
    { id: 'theme', label: '🎨 Tema', icon: '🎨' }
  ];

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  if (isLoading || authLoading || settingsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personaliza la configuración del sistema
        </p>
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        
        {/* Tab General */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Información General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Sitio</label>
                <input
                  type="text"
                  name="site_name"
                  value={generalSettings.site_name}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input
                  type="text"
                  name="site_description"
                  value={generalSettings.site_description}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email de Contacto</label>
                <input
                  type="email"
                  name="contact_email"
                  value={generalSettings.contact_email}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={generalSettings.contact_phone}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NIT / Registro (factura)</label>
                <input
                  type="text"
                  name="nit"
                  value={generalSettings.nit || ''}
                  onChange={handleGeneralChange}
                  placeholder="Ej. 900123456-7"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">Se imprime en el recibo térmico del POS.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  value={generalSettings.city}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horario Lun-Vie</label>
                <input
                  type="text"
                  name="weekdays"
                  value={scheduleSettings.weekdays}
                  onChange={handleScheduleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horario Sábado</label>
                <input
                  type="text"
                  name="saturday"
                  value={scheduleSettings.saturday}
                  onChange={handleScheduleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horario Domingo</label>
                <input
                  type="text"
                  name="sunday"
                  value={scheduleSettings.sunday}
                  onChange={handleScheduleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minutos hasta vaciar el carrito (vitrina)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={carritoSettings.minutosExpiracion}
                  onChange={(e) =>
                    setCarritoSettings({
                      minutosExpiracion: Math.min(
                        120,
                        Math.max(1, Number(e.target.value) || 10)
                      ),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paridad Pañalera · 1–120. Default 10.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Estos datos se muestran en el footer y en la página Contacto del sitio público.
            </p>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveGeneral}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Redes sociales</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              URLs y logos personalizados. Al guardar, se reflejan en el footer y en Contacto.
            </p>
            <div className="space-y-4">
              {socialSettings.map((item, index) => (
                <div
                  key={item.id || index}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 md:grid-cols-12 md:items-center"
                >
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Nombre</label>
                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={(e) => handleSocialChange(index, 'name', e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="mb-1 block text-xs font-medium text-gray-500">URL</label>
                    <input
                      type="url"
                      value={item.url || ''}
                      onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700"
                      placeholder="https://"
                    />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-5">
                    {item.logo ? (
                      <img
                        src={getMediaUrl(item.logo)}
                        alt={item.name}
                        className="h-12 w-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                        Logo
                      </div>
                    )}
                    <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                      {uploadingSocialId === item.id ? 'Subiendo…' : 'Subir logo'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploadingSocialId === item.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleSocialLogoUpload(index, file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSaveSocial}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Guardar redes
              </button>
            </div>
          </div>
        )}

        {/* Tab Pestañas / Módulos */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Pestañas del sistema</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Activa o desactiva secciones del sitio público, panel admin y cajero. Los cambios aplican para todos los usuarios.
              Dashboard y Configuración siempre permanecen activos.
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              {renderModuleGroup('public', 'Sitio público')}
              {renderModuleGroup('admin', 'Panel administrativo')}
              {renderModuleGroup('cajero', 'Panel cajero')}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSaveModules}
                disabled={savingModules}
                className="admin-btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                {savingModules ? 'Guardando…' : 'Guardar pestañas'}
              </button>
            </div>
          </div>
        )}

        {/* Tab WhatsApp */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Configuración de WhatsApp</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Número de WhatsApp (con código de país)
                </label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={whatsappSettings.whatsapp_number}
                  onChange={handleWhatsappChange}
                  placeholder="Ej: 573115610825"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este número se usa en el botón flotante, footer y página Contacto. Formato: 57 + celular (ej: 573023705751).
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje por Defecto</label>
                <textarea
                  name="whatsapp_message_default"
                  value={whatsappSettings.whatsapp_message_default}
                  onChange={handleWhatsappChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Texto del Botón</label>
                <input
                  type="text"
                  name="whatsapp_button_text"
                  value={whatsappSettings.whatsapp_button_text}
                  onChange={handleWhatsappChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveWhatsapp}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {/* Tab Preferencias */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Preferencias del Sistema</h2>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer py-2">
                <span>Activar notificaciones</span>
                <input
                  type="checkbox"
                  name="notifications_enabled"
                  checked={preferences.notifications_enabled}
                  onChange={handlePreferencesChange}
                  className="w-5 h-5"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer py-2">
                <span>Notificaciones por email</span>
                <input
                  type="checkbox"
                  name="email_notifications"
                  checked={preferences.email_notifications}
                  onChange={handlePreferencesChange}
                  className="w-5 h-5"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer py-2">
                <span>Alerta de bajo stock</span>
                <input
                  type="checkbox"
                  name="low_stock_alert"
                  checked={preferences.low_stock_alert}
                  onChange={handlePreferencesChange}
                  className="w-5 h-5"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer py-2">
                <span>Resumen diario de ventas</span>
                <input
                  type="checkbox"
                  name="daily_summary"
                  checked={preferences.daily_summary}
                  onChange={handlePreferencesChange}
                  className="w-5 h-5"
                />
              </label>
              
              <div>
                <label className="block text-sm font-medium mb-1">Productos por página</label>
                <select
                  name="items_per_page"
                  value={preferences.items_per_page}
                  onChange={handlePreferencesChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value={12}>12 productos</option>
                  <option value={24}>24 productos</option>
                  <option value={48}>48 productos</option>
                  <option value={96}>96 productos</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSavePreferences}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {/* Tab Seguridad */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Usuario: <strong>{user?.email}</strong>
            </p>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Tema */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Apariencia</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map(themeOption => (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    theme === themeOption.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{themeOption.icon}</div>
                  <h3 className="font-semibold">{themeOption.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{themeOption.description}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm">
                💡 El tema se aplica automáticamente a toda la interfaz del sistema.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;