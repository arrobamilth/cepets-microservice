const API_BASE = window.__CEPETS_API__ || 'http://localhost:4000/api';
const TOKEN_KEY = 'cepets-token';
const LOGO_PATH = '/logo-cepets.png';

const roleLabels = {
  ADMIN: 'Administrador',
  ORG: 'Organizacion',
  ADOPTANTE: 'Adoptante'
};

const statusLabels = {
  AVAILABLE: 'Disponible',
  PENDING: 'Pendiente',
  ADOPTED: 'Adoptada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  APPROVED: 'Aprobada'
};

const demoAccounts = {
  ADMIN: { email: 'admin@cepets.local', password: 'Cepets2026!' },
  ORG: { email: 'org@cepets.local', password: 'Cepets2026!' },
  ADOPTANTE: { email: 'adoptante@cepets.local', password: 'Cepets2026!' }
};

const faqItems = [
  {
    question: 'De donde provienen las mascotas?',
    answer:
      'Trabajamos con organizaciones, rescatistas y perfiles verificados que publican animales listos para una adopcion responsable.'
  },
  {
    question: 'Cuanto tarda el proceso de adopcion?',
    answer:
      'Depende de la revision del formulario, pero CEPETS centraliza el seguimiento para que el proceso sea mas claro y rapido.'
  },
  {
    question: 'Tiene algun costo adoptar?',
    answer:
      'CEPETS no cobra por navegar ni por enviar solicitudes. Algunas organizaciones pueden pedir validaciones veterinarias o logisticas especificas.'
  },
  {
    question: 'Puedo adoptar si vivo en apartamento?',
    answer:
      'Si, siempre que la vivienda sea adecuada para la mascota y puedas garantizar cuidado, tiempo y seguridad.'
  }
];

const adoptionRequirements = [
  'Ser mayor de 18 anos.',
  'Tener estabilidad de vivienda, propia o arrendada.',
  'Comprometerte con controles veterinarios y alimentacion adecuada.',
  'Dedicar tiempo de calidad y acompanamiento.',
  'No tener restricciones activas para convivir con mascotas.'
];

const processSteps = [
  {
    id: 'explore',
    number: '01',
    title: 'Explora',
    copy: 'Navega por nuestro catalogo de mascotas y filtra por especie para encontrar una conexion real.'
  },
  {
    id: 'apply',
    number: '02',
    title: 'Solicita',
    copy: 'Completa el formulario de adopcion con datos claros sobre tu hogar y tu disponibilidad.'
  },
  {
    id: 'adopt',
    number: '03',
    title: 'Adopta',
    copy: 'Una organizacion revisa tu solicitud y coordina contigo la entrega responsable de la mascota.'
  }
];

const state = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  authUser: null,
  profile: null,
  pets: [],
  images: [],
  adoptions: [],
  pendingOrganizations: [],
  guestPets: [],
  guestFilter: 'ALL',
  guestCarouselIndex: 0,
  activeView: 'catalog',
  selectedPetId: null,
  authModalView: null,
  registrationResult: null,
  openFaqIndex: 0,
  notice: null,
  loading: true
};

const app = document.getElementById('app');
let carouselTimer = null;

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setNotice(type, text) {
  state.notice = type === 'error' ? { type, text } : null;
}

function clearNotice() {
  state.notice = null;
}

function resetSession() {
  state.token = '';
  state.authUser = null;
  state.profile = null;
  state.pets = [];
  state.images = [];
  state.adoptions = [];
  state.pendingOrganizations = [];
  state.activeView = 'catalog';
  state.selectedPetId = null;
  localStorage.removeItem(TOKEN_KEY);
}

function prettyRole(role) {
  return roleLabels[role] || role || '';
}

function prettyStatus(status) {
  return statusLabels[status] || status || '';
}

function statusClass(status) {
  return String(status || '').toLowerCase();
}

function isAdmin() {
  return Boolean(state.authUser && state.authUser.role === 'ADMIN');
}

function isOrg() {
  return Boolean(state.authUser && state.authUser.role === 'ORG');
}

function isAdoptante() {
  return Boolean(state.authUser && state.authUser.role === 'ADOPTANTE');
}

function defaultView() {
  return isAdoptante() ? 'catalog' : 'manage';
}

function viewsForRole() {
  if (!state.authUser) {
    return [];
  }

  if (isAdoptante()) {
    return [
      { id: 'catalog', label: 'Mascotas' },
      { id: 'requests', label: 'Solicitudes' },
      { id: 'profile', label: 'Perfil' }
    ];
  }

  return [
    { id: 'manage', label: 'Gestion' },
    { id: 'catalog', label: 'Mascotas' },
    { id: 'requests', label: 'Solicitudes' },
    { id: 'images', label: 'Imagenes' },
    { id: 'profile', label: 'Perfil' }
  ];
}

function buildHeaders(extra = {}) {
  return {
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...extra
  };
}

async function api(path, { method = 'GET', body, formData, headers = {} } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: formData ? buildHeaders(headers) : buildHeaders({ 'Content-Type': 'application/json', ...headers }),
    body: formData ? formData : body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let payload = {};

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Ocurrio un error inesperado.');
  }

  return payload;
}

function buildImageSrc(imageId, { publicView = false } = {}) {
  if (!imageId) {
    return '';
  }

  if (publicView) {
    return `${API_BASE}/images/public/${imageId}/content`;
  }

  return state.token ? `${API_BASE}/images/${imageId}/content?token=${encodeURIComponent(state.token)}` : '';
}

function formDataToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  try {
    return new Date(value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return value;
  }
}

function currentPet() {
  return state.pets.find((pet) => pet.id === state.selectedPetId) || null;
}

function currentAdoptionPet() {
  return isAdoptante() ? currentPet() : null;
}

function editablePet() {
  return !isAdoptante() ? currentPet() : null;
}

function availableImageOptions() {
  return state.images;
}

function renderNotice() {
  return state.notice ? `<div class="notice ${escapeHtml(state.notice.type)}">${escapeHtml(state.notice.text)}</div>` : '';
}

function renderEmpty(message) {
  return `<div class="empty-state"><p>${escapeHtml(message)}</p></div>`;
}

function renderLogo() {
  return `
    <span class="logo-mark" aria-hidden="true">
      <img class="logo-image" src="${LOGO_PATH}" alt="Logo de CEPETS" />
    </span>
  `;
}

function renderStepIcon(kind) {
  const icons = {
    explore:
      '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="10" fill="#5cc6f2" stroke="#5a426b" stroke-width="3"/><path d="M27 27l10 10" stroke="#7c5295" stroke-width="5" stroke-linecap="round"/></svg>',
    apply:
      '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="8" width="24" height="32" rx="4" fill="#f5d7c1" stroke="#c98f5c" stroke-width="3"/><rect x="18" y="4" width="8" height="8" rx="2" fill="#9a6e4f"/><path d="M16 18h12M16 24h12M16 30h8" stroke="#5a426b" stroke-width="3" stroke-linecap="round"/></svg>',
    adopt:
      '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M8 22l16-14 16 14" fill="none" stroke="#ef6b45" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 20v18h24V20" fill="#f2dfb6" stroke="#cda15d" stroke-width="3"/><rect x="20" y="25" width="8" height="13" fill="#4c8b80"/><rect x="14" y="24" width="4" height="6" fill="#75b6f4"/><rect x="30" y="24" width="4" height="6" fill="#75b6f4"/><path d="M8 40h32" stroke="#2f8a56" stroke-width="4" stroke-linecap="round"/></svg>'
  };

  return icons[kind] || icons.explore;
}

function guestMetrics() {
  const dogCount = state.guestPets.filter((pet) => String(pet.species || '').toLowerCase().includes('perro')).length;
  const catCount = state.guestPets.filter((pet) => String(pet.species || '').toLowerCase().includes('gato')).length;
  const otherCount = Math.max(state.guestPets.length - dogCount - catCount, 0);

  return [
    ['Mascotas disponibles', state.guestPets.length],
    ['Perros esperando hogar', dogCount],
    ['Gatos y otras mascotas', catCount + otherCount]
  ];
}

function filteredGuestPets() {
  if (state.guestFilter === 'ALL') {
    return state.guestPets;
  }

  return state.guestPets.filter((pet) => {
    const species = String(pet.species || '').toLowerCase();

    if (state.guestFilter === 'DOG') {
      return species.includes('perro');
    }

    if (state.guestFilter === 'CAT') {
      return species.includes('gato');
    }

    return !species.includes('perro') && !species.includes('gato');
  });
}

function featuredGuestPet() {
  if (!state.guestPets.length) {
    return null;
  }

  return state.guestPets[state.guestCarouselIndex % state.guestPets.length];
}

function dashboardMetrics() {
  const visiblePets = state.pets.length;
  const availablePets = state.pets.filter((pet) => pet.status === 'AVAILABLE').length;
  const pendingRequests = state.adoptions.filter((adoption) => adoption.status === 'PENDING').length;

  const metrics = [
    ['Mascotas visibles', visiblePets],
    ['Disponibles', availablePets],
    ['Solicitudes', state.adoptions.length]
  ];

  if (isAdmin()) {
    metrics.push(['Organizaciones pendientes', state.pendingOrganizations.length]);
  } else if (isOrg()) {
    metrics.push(['Imagenes cargadas', state.images.length]);
  } else {
    metrics.push(['Pendientes por respuesta', pendingRequests]);
  }

  return metrics;
}

function renderLoading() {
  return `
    <div class="public-page">
      <header class="public-header">
        <div class="brand-link static-brand">
          ${renderLogo()}
          <span class="brand-word">CEPETS</span>
        </div>
      </header>
      <main class="page-inner">
        <section class="landing-section">
          <div class="empty-state">
            <h2 class="section-title small">Cargando CEPETS</h2>
            <p>Estamos preparando la experiencia para ti.</p>
          </div>
        </section>
      </main>
    </div>
  `;
}

function renderPublicHeader() {
  return `
    <header class="public-header">
      <button class="brand-link" type="button" data-scroll-target="inicio">
        ${renderLogo()}
        <span class="brand-word">CEPETS</span>
      </button>
      <nav class="public-nav" aria-label="Principal">
        <button class="nav-link active" type="button" data-scroll-target="inicio">Inicio</button>
        <button class="nav-link" type="button" data-scroll-target="mascotas">Mascotas</button>
        <button class="nav-link" type="button" data-scroll-target="como-funciona">¿Como funciona?</button>
      </nav>
      <div class="header-actions">
        <button class="button-secondary" type="button" data-auth-open="login">Iniciar sesion</button>
        <button class="button-primary" type="button" data-auth-open="register">Registrarse</button>
      </div>
    </header>
  `;
}

function renderHeroSection() {
  const pet = featuredGuestPet();

  return `
    <section class="hero-section" id="inicio">
      <div class="hero-grid">
        <article class="hero-copy">
          <span class="eyebrow"></span>
          <h1 class="hero-title">Encuentra a tu <em>alma gemela</em> peluda</h1>
          <p class="hero-subtitle">
            Conectamos personas con mascotas que buscan un hogar lleno de amor. Rapido, claro y construido para una adopcion transparente.
          </p>
          <div class="hero-actions">
            <button class="button-primary large" type="button" data-scroll-target="mascotas">Ver mascotas disponibles</button>
            <button class="button-link" type="button" data-scroll-target="como-funciona">¿Como funciona?</button>
          </div>
        </article>
        <aside class="hero-showcase">
          <div class="hero-glow hero-glow-left"></div>
          <div class="hero-glow hero-glow-right"></div>
          <div class="hero-card">
            ${
              pet
                ? `
                  <div class="hero-card-media">
                    <img src="${escapeHtml(buildImageSrc(pet.imageId, { publicView: true }))}" alt="Mascota ${escapeHtml(pet.name)}" />
                  </div>
                  <div class="hero-card-copy">
                    <span class="soft-pill ${escapeHtml(statusClass(pet.status))}">${escapeHtml(prettyStatus(pet.status))}</span>
                    <h3>${escapeHtml(pet.name)}</h3>
                    <p>${escapeHtml(pet.description)}</p>
                  </div>
                  <div class="hero-dots">
                    ${state.guestPets
                      .map(
                        (_, index) => `
                          <button class="hero-dot ${index === state.guestCarouselIndex ? 'active' : ''}" type="button" data-carousel-index="${index}" aria-label="Ver mascota ${index + 1}"></button>
                        `
                      )
                      .join('')}
                  </div>
                `
                : `
                  <div class="hero-placeholder">
                    ${renderLogo()}
                    <p>Pronto veras aqui las mascotas disponibles para adopcion.</p>
                  </div>
                `
            }
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderStatsBand() {
  return `
    <section class="stats-band">
      <div class="stats-grid">
        ${guestMetrics()
          .map(
            ([label, value]) => `
              <article class="stat-card">
                <strong>${escapeHtml(value)}</strong>
                <span>${escapeHtml(label)}</span>
              </article>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderGuestPetCard(pet) {
  return `
    <article class="pet-card">
      <div class="pet-card-media">
        <img src="${escapeHtml(buildImageSrc(pet.imageId, { publicView: true }))}" alt="Mascota ${escapeHtml(pet.name)}" />
      </div>
      <div class="pet-card-body">
        <div class="pet-meta">
          <span class="soft-pill ${escapeHtml(statusClass(pet.status))}">${escapeHtml(prettyStatus(pet.status))}</span>
          <span class="chip">${escapeHtml(pet.species)}</span>
          <span class="chip">${escapeHtml(pet.age)}</span>
        </div>
        <div>
          <h3>${escapeHtml(pet.name)}</h3>
          <p><strong>Organizacion:</strong> ${escapeHtml(pet.ownerOrganizationName || 'No especificada')}</p>
          <p>${escapeHtml(pet.description)}</p>
        </div>
        <div class="card-actions">
          <button class="button-secondary compact" type="button" data-auth-open="login">Conocer mas</button>
        </div>
      </div>
    </article>
  `;
}

function renderPetsSection() {
  const items = filteredGuestPets();

  return `
    <section class="landing-section" id="mascotas">
      <div class="section-head">
        <h2 class="section-title">Mascotas disponibles</h2>
        <p class="section-copy">Cada una espera pacientemente por ti.</p>
      </div>
      <div class="filter-row">
        <button class="filter-chip ${state.guestFilter === 'ALL' ? 'active' : ''}" type="button" data-filter="ALL">Todos</button>
        <button class="filter-chip ${state.guestFilter === 'DOG' ? 'active' : ''}" type="button" data-filter="DOG">Perros</button>
        <button class="filter-chip ${state.guestFilter === 'CAT' ? 'active' : ''}" type="button" data-filter="CAT">Gatos</button>
        <button class="filter-chip ${state.guestFilter === 'OTHER' ? 'active' : ''}" type="button" data-filter="OTHER">Otros</button>
      </div>
      <div class="pet-grid">
        ${items.length ? items.slice(0, 3).map(renderGuestPetCard).join('') : renderEmpty('No hay mascotas para este filtro.')}
      </div>
      <div class="section-cta">
        <button class="button-secondary wide" type="button" data-auth-open="login">Ver todas las mascotas</button>
      </div>
    </section>
  `;
}

function renderStepsSection() {
  return `
    <section class="landing-section" id="como-funciona">
      <div class="section-head">
        <h2 class="section-title">¿Como funciona?</h2>
        <p class="section-copy">Tres pasos hacia tu nuevo mejor amigo.</p>
      </div>
      <div class="process-grid">
        ${processSteps
          .map(
            (step) => `
              <article class="process-card">
                <span class="process-index">${step.number}</span>
                <div class="process-icon">${renderStepIcon(step.id)}</div>
                <h3>${escapeHtml(step.title)}</h3>
                <p>${escapeHtml(step.copy)}</p>
              </article>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderRequirementsSection() {
  return `
    <section class="requirements-section" id="requisitos">
      <div class="requirements-grid">
        <article>
          <h2 class="section-title inverse">Requisitos para adoptar</h2>
          <p class="section-copy inverse">
            Queremos asegurar el bienestar de cada mascota. Por eso te pedimos cumplir con estos requisitos basicos:
          </p>
          <ul class="requirements-list">
            ${adoptionRequirements
              .map(
                (item) => `
                  <li class="requirement-item">
                    <span class="requirement-check">&#10003;</span>
                    <span>${escapeHtml(item)}</span>
                  </li>
                `
              )
              .join('')}
          </ul>
          <button class="button-primary large" type="button" data-auth-open="register">Comenzar mi adopcion</button>
        </article>
        <aside class="quote-card">
          <div class="quote-logo">${renderLogo()}</div>
          <p>Cada mascota merece un hogar lleno de amor.</p>
        </aside>
      </div>
    </section>
  `;
}

function renderFaqSection() {
  return `
    <section class="landing-section faq-section" id="faq">
      <div class="section-head">
        <h2 class="section-title">Preguntas frecuentes</h2>
      </div>
      <div class="faq-list">
        ${faqItems
          .map(
            (item, index) => `
              <article class="faq-item ${state.openFaqIndex === index ? 'open' : ''}">
                <button class="faq-question" type="button" data-faq-index="${index}">
                  <span>${escapeHtml(item.question)}</span>
                  <span class="faq-plus">${state.openFaqIndex === index ? '-' : '+'}</span>
                </button>
                ${state.openFaqIndex === index ? `<div class="faq-answer"><p>${escapeHtml(item.answer)}</p></div>` : ''}
              </article>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="public-footer">
      <div class="footer-brand">
        ${renderLogo()}
        <strong>CEPETS</strong>
      </div>
      <p>Plataforma de adopcion responsable construida para conectar hogares con segundas oportunidades.</p>
      <br>
        <p> © chai[dev]</p>
    </footer>
  `;
}

function renderLoginPanel() {
  return `
    <div class="auth-panel-copy">
      <span class="eyebrow">Acceso seguro</span>
      <h2 class="modal-title">Iniciar sesion</h2>
      <p class="modal-copy">Ingresa con tus credenciales o usa una cuenta demo para recorrer el flujo completo.</p>
    </div>
    <form id="login-form" class="form-stack auth-form">
      <div class="field">
        <label for="email">Correo</label>
        <input id="email" name="email" type="email" placeholder="usuario@correo.com" required />
      </div>
      <div class="field">
        <label for="password">Contrasena</label>
        <input id="password" name="password" type="password" placeholder="ingresa tu contraseña" required />
      </div>
      <button class="button-primary" type="submit">Entrar a CEPETS</button>
    </form>
    <div class="demo-login-grid">
      <button class="demo-account" type="button" data-demo-login="ADMIN">
        <strong>Administrador</strong>
        <span>Gestiona la plataforma y aprueba organizaciones.</span>
      </button>
      <button class="demo-account" type="button" data-demo-login="ORG">
        <strong>Organizacion</strong>
        <span>Publica mascotas y revisa solicitudes propias.</span>
      </button>
      <button class="demo-account" type="button" data-demo-login="ADOPTANTE">
        <strong>Adoptante</strong>
        <span>Explora mascotas y envia formularios.</span>
      </button>
    </div>
    <div class="auth-footer-row">
      <span class="tiny-note">Aun no tienes cuenta?</span>
      <button class="button-link" type="button" data-auth-switch="register">Registrarse</button>
    </div>
  `;
}

function renderRegisterPanel() {
  return `
    <div class="auth-panel-copy">
      <span class="eyebrow">Registro guiado</span>
      <h2 class="modal-title">Registrarse</h2>
      <p class="modal-copy">
        Crea tu cuenta como adoptante o registra tu organizacion. Las organizaciones quedaran pendientes de aprobacion administrativa.
      </p>
    </div>
    <form id="register-form" class="form-stack auth-form">
      <div class="split-fields">
        <div class="field">
          <label for="register-name">Nombre</label>
          <input id="register-name" name="name" required />
        </div>
        <div class="field">
          <label for="register-role">Tipo de cuenta</label>
          <select id="register-role" name="role">
            <option value="ADOPTANTE">Adoptante</option>
            <option value="ORG">Organizacion</option>
          </select>
        </div>
      </div>
      <div class="split-fields">
        <div class="field">
          <label for="register-email">Correo</label>
          <input id="register-email" name="email" type="email" required />
        </div>
        <div class="field">
          <label for="register-password">Contrasena</label>
          <input id="register-password" name="password" type="password" minlength="8" required />
        </div>
      </div>
      <div class="split-fields">
        <div class="field">
          <label for="register-phone">Telefono</label>
          <input id="register-phone" name="phone" required />
        </div>
        <div class="field">
          <label for="register-city">Ciudad</label>
          <input id="register-city" name="city" value="Sincelejo" required />
        </div>
      </div>
      <div class="field">
        <label for="register-address">Direccion</label>
        <textarea id="register-address" name="address" required></textarea>
      </div>
      <div class="field">
        <label for="register-organization">Nombre de la organizacion</label>
        <input id="register-organization" name="organizationName" placeholder="Solo obligatorio si eliges organizacion" />
      </div>
      <button class="button-primary" type="submit">Crear cuenta</button>
    </form>
    <div class="auth-footer-row">
      <span class="tiny-note">Si tu cuenta es una organizacion, un admin debe aprobarla antes del acceso.</span>
      <button class="button-link" type="button" data-auth-switch="login">Iniciar sesion</button>
    </div>
  `;
}

function renderRegisterSuccessPanel() {
  const result = state.registrationResult || {};
  const isPendingOrg = Boolean(result.pendingApproval);

  return `
    <div class="auth-panel-copy">
      <span class="eyebrow">Registro recibido</span>
      <h2 class="modal-title">${isPendingOrg ? 'Organizacion pendiente de aprobacion' : 'Cuenta creada correctamente'}</h2>
      <p class="modal-copy">
        ${
          isPendingOrg
            ? 'Tu organizacion ya fue registrada. Un administrador debe aprobarla antes de que puedas iniciar sesion.'
            : 'Tu cuenta ya esta lista. Puedes iniciar sesion y continuar con el proceso de adopcion.'
        }
      </p>
    </div>
    <div class="auth-benefits">
      <article>
        <strong>${escapeHtml(result.user && result.user.email ? result.user.email : '')}</strong>
        <p>${isPendingOrg ? 'Tu acceso quedo en estado pendiente.' : 'El acceso se habilito de inmediato.'}</p>
      </article>
      <article>
        <strong>${escapeHtml(prettyRole(result.user && result.user.role))}</strong>
        <p>${isPendingOrg ? 'Te faltara la aprobacion administrativa.' : 'Ya puedes comenzar a explorar mascotas.'}</p>
      </article>
    </div>
    <div class="auth-footer-row">
      <button class="button-primary compact" type="button" data-auth-switch="login">Ir a iniciar sesion</button>
      <button class="button-link" type="button" data-action="close-auth">Cerrar</button>
    </div>
  `;
}

function renderAuthModal() {
  if (!state.authModalView) {
    return '';
  }

  const modalBody =
    state.authModalView === 'login'
      ? renderLoginPanel()
      : state.authModalView === 'register-success'
        ? renderRegisterSuccessPanel()
        : renderRegisterPanel();

  return `
    <div class="modal">
      <div class="modal-card auth-card">
        <div class="modal-header">
          <div class="brand-link static-brand">
            ${renderLogo()}
            <span class="brand-word">CEPETS</span>
          </div>
          <button class="button-secondary compact" type="button" data-action="close-auth">Cerrar</button>
        </div>
        ${renderNotice()}
        ${modalBody}
      </div>
    </div>
  `;
}

function renderGuest() {
  return `
    <div class="public-page">
      ${renderPublicHeader()}
      <main>
        <div class="page-inner">
          ${state.authModalView ? '' : renderNotice()}
          ${renderHeroSection()}
        </div>
        ${renderStatsBand()}
        <div class="page-inner">
          ${renderPetsSection()}
          ${renderStepsSection()}
        </div>
        ${renderRequirementsSection()}
        <div class="page-inner">
          ${renderFaqSection()}
        </div>
      </main>
      ${renderFooter()}
      ${renderAuthModal()}
    </div>
  `;
}

function renderAppHeader() {
  const displayName = state.profile && state.profile.name ? state.profile.name : state.authUser.name;

  return `
    <header class="public-header app-header">
      <div class="brand-link static-brand">
        ${renderLogo()}
        <span class="brand-word">CEPETS</span>
      </div>
      <nav class="app-tabs" aria-label="Aplicacion">
        ${viewsForRole()
          .map(
            (view) => `
              <button class="app-tab ${state.activeView === view.id ? 'active' : ''}" type="button" data-view="${view.id}">
                ${escapeHtml(view.label)}
              </button>
            `
          )
          .join('')}
      </nav>
      <div class="header-actions">
        <span class="user-chip">${escapeHtml(displayName)} · ${escapeHtml(prettyRole(state.authUser.role))}</span>
        <button class="button-secondary compact" type="button" data-action="logout">Cerrar sesion</button>
      </div>
    </header>
  `;
}

function renderDashboardHero() {
  const lines = {
    ADMIN: {
      eyebrow: 'Panel central',
      title: 'Administra adopciones y organizaciones',
      copy: 'Aprueba nuevas organizaciones, revisa solicitudes y mantien el catalogo visible para las familias interesadas.',
      note: 'Tu vista prioriza aprobaciones pendientes y salud operativa de la plataforma.'
    },
    ORG: {
      eyebrow: 'Gestion para organizaciones',
      title: 'Publica mascotas y responde solicitudes',
      copy: 'Mantiene tu catalogo actualizado, sube imagenes y revisa cada solicitud recibida desde un mismo lugar.',
      note: 'Solo veras las mascotas, imagenes y solicitudes que pertenecen a tu organizacion.'
    },
    ADOPTANTE: {
      eyebrow: 'Tu experiencia de adopcion',
      title: 'Explora mascotas y sigue tus solicitudes',
      copy: 'Descubre companeros disponibles, envia formularios completos y consulta el estado de cada proceso.',
      note: 'Tus solicitudes y perfil se sincronizan para agilizar futuras adopciones.'
    }
  };

  const copy = lines[state.authUser.role] || lines.ADOPTANTE;

  return `
    <section class="app-hero">
      <article class="app-hero-copy">
        <span class="eyebrow">${escapeHtml(copy.eyebrow)}</span>
        <h1 class="section-title small">${escapeHtml(copy.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(copy.copy)}</p>
      </article>
      <aside class="app-hero-note">
        <strong>${escapeHtml(prettyRole(state.authUser.role))}</strong>
        <p>${escapeHtml(copy.note)}</p>
      </aside>
    </section>
  `;
}

function renderMetricsGrid() {
  return `
    <section class="metrics-grid">
      ${dashboardMetrics()
        .map(
          ([label, value]) => `
            <article class="metric-card">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(value)}</strong>
              <p>Resumen actualizado de tu espacio de trabajo.</p>
            </article>
          `
        )
        .join('')}
    </section>
  `;
}

function renderDashboardPetCard(pet) {
  const canManage = isAdmin() || (isOrg() && pet.ownerId === state.authUser.id);
  const canAdopt = isAdoptante() && pet.status === 'AVAILABLE';

  return `
    <article class="pet-card">
      <div class="pet-card-media">
        <img src="${escapeHtml(buildImageSrc(pet.imageId))}" alt="Mascota ${escapeHtml(pet.name)}" />
      </div>
      <div class="pet-card-body">
        <div class="pet-meta">
          <span class="soft-pill ${escapeHtml(statusClass(pet.status))}">${escapeHtml(prettyStatus(pet.status))}</span>
          <span class="chip">${escapeHtml(pet.species)}</span>
          <span class="chip">${escapeHtml(pet.age)}</span>
          <span class="chip">${escapeHtml(pet.city || 'Sin ciudad')}</span>
        </div>
        <div>
          <h3>${escapeHtml(pet.name)}</h3>
          <p><strong>Organizacion:</strong> ${escapeHtml(pet.ownerOrganizationName || 'No especificada')}</p>
          <p>${escapeHtml(pet.description)}</p>
        </div>
        <div class="card-actions">
          ${canAdopt ? `<button class="button-primary compact" type="button" data-open-adoption="${pet.id}">Solicitar adopcion</button>` : ''}
          ${canManage ? `<button class="button-secondary compact" type="button" data-edit-pet="${pet.id}">Editar ficha</button>` : ''}
          ${canManage ? `<button class="button-secondary compact" type="button" data-delete-pet="${pet.id}">Eliminar</button>` : ''}
        </div>
      </div>
    </article>
  `;
}

function renderCatalogView() {
  return `
    <section class="app-section">
      <div class="section-head left">
        <h2 class="section-title small">Catalogo</h2>
        <p class="section-copy">Aqui encuentras las mascotas disponibles segun tu rol.</p>
      </div>
      <div class="pet-grid">
        ${state.pets.length ? state.pets.map(renderDashboardPetCard).join('') : renderEmpty('No hay mascotas disponibles en este momento.')}
      </div>
    </section>
  `;
}

function renderImageOptions(selectedId) {
  const options = availableImageOptions();

  return `
    <option value="">Selecciona una imagen</option>
    ${options
      .map(
        (image) => `
          <option value="${escapeHtml(image.id)}" ${selectedId === image.id ? 'selected' : ''}>
            ${escapeHtml(image.petName || image.id)}
          </option>
        `
      )
      .join('')}
  `;
}

function renderImageGalleryCard(image) {
  return `
    <article class="gallery-card">
      <img src="${escapeHtml(buildImageSrc(image.id))}" alt="Imagen ${escapeHtml(image.petName || image.id)}" />
      <div class="gallery-card-body">
        <h3>${escapeHtml(image.petName || 'Imagen sin vincular')}</h3>
        <p>${escapeHtml(prettyStatus(image.petStatus || 'PENDING'))}</p>
      </div>
    </article>
  `;
}

function renderPendingOrganizationCard(user) {
  return `
    <article class="request-card">
      <div class="request-head">
        <div>
          <h3>${escapeHtml(user.organizationName || user.name)}</h3>
          <p>${escapeHtml(user.email)}</p>
        </div>
        <span class="soft-pill pending">${escapeHtml(prettyStatus(user.approvalStatus))}</span>
      </div>
      <div class="info-grid compact">
        <article>
          <strong>Responsable</strong>
          <span>${escapeHtml(user.name)}</span>
        </article>
        <article>
          <strong>Telefono</strong>
          <span>${escapeHtml(user.phone || 'Sin telefono')}</span>
        </article>
        <article>
          <strong>Ciudad</strong>
          <span>${escapeHtml(user.city || 'Sin ciudad')}</span>
        </article>
      </div>
      <p>${escapeHtml(user.address || 'Sin direccion registrada')}</p>
      <div class="button-row">
        <button class="button-primary compact" type="button" data-organization-approval="${user.id}" data-approval-status="APPROVED">Aprobar</button>
        <button class="button-secondary compact" type="button" data-organization-approval="${user.id}" data-approval-status="REJECTED">Rechazar</button>
      </div>
    </article>
  `;
}

function renderManageView() {
  if (isAdoptante()) {
    return `
      <section class="app-section">
        <div class="section-head left">
          <h2 class="section-title small">Gestion</h2>
          <p class="section-copy">Esta vista esta reservada para administradores y organizaciones.</p>
        </div>
        ${renderEmpty('Tu cuenta de adoptante no necesita herramientas de gestion.')}
      </section>
    `;
  }

  const pet = editablePet();

  return `
    <section class="app-section">
      <div class="section-head left">
        <h2 class="section-title small">Gestion de mascotas</h2>
        <p class="section-copy">Registra nuevas mascotas, actualiza fichas existentes y carga las imagenes necesarias.</p>
      </div>
      <div class="management-grid">
        <article class="panel">
          <div class="request-head">
            <div>
              <h3>${pet ? 'Editar mascota' : 'Registrar mascota'}</h3>
              <p>${pet ? 'Actualiza la informacion visible del catalogo.' : 'Completa la ficha para publicar una nueva mascota.'}</p>
            </div>
            ${pet ? `<button class="button-secondary compact" type="button" data-action="new-pet">Nueva ficha</button>` : ''}
          </div>
          <form id="pet-form" class="form-stack">
            <input type="hidden" name="petId" value="${escapeHtml(pet ? pet.id : '')}" />
            <div class="split-fields">
              <div class="field">
                <label for="pet-name">Nombre</label>
                <input id="pet-name" name="name" value="${escapeHtml(pet ? pet.name : '')}" required />
              </div>
              <div class="field">
                <label for="pet-species">Especie</label>
                <input id="pet-species" name="species" value="${escapeHtml(pet ? pet.species : '')}" placeholder="Perro, Gato..." required />
              </div>
            </div>
            <div class="split-fields">
              <div class="field">
                <label for="pet-age">Edad</label>
                <input id="pet-age" name="age" value="${escapeHtml(pet ? pet.age : '')}" placeholder="2 anos" required />
              </div>
              <div class="field">
                <label for="pet-gender">Genero</label>
                <input id="pet-gender" name="gender" value="${escapeHtml(pet ? pet.gender : '')}" placeholder="Hembra o Macho" required />
              </div>
            </div>
            <div class="split-fields">
              <div class="field">
                <label for="pet-city">Ciudad</label>
                <input id="pet-city" name="city" value="${escapeHtml(pet ? pet.city : state.profile && state.profile.city ? state.profile.city : 'Sincelejo')}" required />
              </div>
              <div class="field">
                <label for="pet-status">Estado</label>
                <select id="pet-status" name="status">
                  <option value="AVAILABLE" ${pet && pet.status === 'AVAILABLE' ? 'selected' : ''}>Disponible</option>
                  <option value="PENDING" ${pet && pet.status === 'PENDING' ? 'selected' : ''}>Pendiente</option>
                  <option value="ADOPTED" ${pet && pet.status === 'ADOPTED' ? 'selected' : ''}>Adoptada</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label for="pet-image">Imagen</label>
              <select id="pet-image" name="imageId" required>
                ${renderImageOptions(pet ? pet.imageId : '')}
              </select>
            </div>
            <div class="field">
              <label for="pet-description">Descripcion</label>
              <textarea id="pet-description" name="description" required>${escapeHtml(pet ? pet.description : '')}</textarea>
            </div>
            <div class="button-row">
              <button class="button-primary" type="submit">${pet ? 'Guardar cambios' : 'Registrar mascota'}</button>
              ${
                pet
                  ? `<button class="button-secondary" type="button" data-delete-pet="${pet.id}">Eliminar ficha</button>`
                  : ''
              }
            </div>
          </form>
        </article>
        <article class="panel">
          <div class="request-head">
            <div>
              <h3>Cargar imagen</h3>
              <p>Sube una imagen para usarla luego en una ficha de mascota.</p>
            </div>
          </div>
          <form id="image-upload-form" class="form-stack">
            <div class="field">
              <label for="image-file">Archivo</label>
              <input id="image-file" name="image" type="file" accept="image/*" required />
            </div>
            <button class="button-secondary" type="submit">Subir imagen</button>
          </form>
          <div class="table-list top-gap">
            ${state.images.length ? state.images.slice(0, 3).map(renderImageGalleryCard).join('') : renderEmpty('Todavia no hay imagenes cargadas.')}
          </div>
        </article>
      </div>
      ${
        isAdmin()
          ? `
            <article class="panel app-section">
              <div class="request-head">
                <div>
                  <h3>Organizaciones pendientes</h3>
                  <p>Aprueba o rechaza organizaciones registradas antes de habilitar su acceso.</p>
                </div>
              </div>
              <div class="table-list">
                ${
                  state.pendingOrganizations.length
                    ? state.pendingOrganizations.map(renderPendingOrganizationCard).join('')
                    : renderEmpty('No hay organizaciones pendientes de aprobacion.')
                }
              </div>
            </article>
          `
          : ''
      }
    </section>
  `;
}

function renderAdoptionItem(adoption) {
  const canReview = !isAdoptante() && adoption.status === 'PENDING';

  return `
    <article class="request-card">
      <div class="request-head">
        <div>
          <h3>${escapeHtml(adoption.petName)}</h3>
          <p>${isAdoptante() ? 'Solicitud enviada por ti.' : `Solicitada por ${escapeHtml(adoption.applicantName)}`}</p>
        </div>
        <span class="soft-pill ${escapeHtml(statusClass(adoption.status))}">${escapeHtml(prettyStatus(adoption.status))}</span>
      </div>
      <div class="info-grid">
        <article>
          <strong>Correo</strong>
          <span>${escapeHtml(adoption.email)}</span>
        </article>
        <article>
          <strong>Telefono</strong>
          <span>${escapeHtml(adoption.phone)}</span>
        </article>
        <article>
          <strong>Creada</strong>
          <span>${escapeHtml(formatDate(adoption.createdAt))}</span>
        </article>
      </div>
      <p><strong>Vivienda:</strong> ${escapeHtml(adoption.housing)}</p>
      <p><strong>Tenencia:</strong> ${escapeHtml(adoption.tenure)}</p>
      <p><strong>Disponibilidad:</strong> ${escapeHtml(adoption.availability)}</p>
      <p><strong>Direccion:</strong> ${escapeHtml(adoption.address)}</p>
      ${adoption.decisionNote ? `<p><strong>Nota:</strong> ${escapeHtml(adoption.decisionNote)}</p>` : ''}
      ${
        canReview
          ? `
            <div class="button-row">
              <button class="button-primary compact" type="button" data-adoption-decision="${adoption.id}" data-adoption-status="ACCEPTED">Aceptar</button>
              <button class="button-secondary compact" type="button" data-adoption-decision="${adoption.id}" data-adoption-status="REJECTED">Rechazar</button>
            </div>
          `
          : ''
      }
    </article>
  `;
}

function renderRequestsView() {
  return `
    <section class="app-section">
      <div class="section-head left">
        <h2 class="section-title small">Solicitudes</h2>
        <p class="section-copy">${isAdoptante() ? 'Consulta el estado de tus formularios enviados.' : 'Revisa y decide sobre las solicitudes activas.'}</p>
      </div>
      <div class="table-list">
        ${state.adoptions.length ? state.adoptions.map(renderAdoptionItem).join('') : renderEmpty('No hay solicitudes para mostrar.')}
      </div>
    </section>
  `;
}

function renderImagesView() {
  return `
    <section class="app-section">
      <div class="section-head left">
        <h2 class="section-title small">Imagenes</h2>
        <p class="section-copy">Galeria de imagenes visibles segun tu rol dentro de la plataforma.</p>
      </div>
      ${!isAdoptante() ? `
        <article class="panel">
          <form id="image-upload-form" class="inline-form">
            <input name="image" type="file" accept="image/*" required />
            <button class="button-secondary compact" type="submit">Subir imagen</button>
          </form>
        </article>
      ` : ''}
      <div class="gallery-grid app-section">
        ${state.images.length ? state.images.map(renderImageGalleryCard).join('') : renderEmpty('No hay imagenes disponibles.')}
      </div>
    </section>
  `;
}

function renderProfileView() {
  const profile = state.profile || state.authUser;

  return `
    <section class="app-section">
      <div class="section-head left">
        <h2 class="section-title small">Perfil</h2>
        <p class="section-copy">Actualiza los datos de contacto y de tu cuenta dentro de CEPETS.</p>
      </div>
      <div class="management-grid">
        <article class="panel">
          <form id="profile-form" class="form-stack">
            <div class="split-fields">
              <div class="field">
                <label for="profile-name">Nombre</label>
                <input id="profile-name" name="name" value="${escapeHtml(profile.name || '')}" required />
              </div>
              <div class="field">
                <label for="profile-phone">Telefono</label>
                <input id="profile-phone" name="phone" value="${escapeHtml(profile.phone || '')}" required />
              </div>
            </div>
            <div class="split-fields">
              <div class="field">
                <label for="profile-city">Ciudad</label>
                <input id="profile-city" name="city" value="${escapeHtml(profile.city || '')}" required />
              </div>
              <div class="field">
                <label for="profile-org">Organizacion</label>
                <input id="profile-org" name="organizationName" value="${escapeHtml(profile.organizationName || '')}" ${isOrg() ? '' : 'placeholder="No aplica para este rol"'} />
              </div>
            </div>
            <div class="field">
              <label for="profile-address">Direccion</label>
              <textarea id="profile-address" name="address" required>${escapeHtml(profile.address || '')}</textarea>
            </div>
            <button class="button-primary" type="submit">Guardar perfil</button>
          </form>
        </article>
        <article class="panel">
          <div class="info-grid">
            <article>
              <strong>Correo</strong>
              <span>${escapeHtml(profile.email || state.authUser.email || '')}</span>
            </article>
            <article>
              <strong>Rol</strong>
              <span>${escapeHtml(prettyRole(state.authUser.role))}</span>
            </article>
            <article>
              <strong>Estado</strong>
              <span>${escapeHtml(prettyStatus(profile.approvalStatus || state.authUser.approvalStatus || 'APPROVED'))}</span>
            </article>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderAdoptionModal() {
  const pet = currentAdoptionPet();

  if (!pet) {
    return '';
  }

  return `
    <div class="modal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Solicitud de adopcion</span>
            <h2 class="modal-title">Adoptar a ${escapeHtml(pet.name)}</h2>
            <p class="modal-copy">Organizacion responsable: ${escapeHtml(pet.ownerOrganizationName || 'No especificada')}</p>
          </div>
          <button class="button-secondary compact" type="button" data-action="close-adoption">Cerrar</button>
        </div>
        ${renderNotice()}
        <form id="adoption-form" class="form-stack">
          <input type="hidden" name="petId" value="${escapeHtml(pet.id)}" />
          <div class="split-fields">
            <div class="field">
              <label for="adoption-phone">Telefono</label>
              <input id="adoption-phone" name="phone" value="${escapeHtml(state.profile && state.profile.phone ? state.profile.phone : '')}" required />
            </div>
            <div class="field">
              <label for="adoption-email">Correo</label>
              <input id="adoption-email" name="email" type="email" value="${escapeHtml(state.profile && state.profile.email ? state.profile.email : state.authUser.email)}" required />
            </div>
          </div>
          <div class="field">
            <label for="adoption-address">Direccion</label>
            <textarea id="adoption-address" name="address" required>${escapeHtml(state.profile && state.profile.address ? state.profile.address : '')}</textarea>
          </div>
          <div class="field">
            <label for="adoption-housing">Tipo de vivienda</label>
            <input id="adoption-housing" name="housing" placeholder="Casa, apartamento, patio..." required />
          </div>
          <div class="field">
            <label for="adoption-tenure">Condicion de vivienda</label>
            <input id="adoption-tenure" name="tenure" placeholder="Propia, arriendo autorizado..." required />
          </div>
          <div class="field">
            <label for="adoption-availability">Disponibilidad</label>
            <textarea id="adoption-availability" name="availability" placeholder="Tiempo de cuidado, acompanamiento, rutina..." required></textarea>
          </div>
          <button class="button-primary" type="submit">Enviar solicitud</button>
        </form>
      </div>
    </div>
  `;
}

function renderActiveView() {
  if (state.activeView === 'manage') {
    return renderManageView();
  }

  if (state.activeView === 'requests') {
    return renderRequestsView();
  }

  if (state.activeView === 'images') {
    return renderImagesView();
  }

  if (state.activeView === 'profile') {
    return renderProfileView();
  }

  return renderCatalogView();
}

function renderDashboard() {
  return `
    <div class="dashboard-page">
      ${renderAppHeader()}
      <main class="app-shell">
        ${state.notice && !currentAdoptionPet() ? renderNotice() : ''}
        ${renderDashboardHero()}
        ${renderMetricsGrid()}
        ${renderActiveView()}
      </main>
      ${renderAdoptionModal()}
    </div>
  `;
}

function render() {
  if (state.loading) {
    app.innerHTML = renderLoading();
    return;
  }

  app.innerHTML = state.authUser ? renderDashboard() : renderGuest();
  ensureCarousel();
}

async function loadGuestPets() {
  try {
    const response = await api('/pets/public');
    state.guestPets = response.items || [];
    state.guestCarouselIndex = 0;
  } catch (error) {
    state.guestPets = [];
  }
}

async function loadDashboardData() {
  try {
    const meResponse = await api('/auth/me');
    state.authUser = meResponse.user;

    const requests = [api('/users/me'), api('/pets'), api('/adoptions'), api('/images')];

    if (isAdmin()) {
      requests.push(api('/users/organizations/pending'));
    }

    const responses = await Promise.all(requests);

    state.profile = responses[0].item;
    state.authUser = {
      ...meResponse.user,
      name: state.profile && state.profile.name ? state.profile.name : meResponse.user.name,
      approvalStatus:
        state.profile && state.profile.approvalStatus ? state.profile.approvalStatus : meResponse.user.approvalStatus
    };
    state.pets = responses[1].items || [];
    state.adoptions = responses[2].items || [];
    state.images = responses[3].items || [];
    state.pendingOrganizations = isAdmin() ? responses[4].items || [] : [];

    if (!viewsForRole().some((view) => view.id === state.activeView)) {
      state.activeView = defaultView();
    }
  } catch (error) {
    resetSession();
    await loadGuestPets();
    throw error;
  }
}

async function refreshAuthenticatedView() {
  await loadDashboardData();
  render();
}

async function finishLogin(response) {
  state.token = response.token;
  state.authUser = response.user;
  state.authModalView = null;
  state.registrationResult = null;
  state.notice = null;
  state.selectedPetId = null;
  state.activeView = defaultView();
  localStorage.setItem(TOKEN_KEY, state.token);
  await loadDashboardData();
  render();
}

async function handleLogin(form) {
  clearNotice();

  const payload = formDataToObject(form);
  const response = await api('/auth/login', {
    method: 'POST',
    body: {
      email: String(payload.email || '').trim(),
      password: String(payload.password || '')
    }
  });

  await finishLogin(response);
}

async function quickDemoLogin(role) {
  const account = demoAccounts[role];

  if (!account) {
    throw new Error('No existe una cuenta demo para este rol.');
  }

  const response = await api('/auth/login', {
    method: 'POST',
    body: account
  });

  await finishLogin(response);
}

async function handleRegister(form) {
  clearNotice();

  const payload = formDataToObject(form);
  const role = String(payload.role || 'ADOPTANTE');
  const organizationName = String(payload.organizationName || '').trim();

  const response = await api('/auth/register', {
    method: 'POST',
    body: {
      name: String(payload.name || '').trim(),
      email: String(payload.email || '').trim(),
      password: String(payload.password || ''),
      role,
      phone: String(payload.phone || '').trim(),
      address: String(payload.address || '').trim(),
      city: String(payload.city || '').trim(),
      organizationName: role === 'ORG' ? organizationName : ''
    }
  });

  if (response.token) {
    await finishLogin(response);
    return;
  }

  state.registrationResult = response;
  state.authModalView = 'register-success';
  render();
}

async function handleProfileUpdate(form) {
  clearNotice();

  const payload = formDataToObject(form);

  const response = await api('/users/me', {
    method: 'PATCH',
    body: {
      name: String(payload.name || '').trim(),
      phone: String(payload.phone || '').trim(),
      city: String(payload.city || '').trim(),
      address: String(payload.address || '').trim(),
      organizationName: isOrg() ? String(payload.organizationName || '').trim() : ''
    }
  });

  state.profile = response.item;
  state.authUser = {
    ...state.authUser,
    name: response.item.name,
    approvalStatus: response.item.approvalStatus || state.authUser.approvalStatus
  };
  render();
}

async function handleImageUpload(form) {
  clearNotice();

  const formData = new FormData(form);
  await api('/images', {
    method: 'POST',
    formData
  });

  await refreshAuthenticatedView();
}

async function handlePetSave(form) {
  clearNotice();

  const payload = formDataToObject(form);
  const petId = String(payload.petId || '').trim();

  const body = {
    name: String(payload.name || '').trim(),
    species: String(payload.species || '').trim(),
    age: String(payload.age || '').trim(),
    gender: String(payload.gender || '').trim(),
    description: String(payload.description || '').trim(),
    status: String(payload.status || 'AVAILABLE'),
    imageId: String(payload.imageId || '').trim(),
    city: String(payload.city || '').trim()
  };

  let response;

  if (petId) {
    response = await api(`/pets/${petId}`, {
      method: 'PATCH',
      body
    });
  } else {
    response = await api('/pets', {
      method: 'POST',
      body
    });
  }

  state.selectedPetId = response.item.id;
  state.activeView = 'manage';
  await refreshAuthenticatedView();
}

async function handlePetDelete(petId) {
  clearNotice();

  await api(`/pets/${petId}`, {
    method: 'DELETE'
  });

  state.selectedPetId = null;
  state.activeView = 'manage';
  await refreshAuthenticatedView();
}

async function handleAdoptionSubmit(form) {
  clearNotice();

  const payload = formDataToObject(form);

  await api('/adoptions', {
    method: 'POST',
    body: {
      petId: String(payload.petId || '').trim(),
      phone: String(payload.phone || '').trim(),
      email: String(payload.email || '').trim(),
      address: String(payload.address || '').trim(),
      housing: String(payload.housing || '').trim(),
      tenure: String(payload.tenure || '').trim(),
      availability: String(payload.availability || '').trim()
    }
  });

  state.selectedPetId = null;
  await refreshAuthenticatedView();
}

async function handleAdoptionDecision(adoptionId, status) {
  clearNotice();

  await api(`/adoptions/${adoptionId}/status`, {
    method: 'PATCH',
    body: {
      status
    }
  });

  await refreshAuthenticatedView();
}

async function handleOrganizationApproval(userId, approvalStatus) {
  clearNotice();

  await api(`/users/${userId}/approval`, {
    method: 'PATCH',
    body: {
      approvalStatus
    }
  });

  await refreshAuthenticatedView();
}

async function handleLogout() {
  resetSession();
  clearNotice();
  state.authModalView = null;
  state.registrationResult = null;
  await loadGuestPets();
  render();
}

function openAuthModal(view) {
  state.authModalView = view;
  state.registrationResult = null;
  clearNotice();
  render();
}

function closeAuthModal() {
  state.authModalView = null;
  state.registrationResult = null;
  clearNotice();
  render();
}

function switchAuthModal(view) {
  state.authModalView = view;
  state.registrationResult = null;
  clearNotice();
  render();
}

function scrollToTarget(id) {
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function openAdoptionModal(petId) {
  state.selectedPetId = petId;
  clearNotice();
  render();
}

function closeAdoptionModal() {
  state.selectedPetId = null;
  clearNotice();
  render();
}

function ensureCarousel() {
  if (carouselTimer) {
    window.clearInterval(carouselTimer);
    carouselTimer = null;
  }

  if (state.authUser || state.authModalView || state.guestPets.length < 2) {
    return;
  }

  carouselTimer = window.setInterval(() => {
    state.guestCarouselIndex = (state.guestCarouselIndex + 1) % state.guestPets.length;
    render();
  }, 4500);
}

async function onSubmit(event) {
  const form = event.target;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const knownForms = ['login-form', 'register-form', 'profile-form', 'pet-form', 'image-upload-form', 'adoption-form'];

  if (!knownForms.includes(form.id)) {
    return;
  }

  event.preventDefault();

  try {
    if (form.id === 'login-form') {
      await handleLogin(form);
      return;
    }

    if (form.id === 'register-form') {
      await handleRegister(form);
      return;
    }

    if (form.id === 'profile-form') {
      await handleProfileUpdate(form);
      return;
    }

    if (form.id === 'pet-form') {
      await handlePetSave(form);
      return;
    }

    if (form.id === 'image-upload-form') {
      await handleImageUpload(form);
      return;
    }

    if (form.id === 'adoption-form') {
      await handleAdoptionSubmit(form);
    }
  } catch (error) {
    setNotice('error', error.message);
    render();
  }
}

async function onClick(event) {
  const target = event.target.closest('button, [data-view], [data-scroll-target]');

  if (!target) {
    return;
  }

  if (target.dataset.scrollTarget) {
    event.preventDefault();
    scrollToTarget(target.dataset.scrollTarget);
    return;
  }

  if (target.dataset.filter) {
    state.guestFilter = target.dataset.filter;
    render();
    return;
  }

  if (target.dataset.faqIndex) {
    const nextIndex = Number(target.dataset.faqIndex);
    state.openFaqIndex = state.openFaqIndex === nextIndex ? -1 : nextIndex;
    render();
    return;
  }

  if (target.dataset.carouselIndex) {
    state.guestCarouselIndex = Number(target.dataset.carouselIndex);
    render();
    return;
  }

  if (target.dataset.authOpen) {
    openAuthModal(target.dataset.authOpen);
    return;
  }

  if (target.dataset.authSwitch) {
    switchAuthModal(target.dataset.authSwitch);
    return;
  }

  if (target.dataset.demoLogin) {
    try {
      await quickDemoLogin(target.dataset.demoLogin);
    } catch (error) {
      setNotice('error', error.message);
      render();
    }
    return;
  }

  if (target.dataset.view) {
    state.activeView = target.dataset.view;
    clearNotice();
    render();
    return;
  }

  if (target.dataset.openAdoption) {
    openAdoptionModal(target.dataset.openAdoption);
    return;
  }

  if (target.dataset.editPet) {
    state.selectedPetId = target.dataset.editPet;
    state.activeView = 'manage';
    clearNotice();
    render();
    return;
  }

  if (target.dataset.deletePet) {
    const shouldDelete = window.confirm('Se eliminara esta ficha de mascota. Deseas continuar?');

    if (!shouldDelete) {
      return;
    }

    try {
      await handlePetDelete(target.dataset.deletePet);
    } catch (error) {
      setNotice('error', error.message);
      render();
    }
    return;
  }

  if (target.dataset.adoptionDecision && target.dataset.adoptionStatus) {
    try {
      await handleAdoptionDecision(target.dataset.adoptionDecision, target.dataset.adoptionStatus);
    } catch (error) {
      setNotice('error', error.message);
      render();
    }
    return;
  }

  if (target.dataset.organizationApproval && target.dataset.approvalStatus) {
    try {
      await handleOrganizationApproval(target.dataset.organizationApproval, target.dataset.approvalStatus);
    } catch (error) {
      setNotice('error', error.message);
      render();
    }
    return;
  }

  if (target.dataset.action === 'close-auth') {
    closeAuthModal();
    return;
  }

  if (target.dataset.action === 'close-adoption') {
    closeAdoptionModal();
    return;
  }

  if (target.dataset.action === 'new-pet') {
    state.selectedPetId = null;
    clearNotice();
    render();
    return;
  }

  if (target.dataset.action === 'logout') {
    await handleLogout();
  }
}

async function init() {
  state.loading = true;
  render();

  await loadGuestPets();

  if (state.token) {
    try {
      await loadDashboardData();
    } catch (error) {
      setNotice('error', error.message);
    }
  }

  state.loading = false;

  if (!state.authUser) {
    state.activeView = 'catalog';
  }

  render();
}

app.addEventListener('submit', onSubmit);
app.addEventListener('click', (event) => {
  void onClick(event);
});

void init();
