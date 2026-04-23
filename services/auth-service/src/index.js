const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  ROLES,
  APPROVAL_STATUSES,
  generateId,
  nowIso,
  getJwtSecret,
  authenticate,
  buildServiceUrl,
  getInternalServiceKey,
  requireInternalService,
  initializeDatabase,
  query
} = require('../../../packages/shared/src');

const app = express();
const port = Number(process.env.AUTH_SERVICE_PORT || process.env.PORT || 4101);
const host = process.env.HOST || '0.0.0.0';
const userServiceUrl = buildServiceUrl('USER_SERVICE_URL', 4102);

function normalizeCredential(account) {
  return {
    ...account,
    approvalStatus: account.approvalStatus || APPROVAL_STATUSES.APPROVED
  };
}

function mapCredential(row) {
  if (!row) {
    return null;
  }

  return normalizeCredential({
    userId: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
    approvalStatus: row.approval_status,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function buildToken(account) {
  return jwt.sign(
    {
      id: account.userId,
      role: account.role,
      email: account.email,
      name: account.name,
      approvalStatus: account.approvalStatus
    },
    getJwtSecret(),
    { expiresIn: '12h' }
  );
}

async function createUserProfile(profile) {
  const response = await fetch(`${userServiceUrl}/internal/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': getInternalServiceKey()
    },
    body: JSON.stringify(profile)
  });

  const payloadText = await response.text();
  let payload = {};

  if (payloadText) {
    try {
      payload = JSON.parse(payloadText);
    } catch (error) {
      payload = { message: payloadText };
    }
  }

  if (!response.ok) {
    throw new Error(payload.message || 'No fue posible crear el perfil del usuario.');
  }

  return payload.item;
}

async function findCredentialByEmail(email) {
  const result = await query(
    `SELECT * FROM credentials WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [String(email).trim()]
  );

  return mapCredential(result.rows[0]);
}

async function insertCredential(account) {
  const result = await query(
    `
      INSERT INTO credentials (
        user_id, name, email, role, approval_status, password_hash, created_at, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `,
    [
      account.userId,
      account.name,
      String(account.email).toLowerCase(),
      account.role,
      account.approvalStatus,
      account.passwordHash,
      account.createdAt || nowIso(),
      account.updatedAt || null
    ]
  );

  return mapCredential(result.rows[0]);
}

async function updateCredentialApproval(userId, approvalStatus) {
  const result = await query(
    `
      UPDATE credentials
      SET approval_status = $2, updated_at = $3
      WHERE user_id = $1
      RETURNING *
    `,
    [userId, approvalStatus, nowIso()]
  );

  return mapCredential(result.rows[0]);
}

async function updateCredentialProfile(userId, name) {
  const result = await query(
    `
      UPDATE credentials
      SET name = $2, updated_at = $3
      WHERE user_id = $1
      RETURNING *
    `,
    [userId, String(name).trim(), nowIso()]
  );

  return mapCredential(result.rows[0]);
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', ok: true, time: nowIso() });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Debes ingresar correo y contrasena.' });
  }

  const account = await findCredentialByEmail(email);

  if (!account) {
    return res.status(401).json({ message: 'Las credenciales no son correctas.' });
  }

  const validPassword = await bcrypt.compare(password, account.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ message: 'Las credenciales no son correctas.' });
  }

  if (account.approvalStatus === APPROVAL_STATUSES.PENDING) {
    return res.status(403).json({
      message: 'Tu organizacion aun esta pendiente de aprobacion por parte de un administrador.'
    });
  }

  if (account.approvalStatus === APPROVAL_STATUSES.REJECTED) {
    return res.status(403).json({
      message: 'La solicitud de tu organizacion fue rechazada. Contacta al equipo administrador.'
    });
  }

  const token = buildToken(account);

  return res.json({
    token,
    user: {
      id: account.userId,
      name: account.name,
      email: account.email,
      role: account.role,
      approvalStatus: account.approvalStatus
    }
  });
});

app.post('/auth/register', async (req, res) => {
  const { name, email, password, role, phone, address, city, organizationName } = req.body || {};

  if (!name || !email || !password || !role || !phone || !address || !city) {
    return res.status(400).json({ message: 'Debes completar todos los campos obligatorios del registro.' });
  }

  if (![ROLES.ADOPTANTE, ROLES.ORG].includes(role)) {
    return res.status(400).json({ message: 'Solo se permiten registros de adoptantes u organizaciones.' });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: 'La contrasena debe tener al menos 8 caracteres.' });
  }

  if (role === ROLES.ORG && !String(organizationName || '').trim()) {
    return res.status(400).json({ message: 'Debes indicar el nombre de la organizacion.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingAccount = await findCredentialByEmail(normalizedEmail);

  if (existingAccount) {
    return res.status(409).json({ message: 'Ya existe una cuenta registrada con ese correo.' });
  }

  const userId = generateId('usr');
  const createdAt = nowIso();
  const approvalStatus = role === ROLES.ORG ? APPROVAL_STATUSES.PENDING : APPROVAL_STATUSES.APPROVED;

  try {
    await createUserProfile({
      id: userId,
      role,
      approvalStatus,
      name: String(name).trim(),
      email: normalizedEmail,
      organizationName: role === ROLES.ORG ? String(organizationName).trim() : '',
      city: String(city).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      createdAt
    });
  } catch (error) {
    return res.status(502).json({ message: error.message });
  }

  const account = await insertCredential({
    userId,
    name: String(name).trim(),
    email: normalizedEmail,
    role,
    approvalStatus,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt
  });

  if (approvalStatus === APPROVAL_STATUSES.PENDING) {
    return res.status(201).json({
      pendingApproval: true,
      user: {
        id: account.userId,
        name: account.name,
        email: account.email,
        role: account.role,
        approvalStatus: account.approvalStatus
      }
    });
  }

  const token = buildToken(account);
  return res.status(201).json({
    token,
    user: {
      id: account.userId,
      name: account.name,
      email: account.email,
      role: account.role,
      approvalStatus: account.approvalStatus
    }
  });
});

app.get('/auth/me', authenticate(), (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      approvalStatus: req.user.approvalStatus || APPROVAL_STATUSES.APPROVED
    }
  });
});

app.patch('/internal/auth/accounts/:userId/approval', requireInternalService, async (req, res) => {
  const { approvalStatus } = req.body || {};

  if (![APPROVAL_STATUSES.APPROVED, APPROVAL_STATUSES.REJECTED].includes(approvalStatus)) {
    return res.status(400).json({ message: 'El nuevo estado de aprobacion no es valido.' });
  }

  const updatedAccount = await updateCredentialApproval(req.params.userId, approvalStatus);

  if (!updatedAccount) {
    return res.status(404).json({ message: 'No encontramos la cuenta a actualizar.' });
  }

  return res.json({ item: updatedAccount });
});

app.patch('/internal/auth/accounts/:userId/profile', requireInternalService, async (req, res) => {
  const { name } = req.body || {};

  if (!String(name || '').trim()) {
    return res.status(400).json({ message: 'Debes enviar un nombre valido para sincronizar la cuenta.' });
  }

  const updatedAccount = await updateCredentialProfile(req.params.userId, name);

  if (!updatedAccount) {
    return res.status(404).json({ message: 'No encontramos la cuenta a sincronizar.' });
  }

  return res.json({ item: updatedAccount });
});

initializeDatabase()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`Auth service escuchando en http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar auth-service', error);
    process.exit(1);
  });
