type IllustrationType = "courses" | "certificates" | "orders" | "quiz" | "notes" | "discussions";

type Props = {
  type: IllustrationType;
};

export function DashboardEmptyIllustration({ type }: Props) {
  const labels: Record<IllustrationType, string> = {
    courses: "Libros",
    certificates: "Diploma",
    orders: "Carrito",
    quiz: "Quiz",
    notes: "Notas",
    discussions: "Chat",
  };

  return (
    <svg
      className="dashboard-empty-illustration"
      viewBox="0 0 120 100"
      aria-hidden
      role="img"
    >
      <rect x="20" y="15" width="80" height="60" rx="8" fill="#f0f1f5" />
      <rect x="30" y="28" width="40" height="6" rx="3" fill="#3b42d9" opacity="0.6" />
      <rect x="30" y="40" width="60" height="4" rx="2" fill="#d1d5db" />
      <rect x="30" y="50" width="50" height="4" rx="2" fill="#d1d5db" />
      <circle cx="85" cy="55" r="18" fill="#eff0ff" stroke="#3b42d9" strokeWidth="2" />
      <text x="85" y="60" textAnchor="middle" fontSize="10" fill="#3b42d9" fontWeight="600">
        {labels[type].slice(0, 1)}
      </text>
    </svg>
  );
}
