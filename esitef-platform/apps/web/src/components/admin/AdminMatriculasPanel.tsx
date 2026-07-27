"use client";

import { useMemo, useState } from "react";
import type {
  AdminCourseOption,
  AdminEnrollmentUser,
} from "@/lib/admin-enrollments";

type Props = {
  courses: AdminCourseOption[];
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminMatriculasPanel({ courses }: Props) {
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [user, setUser] = useState<AdminEnrollmentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredCourses = useMemo(() => {
    const q = courseFilter.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [courses, courseFilter]);

  async function fetchUser(emailValue: string) {
    const res = await fetch(
      `/api/admin/enrollments?email=${encodeURIComponent(emailValue.trim())}`
    );
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      user?: AdminEnrollmentUser;
    };
    if (!res.ok || !data.user) {
      throw new Error(data.error ?? "Usuario no encontrado.");
    }
    return data.user;
  }

  async function lookupUser(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setMessage(null);
    setUser(null);
    try {
      setUser(await fetchUser(email));
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al buscar.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function assignCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !courseId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), courseId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        user?: AdminEnrollmentUser;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo asignar el curso.");
      }
      if (data.user) setUser(data.user);
      setMessage({
        type: "success",
        text: data.message ?? "Curso asignado.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function setEnrollmentStatus(
    enrollmentId: string,
    status: "active" | "cancelled"
  ) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, status }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo actualizar.");
      }
      setUser(await fetchUser(email));
      setMessage({
        type: "success",
        text:
          status === "active"
            ? "Matrícula reactivada."
            : "Acceso cancelado.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">Asignar curso</h2>
      <p className="admin-table-muted" style={{ marginTop: 0 }}>
        Para compras legacy u olvidadas: busca al alumno por email y asígnale
        acceso directo (sin crear pedido).
      </p>

      {message && (
        <div className={`admin-flash admin-flash--${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="admin-filters" onSubmit={lookupUser}>
        <input
          type="email"
          name="email"
          placeholder="email@alumno.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
        <button type="submit" disabled={loading || !email.trim()}>
          Buscar usuario
        </button>
      </form>

      {user && (
        <>
          <div className="admin-matricula-user">
            <strong>{user.name || "Sin nombre"}</strong>
            <span className="admin-table-muted">{user.email}</span>
          </div>

          <form className="admin-matricula-assign" onSubmit={assignCourse}>
            <label className="admin-matricula-label">
              Filtrar cursos
              <input
                type="search"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                placeholder="Título o slug…"
              />
            </label>
            <label className="admin-matricula-label">
              Curso
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                <option value="">Selecciona un curso…</option>
                {filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {!c.published ? " (no publicado)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={loading || !courseId}
            >
              Asignar acceso
            </button>
          </form>

          <h3 className="admin-card-title" style={{ marginTop: "1.5rem" }}>
            Cursos del alumno
          </h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Estado</th>
                  <th>Desde</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {user.enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-table-muted">
                      Sin matrículas todavía.
                    </td>
                  </tr>
                ) : (
                  user.enrollments.map((row) => (
                    <tr key={row.enrollmentId}>
                      <td>
                        <strong>{row.courseTitle}</strong>
                        <div className="admin-table-muted">{row.courseSlug}</div>
                      </td>
                      <td>
                        <span
                          className={`admin-badge admin-badge--${
                            row.status === "active" ? "paid" : "pending"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>{formatDate(row.enrolledAt)}</td>
                      <td>
                        {row.status === "active" ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger"
                            disabled={loading}
                            onClick={() =>
                              setEnrollmentStatus(row.enrollmentId, "cancelled")
                            }
                          >
                            Quitar acceso
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn admin-btn--secondary"
                            disabled={loading}
                            onClick={() =>
                              setEnrollmentStatus(row.enrollmentId, "active")
                            }
                          >
                            Reactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
