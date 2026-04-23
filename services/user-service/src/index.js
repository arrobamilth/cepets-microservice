const express = require('express');
const cors = require('cors');
const {
  ROLES,
  APPROVAL_STATUSES,
  authenticate,
  requireRoles,
  requireInternalService,
  nowIso,
  buildServiceUrl,
  getInternalServiceKey,
  initializeDatabase,
  query
} = require('../../../packages/shared/src');

const app = express();
const port = Number(process.env.USER_SERVICE_PORT || process.env.PORT || 4102);
const host = process.env.HOST || '0.0.0.0';
const authServiceUrl = buildServiceUrl('AUTH_SERVICE_URL', 4101);

function normalizeUser(user) {
  return {
    ...user,
    approvalStatus: user.approvalStatus || APPROVAL_STATUSES.APPROVED
  };
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return normalizeUser({
    id: row.id,
    role: row.role,
    approvalStatus: row.approval_status,
    name: row.name,
    email: row.email,
    organizationName: row.organization_name || '',
    city: row.city,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

async function findUserById(userId) {
  const result = await query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [userId]);
  return mapUser(result.rows[0]);
}

async function listUsers() {
  const result = await query(`SELECT * FROM users ORDER BY created_at DESC NULLS LAST, id ASC`);
  return result.rows.map(mapUser);
}

async function listPendingOrganizations() {
  const result = await query(
    `
      SELECT * FROM users
      WHERE role = $1 AND approval_status = $2
      ORDER BY created_at DESC NULLS LAST, id ASC
    `,
    [ROLES.ORG, APPROVAL_STATUSES.PENDING]
  );

  return result.rows.map(mapUser);
}

async function syncAuthProfile(userId, profile) {
  const response = await fetch(`${authServiceUrl}/internal/auth/accounts/${userId}/profile`, {
    method: 'PATCH',
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
    throw new Error(payload.message || 'No fue posible sincronizar el perfil con auth-service.');
  }

  return payload.item;
}

async function syncAuthApprovalStatus(userId, approvalStatus) {
  const response = await fetch(`${authServiceUrl}/internal/auth/accounts/${userId}/approval`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': getInternalServiceKey()
    },
    body: JSON.stringify({ approvalStatus })
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
    throw new Error(payload.message || 'No fue posible sincronizar la aprobacion con auth-service.');
  }

  return payload.item;
}

app.get('/health', (req, res) => {
  res.json({ service: 'user-service', ok: true, time: nowIso() });
});

app.get('/users', authenticate(), requireRoles(ROLES.ADMIN), async (req, res) => {
  const items = await listUsers();
  res.json({ items });
});

app.get('/users/organizations/pending', authenticate(), requireRoles(ROLES.ADMIN), async (req, res) => {
  const items = await listPendingOrganizations();
  res.json({ items });
});

app.get('/users/me', authenticate(), async (req, res) => {
  const user = await findUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'No encontramos el perfil solicitado.' });
  }

  return res.json({ item: user });
});

app.get('/users/:id', authenticate(), async (req, res) => {
  if (req.user.role !== ROLES.ADMIN && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'No puedes consultar este perfil.' });
  }

  const user = await findUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'No encontramos el perfil solicitado.' });
  }

  return res.json({ item: user });
});

app.patch('/users/me', authenticate(), async (req, res) => {
  const currentUser = await findUserById(req.user.id);

  if (!currentUser) {
    return res.status(404).json({ message: 'No encontramos el perfil solicitado.' });
  }

  const allowedFields = ['name', 'phone', 'address', 'city', 'organizationName'];
  const requestedUpdates = Object.entries(req.body || {}).filter(
    ([field, value]) => allowedFields.includes(field) && typeof value === 'string' && value.trim()
  );

  if (requestedUpdates.length === 0) {
    return res.status(400).json({ message: 'No enviaste cambios validos para actualizar el perfil.' });
  }

  const nextUser = { ...currentUser };

  for (const [field, value] of requestedUpdates) {
    nextUser[field] = value.trim();
  }

  const result = await query(
    `
      UPDATE users
      SET name = $2,
          phone = $3,
          address = $4,
          city = $5,
          organization_name = $6,
          updated_at = $7
      WHERE id = $1
      RETURNING *
    `,
    [
      req.user.id,
      nextUser.name,
      nextUser.phone,
      nextUser.address,
      nextUser.city,
      nextUser.organizationName || null,
      nowIso()
    ]
  );

  const updatedUser = mapUser(result.rows[0]);

  try {
    await syncAuthProfile(req.user.id, { name: updatedUser.name });
  } catch (error) {
    return res.status(502).json({ message: error.message });
  }

  return res.json({ message: 'Perfil actualizado correctamente.', item: updatedUser });
});

app.patch('/users/:id/approval', authenticate(), requireRoles(ROLES.ADMIN), async (req, res) => {
  const targetUser = await findUserById(req.params.id);
  const { approvalStatus } = req.body || {};

  if (!targetUser) {
    return res.status(404).json({ message: 'No encontramos la organizacion solicitada.' });
  }

  if (targetUser.role !== ROLES.ORG) {
    return res.status(400).json({ message: 'Solo las organizaciones requieren aprobacion administrativa.' });
  }

  if (![APPROVAL_STATUSES.APPROVED, APPROVAL_STATUSES.REJECTED].includes(approvalStatus)) {
    return res.status(400).json({ message: 'El nuevo estado de aprobacion no es valido.' });
  }

  const result = await query(
    `
      UPDATE users
      SET approval_status = $2, updated_at = $3
      WHERE id = $1
      RETURNING *
    `,
    [targetUser.id, approvalStatus, nowIso()]
  );

  const updatedUser = mapUser(result.rows[0]);

  try {
    await syncAuthApprovalStatus(targetUser.id, approvalStatus);
  } catch (error) {
    return res.status(502).json({ message: error.message });
  }

  return res.json({ item: updatedUser });
});

app.post('/internal/users', requireInternalService, async (req, res) => {
  const { id, role, approvalStatus, name, email, organizationName, city, phone, address, createdAt } = req.body || {};

  if (!id || !role || !name || !email || !city || !phone || !address) {
    return res.status(400).json({ message: 'El perfil interno requiere todos los campos obligatorios.' });
  }

  if (![ROLES.ADOPTANTE, ROLES.ORG].includes(role)) {
    return res.status(400).json({ message: 'Solo se pueden crear perfiles internos de adoptantes u organizaciones.' });
  }

  if (role === ROLES.ORG && !String(organizationName || '').trim()) {
    return res.status(400).json({ message: 'La organizacion debe registrar su nombre.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUserResult = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [normalizedEmail]);

  if (existingUserResult.rowCount > 0) {
    return res.status(409).json({ message: 'Ya existe un perfil con ese correo.' });
  }

  const result = await query(
    `
      INSERT INTO users (
        id, role, approval_status, name, email, organization_name,
        city, phone, address, created_at, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `,
    [
      id,
      role,
      approvalStatus || (role === ROLES.ORG ? APPROVAL_STATUSES.PENDING : APPROVAL_STATUSES.APPROVED),
      String(name).trim(),
      normalizedEmail,
      role === ROLES.ORG ? String(organizationName).trim() : null,
      String(city).trim(),
      String(phone).trim(),
      String(address).trim(),
      createdAt || nowIso(),
      null
    ]
  );

  return res.status(201).json({ item: mapUser(result.rows[0]) });
});

app.get('/internal/users/:id', requireInternalService, async (req, res) => {
  const user = await findUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'No encontramos el perfil interno solicitado.' });
  }

  return res.json({ item: user });
});

initializeDatabase()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`User service escuchando en http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar user-service', error);
    process.exit(1);
  });
