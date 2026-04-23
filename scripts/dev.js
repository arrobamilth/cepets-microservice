const { spawn } = require('node:child_process');
const path = require('node:path');
const { Client } = require('pg');

const rootDir = path.resolve(__dirname, '..');
const defaultDatabaseUrl = process.env.DATABASE_URL || 'postgresql://cepets:cepets@localhost:5432/cepets';

const services = [
  { name: 'auth', script: 'services/auth-service/src/index.js' },
  { name: 'users', script: 'services/user-service/src/index.js' },
  { name: 'pets', script: 'services/pet-service/src/index.js' },
  { name: 'images', script: 'services/image-service/src/index.js' },
  { name: 'adoptions', script: 'services/adoption-service/src/index.js' },
  { name: 'gateway', script: 'services/gateway/src/index.js' },
  { name: 'web', script: 'apps/web/server.js' }
];

const palette = {
  auth: '\x1b[35m',
  users: '\x1b[34m',
  pets: '\x1b[32m',
  images: '\x1b[36m',
  adoptions: '\x1b[33m',
  gateway: '\x1b[31m',
  web: '\x1b[37m'
};

const children = [];
let shuttingDown = false;

function prefixOutput(name, chunk, stream = process.stdout) {
  const color = palette[name] || '\x1b[37m';
  const reset = '\x1b[0m';
  const lines = chunk.toString().split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    stream.write(`${color}[${name}]${reset} ${line}\n`);
  }
}

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    child.kill('SIGINT');
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }

    process.exit(code);
  }, 500);
}

function formatDatabaseHint(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    return `${parsed.hostname}:${parsed.port || '5432'}`;
  } catch (error) {
    return databaseUrl;
  }
}

async function verifyDatabaseConnection(databaseUrl) {
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query('SELECT 1');
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;

  try {
    await verifyDatabaseConnection(databaseUrl);
  } catch (error) {
    const locationHint = formatDatabaseHint(databaseUrl);
    console.error(
      [
        `No se pudo conectar a PostgreSQL en ${locationHint}.`,
        'Antes de ejecutar `npm run dev`, levanta la base local con `npm run db:up`.',
        'Si es la primera vez o reiniciaste los volumenes, ejecuta despues `npm run db:init`.',
        'Si prefieres usar el stack de produccion ya levantado, abre `http://localhost:8080` en lugar de `npm run dev`.'
      ].join('\n')
    );
    process.exit(1);
  }

  for (const service of services) {
    const child = spawn(process.execPath, [service.script], {
      cwd: rootDir,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (chunk) => prefixOutput(service.name, chunk));
    child.stderr.on('data', (chunk) => prefixOutput(service.name, chunk, process.stderr));
    child.on('exit', (code) => {
      if (shuttingDown) {
        return;
      }

      prefixOutput(
        service.name,
        `Proceso finalizado con codigo ${code}. Se detendra el entorno completo.`,
        process.stderr
      );
      shutdown(code || 1);
    });

    children.push(child);
  }
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
