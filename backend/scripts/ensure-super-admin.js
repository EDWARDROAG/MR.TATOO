/**
 * CLI: upsert super admin (HU-052).
 * Uso: npm run ensure:super-admin
 * Carga dotenv según NODE_ENV / archivo por defecto de database.js
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const envFile = process.env.COREX_ENV_FILE;
if (envFile && fs.existsSync(envFile)) {
  require('dotenv').config({ path: envFile, override: true });
} else if (fs.existsSync(path.join(__dirname, '../../.env.lan')) && process.argv[2] === 'lan') {
  require('dotenv').config({ path: path.join(__dirname, '../../.env.lan'), override: true });
} else if (fs.existsSync(path.join(__dirname, '../../.env.production')) && process.argv[2] === 'dev') {
  require('dotenv').config({ path: path.join(__dirname, '../../.env.production'), override: true });
}

const { connectDB, pool } = require('../src/config/database');
const { ensureSuperAdmin } = require('../src/services/superAdmin.service');

async function main() {
  await connectDB();
  const result = await ensureSuperAdmin();
  if (result.skipped) {
    console.log(`Omitido: ${result.reason}`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error('Error:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.end();
    } catch (_) {
      /* ignore */
    }
  });
