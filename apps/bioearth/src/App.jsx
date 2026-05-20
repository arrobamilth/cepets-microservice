import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Database,
  Dna,
  Droplets,
  Facebook,
  FlaskConical,
  Globe2,
  Handshake,
  Instagram,
  Leaf,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Microscope,
  Phone,
  Satellite,
  Send,
  ShieldCheck,
  Sprout,
  Sun,
  Twitter,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Quiénes somos', href: '#quienes-somos' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Investigación', href: '#investigacion' },
  { label: 'Equipo', href: '#equipo' },
  { label: 'Contacto', href: '#contacto' },
];

const projects = [
  {
    title: 'Atlas de Biodiversidad Andina',
    category: 'Biodiversidad',
    status: 'En ejecución',
    description:
      'Inventario digital de especies nativas con análisis de hábitat, corredores biológicos y datos de campo georreferenciados.',
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'AquaSense Labs',
    category: 'Calidad del agua',
    status: 'Piloto validado',
    description:
      'Sistema de sensores para medir parámetros fisicoquímicos en ríos y humedales con tableros de alerta temprana.',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'EcoAI Risk Platform',
    category: 'IA ambiental',
    status: 'Prototipo',
    description:
      'Modelos predictivos para priorizar zonas de restauración, riesgo climático y presión antrópica en ecosistemas sensibles.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'AgroRegenera',
    category: 'Agricultura sostenible',
    status: 'Escalamiento',
    description:
      'Prácticas de agricultura regenerativa apoyadas por bioinsumos, trazabilidad de suelo y monitoreo de productividad.',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'ClimatePulse',
    category: 'Monitoreo climático',
    status: 'En ejecución',
    description:
      'Red de estaciones y analítica satelital para observar variabilidad climática local y escenarios de adaptación.',
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Reserva Viva',
    category: 'Conservación ecológica',
    status: 'Investigación aplicada',
    description:
      'Plan integral de conservación, restauración forestal y participación comunitaria para paisajes de alta biodiversidad.',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85',
  },
];

const researchAreas = [
  { title: 'Biotecnología', icon: Dna, text: 'Bioinsumos, microbiología aplicada y soluciones basadas en organismos vivos.' },
  { title: 'Medio ambiente', icon: Leaf, text: 'Diagnóstico, restauración y gestión de ecosistemas terrestres y acuáticos.' },
  { title: 'IA aplicada', icon: BrainCircuit, text: 'Modelos predictivos para riesgo, biodiversidad, clima y toma de decisiones.' },
  { title: 'Energías renovables', icon: Sun, text: 'Evaluación de alternativas limpias para comunidades, industria y territorios.' },
  { title: 'Desarrollo sostenible', icon: Globe2, text: 'Estrategias con impacto ambiental, social e institucional medible.' },
  { title: 'Ciencia de datos', icon: Database, text: 'Arquitecturas de datos, visualización científica y analítica geoespacial.' },
];

const impactStats = [
  { label: 'Proyectos realizados', value: 48, icon: FlaskConical },
  { label: 'Investigadores', value: 32, icon: Users },
  { label: 'Publicaciones', value: 76, icon: BookOpen },
  { label: 'Aliados estratégicos', value: 21, icon: Handshake },
];

const team = [
  {
    name: 'Dra. Elena Vargas',
    role: 'Directora científica',
    specialty: 'Biotecnología ambiental',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Dr. Mateo Rios',
    role: 'Coordinador de datos',
    specialty: 'IA aplicada y sensores',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Ing. Sofia Mendez',
    role: 'Líder de proyectos',
    specialty: 'Sostenibilidad territorial',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Dr. Andres Salazar',
    role: 'Investigador senior',
    specialty: 'Conservación ecológica',
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=85',
  },
];

const contactDetails = {
  address: 'Calle 117 Carrera 42 189 Conjunto RE, Barranquilla, Atlántico',
  email: 'contacto@bioearth.co',
  phone: '+57 302 260 1495',
};

function LogoMark({ className = 'h-10 w-10', showWord = false, light = false }) {
  const textClass = light ? 'text-white' : 'text-bio-ink';
  const gradientId = useId().replace(/:/g, '');

  return (
    <div className="flex items-center gap-3">
      <svg className={className} viewBox="0 0 96 96" fill="none" aria-label="Logo conceptual BioEarth">
        <circle cx="48" cy="48" r="38" fill={`url(#${gradientId})`} />
        <path
          d="M20 51c12-12 27-16 45-12 7 2 12 5 16 9"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M29 70c8-12 19-19 34-21"
          stroke="rgba(217,244,234,0.92)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M34 24c17 6 29 16 36 31M62 22C45 31 36 44 33 64"
          stroke="#d9f4ea"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M57 64c10-13 22-13 27-9-3 13-16 23-31 22 0 0 0-6 4-13Z"
          fill="#69c39b"
        />
        <path
          d="M58 66c6-4 12-7 20-8"
          stroke="#f5fbff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="38" cy="31" r="3" fill="#ffffff" />
        <circle cx="51" cy="40" r="3" fill="#ffffff" />
        <circle cx="60" cy="52" r="3" fill="#ffffff" />
        <defs>
          <linearGradient id={gradientId} x1="12" x2="88" y1="8" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16a6c9" />
            <stop offset="0.48" stopColor="#0b4f8a" />
            <stop offset="1" stopColor="#06223f" />
          </linearGradient>
        </defs>
      </svg>
      {showWord ? (
        <span className={`text-xl font-semibold tracking-wide ${textClass}`}>
          Bio<span className="text-bio-green">Earth</span>
        </span>
      ) : null}
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/94 shadow-soft backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="section-shell flex h-20 items-center justify-between">
        <a href="#inicio" className="focus:outline-none focus:ring-2 focus:ring-bio-green focus:ring-offset-4">
          <LogoMark showWord light={!scrolled} />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-slate-700 hover:text-bio-blue' : 'text-white/86 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#contacto"
          className={`hidden rounded-md px-5 py-3 text-sm font-semibold transition-all lg:inline-flex ${
            scrolled
              ? 'bg-bio-blue text-white shadow-soft hover:bg-bio-navy'
              : 'bg-white text-bio-blue hover:bg-bio-mint'
          }`}
        >
          Agenda una llamada
        </a>

        <button
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((value) => !value)}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-md border lg:hidden ${
            scrolled ? 'border-slate-200 bg-white text-bio-ink' : 'border-white/25 bg-white/10 text-white'
          }`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="section-shell grid gap-1 py-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-bio-cloud hover:text-bio-blue"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative min-h-[88vh] overflow-hidden bg-bio-navy pt-20 text-white">
      <img
        src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1900&q=90"
        alt="Investigación científica con tecnología aplicada"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bio-navy via-bio-blue/82 to-bio-cyan/35" />
      <div className="absolute inset-0 opacity-35">
        <svg className="h-full w-full" viewBox="0 0 1440 820" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="bio-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke="white" strokeWidth="0.6" opacity="0.45" />
            </pattern>
          </defs>
          <rect width="1440" height="820" fill="url(#bio-grid)" />
          <path d="M120 590 C 390 390, 640 640, 910 400 S 1250 255, 1390 340" stroke="#d9f4ea" strokeWidth="2" fill="none" />
          <path d="M90 310 C 380 210, 630 315, 840 180 S 1200 210, 1360 120" stroke="#9adbe8" strokeWidth="2" fill="none" />
          {[210, 428, 610, 872, 1100, 1268].map((cx, index) => (
            <circle key={cx} cx={cx} cy={index % 2 ? 450 : 260} r="5" fill="#d9f4ea" />
          ))}
        </svg>
      </div>

      <div className="section-shell relative grid min-h-[calc(88vh-5rem)] items-center py-16 sm:py-20">
        <div className="max-w-4xl animate-fadeUp">
          <div className="mb-7 inline-flex items-center gap-3 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md">
            <Activity size={17} className="text-bio-mint" />
            Centro de investigación científica y sostenibilidad aplicada
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
            BioEarth
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-white/86 sm:text-2xl">
            Ciencia, tecnología y naturaleza para desarrollar soluciones sostenibles con impacto real en territorios,
            ecosistemas y comunidades.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#proyectos"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-bio-green px-6 py-4 text-sm font-bold text-bio-navy shadow-lift transition hover:-translate-y-0.5 hover:bg-bio-mint"
            >
              Conocer proyectos <ArrowRight size={18} />
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-bio-blue"
            >
              Contáctanos <Mail size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScienceSystemPanel() {
  const steps = [
    { title: 'Campo', text: 'Lectura de ecosistemas, agua, suelo y biodiversidad.', icon: Leaf },
    { title: 'Laboratorio', text: 'Protocolos, muestras y validación biotecnológica.', icon: FlaskConical },
    { title: 'Datos', text: 'Modelos, sensores, mapas e inteligencia ambiental.', icon: BrainCircuit },
    { title: 'Impacto', text: 'Decisiones aplicables para territorios e instituciones.', icon: ShieldCheck },
  ];

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-bio-navy p-7 text-white shadow-soft sm:p-8">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-bio-cyan/35" />
      <div className="absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-bio-green/28" />
      <div className="relative">
        <span className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-bio-mint">
          <Satellite size={15} /> Ecosistema BioEarth
        </span>
        <h3 className="max-w-md text-3xl font-semibold leading-tight">
          Del territorio al dato, del dato a la solución.
        </h3>
        <p className="mt-4 max-w-lg leading-8 text-white/72">
          Un modelo de investigación que conecta observación ambiental, laboratorio, analítica avanzada y acciones
          sostenibles medibles.
        </p>
      </div>

      <div className="relative mt-8 min-h-[270px]">
        <svg viewBox="0 0 520 280" className="absolute inset-0 h-full w-full" aria-label="Flujo científico BioEarth">
          <path
            d="M72 198C138 76 246 46 374 96c39 15 67 39 84 72"
            stroke="#9adbe8"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="10 12"
            fill="none"
            opacity=".72"
          />
          <path
            d="M84 207c88 43 175 43 262 1 39-19 72-43 99-74"
            stroke="#69c39b"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="262" cy="140" r="70" fill="#ffffff" opacity=".14" />
          <circle cx="262" cy="140" r="48" fill="#ffffff" />
          <path d="M229 142c22-25 51-33 88-22" stroke="#0b4f8a" strokeWidth="6" strokeLinecap="round" />
          <path d="M238 166c16-21 37-31 62-29" stroke="#69c39b" strokeWidth="6" strokeLinecap="round" />
          <path d="M252 101c22 12 38 29 47 52M292 98c-31 16-49 42-55 76" stroke="#16a6c9" strokeWidth="5" strokeLinecap="round" />
          <circle cx="248" cy="116" r="5" fill="#69c39b" />
          <circle cx="274" cy="138" r="5" fill="#69c39b" />
          <circle cx="291" cy="162" r="5" fill="#69c39b" />
          <path d="M325 171c20-27 46-26 58-15-8 29-35 45-67 42 0 0 0-15 9-27Z" fill="#69c39b" />
          <path d="M330 178c14-9 27-15 43-19" stroke="#f5fbff" strokeWidth="4" strokeLinecap="round" />
          <rect x="51" y="177" width="104" height="68" rx="8" fill="#16a6c9" opacity=".9" />
          <rect x="68" y="199" width="68" height="7" rx="3.5" fill="#fff" opacity=".82" />
          <rect x="68" y="216" width="48" height="7" rx="3.5" fill="#fff" opacity=".55" />
          <rect x="366" y="45" width="104" height="70" rx="8" fill="#fff" />
          <path d="M388 91l18-21 19 15 23-30" stroke="#0b4f8a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="77" cy="82" r="10" fill="#69c39b" />
          <circle cx="452" cy="205" r="10" fill="#9adbe8" />
        </svg>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="rounded-md border border-white/12 bg-white/10 p-4 backdrop-blur-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-bio-green text-bio-navy">
                <Icon size={20} />
              </div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="mt-2 text-sm leading-6 text-white/70">{step.text}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function About() {
  const pillars = [
    {
      title: 'Misión',
      text: 'Impulsar investigación científica aplicada que traduzca datos, biotecnología y conocimiento ambiental en soluciones verificables para retos sociales y ecológicos.',
      icon: Microscope,
    },
    {
      title: 'Visión',
      text: 'Ser un centro referente en innovación sostenible, reconocido por conectar ciencia de frontera con decisiones públicas, empresariales y comunitarias.',
      icon: Globe2,
    },
    {
      title: 'Valores',
      text: 'Rigor científico, colaboración, transparencia, respeto por la biodiversidad y compromiso con resultados que puedan medirse en el territorio.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="quienes-somos" className="bg-white py-24 sm:py-28">
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <div>
            <span className="section-kicker">
              <Leaf size={16} /> Quiénes somos
            </span>
            <h2 className="section-title">
              Investigación para convertir conocimiento ambiental en decisiones confiables.
            </h2>
            <p className="section-copy mt-6">
              BioEarth es un centro de investigación enfocado en innovación científica, sostenibilidad, medio ambiente,
              tecnología y desarrollo de soluciones para problemáticas ambientales y sociales. Integramos trabajo de
              campo, laboratorios, analítica avanzada y alianzas institucionales para generar evidencia útil, trazable y
              accionable.
            </p>
            <p className="section-copy mt-5">
              Nuestro enfoque combina ciencia aplicada, pensamiento sistémico y herramientas digitales para acompañar
              proyectos de biodiversidad, agua, clima, agricultura sostenible, conservación y gestión ambiental.
            </p>
          </div>

          <ScienceSystemPanel />
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="rounded-lg border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md bg-bio-mint text-bio-blue">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-bio-ink">{pillar.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{pillar.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bio-navy/70 to-transparent" />
        <span className="absolute left-4 top-4 rounded-md bg-white/92 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-bio-blue">
          {project.category}
        </span>
      </div>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-bio-green">
            <span className="h-2 w-2 rounded-full bg-bio-green" />
            {project.status}
          </span>
        </div>
        <h3 className="text-xl font-semibold leading-snug text-bio-ink">{project.title}</h3>
        <p className="mt-3 min-h-24 leading-7 text-slate-600">{project.description}</p>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-bio-blue/20 px-4 py-3 text-sm font-bold text-bio-blue transition hover:border-bio-blue hover:bg-bio-blue hover:text-white"
        >
          Ver más <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

function Projects() {
  return (
    <section id="proyectos" className="bg-section-wash py-24 sm:py-28">
      <div className="section-shell">
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="section-kicker">
              <BarChart3 size={16} /> Portafolio
            </span>
            <h2 className="section-title">Proyectos de investigación con enfoque territorial y tecnológico.</h2>
          </div>
          <p className="max-w-xl leading-8 text-slate-600">
            Una base preparada para incorporar proyectos reales, fichas técnicas, indicadores, publicaciones y aliados
            por línea de investigación.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ResearchAreas() {
  return (
    <section id="investigacion" className="bg-white py-24 sm:py-28">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-kicker justify-center">
            <FlaskConical size={16} /> Áreas de investigación
          </span>
          <h2 className="section-title mx-auto">Líneas científicas conectadas por datos, laboratorio y campo.</h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {researchAreas.map((area) => {
            const Icon = area.icon;
            return (
              <article
                key={area.title}
                className="rounded-lg border border-slate-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-bio-aqua hover:shadow-lift"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-bio-blue to-bio-cyan p-3 text-white">
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-semibold text-bio-ink">{area.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{area.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function useCountUp(target, enabled) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let frame = 0;
    const duration = 1400;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, target]);

  return value;
}

function ImpactStat({ stat, enabled }) {
  const Icon = stat.icon;
  const value = useCountUp(stat.value, enabled);

  return (
    <article className="rounded-lg border border-white/16 bg-white/10 p-6 text-white backdrop-blur-md">
      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-md bg-bio-green text-bio-navy">
        <Icon size={24} />
      </div>
      <div className="text-4xl font-semibold">{value}+</div>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-white/72">{stat.label}</p>
    </article>
  );
}

function Impact() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-blue-glow py-24 sm:py-28">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,.18)_50%,transparent_100%)] animate-scan" />
      </div>
      <div className="section-shell relative">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-bio-mint">
              <Satellite size={16} /> Impacto
            </span>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Resultados medibles para instituciones, comunidades y ecosistemas.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
              BioEarth estructura cada iniciativa con indicadores, trazabilidad de datos y reportes ejecutivos para
              convertir investigación en decisiones implementables.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {impactStats.map((stat) => (
              <ImpactStat key={stat.label} stat={stat} enabled={visible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section id="equipo" className="bg-white py-24 sm:py-28">
      <div className="section-shell">
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="section-kicker">
              <Users size={16} /> Equipo
            </span>
            <h2 className="section-title">Perfiles científicos para proyectos de alta exigencia.</h2>
          </div>
          <p className="max-w-xl leading-8 text-slate-600">
            Un equipo multidisciplinario con experiencia en laboratorio, campo, datos, gestión ambiental y cooperación
            interinstitucional.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((person) => (
            <article
              key={person.name}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[4/4] overflow-hidden">
                <img
                  src={person.image}
                  alt={person.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-bio-ink">{person.name}</h3>
                <p className="mt-1 font-medium text-bio-blue">{person.role}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{person.specialty}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const contactInfo = useMemo(
    () => [
      { icon: MapPin, label: contactDetails.address },
      { icon: Mail, label: contactDetails.email },
      { icon: Phone, label: contactDetails.phone },
    ],
    [],
  );

  return (
    <section id="contacto" className="bg-bio-cloud py-24 sm:py-28">
      <div className="section-shell">
        <div className="mb-12 max-w-3xl">
          <span className="section-kicker">
            <Droplets size={16} /> Ubicación y contacto
          </span>
          <h2 className="section-title">Conversemos sobre investigación, alianzas y nuevos proyectos.</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <iframe
              title="Ubicación BioEarth"
              src="https://www.google.com/maps?q=Calle%20117%20Carrera%2042%20189%20Barranquilla%20Atlantico%20Colombia&output=embed"
              className="h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="space-y-4 p-6">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-4 text-slate-700">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-bio-mint text-bio-blue">
                      <Icon size={20} />
                    </div>
                    <p className="leading-7">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-bio-ink">
                Nombre
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="rounded-md border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-aqua/25"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-bio-ink">
                Correo
                <input
                  type="email"
                  placeholder="nombre@empresa.com"
                  className="rounded-md border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-aqua/25"
                />
              </label>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-bio-ink">
              Organización
              <input
                type="text"
                placeholder="Institución, empresa o comunidad"
                className="rounded-md border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-aqua/25"
              />
            </label>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-bio-ink">
              Mensaje
              <textarea
                rows="6"
                placeholder="Cuéntanos sobre el proyecto o alianza que tienes en mente"
                className="resize-none rounded-md border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-aqua/25"
              />
            </label>
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-bio-blue px-6 py-4 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-bio-navy sm:w-auto"
            >
              Enviar mensaje <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bio-navy py-14 text-white">
      <div className="section-shell">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <LogoMark showWord light className="h-12 w-12" />
            <p className="mt-5 max-w-md leading-8 text-white/70">
              Centro de investigación científica dedicado a soluciones sostenibles para biodiversidad, agua, clima,
              datos ambientales y desarrollo territorial.
            </p>
            <div className="mt-6 flex gap-3">
              {[Linkedin, Twitter, Instagram, Facebook].map((Icon, index) => (
                <a
                  key={index}
                  href="#inicio"
                  aria-label="Red social BioEarth"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white/75 transition hover:border-bio-green hover:bg-bio-green hover:text-bio-navy"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Navegación rápida</h3>
            <div className="mt-5 grid gap-3">
              {navItems.slice(1).map((item) => (
                <a key={item.href} href={item.href} className="text-white/68 transition hover:text-bio-green">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Información institucional</h3>
            <div className="mt-5 grid gap-3 text-white/68">
              <p>Centro de Investigación y Desarrollo Tecnológico Bioearth S.A.S.</p>
              <p>NIT 9018518757</p>
              <p>{contactDetails.email}</p>
              <p>Barranquilla, Atlántico</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/12 pt-6 text-sm text-white/58">
          © 2026 BioEarth. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <ResearchAreas />
        <Impact />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
