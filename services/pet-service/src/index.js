const express = require('express');
const cors = require('cors');
const {
  ROLES,
  PET_STATUSES,
  nowIso,
  generateId,
  authenticate,
  requireRoles,
  requireInternalService,
  buildServiceUrl,
  getInternalServiceKey,
  formatPublicPet,
  initializeDatabase,
  query
} = require('../../../packages/shared/src');

const app = express();
const port = Number(process.env.PET_SERVICE_PORT || process.env.PORT || 4103);
const host = process.env.HOST || '0.0.0.0';
const imageServiceUrl = buildServiceUrl('IMAGE_SERVICE_URL', 4104);
const adoptionServiceUrl = buildServiceUrl('ADOPTION_SERVICE_URL', 4105);
const userServiceUrl = buildServiceUrl('USER_SERVICE_URL', 4102);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function mapPet(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    species: row.species,
    age: row.age,
    gender: row.gender,
    description: row.description,
    status: row.status,
    imageId: row.image_id,
    city: row.city,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function canViewPet(user, pet) {
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  if (user.role === ROLES.ORG) {
    return pet.ownerId === user.id;
  }

  return pet.status === PET_STATUSES.AVAILABLE;
}

function canManagePet(user, pet) {
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  return user.role === ROLES.ORG && pet.ownerId === user.id;
}

function validatePetInput(payload, { requireImageId = true } = {}) {
  const requiredFields = ['name', 'species', 'age', 'gender', 'description', 'status'];

  if (requireImageId) {
    requiredFields.push('imageId');
  }

  for (const field of requiredFields) {
    if (!payload[field] || !String(payload[field]).trim()) {
      return `El campo ${field} es obligatorio.`;
    }
  }

  if (!Object.values(PET_STATUSES).includes(payload.status)) {
    return 'El estado de la mascota no es valido.';
  }

  return null;
}

async function listPetsSql(whereClause = '', params = []) {
  const result = await query(
    `
      SELECT * FROM pets
      ${whereClause}
      ORDER BY created_at DESC NULLS LAST, id ASC
    `,
    params
  );

  return result.rows.map(mapPet);
}

async function findPet(petId) {
  const result = await query(`SELECT * FROM pets WHERE id = $1 LIMIT 1`, [petId]);
  return mapPet(result.rows[0]);
}

async function syncImageLink(pet) {
  if (!pet.imageId) {
    return;
  }

  const response = await fetch(`${imageServiceUrl}/internal/images/${pet.imageId}/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': getInternalServiceKey()
    },
    body: JSON.stringify({
      petId: pet.id,
      ownerId: pet.ownerId,
      petStatus: pet.status,
      petName: pet.name
    })
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`No fue posible sincronizar la imagen: ${errorPayload}`);
  }
}

async function syncImageStatus(pet) {
  if (!pet.imageId) {
    return;
  }

  const response = await fetch(`${imageServiceUrl}/internal/images/${pet.imageId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': getInternalServiceKey()
    },
    body: JSON.stringify({
      petStatus: pet.status,
      petName: pet.name
    })
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`No fue posible actualizar el estado de la imagen: ${errorPayload}`);
  }
}

async function unlinkImage(imageId) {
  if (!imageId) {
    return;
  }

  const response = await fetch(`${imageServiceUrl}/internal/images/${imageId}/unlink`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': getInternalServiceKey()
    }
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`No fue posible desvincular la imagen: ${errorPayload}`);
  }
}

async function cleanupAdoptions(petId) {
  const response = await fetch(`${adoptionServiceUrl}/internal/adoptions/pets/${petId}/cleanup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-service-key': getInternalServiceKey()
    },
    body: JSON.stringify({
      decisionNote: 'La ficha de la mascota fue retirada y la solicitud quedo cerrada.'
    })
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`No fue posible cerrar las solicitudes pendientes: ${errorPayload}`);
  }
}

async function getOwnerProfile(userId) {
  const response = await fetch(`${userServiceUrl}/internal/users/${userId}`, {
    headers: {
      'x-internal-service-key': getInternalServiceKey()
    }
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`No fue posible consultar el propietario: ${errorPayload}`);
  }

  const data = await response.json();
  return data.item;
}

function ownerOrganizationName(profile) {
  return profile && (profile.organizationName || profile.name) ? profile.organizationName || profile.name : null;
}

async function enrichPets(items) {
  const ownerIds = [...new Set(items.map((pet) => pet.ownerId).filter(Boolean))];

  if (!ownerIds.length) {
    return items.map((pet) => formatPublicPet(pet));
  }

  const ownerEntries = await Promise.all(
    ownerIds.map(async (ownerId) => {
      try {
        const profile = await getOwnerProfile(ownerId);
        return [ownerId, profile];
      } catch (error) {
        return [ownerId, null];
      }
    })
  );

  const ownerMap = new Map(ownerEntries);

  return items.map((pet) => ({
    ...formatPublicPet(pet),
    ownerOrganizationName: ownerOrganizationName(ownerMap.get(pet.ownerId))
  }));
}

async function enrichPet(pet) {
  const [item] = await enrichPets([pet]);
  return item;
}

app.get('/health', (req, res) => {
  res.json({ service: 'pet-service', ok: true, time: nowIso() });
});

app.get('/pets/public', async (req, res) => {
  const items = await listPetsSql(`WHERE status = $1`, [PET_STATUSES.AVAILABLE]);

  try {
    const enrichedItems = await enrichPets(items);
    return res.json({
      items: enrichedItems.map((pet) => ({
        ...pet,
        imageUrl: pet.imageId ? `/api/images/public/${pet.imageId}/content` : null
      }))
    });
  } catch (error) {
    return res.json({
      items: items.map((pet) => ({
        ...formatPublicPet(pet),
        imageUrl: pet.imageId ? `/api/images/public/${pet.imageId}/content` : null
      }))
    });
  }
});

app.get('/pets', authenticate(), async (req, res) => {
  let items = [];

  if (req.user.role === ROLES.ADMIN) {
    items = await listPetsSql();
  } else if (req.user.role === ROLES.ORG) {
    items = await listPetsSql(`WHERE owner_id = $1`, [req.user.id]);
  } else {
    items = await listPetsSql(`WHERE status = $1`, [PET_STATUSES.AVAILABLE]);
  }

  try {
    const enrichedItems = await enrichPets(items);
    return res.json({ items: enrichedItems });
  } catch (error) {
    return res.json({ items: items.map(formatPublicPet) });
  }
});

app.get('/pets/:id', authenticate(), async (req, res) => {
  const pet = await findPet(req.params.id);

  if (!pet || !canViewPet(req.user, pet)) {
    return res.status(404).json({ message: 'La mascota solicitada no existe o no esta disponible para tu rol.' });
  }

  try {
    const enrichedPet = await enrichPet(pet);
    return res.json({ item: enrichedPet });
  } catch (error) {
    return res.json({ item: formatPublicPet(pet) });
  }
});

app.post('/pets', authenticate(), requireRoles(ROLES.ADMIN, ROLES.ORG), async (req, res) => {
  const validationError = validatePetInput(req.body || {});

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const result = await query(
    `
      INSERT INTO pets (
        id, owner_id, name, species, age, gender, description, status, image_id, city, created_at, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `,
    [
      generateId('pet'),
      req.user.id,
      String(req.body.name).trim(),
      String(req.body.species).trim(),
      String(req.body.age).trim(),
      String(req.body.gender).trim(),
      String(req.body.description).trim(),
      req.body.status,
      String(req.body.imageId).trim(),
      String(req.body.city || 'Sincelejo').trim(),
      nowIso(),
      null
    ]
  );

  const pet = mapPet(result.rows[0]);

  try {
    await syncImageLink(pet);
  } catch (error) {
    console.error(error.message);
  }

  try {
    const enrichedPet = await enrichPet(pet);
    return res.status(201).json({
      message: 'Mascota registrada exitosamente.',
      item: enrichedPet
    });
  } catch (error) {
    return res.status(201).json({
      message: 'Mascota registrada exitosamente.',
      item: formatPublicPet(pet)
    });
  }
});

app.patch('/pets/:id', authenticate(), requireRoles(ROLES.ADMIN, ROLES.ORG), async (req, res) => {
  const pet = await findPet(req.params.id);

  if (!pet) {
    return res.status(404).json({ message: 'La mascota que intentas actualizar no existe.' });
  }

  if (!canManagePet(req.user, pet)) {
    return res.status(403).json({ message: 'No tienes permiso para gestionar esta mascota.' });
  }

  const mergedPet = {
    ...pet,
    ...req.body
  };

  const validationError = validatePetInput(mergedPet, { requireImageId: Boolean(mergedPet.imageId) });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const result = await query(
    `
      UPDATE pets
      SET name = $2,
          species = $3,
          age = $4,
          gender = $5,
          description = $6,
          status = $7,
          city = $8,
          image_id = $9,
          updated_at = $10
      WHERE id = $1
      RETURNING *
    `,
    [
      pet.id,
      String(mergedPet.name).trim(),
      String(mergedPet.species).trim(),
      String(mergedPet.age).trim(),
      String(mergedPet.gender).trim(),
      String(mergedPet.description).trim(),
      mergedPet.status,
      String(mergedPet.city || pet.city || 'Sincelejo').trim(),
      mergedPet.imageId ? String(mergedPet.imageId).trim() : pet.imageId,
      nowIso()
    ]
  );

  const updatedPet = mapPet(result.rows[0]);

  try {
    await syncImageLink(updatedPet);
    await syncImageStatus(updatedPet);
  } catch (error) {
    console.error(error.message);
  }

  try {
    const enrichedPet = await enrichPet(updatedPet);
    return res.json({
      message: 'Mascota actualizada correctamente.',
      item: enrichedPet
    });
  } catch (error) {
    return res.json({
      message: 'Mascota actualizada correctamente.',
      item: formatPublicPet(updatedPet)
    });
  }
});

app.delete('/pets/:id', authenticate(), requireRoles(ROLES.ADMIN, ROLES.ORG), async (req, res) => {
  const pet = await findPet(req.params.id);

  if (!pet) {
    return res.status(404).json({ message: 'La mascota que intentas eliminar no existe.' });
  }

  if (!canManagePet(req.user, pet)) {
    return res.status(403).json({ message: 'No tienes permiso para eliminar esta mascota.' });
  }

  await query(`DELETE FROM pets WHERE id = $1`, [pet.id]);

  try {
    await Promise.all([cleanupAdoptions(pet.id), unlinkImage(pet.imageId)]);
  } catch (error) {
    console.error(error.message);
  }

  try {
    const enrichedPet = await enrichPet(pet);
    return res.json({
      message: 'La ficha de la mascota fue eliminada correctamente.',
      item: enrichedPet
    });
  } catch (error) {
    return res.json({
      message: 'La ficha de la mascota fue eliminada correctamente.',
      item: formatPublicPet(pet)
    });
  }
});

app.get('/internal/pets/:id', requireInternalService, async (req, res) => {
  const pet = await findPet(req.params.id);

  if (!pet) {
    return res.status(404).json({ message: 'Mascota no encontrada.' });
  }

  return res.json({ item: pet });
});

app.patch('/internal/pets/:id/status', requireInternalService, async (req, res) => {
  const pet = await findPet(req.params.id);

  if (!pet) {
    return res.status(404).json({ message: 'Mascota no encontrada.' });
  }

  if (!req.body.status || !Object.values(PET_STATUSES).includes(req.body.status)) {
    return res.status(400).json({ message: 'El nuevo estado de la mascota no es valido.' });
  }

  const result = await query(
    `
      UPDATE pets
      SET status = $2, updated_at = $3
      WHERE id = $1
      RETURNING *
    `,
    [pet.id, req.body.status, nowIso()]
  );

  const updatedPet = mapPet(result.rows[0]);

  try {
    await syncImageStatus(updatedPet);
  } catch (error) {
    console.error(error.message);
  }

  return res.json({ item: updatedPet });
});

initializeDatabase()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`Pet service escuchando en http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar pet-service', error);
    process.exit(1);
  });
