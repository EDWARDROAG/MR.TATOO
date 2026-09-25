/**
 * ============================================================
 * ARCHIVO: AdminBackup.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminBackup.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminBackup (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useBackup, LoadingSpinner
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

import React, { useState, useEffect, useCallback } from 'react';
import { useBackup } from '../../hooks/useBackup';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const AdminBackup = () => {
  const { 
    listBackups, 
    createBackup, 
    downloadBackup, 
    restoreBackup, 
    deleteBackup, 
    cleanOldBackups,
    getBackupConfig,
    updateBackupConfig,
    loading 
  } = useBackup();
  
  const [backups, setBackups] = useState([]);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [cleanDays, setCleanDays] = useState(30);
  const [configForm, setConfigForm] = useState({
    enabled: true,
    time: '02:00',
    retention_days: 30
  });
  const [includeUploads, setIncludeUploads] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /* ========================================================================= */
  /*  CARGAR BACKUPS                                                           */
  /* ========================================================================= */

  const loadBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listBackups();
      setBackups(data || []);
    } catch (err) {
      console.error('Error loading backups:', err);
      setErrorMessage('Error al cargar los backups');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [listBackups]);

  const loadConfig = useCallback(async () => {
    try {
      const data = await getBackupConfig();
      setConfig(data);
      if (data) {
        setConfigForm({
          enabled: data.enabled,
          time: data.time,
          retention_days: data.retention_days
        });
      }
    } catch (err) {
      console.error('Error loading config:', err);
    }
  }, [getBackupConfig]);

  useEffect(() => {
    loadBackups();
    loadConfig();
  }, [loadBackups, loadConfig]);

  /* ========================================================================= */
  /*  CREAR BACKUP                                                             */
  /* ========================================================================= */

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const result = await createBackup({ include_uploads: includeUploads });
      setSuccessMessage(`Backup creado exitosamente: ${result.filename}`);
      loadBackups();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating backup:', err);
      setErrorMessage('Error al crear el backup');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsCreating(false);
    }
  };

  /* ========================================================================= */
  /*  DESCARGAR BACKUP                                                         */
  /* ========================================================================= */

  const handleDownloadBackup = async (filename) => {
    try {
      await downloadBackup(filename);
    } catch (err) {
      console.error('Error downloading backup:', err);
      setErrorMessage('Error al descargar el backup');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  RESTAURAR BACKUP                                                         */
  /* ========================================================================= */

  const handleRestoreBackup = async () => {
    if (!showRestoreModal) return;
    
    try {
      await restoreBackup(showRestoreModal, { restore_uploads: false });
      setSuccessMessage(`Backup restaurado exitosamente`);
      setShowRestoreModal(null);
      loadBackups();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error restoring backup:', err);
      setErrorMessage('Error al restaurar el backup');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  ELIMINAR BACKUP                                                          */
  /* ========================================================================= */

  const handleDeleteBackup = async () => {
    if (!showDeleteModal) return;
    
    try {
      await deleteBackup(showDeleteModal);
      setSuccessMessage(`Backup eliminado exitosamente`);
      setShowDeleteModal(null);
      loadBackups();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting backup:', err);
      setErrorMessage('Error al eliminar el backup');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  LIMPIAR BACKUPS ANTIGUOS                                                 */
  /* ========================================================================= */

  const handleCleanOldBackups = async () => {
    try {
      const result = await cleanOldBackups(cleanDays);
      setSuccessMessage(`${result.deleted_count} backups antiguos eliminados (retención: ${cleanDays} días)`);
      setShowCleanModal(false);
      loadBackups();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error cleaning backups:', err);
      setErrorMessage('Error al limpiar backups antiguos');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  ACTUALIZAR CONFIGURACIÓN                                                 */
  /* ========================================================================= */

  const handleUpdateConfig = async () => {
    try {
      await updateBackupConfig(configForm);
      setSuccessMessage('Configuración de backups actualizada');
      setShowConfigModal(false);
      loadConfig();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating config:', err);
      setErrorMessage('Error al actualizar la configuración');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  FORMATEAR TAMAÑO                                                         */
  /* ========================================================================= */

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /* ========================================================================= */
  /*  FORMATEAR FECHA                                                          */
  /* ========================================================================= */

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE TABLA DE BACKUPS                                          */
  /* ========================================================================= */

  const renderBackupRow = (backup) => {
    return (
      <tr key={backup.filename} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{backup.filename}</p>
            <p className="text-xs text-gray-500">{formatDate(backup.created_at)}</p>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {backup.type || 'database'}
          </span>
        </td>
        <td className="px-4 py-3 font-mono text-sm">
          {formatSize(backup.size)}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadBackup(backup.filename)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-1"
              title="Descargar"
            >
              📥
            </button>
            <button
              onClick={() => setShowRestoreModal(backup.filename)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 p-1"
              title="Restaurar"
            >
              🔄
            </button>
            <button
              onClick={() => setShowDeleteModal(backup.filename)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 p-1"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO PRINCIPAL                                                    */
  /* ========================================================================= */

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Respaldos (Backups)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las copias de seguridad del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCleanModal(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            🧹 Limpiar Antiguos
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            ⚙️ Configuración
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isCreating ? 'Creando...' : '+ Crear Backup'}
          </button>
        </div>
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

      {/* Información de configuración actual */}
      {config && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Configuración Actual</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Backup Automático:</span>
              <span className={`ml-2 font-medium ${config.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {config.enabled ? 'Activado' : 'Desactivado'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Hora Programada:</span>
              <span className="ml-2 font-medium">{config.time}</span>
            </div>
            <div>
              <span className="text-gray-500">Retención:</span>
              <span className="ml-2 font-medium">{config.retention_days} días</span>
            </div>
            {config.last_backup && (
              <div>
                <span className="text-gray-500">Último Backup:</span>
                <span className="ml-2 font-medium">{formatDate(config.last_backup)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Opciones de creación de backup */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Crear Nuevo Backup</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUploads}
              onChange={(e) => setIncludeUploads(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Incluir archivos subidos (imágenes, comprobantes)</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ⚠️ Los backups se guardan en el servidor. Se recomienda descargar copias importantes.
        </p>
      </div>

      {/* Tabla de backups */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Backups Disponibles</h2>
          <p className="text-sm text-gray-500">{backups.length} backups encontrados</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💾</div>
            <p className="text-gray-500">No hay backups disponibles</p>
            <button
              onClick={handleCreateBackup}
              className="mt-4 text-blue-600 hover:underline"
            >
              Crear primer backup
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {backups.map(renderBackupRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación para restaurar */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Restaurar Backup</h2>
            <p className="mb-4">
              ¿Estás seguro de restaurar el backup <strong>"{showRestoreModal}"</strong>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              ⚠️ Esta acción sobrescribirá los datos actuales de la base de datos.
              Se recomienda crear un backup antes de continuar.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRestoreModal(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestoreBackup}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Eliminar Backup</h2>
            <p className="mb-4">
              ¿Estás seguro de eliminar el backup <strong>"{showDeleteModal}"</strong>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              ⚠️ Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBackup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de limpieza de backups antiguos */}
      {showCleanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Limpiar Backups Antiguos</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Días de retención
              </label>
              <input
                type="number"
                value={cleanDays}
                onChange={(e) => setCleanDays(parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Eliminará backups más antiguos que {cleanDays} días
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCleanModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCleanOldBackups}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Configuración de Backups</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configForm.enabled}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Activar backup automático diario</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hora del backup (24h)
                </label>
                <input
                  type="time"
                  value={configForm.time}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Días de retención
                </label>
                <input
                  type="number"
                  value={configForm.retention_days}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, retention_days: parseInt(e.target.value) }))}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackup;