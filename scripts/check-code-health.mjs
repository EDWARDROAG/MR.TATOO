#!/usr/bin/env node
/**
 * CoreX — check-code-health (HU-039 / Código vivo)
 *
 * 1) Contratos de hooks: lo desestructurado de useX() debe existir en el return del hook.
 * 2) Candidatos huérfanos bajo frontend/src (aviso; --strict-orphans falla el proceso).
 *
 * Uso (desde frontend/):
 *   npm run check:code-health
 *   node ../scripts/check-code-health.mjs --strict-orphans
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'frontend', 'src');

const HOOK_CONTRACTS = [
  {
    name: 'useWhatsApp',
    hookFile: path.join(SRC, 'hooks', 'useWhatsApp.js'),
    requiredByConsumers: [
      'generateQuickBuyLink',
      'generateProductInquiryLink',
      'generateServiceInquiryLink'
    ]
  }
];

const SKIP_DIR = new Set(['node_modules', 'dist', '__tests__', 'coverage']);

function walk(dir, ext = ['.js', '.jsx', '.ts', '.tsx']) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, ext));
    else if (ext.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

/** Nombres exportados en el objeto return { ... } del hook (heurística) */
function parseReturnKeys(hookSource) {
  const idx = hookSource.lastIndexOf('return {');
  if (idx === -1) return new Set();
  const slice = hookSource.slice(idx, idx + 2500);
  const end = slice.indexOf('};');
  const block = end === -1 ? slice : slice.slice(0, end);
  const keys = new Set();
  const re = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*[},]/gm;
  let m;
  while ((m = re.exec(block))) {
    if (m[1] === 'return') continue;
    keys.add(m[1]);
  }
  // shorthand y claves con valor: name,
  const re2 = /(?:^|,)\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?::|,|\n)/g;
  while ((m = re2.exec(block))) keys.add(m[1]);
  return keys;
}

/** Desestructuraciones: const { a, b } = useWhatsApp( */
function parseDestructuredFromHook(source, hookName) {
  const names = new Set();
  const re = new RegExp(
    `(?:const|let|var)\\s*\\{([^}]+)\\}\\s*=\\s*${hookName}\\s*\\(`,
    'g'
  );
  let m;
  while ((m = re.exec(source))) {
    m[1].split(',').forEach((part) => {
      const cleaned = part.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (!cleaned) return;
      const id = cleaned.split(':')[0].trim().split('=')[0].trim();
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) names.add(id);
    });
  }
  return names;
}

function checkHookContracts() {
  const errors = [];
  const files = walk(SRC);

  for (const contract of HOOK_CONTRACTS) {
    if (!fs.existsSync(contract.hookFile)) {
      errors.push(`Hook no encontrado: ${contract.hookFile}`);
      continue;
    }
    const hookSrc = read(contract.hookFile);
    const exported = parseReturnKeys(hookSrc);

    for (const req of contract.requiredByConsumers) {
      if (!exported.has(req)) {
        errors.push(
          `[${contract.name}] Falta en return: "${req}" (requerido por contrato HU-039)`
        );
      }
    }

    for (const file of files) {
      if (path.resolve(file) === path.resolve(contract.hookFile)) continue;
      const src = read(file);
      if (!src.includes(contract.name)) continue;
      const used = parseDestructuredFromHook(src, contract.name);
      for (const name of used) {
        if (!exported.has(name)) {
          const rel = path.relative(ROOT, file);
          errors.push(
            `[${contract.name}] "${rel}" usa "${name}" pero el hook no lo exporta`
          );
        }
      }
    }
  }
  return errors;
}

function toImportCandidates(filePath) {
  const rel = path.relative(SRC, filePath).replace(/\\/g, '/');
  const noExt = rel.replace(/\.(jsx?|tsx?)$/, '');
  const base = path.basename(noExt);
  return [
    noExt,
    `./${noExt}`,
    `../${noExt}`,
    `@/${noExt}`,
    base,
    `./${base}`,
    `/${noExt}`
  ];
}

function checkOrphans() {
  const files = walk(SRC);
  const sources = files.map((f) => ({ file: f, text: read(f) }));
  const orphans = [];

  for (const { file } of sources) {
    const base = path.basename(file);
    // Entry points y tests no cuentan como huérfanos
    if (
      /^(main|index|App|main\.jsx|index\.jsx)$/i.test(base.replace(/\.(jsx?|tsx?)$/, '')) ||
      file.includes(`${path.sep}pages${path.sep}`) ||
      file.includes(`${path.sep}routes${path.sep}`)
    ) {
      continue;
    }

    const candidates = toImportCandidates(file);
    let referenced = false;
    for (const other of sources) {
      if (other.file === file) continue;
      const t = other.text;
      if (
        candidates.some(
          (c) =>
            t.includes(`from '${c}'`) ||
            t.includes(`from "${c}"`) ||
            t.includes(`'${c}'`) && t.includes('import')
        )
      ) {
        // Más estricto: buscar segmento de path
        referenced = true;
        break;
      }
      const needle = path.basename(file).replace(/\.(jsx?|tsx?)$/, '');
      if (
        new RegExp(`from ['"][^'"]*${needle}['"]`).test(t) ||
        new RegExp(`import\\(['"][^'"]*${needle}['"]\\)`).test(t)
      ) {
        referenced = true;
        break;
      }
    }
    if (!referenced) {
      orphans.push(path.relative(ROOT, file));
    }
  }
  return orphans;
}

function main() {
  const strictOrphans = process.argv.includes('--strict-orphans');
  console.log('CoreX check-code-health (Código vivo / HU-039)\n');

  const contractErrors = checkHookContracts();
  if (contractErrors.length) {
    console.log('❌ Contratos de hooks:');
    contractErrors.forEach((e) => console.log('  -', e));
  } else {
    console.log('✅ Contratos de hooks OK');
  }

  const orphans = checkOrphans();
  if (orphans.length) {
    console.log(`\n⚠️  Candidatos huérfanos (${orphans.length}) — revisar a mano:`);
    orphans.slice(0, 40).forEach((f) => console.log('  -', f));
    if (orphans.length > 40) console.log(`  … y ${orphans.length - 40} más`);
  } else {
    console.log('✅ Sin candidatos huérfanos obvios');
  }

  if (contractErrors.length) {
    process.exit(1);
  }
  if (strictOrphans && orphans.length) {
    process.exit(1);
  }
  process.exit(0);
}

main();
