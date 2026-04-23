const express = require('express');
const cors = require('cors');
const {
  ROLES,
  PET_STATUSES,
  ADOPTION_STATUSES,
  nowIso,
  generateId,
  authenticate,
  requireRoles,
  requireInternalService,
  buildServiceUrl,
  getInternalServiceKey,
  initializeDatabase,
  query
} = require('../../../packages/shared/src');

const app = express();
const port = Number(process.env.ADOPTION_SERVICE_PORT || process.env.PORT || 4105);
const host = process.env.HOST || '0.0.0.0';
const petServiceUrl = buildServiceUrl('PET_SERVICE_URL', 4103);
const userServiceUrl = buildServiceUrl('USER_SERVICE_URL', 4102);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function mapAdoption(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    petId: row.pet_id,
    petName: row.pet_name,
    petOwnerId: row.pet_owner_id,
    applicantUserId: row.applicant_user_id,
    applicantName: row.applicant_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    housing: row.housing,
    tenure: row.tenure,
    availability: row.availability,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    decisionNote: row.decision_note || ''
  };
}

async function findAdoption(adoptionId) {
  const result = await query(`SELECT * FROM adoptions WHERE id = $1 LIMIT 1`, [adoptionId]);
  return mapAdoption(result.rows[0]);
}

async function listAdoptionsForUser(user) {
  let result;

  if (user.role === ROLES.ADMIN) {
    result = await query(`SELECT * FROM adoptions ORDER BY created_at DESC NULLS LAST, id ASC`);
  } else if (user.role === ROLES.ORG) {
    result = await query(
      `SELECT * FROM adoptions WHERE pet_owner_id = $1 ORDER BY created_at DESC NULLS LAST, id ASC`,
      [user.id]
    );
  } else {
    result = await query(
      `SELECT * FROM adoptions WHERE applicant_user_id = $1 ORDER BY created_at DESC NULLS LAST, id ASC`,
      [user.id]
    );
  }

  return result.rows.map(mapAdoption);
}

async function getPet(petId) {
  const response = await fetch(`${petServiceUrl}/internal/pets/${petId}`, {
    headers: {
      'x-internal-service-key': getInternalServiceKey()
    }
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || 'No se pudo consultar la mascota.');
  }

  const data = await response.json();
  return data.item;
}

async function updatePetStatus(petId, status) {
  const response = await fetch(`${petServiceUrl}/internal/pets/${petId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': getInternalServiceKey()
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || 'No se pudo actualizar el estado de la mascota.');
  }

  const data = await response.json();
  return data.item;
}

async function getUserProfile(userId) {
  const response = await fetch(`${userServiceUrl}/internal/users/${userId}`, {
    headers: {
      'x-internal-service-key': getInternalServiceKey()
    }
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || 'No se pudo consultar el perfil del usuario.');
  }

  const data = await response.json();
  return data.item;
}

async function enrichAdoptionsWithProfiles(items) {
  const userIds = [...new Set(items.map((item) => item.applicantUserId).filter(Boolean))];

  if (!userIds.length) {
    return items;
  }

  const profiles = await Promise.all(
    userIds.map(async (userId) => {
      try {
        const profile = await getUserProfile(userId);
        return [userId, profile];
      } catch (error) {
        return [userId, null];
      }
    })
  );

  const profileMap = new Map(profiles);

  return items.map((item) => {
    const profile = profileMap.get(item.applicantUserId);

    if (!profile || !profile.name) {
      return item;
    }

    return {
      ...item,
      applicantName: profile.name
    };
  });
}

app.get('/health', (req, res) => {
  res.json({ service: 'adoption-service', ok: true, time: nowIso() });
});

app.get('/adoptions', authenticate(), async (req, res) => {
  const items = await listAdoptionsForUser(req.user);

  try {
    const enrichedItems = await enrichAdoptionsWithProfiles(items);
    return res.json({ items: enrichedItems });
  } catch (error) {
    return res.json({ items });
  }
});

app.post('/adoptions', authenticate(), requireRoles(ROLES.ADOPTANTE), async (req, res) => {
  const requiredFields = ['petId', 'phone', 'email', 'address', 'housing', 'tenure', 'availability'];

  for (const field of requiredFields) {
    if (!req.body[field] || !String(req.body[field]).trim()) {
      return res.status(400).json({ message: `El campo ${field} es obligatorio.` });
    }
  }

  let pet;

  try {
    pet = await getPet(req.body.petId);
  } catch (error) {
    return res.status(404).json({ message: 'La mascota que deseas adoptar no existe.' });
  }

  if (pet.status !== PET_STATUSES.AVAILABLE) {
    return res.status(409).json({ message: 'La mascota seleccionada no esta disponible para adopcion.' });
  }

  const existingRequestResult = await query(
    `
      SELECT id FROM adoptions
      WHERE pet_id = $1
        AND applicant_user_id = $2
        AND status = ANY($3::text[])
      LIMIT 1
    `,
    [pet.id, req.user.id, [ADOPTION_STATUSES.PENDING, ADOPTION_STATUSES.ACCEPTED]]
  );

  if (existingRequestResult.rowCount > 0) {
    return res.status(409).json({ message: 'Ya tienes una solicitud activa para esta mascota.' });
  }

  let applicantProfile;

  try {
    applicantProfile = await getUserProfile(req.user.id);
  } catch (error) {
    applicantProfile = null;
  }

  const result = await query(
    `
      INSERT INTO adoptions (
        id, pet_id, pet_name, pet_owner_id, applicant_user_id, applicant_name,
        phone, email, address, housing, tenure, availability,
        status, created_at, reviewed_at, reviewed_by, decision_note
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
    `,
    [
      generateId('adp'),
      pet.id,
      pet.name,
      pet.ownerId,
      req.user.id,
      applicantProfile && applicantProfile.name ? applicantProfile.name : req.user.name,
      String(req.body.phone).trim(),
      String(req.body.email).trim(),
      String(req.body.address).trim(),
      String(req.body.housing).trim(),
      String(req.body.tenure).trim(),
      String(req.body.availability).trim(),
      ADOPTION_STATUSES.PENDING,
      nowIso(),
      null,
      null,
      ''
    ]
  );

  return res.status(201).json({
    message: 'Solicitud enviada correctamente.',
    item: mapAdoption(result.rows[0])
  });
});

app.patch('/adoptions/:id/status', authenticate(), requireRoles(ROLES.ADMIN, ROLES.ORG), async (req, res) => {
  const adoption = await findAdoption(req.params.id);

  if (!adoption) {
    return res.status(404).json({ message: 'La solicitud no existe.' });
  }

  if (req.user.role === ROLES.ORG && adoption.petOwnerId !== req.user.id) {
    return res.status(403).json({ message: 'No puedes revisar solicitudes de otra organizacion.' });
  }

  if (![ADOPTION_STATUSES.ACCEPTED, ADOPTION_STATUSES.REJECTED].includes(req.body.status)) {
    return res.status(400).json({ message: 'El nuevo estado de la solicitud no es valido.' });
  }

  if (adoption.status !== ADOPTION_STATUSES.PENDING) {
    return res.status(409).json({ message: 'Solo las solicitudes pendientes pueden revisarse.' });
  }

  const reviewedAt = nowIso();
  const decisionNote = String(req.body.decisionNote || '').trim();

  const result = await query(
    `
      UPDATE adoptions
      SET status = $2,
          reviewed_at = $3,
          reviewed_by = $4,
          decision_note = $5
      WHERE id = $1
      RETURNING *
    `,
    [adoption.id, req.body.status, reviewedAt, req.user.id, decisionNote]
  );

  if (req.body.status === ADOPTION_STATUSES.ACCEPTED) {
    await query(
      `
        UPDATE adoptions
        SET status = $2,
            reviewed_at = $3,
            reviewed_by = $4,
            decision_note = $5
        WHERE pet_id = $1
          AND id <> $6
          AND status = $7
      `,
      [
        adoption.petId,
        ADOPTION_STATUSES.REJECTED,
        reviewedAt,
        req.user.id,
        'La mascota fue asignada a otro adoptante.',
        adoption.id,
        ADOPTION_STATUSES.PENDING
      ]
    );

    try {
      await updatePetStatus(adoption.petId, PET_STATUSES.ADOPTED);
    } catch (error) {
      console.error(error.message);
    }
  }

  return res.json({
    message: 'Solicitud actualizada correctamente.',
    item: mapAdoption(result.rows[0])
  });
});

app.post('/internal/adoptions/pets/:petId/cleanup', requireInternalService, async (req, res) => {
  const decisionNote =
    String(req.body && req.body.decisionNote ? req.body.decisionNote : '').trim() ||
    'La ficha de la mascota fue retirada por la organizacion.';

  const result = await query(
    `
      UPDATE adoptions
      SET status = $2,
          reviewed_at = $3,
          reviewed_by = $4,
          decision_note = $5
      WHERE pet_id = $1
        AND status = $6
    `,
    [
      req.params.petId,
      ADOPTION_STATUSES.REJECTED,
      nowIso(),
      'system_cleanup',
      decisionNote,
      ADOPTION_STATUSES.PENDING
    ]
  );

  return res.json({ affected: result.rowCount });
});

initializeDatabase()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`Adoption service escuchando en http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar adoption-service', error);
    process.exit(1);
  });
