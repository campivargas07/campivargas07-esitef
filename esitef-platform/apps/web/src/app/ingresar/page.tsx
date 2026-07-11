"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Credenciales incorrectas.");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="login-main" id="login-main">
      <Link href="/" className="login-close" aria-label="Cerrar">
        <span className="login-close__line" />
        <span className="login-close__line" />
      </Link>

      <div className="login-form">
        <h1 className="login-form__title">Bienvenid@ de nuevo</h1>
        <p className="login-form__subtitle">
          Ingresa con tu cuenta de ESITEF Online
        </p>

        {error && (
          <p className="login-form__error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </div>

          <div className="login-field login-field--password">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-toggle-pw"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="login-links">
          <Link href="/formaciones">Explorar formaciones</Link>
          <span aria-hidden="true">·</span>
          <a href="mailto:info@esitef.com">¿Necesitas ayuda?</a>
        </div>
      </div>
    </main>
  );
}
