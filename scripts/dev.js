const { spawn } = require('node:child_process');
const path = require('node:path');

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

for (const service of services) {
  const child = spawn(process.execPath, [service.script], {
    cwd: rootDir,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || defaultDatabaseUrl
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

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
