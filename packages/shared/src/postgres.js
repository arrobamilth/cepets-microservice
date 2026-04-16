const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const {
  demoUsers,
  demoPets,
  demoImages,
  demoAdoptions,
  demoPassword,
  APPROVAL_STATUSES
} = require('./seeds');

const rootDir = path.resolve(__dirname, '../../..');
const defaultDatabaseUrl = 'postgresql://cepets:cepets@localhost:5432/cepets';

let pool;
let initPromise;

function getDatabaseUrl() {
  if (process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim()) {
    return String(process.env.DATABASE_URL).trim();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('La variable de entorno DATABASE_URL es obligatoria en produccion.');
  }

  return defaultDatabaseUrl;
}

function getPool() {
  if (pool) {
    return pool;
  }

  const config = {
    connectionString: getDatabaseUrl()
  };

  if (process.env.DATABASE_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);
  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function withTransaction(callback) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function dataFilePath(...segments) {
  return path.join(rootDir, ...segments);
}

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function normalizeTimestamp(value) {
  return value || new Date().toISOString();
}

function nullableText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value);
  return text.trim() ? text : null;
}

async function waitForDatabase() {
  let lastError;

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await query('SELECT 1');
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError;
}

async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      approval_status TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      organization_name TEXT,
      city TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS credentials (
      user_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      approval_status TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      age TEXT NOT NULL,
      gender TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      image_id TEXT,
      city TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      pet_id TEXT,
      owner_id TEXT NOT NULL,
      pet_name TEXT,
      pet_status TEXT,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      accent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS adoptions (
      id TEXT PRIMARY KEY,
      pet_id TEXT NOT NULL,
      pet_name TEXT NOT NULL,
      pet_owner_id TEXT NOT NULL,
      applicant_user_id TEXT NOT NULL,
      applicant_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      housing TEXT NOT NULL,
      tenure TEXT NOT NULL,
      availability TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      reviewed_by TEXT,
      decision_note TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    CREATE INDEX IF NOT EXISTS idx_credentials_email ON credentials (email);
    CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets (owner_id);
    CREATE INDEX IF NOT EXISTS idx_pets_status ON pets (status);
    CREATE INDEX IF NOT EXISTS idx_images_owner_id ON images (owner_id);
    CREATE INDEX IF NOT EXISTS idx_images_pet_id ON images (pet_id);
    CREATE INDEX IF NOT EXISTS idx_adoptions_pet_owner_id ON adoptions (pet_owner_id);
    CREATE INDEX IF NOT EXISTS idx_adoptions_applicant_user_id ON adoptions (applicant_user_id);
    CREATE INDEX IF NOT EXISTS idx_adoptions_pet_id ON adoptions (pet_id);
  `);
}

async function tableHasRows(client, tableName) {
  const result = await client.query(`SELECT 1 FROM ${tableName} LIMIT 1`);
  return result.rowCount > 0;
}

async function seedUsers(client) {
  if (await tableHasRows(client, 'users')) {
    return;
  }

  const users = readJsonFile(dataFilePath('services', 'user-service', 'data', 'users.json'), demoUsers);

  for (const user of users) {
    await client.query(
      `
        INSERT INTO users (
          id, role, approval_status, name, email, organization_name,
          city, phone, address, created_at, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (id) DO NOTHING
      `,
      [
        user.id,
        user.role,
        user.approvalStatus || APPROVAL_STATUSES.APPROVED,
        user.name,
        String(user.email).toLowerCase(),
        nullableText(user.organizationName),
        user.city,
        user.phone,
        user.address,
        normalizeTimestamp(user.createdAt),
        user.updatedAt || null
      ]
    );
  }
}

async function seedCredentials(client) {
  if (await tableHasRows(client, 'credentials')) {
    return;
  }

  let credentials = readJsonFile(dataFilePath('services', 'auth-service', 'data', 'credentials.json'), []);

  if (!credentials.length) {
    credentials = await Promise.all(
      demoUsers.map(async (user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus || APPROVAL_STATUSES.APPROVED,
        passwordHash: await bcrypt.hash(demoPassword, 10),
        createdAt: new Date().toISOString()
      }))
    );
  }

  for (const account of credentials) {
    await client.query(
      `
        INSERT INTO credentials (
          user_id, name, email, role, approval_status, password_hash, created_at, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [
        account.userId,
        account.name,
        String(account.email).toLowerCase(),
        account.role,
        account.approvalStatus || APPROVAL_STATUSES.APPROVED,
        account.passwordHash,
        normalizeTimestamp(account.createdAt),
        account.updatedAt || null
      ]
    );
  }
}

async function seedPets(client) {
  if (await tableHasRows(client, 'pets')) {
    return;
  }

  const pets = readJsonFile(dataFilePath('services', 'pet-service', 'data', 'pets.json'), demoPets);

  for (const pet of pets) {
    await client.query(
      `
        INSERT INTO pets (
          id, owner_id, name, species, age, gender, description, status,
          image_id, city, created_at, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO NOTHING
      `,
      [
        pet.id,
        pet.ownerId,
        pet.name,
        pet.species,
        pet.age,
        pet.gender,
        pet.description,
        pet.status,
        nullableText(pet.imageId),
        pet.city || 'Sincelejo',
        normalizeTimestamp(pet.createdAt),
        pet.updatedAt || null
      ]
    );
  }
}

async function seedImages(client) {
  if (await tableHasRows(client, 'images')) {
    return;
  }

  const images = readJsonFile(dataFilePath('services', 'image-service', 'data', 'images.json'), demoImages);

  for (const image of images) {
    await client.query(
      `
        INSERT INTO images (
          id, pet_id, owner_id, pet_name, pet_status, file_name, mime_type, accent, created_at, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING
      `,
      [
        image.id,
        nullableText(image.petId),
        image.ownerId,
        nullableText(image.petName),
        nullableText(image.petStatus),
        image.fileName,
        image.mimeType,
        nullableText(image.accent),
        normalizeTimestamp(image.createdAt),
        image.updatedAt || null
      ]
    );
  }
}

async function seedAdoptions(client) {
  if (await tableHasRows(client, 'adoptions')) {
    return;
  }

  const adoptions = readJsonFile(dataFilePath('services', 'adoption-service', 'data', 'adoptions.json'), demoAdoptions);

  for (const adoption of adoptions) {
    await client.query(
      `
        INSERT INTO adoptions (
          id, pet_id, pet_name, pet_owner_id, applicant_user_id, applicant_name,
          phone, email, address, housing, tenure, availability,
          status, created_at, reviewed_at, reviewed_by, decision_note
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        ON CONFLICT (id) DO NOTHING
      `,
      [
        adoption.id,
        adoption.petId,
        adoption.petName,
        adoption.petOwnerId,
        adoption.applicantUserId,
        adoption.applicantName,
        adoption.phone,
        adoption.email,
        adoption.address,
        adoption.housing,
        adoption.tenure,
        adoption.availability,
        adoption.status,
        normalizeTimestamp(adoption.createdAt),
        adoption.reviewedAt || null,
        adoption.reviewedBy || null,
        nullableText(adoption.decisionNote)
      ]
    );
  }
}

async function bootstrapDatabase() {
  await withTransaction(async (client) => {
    await seedUsers(client);
    await seedCredentials(client);
    await seedPets(client);
    await seedImages(client);
    await seedAdoptions(client);
  });
}

async function initializeDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      await waitForDatabase();
      await ensureSchema();
      await bootstrapDatabase();
    })();
  }

  return initPromise;
}

module.exports = {
  getDatabaseUrl,
  getPool,
  query,
  withTransaction,
  initializeDatabase
};
