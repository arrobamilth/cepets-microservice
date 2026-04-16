const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} fallo: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

async function run() {
  const admin = await login('admin@cepets.local', 'Cepets2026!');
  const org = await login('org@cepets.local', 'Cepets2026!');
  const adoptante = await login('adoptante@cepets.local', 'Cepets2026!');

  const [users, adminPets, adoptantePets, orgRequests] = await Promise.all([
    request('/users', { headers: authHeader(admin.token) }),
    request('/pets', { headers: authHeader(admin.token) }),
    request('/pets', { headers: authHeader(adoptante.token) }),
    request('/adoptions', { headers: authHeader(org.token) })
  ]);

  if (!users.items || users.items.length < 3) {
    throw new Error('No se encontraron los usuarios semilla esperados.');
  }

  if (!adminPets.items || adminPets.items.length < 3) {
    throw new Error('El admin deberia visualizar todas las mascotas semilla.');
  }

  if (!adoptantePets.items.every((pet) => pet.status === 'AVAILABLE')) {
    throw new Error('El adoptante solo debe recibir mascotas disponibles.');
  }

  if (!orgRequests.items.every((adoption) => adoption.petOwnerId === 'usr_org_1')) {
    throw new Error('La organizacion solo debe revisar solicitudes sobre sus mascotas.');
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        checkedAt: new Date().toISOString(),
        users: users.items.length,
        adminPets: adminPets.items.length,
        adoptanteVisiblePets: adoptantePets.items.length,
        orgRequests: orgRequests.items.length
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
