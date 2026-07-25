"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { passwordResetErrorMessages } from "@/lib/auth/password-reset-messages";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
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

    setSent(true);
  }

  return (
    <main className="login-main" id="login-main">
      <Link href="/ingresar" className="login-close" aria-label="Volver">
        <span className="login-close__line" />
        <span className="login-close__line" />
      </Link>

      <div className="login-form auth-panels">
        <section className="auth-panel auth-panel--login" aria-labelledby="forgot-title">
          <h1 className="login-form__title" id="forgot-title">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="login-form__subtitle">
            Te enviaremos un enlace para elegir una nueva contraseña.
          </p>

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : null}

          {sent ? (
            <p className="login-form__subtitle" role="status">
              Si existe una cuenta con ese email, recibirás un mensaje en unos
              minutos. Revisa también la carpeta de spam.
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="login-field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>
          )}

          <nav className="login-links" aria-label="Volver al inicio de sesión">
            <Link href="/ingresar">Volver a iniciar sesión</Link>
          </nav>
        </section>
      </div>
    </main>
  );
}
