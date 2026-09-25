#!/usr/bin/env node
/**
 * Migra cabeceras de backend/src + frontend/src a plantilla unificada v1.2.
 * Solo reescribe el bloque de cabecera al inicio; no toca la lógica.
 *
 * Uso (raíz CoreX):
 *   node scripts/migrate-headers-unified.mjs
 *   node scripts/migrate-headers-unified.mjs --dry-run
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const SKIP_DIR = new Set(['node_modules', 'dist', 'build', 'coverage', '__tests__', '.git']);
const EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

const NOW = '2026-07-30 18:15';
const MIG_TAG = 'Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)';

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(e.name) || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else {
      const ext = path.extname(e.name).toLowerCase();
      if (!EXT.has(ext)) continue;
      if (/^\.env/i.test(e.name) || /\.env\./i.test(e.name)) continue;
      out.push(full);
    }
  }
  return out;
}

function roleFromPath(rel) {
  const p = rel.replace(/\\/g, '/').toLowerCase();
  if (p.includes('/controllers/')) return 'controller';
  if (p.includes('/services/')) return 'service';
  if (p.includes('/models/')) return 'model';
  if (p.includes('/middlewares/')) return 'middleware';
  if (p.includes('/routes/')) return 'route';
  if (p.includes('/hooks/')) return 'hook';
  if (p.includes('/utils/') || p.includes('/helpers/')) return 'util';
  if (p.includes('/pages/')) return 'page';
  if (p.includes('/components/')) return 'component';
  if (p.includes('/config/')) return 'config';
  if (p.includes('/context/')) return 'context';
  if (p.includes('/constants/')) return 'constants';
  if (p.includes('/seeds/')) return 'seed';
  if (p.includes('/data/')) return 'data';
  if (p.endsWith('/server.js') || p.endsWith('/main.jsx') || p.endsWith('/app.jsx')) return 'entry';
  return 'module';
}

/** Quita cabeceras al inicio (legacy, vivo, @file, lineas tipo slash-star) */
function stripLeadingHeaders(source) {
  let s = source.replace(/^\uFEFF/, '');
  let changed = true;
  while (changed) {
    changed = false;
    s = s.replace(/^\s+/, '');

    // // Archivo: ... líneas sueltas al inicio
    const lineHdr = s.match(/^(?:\/\/[^\n]*\n)+/);
    if (lineHdr && /Archivo:|CoreX\s*-|Generado autom/i.test(lineHdr[0])) {
      s = s.slice(lineHdr[0].length);
      changed = true;
      continue;
    }

    // Bloques /* ... */ o /** ... */ multilínea al inicio
    const m = s.match(/^\/\*[\s\S]*?\*\/\s*/);
    if (m) {
      const block = m[0];
      const looksHeader =
        /ARCHIVO\s*:|UBICACI[OÓ]N\s*:|PROP[OÓ]SITO|M[oó]dulo\s*:|@file\b|@contract\b|Contrato|HISTORIAL|={8,}|FUNCIONES|Consumidores|Rol\s*:|Cabecera unificada|📄|🎯|FUNCIONALIDADES|DEPENDENCIAS|RELACIONES/i.test(
          block
        );
      if (looksHeader) {
        s = s.slice(m[0].length);
        changed = true;
        continue;
      }
    }

    // Plantilla legacy CoreX: muchas líneas cada una es /* ..... */
    // o separadores /* ===== */
    const singleLines = [];
    const lines = s.split('\n');
    let i = 0;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === '') {
        singleLines.push(lines[i]);
        i++;
        continue;
      }
      if (/^\/\*.*\*\/$/.test(t) || /^\/\*=+\s*\*\/$/.test(t) || /^\/\*\s*$/.test(t)) {
        singleLines.push(lines[i]);
        i++;
        continue;
      }
      break;
    }
    if (singleLines.length > 0) {
      const blob = singleLines.join('\n');
      const looks =
        /ARCHIVO\s*:|UBICACI|PROP[OÓ]SITO|FUNCIONALIDADES|DEPENDENCIAS|RELACIONES|HISTORIAL|📄|🎯|M[OÓ]DULO:|VERSI[OÓ]N:|={5,}/i.test(
          blob
        );
      if (looks) {
        s = lines.slice(i).join('\n').replace(/^\s+/, '');
        changed = true;
        continue;
      }
    }
  }
  return s;
}

function extractOldMeta(oldHeaderText) {
  const meta = {
    purpose: '',
    deps: '',
    consumers: '',
    notes: '',
    history: [],
    version: '',
  };
  if (!oldHeaderText) return meta;

  const purpose =
    oldHeaderText.match(/PROP[OÓ]SITO[:\s]*\n?\s*([\s\S]*?)(?=\n\s*\*|FUNCIONALIDADES|FUNCIONES|DEPENDENCIAS|={5}|$)/i) ||
    oldHeaderText.match(/Prop[oó]sito:\s*\n?\s*([\s\S]*?)(?=\n\s*\*|Funciones|Dependencias|={5}|$)/i) ||
    oldHeaderText.match(/@description\s+([^\n*]+)/i) ||
    oldHeaderText.match(/🎯\s*PROP[OÓ]SITO[\s\S]*?-{5,}[\s\S]*?\/\*\s*([^*\n][^\n]*)/);
  if (purpose) {
    meta.purpose = purpose[1]
      .replace(/\/\*|\*\//g, '')
      .replace(/^\s*\*?\s?/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 280);
  }
  // Legacy line-style: lines after PROPÓSITO separator until FUNCIONALIDADES
  if (!meta.purpose || meta.purpose.length < 20) {
    const legacyPurp = oldHeaderText.match(
      /PROP[OÓ]SITO[\s\S]{0,80}?-{5,}([\s\S]*?)(?:FUNCIONALIDADES|FUNCIONES \/ API|DEPENDENCIAS)/i
    );
    if (legacyPurp) {
      const text = legacyPurp[1]
        .split('\n')
        .map((l) => l.replace(/^\/\*/, '').replace(/\*\/\s*$/, '').replace(/^\s*\*\s?/, '').trim())
        .filter((l) => l && !/^-+$/.test(l) && !/PROP[OÓ]SITO/i.test(l))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length > 15) meta.purpose = text.slice(0, 280);
    }
  }

  const deps =
    oldHeaderText.match(/DEPENDENCIAS[\s\S]*?----+([\s\S]*?)(?=\n\s*\*|🔗|RELACIONES|CONSUMIDORES|={5}|$)/i) ||
    oldHeaderText.match(/Dependencias(?:\s+clave)?:\s*\n?\s*([\s\S]*?)(?=\n\s*\*|Consumidores|Notas|={5}|$)/i);
  if (deps) {
    meta.deps = deps[1]
      .split('\n')
      .map((l) => l.replace(/^\s*[\*•·]\s*/, '').replace(/^\s*\*\s*/, '').trim())
      .filter((l) => l && !/^-+$/.test(l) && !/DEPENDENCIAS/i.test(l))
      .slice(0, 8)
      .join(', ')
      .slice(0, 220);
  }

  const cons =
    oldHeaderText.match(/Importado por:\s*([^\n*]+)/i) ||
    oldHeaderText.match(/@consumers?\s+([^\n*]+)/i) ||
    oldHeaderText.match(/Consumidores:\s*([^\n*]+)/i);
  if (cons) meta.consumers = cons[1].replace(/\s+/g, ' ').trim().slice(0, 200);

  const notes =
    oldHeaderText.match(/NOTAS[\s\S]*?----+([\s\S]*?)(?=\n\s*\*|🛠️|HISTORIAL|={5}|$)/i) ||
    oldHeaderText.match(/Notas:\s*\n?\s*([\s\S]*?)(?=\n\s*\*|HISTORIAL|={5}|$)/i);
  if (notes) {
    meta.notes = notes[1]
      .replace(/^\s*\*?\s?/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
  }

  const ver = oldHeaderText.match(/VERSI[OÓ]N:\s*([^\n*]+)/i);
  if (ver) meta.version = ver[1].trim().slice(0, 80);

  // Historial bullets [x.y] - date
  const histBlock = oldHeaderText.match(/HISTORIAL[\s\S]*?(?=\n\s*\*?\s*={5}|$)/i);
  if (histBlock) {
    const lines = histBlock[0].split('\n');
    let current = null;
    for (const line of lines) {
      const h = line.match(/\[([^\]]+)\]\s*-\s*([^\n*]+)/);
      if (h) {
        if (current) meta.history.push(current);
        current = { ver: h[1].trim(), date: h[2].replace(/\*+\s*$/, '').trim(), bullets: [] };
        continue;
      }
      const b = line.match(/✅\s*(.+)/) || line.match(/^\s*\*\s{2,}✅\s*(.+)/);
      if (b && current) current.bullets.push(b[1].trim());
    }
    if (current) meta.history.push(current);
  }

  const contract =
    oldHeaderText.match(/@contract\s+([^\n*]+)/i) ||
    oldHeaderText.match(/Contrato(?:\s*\(exporta\))?:\s*([^\n*]+)/i);
  if (contract && !meta.purpose) {
    meta.notes = (meta.notes ? meta.notes + ' · ' : '') + contract[1].trim();
  }

  return meta;
}

function captureOldHeader(source) {
  const m = source.match(/^((?:\s*\/\/[^\n]*\n)*)(\s*\/\*[\s\S]*?\*\/\s*)*/);
  if (!m) return '';
  // take up to first non-header content — simpler: first 8k if looks like header
  const head = source.slice(0, 9000);
  if (
    /ARCHIVO\s*:|@file\b|PROP[OÓ]SITO|M[oó]dulo\s*:|={8,}|Generado autom/i.test(head)
  ) {
    const end = stripLeadingHeaders(source);
    return source.slice(0, source.length - end.length);
  }
  return '';
}

function parseExports(body) {
  const names = new Set();
  let m;
  const reExport = /export\s+(?:async\s+)?(?:function|const|class|let|var)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = reExport.exec(body))) names.add(m[1]);
  if (/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/.test(body)) {
    names.add(RegExp.$1 + ' (default)');
  } else if (/export\s+default\s+([A-Za-z_$][\w$]*)/.test(body)) {
    names.add(RegExp.$1 + ' (default)');
  } else if (/export\s+default\s/.test(body)) {
    names.add('default');
  }
  const reMod = /module\.exports\s*=\s*\{([^}]+)\}/gs;
  while ((m = reMod.exec(body))) {
    m[1].split(',').forEach((p) => {
      const k = p.split(':')[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(k)) names.add(k);
    });
  }
  const reAssign = /exports\.([A-Za-z_$][\w$]*)\s*=/g;
  while ((m = reAssign.exec(body))) names.add(m[1]);
  // named: module.exports = { a, b } already; also exports at end
  if (names.size === 0) {
    const fns = body.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm) || [];
    fns.slice(0, 12).forEach((l) => {
      const n = l.match(/function\s+([A-Za-z_$][\w$]*)/);
      if (n) names.add(n[1]);
    });
  }
  const list = [...names].slice(0, 16);
  return list.length ? list.join(', ') : '(API interna / sin export nombrado detectado)';
}

function parseTopDeps(body) {
  const deps = new Set();
  const reReq = /require\(['"](\.\.?\/[^'"]+)['"]\)/g;
  let m;
  while ((m = reReq.exec(body))) {
    deps.add(path.basename(m[1]).replace(/\.(js|jsx|ts|tsx)$/, ''));
  }
  const reImp = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
  while ((m = reImp.exec(body))) {
    deps.add(path.basename(m[1]).replace(/\.(js|jsx|ts|tsx)$/, ''));
  }
  return [...deps].slice(0, 10).join(', ');
}

function defaultPurpose(role, file) {
  const map = {
    controller: `Controlador HTTP — endpoints de ${file.replace(/Controller\.js$/i, '')}.`,
    service: `Servicio de dominio / orquestación — ${file}.`,
    model: `Modelo / acceso a datos — ${file}.`,
    middleware: `Middleware Express — ${file}.`,
    route: `Definición de rutas Express — ${file}.`,
    hook: `Hook React — ${file}.`,
    util: `Utilidades — ${file}.`,
    page: `Página / vista React — ${file}.`,
    component: `Componente UI React — ${file}.`,
    config: `Configuración de entorno / infraestructura — ${file}.`,
    context: `Contexto React — ${file}.`,
    constants: `Constantes / catálogo — ${file}.`,
    seed: `Seed de datos — ${file}.`,
    data: `Datos estáticos / contenido — ${file}.`,
    entry: `Punto de entrada de la aplicación — ${file}.`,
    module: `Módulo — ${file}.`,
  };
  return map[role] || map.module;
}

function bumpVersion(oldVer) {
  if (!oldVer) return '2.0 — cabecera unificada';
  const m = oldVer.match(/^(\d+)\.(\d+)/);
  if (m) {
    const major = Number(m[1]);
    const minor = Number(m[2]);
    return `${major}.${minor + 1} — cabecera unificada`;
  }
  return '2.0 — cabecera unificada';
}

function wrapLines(text, indent = ' *   ', max = 72) {
  if (!text) return `${indent}—`;
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      lines.push(indent + cur.trim());
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(indent + cur.trim());
  return lines.join('\n');
}

function buildHeader({ rel, file, role, meta, exportsList, depsList, layer }) {
  const ubic = path.posix.dirname(rel.replace(/\\/g, '/')) + '/';
  const version = bumpVersion(meta.version);
  const purpose = meta.purpose || defaultPurpose(role, file);
  const deps = meta.deps || depsList || '—';
  const consumers = meta.consumers || 'Revisar imports en el resto del proyecto';
  const notes = meta.notes || `${layer} · mantener contrato y consumidores al cambiar la API`;

  const histLines = [];
  histLines.push(` * [${version.split(' —')[0]}] - ${NOW}`);
  histLines.push(` *    ✅ ${MIG_TAG}`);
  for (const h of meta.history.slice(0, 8)) {
    histLines.push(` * [${h.ver}] - ${h.date}`);
    if (h.bullets.length) {
      h.bullets.slice(0, 4).forEach((b) => histLines.push(` *    ✅ ${b}`));
    } else {
      histLines.push(` *    ✅ (entrada previa conservada)`);
    }
  }
  if (meta.history.length === 0) {
    histLines.push(` * [1.0] - (previo)`);
    histLines.push(` *    ✅ Implementación existente antes de unificar cabecera`);
  }

  return `/**
 * ============================================================
 * ARCHIVO: ${file}
 * UBICACIÓN: ${ubic}
 * ROL: ${role}
 * VERSIÓN: ${version}
 * ÚLTIMA ACTUALIZACIÓN: ${NOW}
 * ============================================================
 * PROPÓSITO:
${wrapLines(purpose)}
 *
 * FUNCIONES / API (contrato exporta):
${wrapLines(exportsList)}
 *
 * DEPENDENCIAS CLAVE:
${wrapLines(deps)}
 *
 * CONSUMIDORES / RELACIONES:
${wrapLines('Importado por: ' + consumers)}
 *
 * NOTAS:
${wrapLines(notes)}
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
${histLines.join('\n')}
 * ============================================================
 */
`;
}

function processFile(abs) {
  const rel = path.relative(ROOT, abs);
  const raw = fs.readFileSync(abs, 'utf8');
  const oldHeader = captureOldHeader(raw);
  const meta = extractOldMeta(oldHeader);
  const body = stripLeadingHeaders(raw);
  if (body === raw && !oldHeader) {
    // no header — still prepend
  }
  // Avoid double-processing if already clean unified (unless --force)
  const headCheck = raw.slice(0, 4500);
  const hasLeftoverLegacy =
    /📄 ARCHIVO:|🎯 PROPÓSITO|FUNCIONALIDADES PRINCIPALES|🛠️ HISTORIAL/i.test(raw.slice(800, 6000));
  if (
    !FORCE &&
    /ARCHIVO:\s/.test(headCheck) &&
    /FUNCIONES \/ API/.test(headCheck) &&
    /HISTORIAL DE CAMBIOS/.test(headCheck) &&
    raw.includes(MIG_TAG) &&
    !hasLeftoverLegacy
  ) {
    return { status: 'skip', rel };
  }

  const file = path.basename(abs);
  const role = roleFromPath(rel);
  const layer = rel.replace(/\\/g, '/').startsWith('backend/') ? 'Backend' : 'Frontend';
  const exportsList = parseExports(body);
  const depsList = parseTopDeps(body);
  const header = buildHeader({
    rel: rel.replace(/\\/g, '/'),
    file,
    role,
    meta,
    exportsList,
    depsList,
    layer,
  });
  const next = header + (body.startsWith('\n') ? body : '\n' + body);
  if (!DRY) fs.writeFileSync(abs, next, 'utf8');
  return { status: 'ok', rel };
}

const files = [
  ...walk(path.join(ROOT, 'backend', 'src')),
  ...walk(path.join(ROOT, 'frontend', 'src')),
];

const stats = { ok: 0, skip: 0, err: 0 };
for (const f of files) {
  try {
    const r = processFile(f);
    stats[r.status === 'skip' ? 'skip' : 'ok']++;
    if (r.status === 'ok') console.log('OK', r.rel);
    else console.log('SKIP', r.rel);
  } catch (e) {
    stats.err++;
    console.error('ERR', path.relative(ROOT, f), e.message);
  }
}

console.log(JSON.stringify({ dry: DRY, total: files.length, ...stats }, null, 2));
