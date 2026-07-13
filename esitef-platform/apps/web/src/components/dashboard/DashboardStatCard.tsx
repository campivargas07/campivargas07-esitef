type Props = {
  value: number | string;
  label: string;
  trend?: string;
  icon: "courses" | "progress" | "completed" | "certificates" | "week";
  accent?: "purple" | "teal" | "green" | "amber";
};

function StatIcon({ type }: { type: Props["icon"] }) {
  const paths: Record<Props["icon"], string> = {
    courses:
      "M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v2H8v-2zm0 3h5v2H8v-2z",
    progress: "M8 5v14l11-7L8 5z",
    completed:
      "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
    certificates:
      "M5 4h14v2H5V4zm0 4h10v2H5V8zm0 4h14v2H5v-2zm0 4h8v2H5v-2z",
    week: "M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v5l4 2-.8 1.6L11 13V7h2z",
  };
  return (
    <svg className="dashboard-stat-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={paths[type]} />
    </svg>
  );
}

export function DashboardStatCard({ value, label, trend, icon, accent = "purple" }: Props) {
  return (
    <div className={`dashboard-stat dashboard-stat--grid dashboard-stat--${accent}`}>
      <div className="dashboard-stat-top">
        <span className="dashboard-stat-label">{label}</span>
        <StatIcon type={icon} />
      </div>
      <strong>{value}</strong>
      {trend && <em className="dashboard-stat-trend">{trend}</em>}
    </div>
  );
}
