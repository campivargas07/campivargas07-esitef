import Image from "next/image";
import Link from "next/link";
import type { DashboardTab } from "@/lib/dashboard";

const LOGO =
  "/img/Esitef_logo_icon_preloadeer.png";

export type NavIcon =
  | "home"
  | "explore"
  | "more"
  | "courses"
  | "quiz"
  | "notes"
  | "discussions"
  | "certificates"
  | "orders"
  | "profile"
  | "preferences";

export function NavIconSvg({ type }: { type: NavIcon }) {
  const paths: Record<NavIcon, string> = {
    home: "M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z",
    explore:
      "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4.5l3.5 8.5-3.5-1.8-3.5 1.8L12 6.5z",
    more: "M12 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z",
    courses:
      "M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v2H8v-2zm0 3h5v2H8v-2z",
    quiz: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
    notes:
      "M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zm8 1.5V8h2.5L14 5.5zM8 11h8v2H8v-2zm0 4h5v2H8v-2z",
    discussions:
      "M4 5h16v10H7.8L5 18.2V5zm2 2v6.6l1.2-1.2H18V7H6z",
    certificates:
      "M5 4h14v2H5V4zm0 4h10v2H5V8zm0 4h14v2H5v-2zm0 4h8v2H5v-2z",
    orders:
      "M7 4h-2v16h14V4h-2v2H7V4zm0 4h10v2H7V8zm0 4h7v2H7v-2z",
    profile:
      "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0H5z",
    preferences:
      "M12 8a4 4 0 110 8 4 4 0 010-8zm8.94 3A7.96 7.96 0 0012 4.06 7.96 7.96 0 003.06 11H3v2h.06A7.96 7.96 0 0012 19.94 7.96 7.96 0 0020.94 13H21v-2h-.06z",
  };
  return (
    <svg className="dashboard-nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={paths[type]} />
    </svg>
  );
}

export const PRIMARY_NAV: {
  tab: DashboardTab;
  href: string;
  label: string;
  icon: NavIcon;
}[] = [
  { tab: "home", href: "/dashboard", label: "Inicio", icon: "home" },
  { tab: "courses", href: "/dashboard?tab=courses", label: "Cursos", icon: "courses" },
  { tab: "notes", href: "/dashboard?tab=notes", label: "Notas", icon: "notes" },
  {
    tab: "discussions",
    href: "/dashboard?tab=discussions",
    label: "Discusiones",
    icon: "discussions",
  },
];

export const SECONDARY_NAV: {
  tab: DashboardTab;
  href: string;
  label: string;
  icon: NavIcon;
}[] = [
  {
    tab: "quiz-attempts",
    href: "/dashboard?tab=quiz-attempts",
    label: "Intentos de quiz",
    icon: "quiz",
  },
  {
    tab: "certificates",
    href: "/dashboard?tab=certificates",
    label: "Certificados",
    icon: "certificates",
  },
  { tab: "orders", href: "/dashboard?tab=orders", label: "Compras", icon: "orders" },
  { tab: "profile", href: "/dashboard?tab=profile", label: "Mi perfil", icon: "profile" },
  {
    tab: "preferences",
    href: "/dashboard?tab=preferences",
    label: "Accesibilidad",
    icon: "preferences",
  },
];

export function DashboardBrand({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={className ?? "dashboard-brand"}>
      <Image src={LOGO} alt="" width={32} height={32} unoptimized />
      <span>ESITEF Online</span>
    </Link>
  );
}

type Props = {
  activeTab: DashboardTab;
};

export function DashboardNav({ activeTab }: Props) {
  return (
    <nav className="dashboard-nav" aria-label="Panel de alumno">
      <DashboardBrand />

      <div className="dashboard-nav-group">
        {PRIMARY_NAV.map((item) => (
          <Link
            key={item.tab}
            href={item.href}
            className={activeTab === item.tab ? "is-active" : undefined}
            aria-current={activeTab === item.tab ? "page" : undefined}
          >
            <NavIconSvg type={item.icon} />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="dashboard-nav-group dashboard-nav-group--secondary">
        {SECONDARY_NAV.map((item) => (
          <Link
            key={item.tab}
            href={item.href}
            className={activeTab === item.tab ? "is-active" : undefined}
            aria-current={activeTab === item.tab ? "page" : undefined}
          >
            <NavIconSvg type={item.icon} />
            {item.label}
          </Link>
        ))}
      </div>

      <Link href="/formaciones" className="dashboard-nav-explore">
        <NavIconSvg type="courses" />
        Explorar formaciones
      </Link>
    </nav>
  );
}

const MOBILE_NAV: {
  tab?: DashboardTab;
  href: string;
  label: string;
  icon: NavIcon;
  external?: boolean;
}[] = [
  { tab: "home", href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/formaciones", label: "Explorar", icon: "explore", external: true },
  { tab: "courses", href: "/dashboard?tab=courses", label: "Cursos", icon: "courses" },
  { tab: "profile", href: "/dashboard?tab=profile", label: "Perfil", icon: "profile" },
  { tab: "notes", href: "/dashboard?tab=notes", label: "Más", icon: "more" },
];

const MORE_TABS: DashboardTab[] = [
  "notes",
  "discussions",
  "quiz-attempts",
  "certificates",
  "orders",
  "preferences",
];

export const TAB_TITLES: Record<DashboardTab, string> = {
  home: "Inicio",
  courses: "Mis cursos",
  notes: "Notas",
  discussions: "Discusiones",
  "quiz-attempts": "Intentos de quiz",
  certificates: "Certificados",
  orders: "Compras",
  profile: "Mi perfil",
  preferences: "Accesibilidad",
};

export function DashboardMobileNav({ activeTab }: Props) {
  return (
    <nav className="dashboard-mobile-nav" aria-label="Navegación principal">
      {MOBILE_NAV.map((item) => {
        const isMore = item.icon === "more";
        const isActive = isMore
          ? MORE_TABS.includes(activeTab)
          : item.tab === activeTab;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "is-active" : undefined}
            aria-current={isActive ? "page" : undefined}
          >
            <NavIconSvg type={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

