/**
 * ============================================================
 * ARCHIVO: SectionLink.jsx
 * UBICACIÓN: frontend/src/components/common/
 * ROL: component
 * VERSIÓN: 1.0 — anclas HOME
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-22 20:45
 * ============================================================
 * PROPÓSITO:
 *   Link de nav que llega a /#seccion aunque ya estés en la HOME.
 *
 * FUNCIONES / API (contrato exporta):
 *   SectionLink (default)
 *
 * DEPENDENCIAS CLAVE:
 *   react-router-dom, sectionNav
 *
 * CONSUMIDORES / RELACIONES:
 *   Navbar.jsx, Footer.jsx
 *
 * NOTAS:
 *   Frontend · NavLink no hace scroll de hash en la misma ruta
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [1.0] - 2026-09-22 20:45
 *    ✅ HU-020 — Portafolio / El artista / anclas de HOME
 * ============================================================
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { parseSectionTo, scrollToSection } from '../../utils/sectionNav';

const SectionLink = ({ to, className, children, onClick, end = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, hash } = parseSectionTo(to);
  const isHash = Boolean(hash);

  const active = isHash
    ? location.pathname === pathname && location.hash === hash
    : end
      ? location.pathname === pathname && !location.hash
      : location.pathname === pathname || (pathname !== '/' && location.pathname.startsWith(`${pathname}/`));

  const resolvedClass = typeof className === 'function' ? className({ isActive: active }) : className;

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!isHash && pathname !== '/') return;

    event.preventDefault();
    const samePage = location.pathname === pathname;
    if (!samePage) {
      navigate({ pathname, hash });
      return;
    }
    if (location.hash !== hash) {
      navigate({ pathname, hash });
    }
    window.setTimeout(() => scrollToSection(hash), 0);
  };

  return (
    <Link to={{ pathname, hash }} className={resolvedClass} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default SectionLink;
