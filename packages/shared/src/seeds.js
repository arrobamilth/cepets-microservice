const ROLES = {
  ADMIN: 'ADMIN',
  ORG: 'ORG',
  ADOPTANTE: 'ADOPTANTE'
};

const PET_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  PENDING: 'PENDING',
  ADOPTED: 'ADOPTED'
};

const ADOPTION_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};

const APPROVAL_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

const demoPassword = 'Cepets2026!';

const demoUsers = [
  {
    id: 'usr_admin_1',
    role: ROLES.ADMIN,
    approvalStatus: APPROVAL_STATUSES.APPROVED,
    name: 'Ana Hoyos',
    email: 'admin@cepets.local',
    organizationName: 'CEPETS Central',
    city: 'Sincelejo',
    phone: '3001112233',
    address: 'Oficina principal CEPETS'
  },
  {
    id: 'usr_org_1',
    role: ROLES.ORG,
    approvalStatus: APPROVAL_STATUSES.APPROVED,
    name: 'Fundacion Huellas del Caribe',
    email: 'org@cepets.local',
    organizationName: 'Fundacion Huellas del Caribe',
    city: 'Sincelejo',
    phone: '3002223344',
    address: 'Barrio La Selva, Sincelejo'
  },
  {
    id: 'usr_adopt_1',
    role: ROLES.ADOPTANTE,
    approvalStatus: APPROVAL_STATUSES.APPROVED,
    name: 'Chaira',
    email: 'adoptante@cepets.local',
    city: 'Sincelejo',
    phone: '3005556677',
    address: 'Mi casa'
  }
];

const demoImages = [
  {
    id: 'img_luna_1',
    petId: 'pet_luna_1',
    ownerId: 'usr_org_1',
    petName: 'Luna',
    petStatus: PET_STATUSES.AVAILABLE,
    fileName: 'luna.svg',
    mimeType: 'image/svg+xml',
    accent: '#ff9470',
    createdAt: '2026-04-01T10:00:00.000Z'
  },
  {
    id: 'img_milo_1',
    petId: 'pet_milo_1',
    ownerId: 'usr_org_1',
    petName: 'Milo',
    petStatus: PET_STATUSES.AVAILABLE,
    fileName: 'milo.svg',
    mimeType: 'image/svg+xml',
    accent: '#6d83f2',
    createdAt: '2026-04-02T10:00:00.000Z'
  },
  {
    id: 'img_nala_1',
    petId: 'pet_nala_1',
    ownerId: 'usr_org_1',
    petName: 'Nala',
    petStatus: PET_STATUSES.PENDING,
    fileName: 'nala.svg',
    mimeType: 'image/svg+xml',
    accent: '#4cb698',
    createdAt: '2026-04-03T10:00:00.000Z'
  }
];

const demoPets = [
  {
    id: 'pet_luna_1',
    ownerId: 'usr_org_1',
    name: 'Luna',
    species: 'Perro',
    age: '2 anos',
    gender: 'Hembra',
    description: 'Energica, carinosa y vacunada. Ideal para hogares activos.',
    status: PET_STATUSES.AVAILABLE,
    imageId: 'img_luna_1',
    city: 'Sincelejo',
    createdAt: '2026-04-01T10:00:00.000Z'
  },
  {
    id: 'pet_milo_1',
    ownerId: 'usr_org_1',
    name: 'Milo',
    species: 'Gato',
    age: '1 ano',
    gender: 'Macho',
    description: 'Tranquilo, sociable y acostumbrado a vivir en apartamento.',
    status: PET_STATUSES.AVAILABLE,
    imageId: 'img_milo_1',
    city: 'Sincelejo',
    createdAt: '2026-04-02T10:00:00.000Z'
  },
  {
    id: 'pet_nala_1',
    ownerId: 'usr_org_1',
    name: 'Nala',
    species: 'Perro',
    age: '4 anos',
    gender: 'Hembra',
    description: 'Muy noble, esterilizada y en evaluacion de adopcion responsable.',
    status: PET_STATUSES.PENDING,
    imageId: 'img_nala_1',
    city: 'Sincelejo',
    createdAt: '2026-04-03T10:00:00.000Z'
  }
];

const demoAdoptions = [
  {
    id: 'adp_nala_1',
    petId: 'pet_nala_1',
    petName: 'Nala',
    petOwnerId: 'usr_org_1',
    applicantUserId: 'usr_adopt_1',
    applicantName: 'Chaira',
    phone: '3005556677',
    email: 'adoptante@cepets.local',
    address: 'Mi casa',
    housing: 'Casa con patio cerrado',
    tenure: 'Vivo en arriendo con autorizacion para tener mascotas',
    availability: 'Trabajo remoto y tengo acompanamiento familiar',
    status: ADOPTION_STATUSES.PENDING,
    createdAt: '2026-04-10T14:30:00.000Z',
    reviewedAt: null,
    reviewedBy: null,
    decisionNote: ''
  }
];

module.exports = {
  ROLES,
  PET_STATUSES,
  ADOPTION_STATUSES,
  APPROVAL_STATUSES,
  demoPassword,
  demoUsers,
  demoImages,
  demoPets,
  demoAdoptions
};
