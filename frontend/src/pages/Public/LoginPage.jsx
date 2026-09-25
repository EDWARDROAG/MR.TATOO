/**
 * ============================================================
 * ARCHIVO: LoginPage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Página / vista React — LoginPage.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   LoginPage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   useAuth, assets
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
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { IMAGES } from '../../utils/assets';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading, error, isAuthenticated, user, getRememberedEmail, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const sessionExpired = searchParams.get('session') === 'expired';

  useEffect(() => {
    setEmail(getRememberedEmail());
  }, [getRememberedEmail]);

  const goHomeForRole = (role) =>
    role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/cajero/pos';

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(goHomeForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password, rememberMe);
    if (result.success) {
      navigate(goHomeForRole(result.user.role), { replace: true });
    }
  };

  return (
    <div className="corex-page flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-black px-4 py-4">
        <div className="corex-container flex items-center justify-between">
          <Link to="/">
            <img src={IMAGES.logoWhite} alt="CoreX" className="h-8 w-auto" />
          </Link>
          <Link to="/" className="text-sm text-gray-300 transition hover:text-white">
            Volver al sitio
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="corex-card w-full max-w-md p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="corex-display text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-gray-500">Acceso para administradores y cajeros de CoreX</p>
          </div>

          {sessionExpired && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Tu sesión expiró. Inicia sesión nuevamente.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="corex-label">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="corex-input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="corex-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="corex-input"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300"
              />
              Recordar correo
            </label>

            <button
              type="submit"
              disabled={loading}
              className="corex-btn-gradient corex-btn-gradient--md w-full disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
