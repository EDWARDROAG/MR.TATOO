/**
 * ============================================================
 * ARCHIVO: AdminUsers.jsx
 * UBICACIÓN: frontend/src/pages/Admin/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — AdminUsers.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   AdminUsers (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useAuth, LoadingSpinner
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
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ========================================================================== */
/*  ROLES DE USUARIOS                                                         */
/* ========================================================================== */

const USER_ROLES = [
  { value: 'admin', label: 'Administrador', icon: '👑', color: 'bg-purple-100 text-purple-700' },
  { value: 'cajero', label: 'Cajero', icon: '💰', color: 'bg-blue-100 text-blue-700' }
];

/* ========================================================================== */
/*  COMPONENTE PRINCIPAL                                                      */
/* ========================================================================== */

const AdminUsers = () => {
  const { 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    changePassword,
    user: currentUser,
    loading 
  } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'cajero'
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /* ========================================================================= */
  /*  CARGAR USUARIOS                                                          */
  /* ========================================================================= */

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setErrorMessage('Error al cargar los usuarios');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* ========================================================================= */
  /*  MANEJAR FORMULARIO                                                       */
  /* ========================================================================= */

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      role: 'cajero'
    });
    setEditingUser(null);
  };

  const resetPasswordForm = () => {
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);
    resetPasswordForm();
    setShowPasswordModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    resetPasswordForm();
  };

  /* ========================================================================= */
  /*  CREAR/ACTUALIZAR USUARIO                                                 */
  /* ========================================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setErrorMessage('El nombre es requerido');
      return;
    }
    
    if (!formData.email.trim()) {
      setErrorMessage('El email es requerido');
      return;
    }
    
    if (!editingUser && !formData.password) {
      setErrorMessage('La contraseña es requerida para nuevos usuarios');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Formato de email inválido');
      return;
    }
    
    try {
      if (editingUser) {
        const updateData = {
          nombre: formData.nombre,
          email: formData.email,
          role: formData.role
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(editingUser.id, updateData);
        setSuccessMessage(`Usuario "${formData.nombre}" actualizado`);
      } else {
        await createUser(formData);
        setSuccessMessage(`Usuario "${formData.nombre}" creado`);
      }
      
      handleCloseModal();
      loadUsers();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving user:', err);
      setErrorMessage(err.message || 'Error al guardar el usuario');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  CAMBIAR CONTRASEÑA                                                       */
  /* ========================================================================= */

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.newPassword) {
      setErrorMessage('La nueva contraseña es requerida');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }
    
    try {
      await changePassword(selectedUser.id, { 
        newPassword: passwordData.newPassword 
      });
      setSuccessMessage(`Contraseña actualizada para "${selectedUser.nombre}"`);
      handleClosePasswordModal();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setErrorMessage(err.message || 'Error al cambiar la contraseña');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  ELIMINAR USUARIO                                                         */
  /* ========================================================================= */

  const handleDeleteClick = (user) => {
    if (user.id === currentUser?.id) {
      setErrorMessage('No puedes eliminar tu propio usuario');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      setSuccessMessage(`Usuario "${userToDelete.nombre}" eliminado`);
      setUserToDelete(null);
      loadUsers();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setErrorMessage(err.message || 'Error al eliminar el usuario');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  /* ========================================================================= */
  /*  OBTENER BADGE DE ROL                                                    */
  /* ========================================================================= */

  const getRoleBadge = (role) => {
    const roleInfo = USER_ROLES.find(r => r.value === role);
    if (!roleInfo) return <span>{role}</span>;
    
    return (
      <span className={`${roleInfo.color} px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}>
        <span>{roleInfo.icon}</span>
        <span>{roleInfo.label}</span>
      </span>
    );
  };

  /* ========================================================================= */
  /*  RENDERIZADO DE TABLA DE USUARIOS                                         */
  /* ========================================================================= */

  const renderUserRow = (user) => {
    return (
      <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg">
              {user.nombre?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{user.nombre}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          {getRoleBadge(user.role)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(user.created_at).toLocaleDateString('es-CO')}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal(user)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-1"
              title="Editar"
            >
              ✏️
            </button>
            <button
              onClick={() => handleOpenPasswordModal(user)}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 p-1"
              title="Cambiar contraseña"
            >
              🔑
            </button>
            <button
              onClick={() => handleDeleteClick(user)}
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
            Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los usuarios del sistema (Administradores y Cajeros)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Nuevo Usuario
        </button>
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

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500">No hay usuarios registrados</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-blue-600 hover:underline"
            >
              Crear primer usuario
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(renderUserRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Rol *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  {USER_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Contraseña {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder={editingUser ? 'Dejar en blanco para mantener' : 'Nueva contraseña (mínimo 6 caracteres)'}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required={!editingUser}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              Cambiar Contraseña - {selectedUser.nombre}
            </h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-6">
              ¿Estás seguro de eliminar al usuario <strong>"{userToDelete.nombre}"</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;