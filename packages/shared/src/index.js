const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const {
  ROLES,
  PET_STATUSES,
  ADOPTION_STATUSES,
  APPROVAL_STATUSES,
  demoPassword,
  demoUsers,
  demoImages,
  demoPets,
  demoAdoptions
} = require('./seeds');
const { getDatabaseUrl, getPool, query, withTransaction, initializeDatabase } = require('./postgres');

const DEFAULT_JWT_SECRET = 'cepets-dev-secret';
const DEFAULT_INTERNAL_SERVICE_KEY = 'cepets-internal-key';

function getEnvOrDefault(name, fallback) {
  const value = process.env[name];

  if (value && String(value).trim()) {
    return String(value).trim();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`La variable de entorno ${name} es obligatoria en produccion.`);
  }

  return fallback;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureJsonFile(filePath, seedValue) {
  if (fs.existsSync(filePath)) {
    return;
  }

  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(seedValue, null, 2), 'utf8');
}

function createJsonStore(filePath, seedValue) {
  ensureJsonFile(filePath, seedValue);

  return {
    read() {
      ensureJsonFile(filePath, seedValue);
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    },
    write(nextValue) {
      ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, JSON.stringify(nextValue, null, 2), 'utf8');
      return nextValue;
    },
    update(updater) {
      const currentValue = this.read();
      const nextValue = updater(clone(currentValue));
      return this.write(nextValue);
    }
  };
}

function nowIso() {
  return new Date().toISOString();
}

function generateId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function getJwtSecret() {
  return getEnvOrDefault('JWT_SECRET', DEFAULT_JWT_SECRET);
}

function getInternalServiceKey() {
  return getEnvOrDefault('INTERNAL_SERVICE_KEY', DEFAULT_INTERNAL_SERVICE_KEY);
}

function getBearerToken(req) {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    if (req.query && typeof req.query.token === 'string' && req.query.token.trim()) {
      return req.query.token.trim();
    }

    return null;
  }

  return authorization.slice(7);
}

function authenticate({ optional = false } = {}) {
  return (req, res, next) => {
    const token = getBearerToken(req);

    if (!token) {
      if (optional) {
        req.user = null;
        return next();
      }

      return res.status(401).json({ message: 'Debes iniciar sesion para acceder a este recurso.' });
    }

    try {
      req.user = jwt.verify(token, getJwtSecret());
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Tu sesion no es valida o ha expirado.' });
    }
  };
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No hay una sesion activa.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Tu rol no tiene permisos para esta accion.' });
    }

    return next();
  };
}

function requireInternalService(req, res, next) {
  if (req.headers['x-internal-service-key'] !== getInternalServiceKey()) {
    return res.status(403).json({ message: 'Acceso interno no autorizado.' });
  }

  return next();
}

function buildServiceUrl(serviceName, fallbackPort) {
  return process.env[serviceName] || `http://localhost:${fallbackPort}`;
}

function formatPublicPet(pet) {
  return {
    ...pet,
    imageUrl: pet.imageId ? `/api/images/${pet.imageId}/content` : null
  };
}

module.exports = {
  ROLES,
  PET_STATUSES,
  ADOPTION_STATUSES,
  APPROVAL_STATUSES,
  demoPassword,
  demoUsers,
  demoImages,
  demoPets,
  demoAdoptions,
  createJsonStore,
  nowIso,
  generateId,
  authenticate,
  requireRoles,
  requireInternalService,
  getJwtSecret,
  getInternalServiceKey,
  buildServiceUrl,
  formatPublicPet,
  ensureDir,
  getDatabaseUrl,
  getPool,
  query,
  withTransaction,
  initializeDatabase
};
