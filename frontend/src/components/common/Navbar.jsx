/**
 * ============================================================
 * ARCHIVO: Navbar.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 2.4 — vitrina Pages
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   Componente UI React — Navbar.jsx.
 *
 * FUNCIONES / API (contrato exporta):
 *   Navbar (default)
 *
 * DEPENDENCIAS CLAVE:
 *   tattooContent, ModulesContext, CartContext, navConfig, api, SectionLink
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: layout público
 *
 * NOTAS:
 *   Frontend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.4] - 2026-09-25 10:00
 *    ✅ HU-092 — vitrina: sin login/carrito ni fetch API
 * [2.3] - 2026-09-22 20:45
 *    ✅ HU-020 — nav a #portafolio / #artista (scroll real)
 * [2.2] - 2026-09-22 20:30
 *    ✅ HU-013 — logo local en nav oscuro
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useModules } from '../../context/ModulesContext';
import { useCart } from '../../context/CartContext';
import { PUBLIC_NAV, isNavPathActive, buildProductNavChildren } from '../../config/navConfig';
import api from '../../services/api';
import { BRAND_LOGO_WHITE } from '../../data/tattooContent';
import SectionLink from './SectionLink';
import { APP_ENV } from '../../config/env';

const IconSearch = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
  </svg>
);

const IconUser = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconCart = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.5 6h12M10 19.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm8 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z" />
  </svg>
);

const linkClass = (active) =>
  `text-sm font-medium tracking-wide transition ${
    active ? 'border-b-2 border-white pb-0.5 text-white' : 'text-gray-300 hover:text-white'
  }`;

const ProductsDropdown = ({ item, onNavigate }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const productsActive = location.pathname.startsWith('/products');

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div
      className="relative"
      ref={wrapRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-1">
        <NavLink
          to={item.path}
          className={() => linkClass(productsActive)}
          onClick={() => {
            setOpen(true);
            onNavigate?.();
          }}
        >
          {item.label}
        </NavLink>
        <button
          type="button"
          className={`text-xs ${productsActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          aria-expanded={open}
          aria-label="Abrir submenú Productos"
          onClick={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
        >
          ▾
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-[60] min-w-[12rem] pt-2">
          <div
            className="max-h-[70vh] overflow-y-auto rounded-lg border border-white/20 py-1 shadow-2xl"
            style={{ backgroundColor: '#000000' }}
          >
            {item.children.map((child) => {
              const active = isNavPathActive(child.path, location.pathname, location.search);
              return (
                <NavLink
                  key={child.path + child.label}
                  to={child.path}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={`block px-4 py-2 text-sm ${
                    active ? 'bg-white/15 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {child.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { filterNavByModules } = useModules();
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    if (APP_ENV.isVitrina) return undefined;
    api
      .get('/categories')
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
    return undefined;
  }, []);

  const navItems = useMemo(() => {
    const base = filterNavByModules(PUBLIC_NAV, 'public');
    return base.map((item) => {
      if (item.path !== '/products') return item;
      return { ...item, children: buildProductNavChildren(categories) };
    });
  }, [filterNavByModules, categories]);

  const closeMobile = () => {
    setIsMenuOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <SectionLink to="/" end className="flex items-center gap-2" onClick={closeMobile}>
          <img className="mrtatoo-brand-logo" src={BRAND_LOGO_WHITE} alt="Mr. Tatoo" />
        </SectionLink>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.children?.length ? (
              <ProductsDropdown key={item.label} item={item} />
            ) : (
              <SectionLink
                key={item.label}
                to={item.path}
                end={item.end}
                className={({ isActive }) => linkClass(isActive)}
              >
                {item.label}
              </SectionLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!APP_ENV.isVitrina && (
            <>
              <button type="button" className="hidden text-gray-300 transition hover:text-white sm:block" aria-label="Buscar">
                <IconSearch />
              </button>
              <Link to="/login" className="hidden text-gray-300 transition hover:text-white sm:block" aria-label="Cuenta">
                <IconUser />
              </Link>
              <Link
                to="/cart"
                className="relative text-gray-300 transition hover:text-white"
                aria-label="Carrito"
                onClick={closeMobile}
              >
                <IconCart />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <button
            type="button"
            className="rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Menú"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-white/10 bg-black px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.children?.length) {
                const productsActive = location.pathname.startsWith('/products');
                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <NavLink
                        to={item.path}
                        onClick={closeMobile}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                          productsActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5"
                        aria-expanded={mobileProductsOpen}
                        onClick={() => setMobileProductsOpen((v) => !v)}
                      >
                        {mobileProductsOpen ? '▴' : '▾'}
                      </button>
                    </div>
                    {mobileProductsOpen &&
                      item.children.map((child) => {
                        const active = isNavPathActive(child.path, location.pathname, location.search);
                        return (
                          <NavLink
                            key={child.path + child.label}
                            to={child.path}
                            onClick={closeMobile}
                            className={`ml-3 rounded-lg px-3 py-2 text-sm ${
                              active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {child.label}
                          </NavLink>
                        );
                      })}
                  </div>
                );
              }

              return (
                <SectionLink
                  key={item.label}
                  to={item.path}
                  end={item.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`
                  }
                >
                  {item.label}
                </SectionLink>
              );
            })}
            {!APP_ENV.isVitrina && (
            <Link
              to="/cart"
              onClick={closeMobile}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
            >
              Carrito{itemCount > 0 ? ` (${itemCount})` : ''}
            </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
