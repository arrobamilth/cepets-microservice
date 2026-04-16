const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('node:fs');
const path = require('node:path');
const {
  ROLES,
  PET_STATUSES,
  demoImages,
  demoPets,
  nowIso,
  generateId,
  authenticate,
  requireRoles,
  requireInternalService,
  ensureDir,
  initializeDatabase,
  query
} = require('../../../packages/shared/src');

const app = express();
const port = Number(process.env.IMAGE_SERVICE_PORT || process.env.PORT || 4104);
const uploadsDir = path.resolve(__dirname, '../uploads');

ensureDir(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadsDir),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || '') || '.bin';
    callback(null, `${generateId('upload')}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

function buildPlaceholderSvg(name, accent, species) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="560" viewBox="0 0 800 560" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="560" rx="48" fill="#fbf6ef"/>
  <circle cx="650" cy="120" r="88" fill="${accent}" fill-opacity="0.18"/>
  <circle cx="156" cy="120" r="52" fill="${accent}" fill-opacity="0.24"/>
  <circle cx="400" cy="286" r="140" fill="${accent}"/>
  <circle cx="338" cy="232" r="42" fill="#fbf6ef"/>
  <circle cx="462" cy="232" r="42" fill="#fbf6ef"/>
  <circle cx="368" cy="314" r="30" fill="#fbf6ef"/>
  <circle cx="432" cy="314" r="30" fill="#fbf6ef"/>
  <circle cx="336" cy="356" r="26" fill="#fbf6ef"/>
  <circle cx="464" cy="356" r="26" fill="#fbf6ef"/>
  <rect x="120" y="428" width="560" height="74" rx="24" fill="#111827"/>
  <text x="400" y="468" text-anchor="middle" fill="#fbf6ef" font-family="Trebuchet MS, sans-serif" font-size="34" font-weight="700">${name}</text>
  <text x="400" y="236" text-anchor="middle" fill="#0f172a" font-family="Trebuchet MS, sans-serif" font-size="22" font-weight="700">${species}</text>
</svg>`;
}

function ensureSeedImages() {
  const petIndex = new Map(demoPets.map((pet) => [pet.id, pet]));

  for (const image of demoImages) {
    const filePath = path.join(uploadsDir, image.fileName);

    if (fs.existsSync(filePath)) {
      continue;
    }

    const pet = petIndex.get(image.petId);
    fs.writeFileSync(
      filePath,
      buildPlaceholderSvg(image.petName, image.accent, pet ? pet.species : 'Mascota'),
      'utf8'
    );
  }
}

function mapImage(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    petId: row.pet_id,
    ownerId: row.owner_id,
    petName: row.pet_name,
    petStatus: row.pet_status,
    fileName: row.file_name,
    mimeType: row.mime_type,
    accent: row.accent,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toPublicImage(image) {
  return {
    ...image,
    contentUrl: `/api/images/${image.id}/content`
  };
}

async function findImage(imageId) {
  const result = await query(`SELECT * FROM images WHERE id = $1 LIMIT 1`, [imageId]);
  return mapImage(result.rows[0]);
}

function canAccessImage(user, image) {
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  if (user.role === ROLES.ORG) {
    return image.ownerId === user.id;
  }

  return image.petStatus === PET_STATUSES.AVAILABLE;
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ service: 'image-service', ok: true, time: nowIso() });
});

app.get('/images/public/:id/content', async (req, res) => {
  const image = await findImage(req.params.id);

  if (!image || image.petStatus !== PET_STATUSES.AVAILABLE) {
    return res.status(404).json({ message: 'La imagen solicitada no esta disponible publicamente.' });
  }

  const filePath = path.join(uploadsDir, image.fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'El archivo asociado a la imagen no existe.' });
  }

  res.type(image.mimeType || 'application/octet-stream');
  return res.sendFile(filePath);
});

app.get('/images', authenticate(), async (req, res) => {
  let result;

  if (req.user.role === ROLES.ADMIN) {
    result = await query(`SELECT * FROM images ORDER BY created_at DESC NULLS LAST, id ASC`);
  } else if (req.user.role === ROLES.ORG) {
    result = await query(
      `SELECT * FROM images WHERE owner_id = $1 ORDER BY created_at DESC NULLS LAST, id ASC`,
      [req.user.id]
    );
  } else {
    result = await query(
      `SELECT * FROM images WHERE pet_status = $1 ORDER BY created_at DESC NULLS LAST, id ASC`,
      [PET_STATUSES.AVAILABLE]
    );
  }

  const items = result.rows.map(mapImage).filter((image) => canAccessImage(req.user, image)).map(toPublicImage);
  res.json({ items });
});

app.get('/images/:id', authenticate(), async (req, res) => {
  const image = await findImage(req.params.id);

  if (!image || !canAccessImage(req.user, image)) {
    return res.status(404).json({ message: 'La imagen solicitada no esta disponible.' });
  }

  return res.json({ item: toPublicImage(image) });
});

app.get('/images/:id/content', authenticate(), async (req, res) => {
  const image = await findImage(req.params.id);

  if (!image || !canAccessImage(req.user, image)) {
    return res.status(404).json({ message: 'La imagen solicitada no esta disponible.' });
  }

  const filePath = path.join(uploadsDir, image.fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'El archivo asociado a la imagen no existe.' });
  }

  res.type(image.mimeType || 'application/octet-stream');
  return res.sendFile(filePath);
});

app.post('/images', authenticate(), requireRoles(ROLES.ADMIN, ROLES.ORG), upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Debes adjuntar un archivo de imagen.' });
  }

  const result = await query(
    `
      INSERT INTO images (
        id, pet_id, owner_id, pet_name, pet_status, file_name, mime_type, accent, created_at, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `,
    [
      generateId('img'),
      null,
      req.user.id,
      null,
      null,
      req.file.filename,
      req.file.mimetype,
      '#9c6644',
      nowIso(),
      null
    ]
  );

  return res.status(201).json({
    message: 'Imagen cargada correctamente.',
    item: toPublicImage(mapImage(result.rows[0]))
  });
});

app.post('/internal/images/:id/link', requireInternalService, async (req, res) => {
  const image = await findImage(req.params.id);

  if (!image) {
    return res.status(404).json({ message: 'La imagen que intentas vincular no existe.' });
  }

  const result = await query(
    `
      UPDATE images
      SET pet_id = $2,
          owner_id = $3,
          pet_name = $4,
          pet_status = $5,
          updated_at = $6
      WHERE id = $1
      RETURNING *
    `,
    [
      image.id,
      req.body.petId || image.petId,
      req.body.ownerId || image.ownerId,
      req.body.petName || image.petName,
      req.body.petStatus || image.petStatus,
      nowIso()
    ]
  );

  return res.json({ item: mapImage(result.rows[0]) });
});

app.patch('/internal/images/:id/status', requireInternalService, async (req, res) => {
  const image = await findImage(req.params.id);

  if (!image) {
    return res.status(404).json({ message: 'La imagen que intentas actualizar no existe.' });
  }

  const result = await query(
    `
      UPDATE images
      SET pet_status = $2,
          pet_name = $3,
          updated_at = $4
      WHERE id = $1
      RETURNING *
    `,
    [image.id, req.body.petStatus || image.petStatus, req.body.petName || image.petName, nowIso()]
  );

  return res.json({ item: mapImage(result.rows[0]) });
});

app.post('/internal/images/:id/unlink', requireInternalService, async (req, res) => {
  const image = await findImage(req.params.id);

  if (!image) {
    return res.status(404).json({ message: 'La imagen que intentas desvincular no existe.' });
  }

  const result = await query(
    `
      UPDATE images
      SET pet_id = NULL,
          pet_name = NULL,
          pet_status = NULL,
          updated_at = $2
      WHERE id = $1
      RETURNING *
    `,
    [image.id, nowIso()]
  );

  return res.json({ item: mapImage(result.rows[0]) });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: 'La carga de la imagen no fue valida.' });
  }

  return next(error);
});

ensureSeedImages();

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Image service escuchando en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar image-service', error);
    process.exit(1);
  });
