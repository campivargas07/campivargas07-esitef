function MetaIcon({ type }: { type: "users" | "clock" | "lifetime" | "devices" }) {
  switch (type) {
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "lifetime":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
  }
}

type Props = {
  context: "desktop" | "mobile";
  enrolledCount: number;
  durationLabel: string;
};

export function LandingHeroMeta({ context, enrolledCount, durationLabel }: Props) {
  const enrolledLabel =
    enrolledCount === 1 ? "1 inscrito" : `${enrolledCount} inscritos`;

  const items = [
    { label: "Inscritos", value: enrolledLabel, icon: "users" as const },
    { label: "Duración", value: durationLabel, icon: "clock" as const },
    { label: "Acceso de por vida", value: "", icon: "lifetime" as const },
    {
      label: "Acceso en dispositivos móviles y TV",
      value: "",
      icon: "devices" as const,
    },
  ];

  return (
    <div
      className={`landing-hero__meta-panel landing-hero__meta-panel--${context}`}
    >
      <ul className="landing-hero__meta" aria-label="Datos del curso">
        {items.map((item) => (
          <li key={item.label} className="landing-hero__meta-item">
            <span className="landing-hero__meta-icon" aria-hidden="true">
              <MetaIcon type={item.icon} />
            </span>
            <span className="landing-hero__meta-text">
              <strong className="landing-hero__meta-label">{item.label}</strong>
              {item.value ? (
                <span className="landing-hero__meta-value">{item.value}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
