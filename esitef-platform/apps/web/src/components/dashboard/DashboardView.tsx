import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AccessibilityPreferencesPanel } from "@/components/AccessibilityPreferencesPanel";
import { DashboardContinueRow } from "@/components/dashboard/DashboardContinueRow";
import { DashboardCoursesPanel } from "@/components/dashboard/DashboardCoursesPanel";
import { DashboardEmptyIllustration } from "@/components/dashboard/DashboardEmptyIllustration";
import { DashboardBrand, DashboardMobileNav, DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import {
  formatDashboardDate,
  formatMoney,
  type DashboardTab,
  type StudentDashboard,
} from "@/lib/dashboard";

type User = {
  name?: string | null;
  email?: string | null;
};

type Props = {
  user: User;
  data: StudentDashboard;
  activeTab: DashboardTab;
  a11yCookie?: string | null;
};

function orderStatusClass(status: string) {
  if (status === "paid") return "is-paid";
  if (status === "pending") return "is-pending";
  return "is-failed";
}

function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    paid: "Pagado",
    pending: "Pendiente",
    failed: "Fallido",
    refunded: "Reembolsado",
    cancelled: "Cancelado",
  };
  return labels[status] ?? status;
}

function continueCourses(data: StudentDashboard) {
  return [...data.courses]
    .filter((c) => c.status !== "completed")
    .sort((a, b) => {
      const rank = (s: (typeof a)["status"]) =>
        s === "in_progress" ? 0 : s === "not_started" ? 1 : 2;
      return rank(a.status) - rank(b.status);
    });
}

export function DashboardView({ user, data, activeTab, a11yCookie }: Props) {
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Alumno";
  const weekTrend =
    data.stats.lessonsCompletedThisWeek > 0
      ? `+${data.stats.lessonsCompletedThisWeek} esta semana`
      : undefined;
  const activeCourses = continueCourses(data);

  return (
    <div className="dashboard-page">
      <header className="dashboard-mobile-header">
        <DashboardBrand className="dashboard-brand dashboard-brand--mobile" />
        <Link href="/dashboard?tab=profile" className="dashboard-mobile-profile">
          Perfil
        </Link>
      </header>

      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <DashboardNav activeTab={activeTab} />
          <div className="dashboard-sidebar-footer">
            <SignOutButton className="btn btn-outline dashboard-signout" />
          </div>
        </aside>

        <div className="dashboard-main">
          {activeTab === "home" && (
            <>
              <header className="dashboard-greeting">
                <h1>Hola, {displayName} 👋</h1>
              </header>

              <div className="dashboard-stats dashboard-stats--home" aria-label="Resumen">
                <DashboardStatCard
                  value={data.stats.enrolled}
                  label="Cursos matriculados"
                  icon="courses"
                />
                <DashboardStatCard
                  value={data.stats.inProgress}
                  label="Activos"
                  icon="progress"
                  trend={weekTrend}
                />
              </div>

              <section className="dashboard-home-section" aria-labelledby="continue-title">
                <h2 id="continue-title">Continuar aprendiendo</h2>
                {activeCourses.length === 0 ? (
                  <div className="dashboard-empty dashboard-empty--inline">
                    <DashboardEmptyIllustration type="courses" />
                    <h3>Aún no tienes cursos activos</h3>
                    <p>Explora nuestras formaciones y matricúlate para empezar.</p>
                    <Link href="/formaciones" className="btn btn-primary">
                      Ver formaciones
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-continue-list">
                    {activeCourses.map((course) => (
                      <DashboardContinueRow key={course.courseId} course={course} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab !== "home" && (
            <section
              className="dashboard-panel"
              aria-labelledby="dashboard-panel-title"
            >
              {activeTab === "courses" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Mis cursos</h2>
                    <Link href="/formaciones" className="btn btn-outline">
                      Explorar cursos
                    </Link>
                  </div>
                  {data.courses.length === 0 ? (
                    <div className="dashboard-empty">
                      <DashboardEmptyIllustration type="courses" />
                      <h3>Aún no tienes cursos</h3>
                      <p>
                        Explora nuestras formaciones online y matricúlate para
                        empezar a aprender.
                      </p>
                      <Link href="/formaciones" className="btn btn-primary">
                        Ver formaciones
                      </Link>
                    </div>
                  ) : (
                    <DashboardCoursesPanel
                      courses={data.courses}
                      notStartedCount={data.stats.notStarted}
                    />
                  )}
                </>
              )}

              {activeTab === "quiz-attempts" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Intentos de quiz</h2>
                  </div>
                  {data.quizAttempts.length === 0 ? (
                    <div className="dashboard-empty">
                      <DashboardEmptyIllustration type="quiz" />
                      <h3>Sin intentos registrados</h3>
                      <p>Completa un quiz en cualquier curso para ver tus resultados aquí.</p>
                    </div>
                  ) : (
                    <ul className="dashboard-list">
                      {data.quizAttempts.map((a) => (
                        <li key={a.id} className="dashboard-list-item">
                          <div>
                            <strong>{a.quizTitle}</strong>
                            <span>
                              {a.courseTitle} · {formatDashboardDate(a.attemptedAt)} ·
                              Puntuación {a.score}%
                            </span>
                          </div>
                          <span
                            className={`dashboard-order-status ${a.passed ? "is-paid" : "is-failed"}`}
                          >
                            {a.passed ? "Aprobado" : "No aprobado"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === "notes" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Mis notas</h2>
                  </div>
                  {data.notes.length === 0 ? (
                    <div className="dashboard-empty">
                      <DashboardEmptyIllustration type="notes" />
                      <h3>Sin notas todavía</h3>
                      <p>
                        Toma notas mientras ves una lección desde el panel del aula.
                      </p>
                    </div>
                  ) : (
                    <ul className="dashboard-list">
                      {data.notes.map((note) => (
                        <li key={note.id} className="dashboard-list-item dashboard-list-item--stack">
                          <div>
                            <strong>{note.courseTitle}</strong>
                            <span>
                              {note.lessonTitle}
                              {note.timestampSeconds != null
                                ? ` · ${Math.floor(note.timestampSeconds / 60)}:${String(note.timestampSeconds % 60).padStart(2, "0")}`
                                : ""}
                            </span>
                            <p className="dashboard-note-preview">{note.contentHtml}</p>
                          </div>
                          <Link
                            href={`/aprender/${note.courseSlug}/${note.lessonId}`}
                            className="btn btn-outline"
                          >
                            Ir a lección
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === "discussions" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Mis discusiones</h2>
                  </div>
                  {data.discussions.length === 0 ? (
                    <div className="dashboard-empty">
                      <DashboardEmptyIllustration type="discussions" />
                      <h3>Sin discusiones</h3>
                      <p>
                        Haz preguntas en el panel de discusión de cualquier lección.
                      </p>
                    </div>
                  ) : (
                    <ul className="dashboard-list">
                      {data.discussions.map((d) => (
                        <li key={d.id} className="dashboard-list-item dashboard-list-item--stack">
                          <div>
                            <strong>{d.courseTitle}</strong>
                            <span>
                              {d.lessonTitle} · {formatDashboardDate(d.createdAt)}
                              {d.replyCount > 0 ? ` · ${d.replyCount} respuestas` : ""}
                            </span>
                            <p className="dashboard-note-preview">{d.contentHtml}</p>
                          </div>
                          <Link
                            href={`/aprender/${d.courseSlug}/${d.lessonId}`}
                            className="btn btn-outline"
                          >
                            Ver lección
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === "certificates" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Certificados</h2>
                  </div>
                  {data.certificates.length === 0 ? (
                    <div className="dashboard-empty">
                      <DashboardEmptyIllustration type="certificates" />
                      <h3>Sin certificados todavía</h3>
                      <p>
                        Completa un curso y aprueba el quiz para obtener tu
                        certificado.
                      </p>
                    </div>
                  ) : (
                    <ul className="dashboard-list">
                      {data.certificates.map((cert) => (
                        <li key={cert.code} className="dashboard-list-item">
                          <div>
                            <strong>{cert.courseTitle}</strong>
                            <span>
                              Emitido el {formatDashboardDate(cert.issuedAt)} ·{" "}
                              {cert.code}
                            </span>
                          </div>
                          <Link
                            href={`/certificados/${cert.courseSlug}`}
                            className="btn btn-outline"
                          >
                            Ver certificado
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === "orders" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Historial de compras</h2>
                  </div>
                  {data.orders.length === 0 ? (
                    <div className="dashboard-empty">
                      <DashboardEmptyIllustration type="orders" />
                      <h3>Sin compras registradas</h3>
                      <p>
                        Las compras realizadas en la plataforma aparecerán aquí con
                        su estado de pago.
                      </p>
                    </div>
                  ) : (
                    <ul className="dashboard-list">
                      {data.orders.map((order) => (
                        <li key={order.id} className="dashboard-list-item">
                          <div>
                            <strong>
                              {order.items.map((i) => i.title).join(", ") ||
                                "Pedido"}
                            </strong>
                            <span>
                              {formatDashboardDate(order.createdAt)} ·{" "}
                              {formatMoney(order.totalCents, order.currency)}
                              {order.provider ? ` · ${order.provider}` : ""}
                            </span>
                          </div>
                          <span
                            className={`dashboard-order-status ${orderStatusClass(order.status)}`}
                          >
                            {orderStatusLabel(order.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === "profile" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Mi perfil</h2>
                  </div>
                  <dl className="dashboard-profile-card">
                    <div className="dashboard-profile-row">
                      <dt>Nombre</dt>
                      <dd>{user.name?.trim() || "—"}</dd>
                    </div>
                    <div className="dashboard-profile-row">
                      <dt>Email</dt>
                      <dd>{user.email ?? "—"}</dd>
                    </div>
                    <div className="dashboard-profile-row">
                      <dt>Cursos activos</dt>
                      <dd>{data.stats.enrolled}</dd>
                    </div>
                    <div className="dashboard-profile-row">
                      <dt>Lecciones esta semana</dt>
                      <dd>{data.stats.lessonsCompletedThisWeek}</dd>
                    </div>
                  </dl>
                  <p className="dashboard-profile-hint">
                    Para cambiar tu contraseña, usa{" "}
                    <a
                      href="https://esitef.com/online/wp-login.php?action=lostpassword"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      recuperar contraseña en WordPress
                    </a>{" "}
                    hasta que migremos el perfil completo.
                  </p>
                  <div className="dashboard-profile-signout">
                    <SignOutButton className="btn btn-outline dashboard-signout" />
                  </div>
                </>
              )}

              {activeTab === "preferences" && (
                <>
                  <div className="dashboard-panel-header">
                    <h2 id="dashboard-panel-title">Accesibilidad y preferencias</h2>
                  </div>
                  <AccessibilityPreferencesPanel initialCookie={a11yCookie} />
                </>
              )}
            </section>
          )}
        </div>
      </div>
      <DashboardMobileNav activeTab={activeTab} />
    </div>
  );
}
