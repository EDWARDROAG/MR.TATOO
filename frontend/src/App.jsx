/**
 * ============================================================
 * ARCHIVO: App.jsx
 * UBICACIÓN: frontend/src/
 * ROL: entry
 * VERSIÓN: 3.1 — vitrina Pages
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   Rutas de la aplicación Mr. Tatoo (fork CoreX).
 *
 * FUNCIONES / API (contrato exporta):
 *   App (default)
 *
 * DEPENDENCIAS CLAVE:
 *   Navbar, Footer, WhatsAppFloat, páginas Public/Admin
 *
 * CONSUMIDORES / RELACIONES:
 *   main.jsx
 *
 * NOTAS:
 *   Público con piel de estudio. POS/equipos quedan en código pero fuera del nav.
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [3.1] - 2026-09-25 10:00
 *    ✅ HU-091/092 — banner de muestra en vitrina
 * [3.0] - 2026-09-22 13:15
 *    ✅ HU-002/020 — layout Mr. Tatoo + /cotizar; mantenimiento público redirige
 * [2.2] - 2026-08-05 21:40
 *    ✅ HU-065 — ruta /admin/documentacion
 * ============================================================
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import WhatsAppFloat from './components/ui/WhatsAppFloat';
import ScrollToTop from './components/common/ScrollToTop';
import { APP_ENV } from './config/env';
import ProtectedRoute, { DashboardLayout } from './components/auth/ProtectedRoute';
import ModuleRouteGuard from './components/auth/ModuleRouteGuard';
import HomePage from './pages/Public/HomePage';
import ProductsPage from './pages/Public/ProductsPage';
import ProductDetailPage from './pages/Public/ProductDetailPage';
import CartPage from './pages/Public/CartPage';
import ContactPage from './pages/Public/ContactPage';
import QuotePage from './pages/Public/QuotePage';
import LoginPage from './pages/Public/LoginPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminSales from './pages/Admin/AdminSales';
import AdminReports from './pages/Admin/AdminReports';
import AdminLogs from './pages/Admin/AdminLogs';
import AdminBackup from './pages/Admin/AdminBackup';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminDocumentation from './pages/Admin/AdminDocumentation';
import CajeroPOS from './pages/Cajero/CajeroPOS';
import CajeroHistory from './pages/Cajero/CajeroHistory';

const PublicLayout = () => (
  <div className="corex-page mrtatoo-public flex min-h-screen flex-col">
    {APP_ENV.isVitrina && (
      <p className="mrtatoo-vitrina-banner">Sitio de muestra · Mr. Tatoo · Ink. Art. Identity.</p>
    )}
    <Navbar />
    <main className="flex-1">
      <ModuleRouteGuard area="public">
        <Outlet />
      </ModuleRouteGuard>
    </main>
    <Footer />
    <WhatsAppFloat />
  </div>
);

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

function App() {
  return (
    <BrowserRouter
      basename={basename}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="cotizar" element={<QuotePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="maintenance" element={<Navigate to="/" replace />} />
          <Route path="maintenance/:type" element={<Navigate to="/" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/products" element={<AdminProducts />} />
            <Route path="admin/categories" element={<AdminCategories />} />
            <Route path="admin/recepciones" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="admin/ventas-equipo" element={<Navigate to="/admin/sales" replace />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/sales" element={<AdminSales />} />
            <Route path="admin/reports" element={<AdminReports />} />
            <Route path="admin/logs" element={<AdminLogs />} />
            <Route path="admin/backup" element={<AdminBackup />} />
            <Route path="admin/documentacion" element={<AdminDocumentation />} />
            <Route path="admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['cajero', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="cajero/pos" element={<CajeroPOS />} />
            <Route path="cajero/history" element={<CajeroHistory />} />
            <Route path="cajero/recepciones" element={<Navigate to="/cajero/pos" replace />} />
            <Route path="cajero/ventas-equipo" element={<Navigate to="/cajero/pos" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
