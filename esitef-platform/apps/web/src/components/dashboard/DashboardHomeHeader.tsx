import Link from "next/link";

type Props = {
  displayName: string;
  email?: string | null;
};

function initials(name: string, email?: string | null) {
  const source = name.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function DashboardHomeHeader({ displayName, email }: Props) {
  return (
    <header className="dashboard-home-header">
      <h1 className="dashboard-greeting-title">Hola, {displayName} 👋</h1>
      <div className="dashboard-home-header-actions">
        <button
          type="button"
          className="dashboard-icon-btn"
          aria-label="Notificaciones (próximamente)"
          disabled
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-6V11a7 7 0 00-5.6-6.86V3a1.4 1.4 0 00-2.8 0v1.14A7 7 0 006 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <span className="dashboard-icon-btn-dot" aria-hidden />
        </button>
        <Link
          href="/dashboard?tab=profile"
          className="dashboard-avatar-link"
          aria-label="Mi perfil"
        >
          <span className="dashboard-avatar-sm">{initials(displayName, email)}</span>
        </Link>
      </div>
    </header>
  );
}
