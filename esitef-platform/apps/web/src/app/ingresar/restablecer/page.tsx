"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { passwordResetErrorMessages } from "@/lib/auth/password-reset-messages";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, passwordConfirm }),
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);

    if (!res.ok) {
      const code = data?.error as keyof typeof passwordResetErrorMessages | undefined;
      setError(
        code && passwordResetErrorMessages[code]
          ? passwordResetErrorMessages[code]
          : passwordResetErrorMessages.failed
      );
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/ingresar"), 2500);
  }

  if (!token) {
    return (
      <main className="login-main" id="login-main">
        <div className="login-form auth-panels">
          <section className="auth-panel auth-panel--login">
            <h1 className="login-form__title">Enlace no válido</h1>
            <p className="login-form__subtitle">
              Solicita un nuevo enlace desde la página de recuperación.
            </p>
            <nav className="login-links">
              <Link href="/ingresar/olvidar">Recuperar contraseña</Link>
            </nav>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="login-main" id="login-main">
      <Link href="/ingresar" className="login-close" aria-label="Volver">
        <span className="login-close__line" />
        <span className="login-close__line" />
      </Link>

      <div className="login-form auth-panels">
        <section className="auth-panel auth-panel--login" aria-labelledby="reset-title">
          <h1 className="login-form__title" id="reset-title">
            Nueva contraseña
          </h1>
          <p className="login-form__subtitle">
            Elige una contraseña segura para tu cuenta ESITEF.
          </p>

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : null}

          {done ? (
            <p className="login-form__subtitle" role="status">
              Contraseña actualizada. Redirigiendo al inicio de sesión…
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="login-field login-field--password">
                <label htmlFor="new-password">Nueva contraseña</label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  required
                  minLength={9}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <p className="login-field-hint">
                  Más de 8 caracteres e incluye un carácter especial (!@#$…).
                </p>
              </div>

              <div className="login-field login-field--password">
                <label htmlFor="new-password-confirm">Confirmar contraseña</label>
                <input
                  id="new-password-confirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  minLength={9}
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="login-main">
          <div className="login-form auth-panels">
            <p className="login-form__subtitle">Cargando…</p>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
