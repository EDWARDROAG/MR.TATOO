/**
 * ============================================================
 * ARCHIVO: HomePage.jsx
 * UBICACIÓN: frontend/src/pages/Public/
 * ROL: page
 * VERSIÓN: 3.4 — vitrina Pages
 * ÚLTIMA ACTUALIZACIÓN: 2026-09-25 10:00
 * ============================================================
 * PROPÓSITO:
 *   HOME pública del demo: hero, portafolio, artista, estilos, proceso, cotizar, tienda, redes.
 *
 * FUNCIONES / API (contrato exporta):
 *   HomePage (default)
 *
 * DEPENDENCIAS CLAVE:
 *   tattooContent, api, media, QuoteForm, sectionNav
 *
 * CONSUMIDORES / RELACIONES:
 *   App.jsx ruta /
 *
 * NOTAS:
 *   Prefijo CSS corex-* técnico heredado. Look de estudio en mr-tatoo.css.
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [3.4] - 2026-09-25 10:00
 *    ✅ HU-092 — merch demo sin API en vitrina
 * [3.3] - 2026-09-22 20:45
 *    ✅ HU-020 — id contacto; estilos filtran y bajan a portafolio
 * [3.2] - 2026-09-22 20:40
 *    ✅ HU-022 — retrato del artista sin recortar (object-fit contain)
 * [3.1] - 2026-09-22 20:30
 *    ✅ HU-013 — hero, portafolio, estilos, merch y feed desde /images/demo/
 * [3.0] - 2026-09-22 13:10
 *    ✅ HU-020…024 / HU-030…033 / HU-050 — HOME demo Mr. Tatoo
 * ============================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QuoteForm from '../../components/public/QuoteForm';
import api from '../../services/api';
import { getMediaUrl, normalizeImages } from '../../utils/media';
import { scrollToSection } from '../../utils/sectionNav';
import { APP_ENV } from '../../config/env';
import {
  ARTIST_BIO,
  ARTIST_IMAGE,
  DEMO_MERCH,
  DEMO_STATS,
  HERO_IMAGE,
  PORTFOLIO_ITEMS,
  PROCESS_STEPS,
  SOCIAL_FEED,
  TATTOO_STYLES,
  TRUST_STRIP,
} from '../../data/tattooContent';

const FILTERS = [{ id: 'todos', name: 'Todos' }, ...TATTOO_STYLES];

const cop = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const HomePage = () => {
  const [filter, setFilter] = useState('todos');
  const [active, setActive] = useState(null);
  const [shop, setShop] = useState([]);

  const pieces = useMemo(
    () => (filter === 'todos' ? PORTFOLIO_ITEMS : PORTFOLIO_ITEMS.filter((p) => p.style === filter)),
    [filter]
  );

  useEffect(() => {
    if (APP_ENV.isVitrina) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/products', { params: { limit: 12, page: 1 } });
        const rows = res.data?.data ?? [];
        if (!cancelled) setShop(Array.isArray(rows) ? rows.slice(0, 6) : []);
      } catch {
        if (!cancelled) setShop([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const merchByName = Object.fromEntries(DEMO_MERCH.map((p) => [p.name, p.image]));
  const merch = shop.length
    ? shop.map((p) => ({
        id: p.id,
        name: p.nombre,
        price: Number(p.precio) || 0,
        href: `/products/${p.id}`,
        image: getMediaUrl(normalizeImages(p.imagenes, p.imagen_url)[0]) || merchByName[p.nombre],
      }))
    : DEMO_MERCH.map((p) => ({ ...p, href: APP_ENV.isVitrina ? '/#cotizar' : '/products' }));

  return (
    <div>
      <section className="mrtatoo-hero" id="inicio">
        <img className="mrtatoo-hero__bg" src={HERO_IMAGE} alt="Tatuador trabajando" />
        <div className="mrtatoo-hero__veil" />
        <div className="mrtatoo-hero__inner">
          <p className="mrtatoo-kicker">{ARTIST_BIO.tagline}</p>
          <h1>
            MR. <span>TATOO</span>
          </h1>
          <p className="mrtatoo-claim">{ARTIST_BIO.claim}</p>
          <p>Tatuajes personalizados · {ARTIST_BIO.city}</p>
          <p>Ideas, historias y emociones convertidas en arte.</p>
          <div className="mrtatoo-actions">
            <a className="mrtatoo-btn mrtatoo-btn--primary" href="#portafolio">
              Ver portafolio →
            </a>
            <Link className="mrtatoo-btn mrtatoo-btn--ghost" to="/cotizar">
              Cotizar mi tatuaje
            </Link>
          </div>
        </div>
        <p className="mrtatoo-quote-aside">Good Tattoos Better People</p>
      </section>

      <div className="mrtatoo-strip">
        {TRUST_STRIP.map((item) => (
          <div key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
        ))}
      </div>

      <section className="mrtatoo-section" id="portafolio">
        <h2>
          Nuestro <span>portafolio</span>
        </h2>
        <div className="mrtatoo-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filter === f.id ? 'is-on' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.name}
            </button>
          ))}
        </div>
        <div className="mrtatoo-masonry">
          {pieces.map((item) => (
            <figure key={item.id} onClick={() => setActive(item)}>
              <img src={item.image} alt={item.title} />
            </figure>
          ))}
        </div>
      </section>

      <section className="mrtatoo-section" id="artista">
        <h2>
          Conoce al <span>artista</span>
        </h2>
        <div className="mrtatoo-split mrtatoo-split--artist">
          <div>
            <p>{ARTIST_BIO.text}</p>
            <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#9a9a9a' }}>{ARTIST_BIO.quote}</p>
            <div className="mrtatoo-stats">
              {DEMO_STATS.map((s) => (
                <div key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: '#666' }}>
              Cifras de muestra, reemplazables con los datos reales del artista.
            </p>
          </div>
          <figure className="mrtatoo-artist-photo">
            <img src={ARTIST_IMAGE} alt={ARTIST_BIO.name} />
          </figure>
        </div>
      </section>

      <section className="mrtatoo-section" id="estilos">
        <h2>Estilos</h2>
        <div className="mrtatoo-styles">
          {TATTOO_STYLES.map((style) => (
            <button
              type="button"
              className="mrtatoo-style"
              key={style.id}
              onClick={() => {
                setFilter(style.id);
                scrollToSection('portafolio');
              }}
            >
              <img src={style.image} alt={style.name} />
              <div>
                <strong>{style.name}</strong>
                <small>{style.blurb}</small>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mrtatoo-section" id="proceso">
        <div className="mrtatoo-split">
          <div>
            <h2>¿Cómo funciona?</h2>
            <div className="mrtatoo-steps">
              {PROCESS_STEPS.map((step) => (
                <div className="mrtatoo-step" key={step.n}>
                  <em>{step.n}</em>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div id="cotizar">
            <h2>
              Cotiza tu <span>tatuaje</span>
            </h2>
            <QuoteForm compact />
          </div>
        </div>
      </section>

      <section className="mrtatoo-section" id="tienda">
        <h2>Tienda</h2>
        <div className="mrtatoo-shop">
          {merch.map((p) => (
            <Link className="mrtatoo-card" key={p.id} to={p.href}>
              {p.image ? <img src={p.image} alt={p.name} /> : <div className="ph" />}
              <p>{p.name}</p>
              <strong>{cop(p.price)}</strong>
            </Link>
          ))}
        </div>
        {!APP_ENV.isVitrina && (
        <div className="mrtatoo-actions" style={{ marginTop: '1.2rem' }}>
          <Link className="mrtatoo-btn mrtatoo-btn--ghost" to="/products">
            Ver todos los productos
          </Link>
        </div>
        )}
      </section>

      <section className="mrtatoo-section" id="contacto">
        <h2>Síguenos</h2>
        <p style={{ color: '#9a9a9a', marginBottom: '1rem' }}>
          Vive el proceso, el día a día y cada contenido en nuestras redes. {ARTIST_BIO.handle}
        </p>
        <div className="mrtatoo-feed">
          {SOCIAL_FEED.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
      </section>

      {active && (
        <div className="mrtatoo-modal" onClick={() => setActive(null)} role="presentation">
          <div className="mrtatoo-modal__box" onClick={(e) => e.stopPropagation()} role="dialog">
            <img src={active.image} alt={active.title} />
            <div>
              <p className="mrtatoo-kicker">{active.style}</p>
              <h3>{active.title}</h3>
              <p>Zona: {active.zone}</p>
              <p style={{ margin: '0.8rem 0', color: '#9a9a9a' }}>
                Pieza de muestra. El cliente reemplaza foto y descripción con su trabajo real.
              </p>
              <Link className="mrtatoo-btn mrtatoo-btn--primary" to={`/cotizar?estilo=${encodeURIComponent(active.style)}`}>
                Quiero algo parecido
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
