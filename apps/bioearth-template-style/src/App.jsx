import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronRight,
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
  Rocket,
  Send,
  ShieldCheck,
  Sprout,
  Sun,
  Target,
  Twitter,
  Users,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#inicio' },
  { label: 'About', href: '#quienes-somos' },
  { label: 'Projects', href: '#proyectos' },
  { label: 'Research', href: '#investigacion' },
  { label: 'Team', href: '#equipo' },
  { label: 'Contact', href: '#contacto' },
];

const projects = [
  {
    title: 'Atlas de Biodiversidad',
    category: 'Biodiversidad',
    status: 'En ejecución',
    description: 'Inventario digital de especies, hábitats y corredores biológicos con datos georreferenciados.',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'AquaSense Labs',
    category: 'Calidad del agua',
    status: 'Piloto validado',
    description: 'Sensores y tableros de alerta temprana para monitorear ríos, humedales y cuerpos de agua.',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'EcoAI Risk',
    category: 'IA ambiental',
    status: 'Prototipo',
    description: 'Modelos predictivos para priorizar restauración, riesgo climático y presión antrópica.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'AgroRegenera',
    category: 'Agricultura sostenible',
    status: 'Escalamiento',
    description: 'Bioinsumos, trazabilidad de suelo y prácticas regenerativas para territorios productivos.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'ClimatePulse',
    category: 'Monitoreo climático',
    status: 'En ejecución',
    description: 'Estaciones, analítica satelital y reportes para adaptación climática local.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Reserva Viva',
    category: 'Conservación ecológica',
    status: 'Investigación aplicada',
    description: 'Restauración forestal, participación comunitaria y conservación de paisajes biodiversos.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85',
  },
];

const researchAreas = [
  { title: 'Biotecnología', icon: Dna, description: 'Bioinsumos, microbiología aplicada y soluciones basadas en vida.' },
  { title: 'Medio ambiente', icon: Leaf, description: 'Diagnóstico, restauración y gestión de ecosistemas.' },
  { title: 'IA aplicada', icon: BrainCircuit, description: 'Predicción ambiental, riesgo territorial y decisiones guiadas por datos.' },
  { title: 'Energías renovables', icon: Sun, description: 'Evaluación técnica de alternativas limpias para comunidades e industria.' },
  { title: 'Desarrollo sostenible', icon: Globe2, description: 'Estrategias medibles para impacto social, ambiental e institucional.' },
  { title: 'Ciencia de datos', icon: Database, description: 'Arquitecturas, visualización científica y analítica geoespacial.' },
];

const impactStats = [
  { label: 'Proyectos', value: 48 },
  { label: 'Investigadores', value: 32 },
  { label: 'Publicaciones', value: 76 },
  { label: 'Aliados', value: 21 },
];

const team = [
  {
    name: 'Dra. Elena Vargas',
    role: 'Directora científica',
    specialty: 'Biotecnología ambiental',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85',
    color: 'bg-[#8DD8E8]',
  },
  {
    name: 'Dr. Mateo Ríos',
    role: 'Coordinador de datos',
    specialty: 'IA aplicada y sensores',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85',
    color: 'bg-[#756DFF]',
  },
  {
    name: 'Ing. Sofía Méndez',
    role: 'Líder de proyectos',
    specialty: 'Sostenibilidad territorial',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=85',
    color: 'bg-[#FFB64D]',
  },
  {
    name: 'Dr. Andrés Salazar',
    role: 'Investigador senior',
    specialty: 'Conservación ecológica',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=85',
    color: 'bg-[#FF6B61]',
  },
];

const contactDetails = {
  address: 'Calle 117 Carrera 42 189 Conjunto RE, Barranquilla, Atlántico',
  email: 'contacto@bioearth.co',
  phone: '+57 302 260 1495',
};

function Logo({ light = false }) {
  const gradientId = useId().replace(/:/g, '');
  const textClass = light ? 'text-white' : 'text-bio-ink';

  return (
    <div className="flex items-center gap-3">
      <svg className="h-10 w-10" viewBox="0 0 96 96" fill="none" aria-label="BioEarth logo">
        <circle cx="48" cy="48" r="38" fill={`url(#${gradientId})`} />
        <path d="M24 52c12-11 26-15 42-11 7 2 12 5 16 9" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".82" />
        <path d="M34 24c17 7 29 18 36 33M62 22C44 32 35 45 32 66" stroke="#DFFFEF" strokeWidth="4" strokeLinecap="round" />
        <path d="M56 66c9-13 22-13 28-9-4 14-17 23-32 21 0 0 0-7 4-12Z" fill="#9BE7CA" />
        <circle cx="38" cy="32" r="3" fill="#fff" />
        <circle cx="51" cy="41" r="3" fill="#fff" />
        <circle cx="61" cy="54" r="3" fill="#fff" />
        <defs>
          <linearGradient id={gradientId} x1="14" x2="82" y1="14" y2="84" gradientUnits="userSpaceOnUse">
            <stop stopColor="#514BFF" />
            <stop offset=".56" stopColor="#3D88FF" />
            <stop offset="1" stopColor="#2DBB83" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`text-xl font-extrabold tracking-tight ${textClass}`}>
        Bio<span className="text-bio-coral">Earth</span>
      </span>
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
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-[8px] border px-5 py-3 transition duration-300 ${
          scrolled ? 'border-transparent bg-white/96 shadow-soft backdrop-blur-xl' : 'border-white/60 bg-white/82 backdrop-blur-md'
        }`}
      >
        <a href="#inicio" aria-label="Ir al inicio">
          <Logo />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-xs font-bold text-bio-muted transition hover:text-bio-blue">
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#contacto"
          className="hidden items-center gap-2 rounded-[8px] bg-bio-coral px-5 py-3 text-xs font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-bio-coralDark lg:inline-flex"
        >
          Contactar <ChevronRight size={16} />
        </a>

        <button
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-bio-blue text-white lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open ? (
        <div className="mx-auto mt-2 max-w-6xl rounded-[8px] bg-white p-3 shadow-soft lg:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-[8px] px-4 py-3 text-sm font-bold text-bio-muted hover:bg-bio-lavender hover:text-bio-blue"
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] animate-float">
      <div className="absolute right-2 top-4 h-24 w-24 rounded-full bg-bio-coral" />
      <div className="absolute bottom-10 left-0 h-20 w-20 rounded-full bg-bio-blue" />
      <div className="absolute inset-8 rounded-full bg-bio-lavender" />
      <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full" role="img" aria-label="Ilustración BioEarth de planeta, ciencia y datos">
        <circle cx="268" cy="238" r="128" fill="#514BFF" opacity=".1" />
        <circle cx="268" cy="238" r="96" fill="#fff" />
        <circle cx="268" cy="238" r="76" fill="#514BFF" opacity=".16" />
        <circle cx="268" cy="238" r="46" fill="#514BFF" />
        <circle cx="268" cy="238" r="18" fill="#FF6B61" />
        <path d="M187 237h162M268 156v163" stroke="#514BFF" strokeWidth="8" strokeLinecap="round" opacity=".32" />
        <path d="M164 352h178l34 58H130l34-58Z" fill="#31306F" />
        <rect x="156" y="334" width="210" height="32" rx="8" fill="#4C46F0" />
        <path d="M196 135l19-23 25 21-19 24-25-22ZM343 142l24-9 14 28-25 9-13-28Z" fill="#C9D7FF" />
        <path d="M149 302c-24 4-43 28-44 56 18 7 42 2 57-14 8-8 11-22 7-31-3-8-10-12-20-11Z" fill="#FF6B61" />
        <path d="M385 303c24 4 43 28 44 56-18 7-42 2-57-14-8-8-11-22-7-31 3-8 10-12 20-11Z" fill="#514BFF" />
        <path d="M115 276c25-29 57-40 95-32M412 276c-26-28-57-39-95-31" stroke="#514BFF" strokeWidth="6" strokeLinecap="round" opacity=".55" />
        <circle cx="131" cy="164" r="11" fill="#FF6B61" />
        <circle cx="408" cy="165" r="10" fill="#514BFF" />
        <circle cx="408" cy="392" r="12" fill="#FF6B61" />
        <path d="M224 410c17-24 39-35 66-34 27 2 50 14 69 36" stroke="#9BE7CA" strokeWidth="8" strokeLinecap="round" />
        <path d="M250 397c11-18 25-29 42-33 1 25-12 43-39 54 0 0-7-9-3-21Z" fill="#2DBB83" />
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white pt-32">
      <div className="absolute left-0 top-24 h-16 w-16 rounded-full bg-bio-coral" />
      <div className="absolute right-10 top-36 h-32 w-32 rounded-full bg-bio-lavender" />
      <div className="shell grid min-h-[760px] items-center gap-12 pb-20 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="animate-fadeUp">
          <p className="eyebrow">
            <Rocket size={15} /> Centro de investigación científica
          </p>
          <h1 className="mt-6 max-w-2xl text-5xl font-extrabold leading-[1.02] text-bio-ink sm:text-6xl lg:text-7xl">
            Ciencia para una Tierra más inteligente.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-bio-muted">
            BioEarth integra biotecnología, sostenibilidad, datos ambientales e innovación aplicada para resolver retos
            ecológicos y sociales con evidencia confiable.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#proyectos"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-bio-coral px-6 py-4 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-bio-coralDark"
            >
              Conocer proyectos <ArrowRight size={18} />
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-bio-blue px-6 py-4 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-bio-blueDark"
            >
              Contáctanos <Mail size={18} />
            </a>
          </div>
        </div>
        <HeroIllustration />
      </div>
    </section>
  );
}

function AboutIllustration() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[8px] bg-bio-lavender p-8">
      <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-bio-coral" />
      <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-bio-blue" />
      <svg viewBox="0 0 520 360" className="relative h-full min-h-[300px] w-full" aria-label="Equipo científico BioEarth">
        <path d="M89 244c48-72 117-108 206-108s145 38 168 114" fill="#fff" opacity=".78" />
        <circle cx="257" cy="114" r="50" fill="#fff" />
        <path d="M231 118c13 14 30 19 52 16M229 101c18-16 37-19 61-9" stroke="#514BFF" strokeWidth="7" strokeLinecap="round" />
        <path d="M178 260v-77c0-17 14-31 31-31h96c17 0 31 14 31 31v77" fill="#514BFF" />
        <path d="M223 152l34 48 34-48" fill="#fff" opacity=".9" />
        <path d="M113 288v-72c0-18 14-32 32-32h20c18 0 32 14 32 32v72" fill="#FF6B61" />
        <circle cx="155" cy="151" r="33" fill="#FFB64D" />
        <path d="M333 288v-72c0-18 14-32 32-32h20c18 0 32 14 32 32v72" fill="#2DBB83" />
        <circle cx="375" cy="151" r="33" fill="#7BD2F6" />
        <path d="M178 220h158M133 232h64M333 232h64" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".72" />
        <circle cx="92" cy="111" r="10" fill="#FF6B61" />
        <circle cx="433" cy="87" r="11" fill="#514BFF" />
      </svg>
    </div>
  );
}

function About() {
  const pillars = [
    { title: 'Misión', icon: Target, text: 'Traducir investigación científica aplicada en soluciones verificables para retos ambientales y sociales.' },
    { title: 'Visión', icon: Zap, text: 'Ser referente en innovación sostenible conectando ciencia, tecnología y decisiones territoriales.' },
    { title: 'Valores', icon: ShieldCheck, text: 'Rigor científico, colaboración, transparencia, biodiversidad y resultados medibles.' },
  ];

  return (
    <section id="quienes-somos" className="bg-bio-blue py-24 text-white sm:py-28">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
            <Leaf size={15} /> Sobre nosotros
          </p>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Investigación, desarrollo tecnológico y sostenibilidad aplicada.
          </h2>
          <p className="mt-5 leading-8 text-white/78">
            BioEarth es un centro de investigación enfocado en innovación científica, medio ambiente, tecnología y
            desarrollo de soluciones para problemáticas ambientales y sociales.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <AboutIllustration />
          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="rounded-[8px] bg-white p-6 text-bio-ink shadow-soft">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] bg-bio-lavender text-bio-blue">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-extrabold">{pillar.title}</h3>
                  <p className="mt-2 leading-7 text-bio-muted">{pillar.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResearchEcosystem() {
  const flow = [
    {
      title: 'Campo vivo',
      text: 'Lectura de ecosistemas, comunidades, agua, suelo y biodiversidad.',
      icon: Leaf,
      color: 'bg-bio-green',
    },
    {
      title: 'Laboratorio',
      text: 'Validación científica, biotecnología, muestras y protocolos técnicos.',
      icon: Microscope,
      color: 'bg-bio-coral',
    },
    {
      title: 'Datos + IA',
      text: 'Modelos, mapas, sensores y analítica para anticipar riesgos ambientales.',
      icon: BrainCircuit,
      color: 'bg-bio-blue',
    },
    {
      title: 'Impacto',
      text: 'Soluciones aplicables para instituciones, empresas y territorios.',
      icon: Sprout,
      color: 'bg-[#FFB64D]',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div className="absolute left-0 top-16 h-28 w-28 rounded-full bg-bio-coral" />
      <div className="absolute right-0 bottom-20 h-32 w-32 rounded-full bg-bio-blue" />
      <div className="shell relative">
        <div>
          <p className="eyebrow">
            <Zap size={15} /> Ecosistema BioEarth
          </p>
          <h2 className="section-title mt-4">Del territorio al dato, del dato a la solución.</h2>
          <p className="section-copy mt-5">
            BioEarth trabaja como un sistema de investigación conectado: observa en campo, valida en laboratorio,
            modela con tecnología y convierte los hallazgos en decisiones ambientales accionables.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="relative min-h-[520px] overflow-hidden rounded-[8px] bg-bio-blue p-6 text-white shadow-hover sm:p-10">
            <div className="absolute -left-12 top-16 h-28 w-28 rounded-full bg-bio-coral" />
            <div className="absolute -right-10 bottom-14 h-32 w-32 rounded-full bg-white/12" />
            <div className="absolute right-10 top-10 rounded-[8px] bg-white px-4 py-3 text-sm font-extrabold text-bio-blue shadow-soft">
              Barranquilla Lab
            </div>
            <svg viewBox="0 0 640 470" className="absolute inset-x-0 bottom-0 h-[430px] w-full" aria-label="Sistema científico BioEarth">
              <path d="M85 344c87-158 244-222 414-166" stroke="#fff" strokeWidth="3" strokeDasharray="10 12" opacity=".34" fill="none" />
              <path d="M112 340c94 44 197 44 308 1 48-19 90-45 126-78" stroke="#9BE7CA" strokeWidth="5" strokeLinecap="round" opacity=".8" fill="none" />
              <circle cx="320" cy="245" r="118" fill="#fff" opacity=".12" />
              <circle cx="320" cy="245" r="84" fill="#fff" />
              <circle cx="320" cy="245" r="58" fill="#514BFF" opacity=".16" />
              <path d="M270 248c28-34 66-43 116-26" stroke="#514BFF" strokeWidth="7" strokeLinecap="round" />
              <path d="M284 280c17-27 42-40 74-39" stroke="#2DBB83" strokeWidth="7" strokeLinecap="round" />
              <path d="M312 196c28 14 47 34 57 62M360 191c-39 20-62 52-69 94" stroke="#514BFF" strokeWidth="6" strokeLinecap="round" opacity=".75" />
              <circle cx="305" cy="213" r="6" fill="#FF6B61" />
              <circle cx="339" cy="241" r="6" fill="#FF6B61" />
              <circle cx="354" cy="274" r="6" fill="#FF6B61" />
              <path d="M402 291c25-34 57-32 72-19-10 36-43 55-83 51 0 0 0-18 11-32Z" fill="#9BE7CA" />
              <path d="M407 300c17-12 34-20 55-24" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
              <rect x="78" y="282" width="128" height="78" rx="8" fill="#FF6B61" />
              <rect x="95" y="303" width="94" height="8" rx="4" fill="#fff" opacity=".8" />
              <rect x="95" y="323" width="66" height="8" rx="4" fill="#fff" opacity=".55" />
              <rect x="446" y="126" width="126" height="86" rx="8" fill="#fff" />
              <path d="M468 178l22-24 22 16 28-34" stroke="#514BFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="98" cy="147" r="15" fill="#FF6B61" />
              <circle cx="545" cy="333" r="14" fill="#9BE7CA" />
              <circle cx="166" cy="102" r="10" fill="#fff" opacity=".82" />
              <circle cx="462" cy="374" r="9" fill="#fff" opacity=".7" />
            </svg>
            <div className="relative z-10 max-w-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Modelo de trabajo</p>
              <h3 className="mt-4 text-4xl font-extrabold leading-tight">Ciencia aplicada en movimiento.</h3>
              <p className="mt-5 leading-8 text-white/78">
                Unimos biodiversidad, agua, clima y datos para diseñar proyectos que se puedan medir, presentar y
                escalar.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {flow.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group flex gap-5 rounded-[8px] bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-hover">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] text-white ${item.color}`}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-bio-coral">
                      Fase 0{index + 1}
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-bio-ink">{item.title}</h3>
                    <p className="mt-2 leading-7 text-bio-muted">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="proyectos" className="bg-white py-24 sm:py-28">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">
            <BarChart3 size={15} /> Portafolio
          </p>
          <h2 className="section-title mx-auto mt-4">Proyectos de investigación listos para crecer.</h2>
          <p className="section-copy mx-auto mt-5">
            Una galería editable para integrar proyectos reales, indicadores, aliados, publicaciones y resultados por
            línea científica.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.title} className="template-card overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={project.image} alt={project.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                <div className="absolute left-4 top-4 rounded-[8px] bg-bio-coral px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white">
                  {project.category}
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-bold text-bio-blue">{project.status}</p>
                <h3 className="mt-2 text-xl font-extrabold text-bio-ink">{project.title}</h3>
                <p className="mt-3 min-h-20 leading-7 text-bio-muted">{project.description}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-[8px] bg-bio-lavender px-4 py-3 text-sm font-extrabold text-bio-blue transition hover:bg-bio-blue hover:text-white"
                >
                  Ver más <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResearchAreas() {
  return (
    <section id="investigacion" className="bg-bio-lavender py-24 sm:py-28">
      <div className="shell">
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">
              <FlaskConical size={15} /> Áreas de investigación
            </p>
            <h2 className="section-title mt-4">Líneas científicas con enfoque aplicado.</h2>
          </div>
          <p className="max-w-xl leading-8 text-bio-muted">
            La estructura está pensada para comunicar capacidades institucionales sin verse rígida ni excesivamente
            corporativa.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {researchAreas.map((area) => {
            const Icon = area.icon;
            return (
              <article key={area.title} className="template-card p-7">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[8px] bg-bio-blue text-white">
                  <Icon size={27} />
                </div>
                <h3 className="text-xl font-extrabold text-bio-ink">{area.title}</h3>
                <p className="mt-3 leading-7 text-bio-muted">{area.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function useCountUp(target, active) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    let frame = 0;
    const startedAt = performance.now();
    const duration = 1300;

    const tick = (time) => {
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return value;
}

function ImpactNumber({ stat, active }) {
  const value = useCountUp(stat.value, active);

  return (
    <article className="text-center">
      <p className="text-5xl font-extrabold">{value}+</p>
      <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-white/76">{stat.label}</p>
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
      { threshold: 0.25 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-bio-coral py-20 text-white">
      <div className="shell">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <ImpactNumber key={stat.label} stat={stat} active={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section id="equipo" className="bg-soft-page py-24 sm:py-28">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">
            <Users size={15} /> Nuestro equipo
          </p>
          <h2 className="section-title mx-auto mt-4">Perfiles científicos con experiencia interdisciplinaria.</h2>
          <p className="section-copy mx-auto mt-5">
            Talento preparado para articular laboratorio, campo, analítica, gestión ambiental y cooperación
            institucional.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((person) => (
            <article key={person.name} className="template-card p-6 text-center">
              <div className={`mx-auto flex h-40 w-40 items-end justify-center overflow-hidden rounded-full ${person.color}`}>
                <img src={person.image} alt={person.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-6 text-lg font-extrabold text-bio-ink">{person.name}</h3>
              <p className="mt-1 text-sm font-bold text-bio-blue">{person.role}</p>
              <p className="mt-3 text-sm leading-6 text-bio-muted">{person.specialty}</p>
              <div className="mt-5 flex justify-center gap-2 text-bio-blue">
                <Linkedin size={17} />
                <Twitter size={17} />
                <Mail size={17} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contacto" className="bg-white py-24 sm:py-28">
      <div className="shell">
        <div className="rounded-[8px] bg-bio-coral px-6 py-16 text-center text-white sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/72">Contáctenos</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Hablemos de investigación, alianzas y proyectos ambientales.
          </h2>
          <a
            href={`mailto:${contactDetails.email}`}
            className="mt-7 inline-flex items-center gap-2 rounded-[8px] bg-bio-blue px-6 py-4 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-bio-blueDark"
          >
            Enviar correo <Mail size={18} />
          </a>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <div className="overflow-hidden rounded-[8px] bg-white shadow-soft">
              <iframe
                title="Ubicación BioEarth"
                src="https://www.google.com/maps?q=Calle%20117%20Carrera%2042%20189%20Barranquilla%20Atlantico%20Colombia&output=embed"
                className="h-80 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-6 grid gap-4">
              {[
                { icon: MapPin, label: contactDetails.address },
                { icon: Mail, label: contactDetails.email },
                { icon: Phone, label: contactDetails.phone },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-4 rounded-[8px] bg-bio-lavender p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-bio-blue text-white">
                      <Icon size={21} />
                    </div>
                    <p className="self-center font-semibold leading-7 text-bio-ink">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <form className="template-card p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-bio-ink">
                Nombre
                <input className="rounded-[8px] border border-bio-lavender px-4 py-3 font-normal outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-lavender" placeholder="Tu nombre" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-bio-ink">
                Correo
                <input type="email" className="rounded-[8px] border border-bio-lavender px-4 py-3 font-normal outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-lavender" placeholder="nombre@empresa.com" />
              </label>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-bold text-bio-ink">
              Organización
              <input className="rounded-[8px] border border-bio-lavender px-4 py-3 font-normal outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-lavender" placeholder="Institución, empresa o comunidad" />
            </label>
            <label className="mt-5 grid gap-2 text-sm font-bold text-bio-ink">
              Mensaje
              <textarea rows="6" className="resize-none rounded-[8px] border border-bio-lavender px-4 py-3 font-normal outline-none transition focus:border-bio-blue focus:ring-4 focus:ring-bio-lavender" placeholder="Cuéntanos sobre el proyecto o alianza que tienes en mente" />
            </label>
            <button type="button" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-bio-coral px-6 py-4 text-sm font-extrabold text-white transition hover:bg-bio-coralDark sm:w-auto">
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
    <footer className="bg-bio-blue py-14 text-white">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-md leading-8 text-white/74">
              Centro de investigación y desarrollo tecnológico para sostenibilidad, biodiversidad, datos ambientales y
              soluciones científicas aplicadas.
            </p>
            <div className="mt-6 flex gap-3">
              {[Linkedin, Instagram, Facebook, Twitter].map((Icon) => (
                <a key={Icon.displayName || Icon.name} href="#inicio" className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white/12 transition hover:bg-bio-coral" aria-label="Red social BioEarth">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold">Navegación</h3>
            <div className="mt-5 grid gap-3">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-white/72 transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold">Institucional</h3>
            <div className="mt-5 grid gap-3 text-white/72">
              <p>Centro de Investigación y Desarrollo Tecnológico Bioearth S.A.S.</p>
              <p>NIT 9018518757</p>
              <p>Barranquilla, Atlántico</p>
              <p>{contactDetails.phone}</p>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/14 pt-6 text-sm text-white/62">
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
        <ResearchEcosystem />
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
