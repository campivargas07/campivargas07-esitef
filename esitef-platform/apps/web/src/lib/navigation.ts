export const LOGO_URL =
  "/img/Esitef_logo_icon_preloadeer.png";

export const PAISES = [
  { slug: "espana", title: "España" },
  { slug: "peru", title: "Perú" },
  { slug: "argentina", title: "Argentina" },
  { slug: "mexico", title: "México" },
  { slug: "colombia", title: "Colombia" },
  { slug: "uruguay", title: "Uruguay" },
] as const;

export const ONLINE_LINKS = [
  { href: "/formaciones", label: "Formaciones" },
  { href: "/libros", label: "Libros" },
  { href: "/blog", label: "Blog" },
  { href: "/articulos", label: "Artículos" },
  { href: "/mentorias", label: "Mentorías" },
] as const;

export const MARQUEE_ITEMS = [
  "Media",
  "NovaTech",
  "Pluto Inc",
  "VitaHealth",
  "BoxMedia",
] as const;

export const OFRECEMOS_ITEMS = [
  {
    num: "01",
    title: "Nuestras formaciones",
    desc: "Capacítate con cursos actualizados y eleva tu nivel profesional en fisioterapia.",
    img: "/img/nuestras-formaciones-1.webp",
    href: "/formaciones-presenciales",
  },
  {
    num: "02",
    title: "Mentorías con Tomás",
    desc: "Guía personalizada para llevar tu clínica o carrera profesional al siguiente nivel.",
    img: "/img/mentorias-tomas.webp",
    href: "/mentorias",
  },
  {
    num: "03",
    title: "Sesiones Online con Tomás",
    desc: "Consultas y sesiones online para aplicar el ejercicio terapéutico con tus pacientes.",
    img: "https://images.unsplash.com/photo-1586439496903-c96e9f18f212?w=900&h=1200&fit=crop&q=80&auto=format",
    href: "/sesiones-online",
  },
  {
    num: "04",
    title: "Talleres privados clinicas / Instituciones",
    desc: "Entrenamientos prácticos y presenciales para instituciones y grupos de salud.",
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&h=1200&fit=crop&q=80&auto=format",
    href: "/talleres-privados-clinicas",
  },
  {
    num: "05",
    title: "Blog",
    desc: "Artículos y actualización científica para tu práctica diaria.",
    img: "https://images.unsplash.com/photo-1456513080800-7d93acfdaefe?w=900&h=1200&fit=crop&q=80&auto=format",
    href: "/blog",
  },
] as const;

export const HERO_WORDS = ["avanza", "trasciende", "inspira"] as const;
