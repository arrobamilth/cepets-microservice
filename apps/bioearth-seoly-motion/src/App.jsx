import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
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
  Search,
  Send,
  ShieldCheck,
  Sprout,
  Sun,
  Target,
  Twitter,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Quiénes somos', href: '#quienes-somos' },
  { label: 'Líneas', href: '#lineas' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Equipo', href: '#equipo' },
  { label: 'Contacto', href: '#contacto' },
];

const marqueeItems = [
  'Biodiversidad',
  'Calidad del agua',
  'BioEarth Lab',
  'IA ambiental',
  'Monitoreo climático',
  'Ciencia de datos',
  'Agricultura sostenible',
  'Conservación ecológica',
];

const researchAreas = [
  {
    title: 'Biotecnología',
    icon: Dna,
    text: 'Bioinsumos, microbiología aplicada y soluciones basadas en organismos vivos.',
    color: 'bg-bio-sky',
    iconColor: 'bg-bio-blue',
  },
  {
    title: 'Medio ambiente',
    icon: Leaf,
    text: 'Diagnóstico, restauración y gestión de ecosistemas terrestres y acuáticos.',
    color: 'bg-bio-coralSoft',
    iconColor: 'bg-bio-coral',
  },
  {
    title: 'IA aplicada',
    icon: BrainCircuit,
    text: 'Modelos predictivos para riesgo, biodiversidad, clima y toma de decisiones.',
    color: 'bg-bio-violetSoft',
    iconColor: 'bg-bio-violet',
  },
  {
    title: 'Energías renovables',
    icon: Sun,
    text: 'Evaluación de alternativas limpias para comunidades, industria y territorios.',
    color: 'bg-bio-mint',
    iconColor: 'bg-bio-green',
  },
  {
    title: 'Desarrollo sostenible',
    icon: Globe2,
    text: 'Estrategias con impacto ambiental, social e institucional medible.',
    color: 'bg-bio-cream',
    iconColor: 'bg-bio-coral',
  },
  {
    title: 'Ciencia de datos',
    icon: Database,
    text: 'Arquitecturas de datos, visualización científica y analítica geoespacial.',
    color: 'bg-bio-sky',
    iconColor: 'bg-bio-blue',
  },
];

const projects = [
  {
    title: 'Atlas de Biodiversidad Andina',
    category: 'Biodiversidad',
    status: 'En ejecución',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85',
    text: 'Inventario digital de especies nativas con análisis de hábitat y datos de campo georreferenciados.',
  },
  {
    title: 'AquaSense Labs',
    category: 'Calidad del agua',
    status: 'Piloto validado',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85',
    text: 'Sensores para medir parámetros fisicoquímicos en ríos y humedales con alertas tempranas.',
  },
  {
    title: 'EcoAI Risk Platform',
    category: 'IA ambiental',
    status: 'Prototipo',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
    text: 'Modelos predictivos para priorizar restauración, riesgo climático y presión antrópica.',
  },
  {
    title: 'AgroRegenera',
    category: 'Agricultura sostenible',
    status: 'Escalamiento',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=85',
    text: 'Bioinsumos, trazabilidad de suelo y prácticas regenerativas para territorios productivos.',
  },
  {
    title: 'ClimatePulse',
    category: 'Monitoreo climático',
    status: 'En ejecución',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85',
    text: 'Estaciones y analítica satelital para observar variabilidad climática local.',
  },
  {
    title: 'Reserva Viva',
    category: 'Conservación ecológica',
    status: 'Investigación aplicada',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85',
    text: 'Restauración forestal, conservación y participación comunitaria para paisajes biodiversos.',
  },
];

const team = [
  {
    name: 'Dra. Elena Vargas',
    role: 'Directora científica',
    specialty: 'Biotecnología ambiental',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Dr. Mateo Ríos',
    role: 'Coordinador de datos',
    specialty: 'IA aplicada y sensores',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Ing. Sofía Méndez',
    role: 'Líder de proyectos',
    specialty: 'Sostenibilidad territorial',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Dr. Andrés Salazar',
    role: 'Investigador senior',
    specialty: 'Conservación ecológica',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=85',
  },
];

const contactDetails = {
  business: 'Centro de Investigación y Desarrollo Tecnológico Bioearth S.A.S.',
  nit: '9018518757',
  address: 'Calle 117 Carrera 42 189 Conjunto RE, Barranquilla, Atlántico',
  email: 'contacto@bioearth.co',
  phone: '+57 302 260 1495',
};

function Reveal({ children, className = '', delay = 0 }) {
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
      { threshold: 0.15, rootMargin: '0px 0px -70px 0px' },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Logo() {
  const id = useId().replace(/:/g, '');
  return (
    <div className="flex items-center gap-3">
      <svg className="h-10 w-10" viewBox="0 0 96 96" fill="none" aria-label="BioEarth">
        <circle cx="48" cy="48" r="34" fill={`url(#${id})`} />
        <path d="M26 51c13-12 28-16 46-10" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path d="M34 25c17 8 29 19 36 34M63 24C45 34 36 48 33 68" stroke="#E9FFF4" strokeWidth="5" strokeLinecap="round" />
        <path d="M57 66c10-14 23-14 29-9-4 14-18 24-34 22 0 0 0-7 5-13Z" fill="#39B883" />
        <circle cx="38" cy="33" r="4" fill="#fff" />
        <circle cx="51" cy="42" r="4" fill="#fff" />
        <circle cx="61" cy="55" r="4" fill="#fff" />
        <defs>
          <linearGradient id={id} x1="14" x2="82" y1="10" y2="84" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4584ED" />
            <stop offset=".54" stopColor="#3767C9" />
            <stop offset="1" stopColor="#39B883" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-3xl font-semibold tracking-tight text-black">
        Bio<span className="text-bio-coral">Earth</span>
      </span>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/92 shadow-[0_1px_0_rgba(48,58,75,.06)] backdrop-blur-xl">
      <nav className="shell flex h-[92px] items-center justify-between">
        <a href="#inicio" aria-label="Ir a inicio">
          <Logo />
        </a>
        <div className="hidden items-center gap-10 lg:flex">
          {navItems.map((item, index) => (
            <a key={item.href} href={item.href} className="inline-flex items-center gap-1 text-lg font-medium text-bio-ink transition hover:text-bio-blue">
              {item.label}
              {index === 0 || index === 2 ? <ChevronDown size={16} /> : null}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-8 lg:flex">
          <a href="#contacto" className="rounded-full bg-bio-blue px-7 py-4 text-base font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-bio-blueDark">
            Agenda una alianza
          </a>
          <div className="grid grid-cols-3 gap-2" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-bio-ink/70" />
            ))}
          </div>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bio-blue text-white lg:hidden" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {open ? (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="shell grid gap-1 py-4">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-base font-semibold text-bio-ink hover:bg-bio-sky">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto min-h-[420px] w-full max-w-[720px] animate-float lg:min-h-[560px]">
      <svg viewBox="0 0 760 620" className="absolute inset-0 h-full w-full" aria-label="Ilustración científica BioEarth">
        <rect x="444" y="78" width="96" height="58" rx="10" fill="#fff" />
        <text x="468" y="118" fill="#4584ED" fontSize="34" fontWeight="800">IA</text>
        <rect x="546" y="190" width="242" height="68" rx="14" fill="#D2D5DF" />
        <rect x="546" y="190" width="64" height="68" rx="14" fill="#FF7254" />
        <circle cx="579" cy="224" r="14" stroke="#FFD783" strokeWidth="3" />
        <line x1="590" y1="235" x2="604" y2="250" stroke="#FFD783" strokeWidth="3" />
        <circle cx="658" cy="180" r="44" fill="none" stroke="#7CB7FF" strokeWidth="7" />
        <path d="M698 166l67-34" stroke="#7CB7FF" strokeWidth="7" strokeLinecap="round" />
        <rect x="632" y="68" width="158" height="60" rx="12" fill="#fff" opacity=".92" />
        <path d="M650 86h117M650 101h117M650 116h96" stroke="#D2D5DF" strokeWidth="3" strokeLinecap="round" />
        <rect x="696" y="113" width="128" height="76" rx="8" fill="#C7C8D1" />
        <rect x="696" y="113" width="128" height="16" rx="8" fill="#8A58E8" />
        <circle cx="787" cy="121" r="4" fill="#FF7254" />
        <circle cx="800" cy="121" r="4" fill="#FFD783" />
        <rect x="730" y="144" width="36" height="26" fill="#fff" />
        <rect x="762" y="154" width="38" height="28" fill="#7CB7FF" />
        <rect x="350" y="278" width="166" height="206" rx="18" fill="#fff" />
        <rect x="336" y="278" width="166" height="206" rx="18" fill="#C9CDD8" />
        <rect x="388" y="326" width="62" height="58" rx="8" fill="#7CB7FF" />
        <path d="M418 338v35M401 356h34" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        <path d="M370 430h96M370 456h96" stroke="#8DB5F3" strokeWidth="9" />
        <path d="M335 285c-31-4-56 10-75 43-17 30-20 66-7 104l33-8c-11-35-2-66 27-93 13-12 24-18 32-18l-10-28Z" fill="#4584ED" />
        <circle cx="304" cy="251" r="28" fill="#FFC6B2" />
        <path d="M278 238c2-24 26-38 48-25 13 8 18 22 15 40-18-11-39-11-63-15Z" fill="#FFB12E" />
        <path d="M254 412l-56 54 18 18 72-54-34-18Z" fill="#FF7254" />
        <path d="M196 466l-36 28 23 17 51-22-38-23Z" fill="#FF8E2B" />
        <path d="M276 484l-18 78h44l32-90-58 12Z" fill="#8DB5F3" />
        <path d="M258 562h58c12 0 22 10 22 22h-85l5-22Z" fill="#FF8E2B" />
        <path d="M298 432c-8 50-13 88-16 114h74c18-58 31-112 40-162l-98 48Z" fill="#8DB5F3" />
        <path d="M285 342c36 29 67 41 92 36" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path d="M322 271c13 3 26 10 37 21" stroke="#303A4B" strokeWidth="4" strokeLinecap="round" />
        <path d="M602 375c26-38 71-48 119-33 49 15 84 51 104 108l-37 23c-17-37-42-61-74-70l-25 193h-61l-8-127-39 127h-67l46-184c5-19 19-31 42-37Z" fill="#FFB12E" />
        <circle cx="680" cy="303" r="32" fill="#FFC6B2" />
        <path d="M649 295c8-33 40-47 70-30 16 9 24 25 22 47-32-7-60-13-92-17Z" fill="#0E1019" />
        <path d="M575 374l-70-54 30-34 72 55-32 33Z" fill="#FFC6B2" />
        <path d="M504 321l-54-50 39-34 47 49-32 35Z" fill="#8DB5F3" />
        <path d="M724 348l58 27 11-34-52-31-17 38Z" fill="#FFC6B2" />
        <path d="M627 596l-43 19c-15 7-27 18-33 33h79c19 0 31-16 26-34l-6-18h-23Z" fill="#4584ED" />
        <path d="M728 596l-15 52h77c15 0 24-15 17-28-7-12-26-20-56-24h-23Z" fill="#4584ED" />
        <path d="M593 436h62M705 438h53" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
        <rect x="582" y="462" width="78" height="76" rx="8" fill="none" stroke="#fff" strokeWidth="3" opacity=".7" />
        <path d="M614 500c10-14 23-17 39-9-7 17-21 25-43 23 0 0 0-8 4-14Z" fill="none" stroke="#fff" strokeWidth="3" />
        <rect x="615" y="404" width="96" height="52" rx="8" fill="#8A58E8" opacity=".16" />
        <rect x="626" y="416" width="50" height="10" rx="5" fill="#8A58E8" />
        <rect x="626" y="434" width="70" height="8" rx="4" fill="#8A58E8" opacity=".55" />
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden bg-hero pt-[92px]">
      <div className="shell grid min-h-[calc(100vh-92px)] items-center gap-8 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <h1 className="max-w-3xl text-6xl font-semibold leading-[1.08] text-bio-ink sm:text-7xl lg:text-8xl">
            Ciencia visible, datos útiles, impacto sostenible.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-9 text-bio-muted">
            BioEarth desarrolla investigación científica y soluciones tecnológicas para biodiversidad, agua, clima,
            agricultura sostenible y conservación ecológica.
          </p>
          <a href="#contacto" className="mt-10 inline-flex rounded-full bg-bio-blue px-8 py-5 text-lg font-bold text-white shadow-soft transition hover:-translate-y-1 hover:bg-bio-blueDark">
            Conversemos
          </a>
        </Reveal>
        <Reveal delay={160}>
          <HeroIllustration />
        </Reveal>
      </div>
      <div className="shell grid gap-8 pb-8 sm:grid-cols-3">
        {[
          ['+48', 'Proyectos realizados'],
          ['+32', 'Investigadores'],
          ['+21', 'Aliados estratégicos'],
        ].map(([value, label], index) => (
          <Reveal key={label} delay={index * 120}>
            <div className="text-center">
              <p className="text-6xl font-semibold text-bio-ink lg:text-7xl">{value}</p>
              <p className="mt-2 font-semibold text-bio-muted">{label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function MarqueeBand({ color, direction = 'left', items }) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className={`w-[120vw] overflow-hidden ${color} py-5 text-white shadow-soft`}>
      <div className={`flex w-max gap-10 whitespace-nowrap text-5xl font-light ${direction === 'left' ? 'animate-marqueeLeft' : 'animate-marqueeRight'}`}>
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-10">
            {item}
            <span className="text-white/36">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function MovingBands() {
  return (
    <section className="pointer-events-none relative z-10 -mt-4 mb-24 h-48 overflow-hidden bg-white">
      <div className="absolute left-1/2 top-8 -translate-x-1/2 -rotate-2">
        <MarqueeBand color="bg-bio-blue" direction="left" items={marqueeItems} />
      </div>
      <div className="absolute left-1/2 top-24 -translate-x-1/2 -rotate-1">
        <MarqueeBand color="bg-bio-coral" direction="right" items={[...marqueeItems].reverse()} />
      </div>
    </section>
  );
}

function ResearchAreas() {
  return (
    <section id="lineas" className="bg-white pb-24">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[0.65fr_0.35fr] lg:items-end">
          <Reveal>
            <p className="section-label">Áreas de investigación</p>
            <h2 className="section-title mt-5">Soluciones científicas para decisiones ambientales.</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="section-copy">
              Combinamos campo, laboratorio, datos e innovación para producir evidencia clara, medible y aplicable.
            </p>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {researchAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <Reveal key={area.title} delay={index * 80}>
                <article className={`min-h-[360px] rounded-[28px] ${area.color} p-9 transition duration-300 hover:-translate-y-2 hover:shadow-lift`}>
                  <div className={`mb-12 flex h-20 w-20 items-center justify-center rounded-2xl ${area.iconColor} text-white`}>
                    <Icon size={38} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-3xl font-semibold text-bio-ink">{area.title}</h3>
                  <p className="mt-6 text-xl leading-9 text-bio-muted">{area.text}</p>
                  <button type="button" className="mt-8 flex h-12 w-12 items-center justify-center rounded-full border border-bio-ink text-bio-ink transition hover:bg-bio-ink hover:text-white" aria-label={`Ver ${area.title}`}>
                    +
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="quienes-somos" className="px-4 py-24">
      <Reveal>
        <div className="mx-auto grid max-w-[1840px] gap-10 rounded-[28px] bg-bio-cream px-8 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-28">
          <div>
            <p className="section-label">Quiénes somos</p>
            <h2 className="mt-8 text-5xl font-semibold leading-tight text-bio-ink lg:text-6xl">
              Investigación aplicada para territorios sostenibles.
            </h2>
            <div className="mt-10 grid gap-5 text-xl leading-9 text-bio-muted">
              <p>
                BioEarth es un centro de investigación enfocado en innovación científica, sostenibilidad, medio ambiente,
                tecnología y desarrollo de soluciones para problemáticas ambientales y sociales.
              </p>
              <p>
                Integramos trabajo de campo, laboratorio, analítica avanzada e inteligencia ambiental para transformar
                conocimiento científico en proyectos aplicables, medibles y sostenibles.
              </p>
            </div>
            <div className="mt-8 grid gap-4">
              {[
                'Investigación con rigor científico y visión territorial.',
                'Tecnología aplicada para comprender ecosistemas complejos.',
                'Soluciones sostenibles para instituciones, empresas y comunidades.',
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 text-xl text-bio-muted">
                  <Check className="text-bio-blue" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <AboutIllustration />
        </div>
      </Reveal>
    </section>
  );
}

function AboutIllustration() {
  return (
    <div className="relative min-h-[420px]">
      <svg viewBox="0 0 760 480" className="absolute inset-0 h-full w-full" aria-label="Equipo BioEarth celebrando ciencia">
        <path d="M75 382c78-94 184-142 318-142 132 0 229 47 291 140" fill="#fff" opacity=".55" />
        <circle cx="160" cy="366" r="72" fill="#4584ED" opacity=".12" />
        <circle cx="580" cy="364" r="82" fill="#FF7254" opacity=".1" />
        <path d="M202 262c-42 28-59 76-51 144h68l23-108-40-36Z" fill="#3159BE" />
        <circle cx="224" cy="196" r="34" fill="#FFC6B2" />
        <path d="M196 199c6-42 38-64 76-44 13 7 21 20 25 39-35-5-67-3-101 5Z" fill="#E7A724" />
        <path d="M178 247c-44-5-77-26-98-62" stroke="#D7362D" strokeWidth="18" strokeLinecap="round" />
        <path d="M234 244c28 20 54 53 77 98" stroke="#D7362D" strokeWidth="18" strokeLinecap="round" />
        <path d="M190 238h72l28 116-93 14-7-130Z" fill="#D9472F" />
        <path d="M362 184c-31 46-42 101-33 165h82c16-68 14-124-5-168l-44 3Z" fill="#8E4A24" />
        <circle cx="389" cy="113" r="36" fill="#FFC6B2" />
        <path d="M348 184c-31-21-46-55-44-102" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
        <path d="M417 183c33-18 52-47 58-87" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
        <path d="M343 177h76l20 108-113 2 17-110Z" fill="#fff" />
        <path d="M353 100c9-43 55-55 83-22 12 14 15 30 12 49-37-10-68-19-95-27Z" fill="#EF7A38" />
        <path d="M508 254c-34 31-48 80-43 148h78l28-118-63-30Z" fill="#0F1556" />
        <circle cx="542" cy="198" r="34" fill="#FFC6B2" />
        <path d="M510 191c14-38 48-51 84-33 15 8 25 22 29 43-37-7-74-10-113-10Z" fill="#303A4B" />
        <path d="M498 246c-49-5-86-25-109-61" stroke="#F2BD20" strokeWidth="18" strokeLinecap="round" />
        <path d="M560 244c28 19 58 50 89 92" stroke="#F2BD20" strokeWidth="18" strokeLinecap="round" />
        <path d="M501 239h83l28 121-110 15-1-136Z" fill="#F2BD20" />
        <path d="M642 258c44 9 74 40 90 93l-51 21-48-93 9-21Z" fill="#2C7B35" />
        <circle cx="661" cy="203" r="33" fill="#FFC6B2" />
        <path d="M631 200c6-34 36-53 70-42 17 5 28 18 34 39-34 1-70 2-104 3Z" fill="#E7A724" />
        <path d="M621 253h80l2 122-101-6 19-116Z" fill="#2C7B35" />
        <path d="M700 246c27-23 42-57 44-102" stroke="#2C7B35" strokeWidth="18" strokeLinecap="round" />
        <path d="M208 409h54M354 386h69M526 423h70M632 410h72" stroke="#303A4B" strokeWidth="7" strokeLinecap="round" opacity=".18" />
        <path d="M111 125l14 32 31-14M604 108l9 35 32-18M457 72l-14 40M436 94h41" stroke="#4584ED" strokeWidth="5" strokeLinecap="round" />
        <circle cx="92" cy="272" r="7" stroke="#FF7254" strokeWidth="5" fill="none" />
        <circle cx="636" cy="286" r="7" stroke="#FF7254" strokeWidth="5" fill="none" />
        <path d="M299 72l10 30M288 91h31" stroke="#FF7254" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Projects() {
  return (
    <section id="proyectos" className="bg-white py-24">
      <div className="shell">
        <Reveal>
          <p className="section-label">Portafolio</p>
          <h2 className="section-title mt-5 max-w-4xl">Investigación con evidencia y resultados visibles.</h2>
        </Reveal>
        <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.title} delay={index * 80}>
              <article className="group overflow-hidden rounded-[28px] bg-white shadow-soft transition hover:-translate-y-2 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={project.image} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-bold text-bio-blue">{project.category}</span>
                </div>
                <div className="p-8">
                  <p className="font-bold text-bio-coral">{project.status}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-bio-ink">{project.title}</h3>
                  <p className="mt-4 min-h-24 text-lg leading-8 text-bio-muted">{project.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Impact() {
  return (
    <section className="bg-bio-blue py-20 text-white">
      <div className="shell grid gap-8 md:grid-cols-4">
        {[
          [48, 'Proyectos realizados', FlaskConical],
          [32, 'Investigadores', Users],
          [76, 'Publicaciones', BookOpen],
          [21, 'Aliados estratégicos', Handshake],
        ].map(([value, label, Icon], index) => (
          <Reveal key={label} delay={index * 80}>
            <article className="rounded-[28px] bg-white/12 p-7 backdrop-blur">
              <Icon size={32} />
              <p className="mt-8 text-5xl font-semibold">{value}+</p>
              <p className="mt-2 text-white/72">{label}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Team() {
  return (
    <section id="equipo" className="bg-white py-24">
      <div className="shell">
        <Reveal>
          <p className="section-label">Equipo</p>
          <h2 className="section-title mt-5 max-w-4xl">Perfiles científicos para proyectos de alta exigencia.</h2>
        </Reveal>
        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((person, index) => (
            <Reveal key={person.name} delay={index * 100}>
              <article className="rounded-[28px] bg-bio-sky p-7 text-center transition hover:-translate-y-2 hover:shadow-lift">
                <img src={person.image} alt={person.name} className="mx-auto h-44 w-44 rounded-full object-cover" />
                <h3 className="mt-7 text-2xl font-semibold text-bio-ink">{person.name}</h3>
                <p className="mt-2 font-bold text-bio-blue">{person.role}</p>
                <p className="mt-3 leading-7 text-bio-muted">{person.specialty}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contacto" className="px-4 py-24">
      <div className="mx-auto max-w-[1840px] rounded-[28px] bg-bio-cream p-6 lg:p-14">
        <div className="shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <p className="section-label">Contacto</p>
            <h2 className="mt-5 text-5xl font-semibold leading-tight text-bio-ink lg:text-6xl">
              Hablemos de investigación, alianzas y nuevos proyectos.
            </h2>
            <div className="mt-10 grid gap-5">
              {[
                [MapPin, contactDetails.address],
                [Mail, contactDetails.email],
                [Phone, contactDetails.phone],
                [Target, `${contactDetails.business} · NIT ${contactDetails.nit}`],
              ].map(([Icon, text]) => (
                <div key={text} className="flex gap-4 text-lg text-bio-muted">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-bio-blue shadow-soft">
                    <Icon size={22} />
                  </div>
                  <span className="self-center">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <form className="rounded-[28px] bg-white p-7 shadow-soft lg:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 font-semibold text-bio-ink">
                  Nombre
                  <input className="rounded-2xl border border-slate-200 px-5 py-4 font-normal outline-none focus:border-bio-blue focus:ring-4 focus:ring-bio-sky" placeholder="Tu nombre" />
                </label>
                <label className="grid gap-2 font-semibold text-bio-ink">
                  Correo
                  <input type="email" className="rounded-2xl border border-slate-200 px-5 py-4 font-normal outline-none focus:border-bio-blue focus:ring-4 focus:ring-bio-sky" placeholder="nombre@empresa.com" />
                </label>
              </div>
              <label className="mt-5 grid gap-2 font-semibold text-bio-ink">
                Organización
                <input className="rounded-2xl border border-slate-200 px-5 py-4 font-normal outline-none focus:border-bio-blue focus:ring-4 focus:ring-bio-sky" placeholder="Institución, empresa o comunidad" />
              </label>
              <label className="mt-5 grid gap-2 font-semibold text-bio-ink">
                Mensaje
                <textarea rows="6" className="resize-none rounded-2xl border border-slate-200 px-5 py-4 font-normal outline-none focus:border-bio-blue focus:ring-4 focus:ring-bio-sky" placeholder="Cuéntanos sobre el proyecto o alianza que tienes en mente" />
              </label>
              <button type="button" className="mt-6 inline-flex items-center gap-2 rounded-full bg-bio-blue px-8 py-5 font-bold text-white transition hover:bg-bio-blueDark">
                Enviar mensaje <Send size={19} />
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white py-12">
      <div className="shell flex flex-col gap-6 border-t border-slate-200 pt-10 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p className="text-bio-muted">© 2026 BioEarth. Todos los derechos reservados.</p>
        <div className="flex gap-3 text-bio-blue">
          {[Linkedin, Instagram, Facebook, Twitter].map((Icon) => (
            <a key={Icon.name} href="#inicio" className="flex h-11 w-11 items-center justify-center rounded-full bg-bio-sky" aria-label="Red social BioEarth">
              <Icon size={19} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function BackToTop() {
  return (
    <a href="#inicio" className="fixed bottom-7 right-7 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-bio-blue text-white shadow-soft transition hover:-translate-y-1" aria-label="Volver arriba">
      <ArrowUp size={22} />
    </a>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <MovingBands />
        <ResearchAreas />
        <About />
        <Projects />
        <Impact />
        <Team />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
