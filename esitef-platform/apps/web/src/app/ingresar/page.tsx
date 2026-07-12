"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  registerErrorMessages,
  type RegisterErrorCode,
} from "@/lib/auth/register-messages";

type AuthPanel = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [panel, setPanel] = useState<AuthPanel>("login");
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] =
    useState(false);

  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const showPanel = useCallback((name: AuthPanel) => {
    setPanel(name);
    setLoginError("");
    setRegisterError("");
    history.replaceState(null, "", name === "register" ? "#registro" : "#login");
    const focusId = name === "register" ? "reg_first_name" : "email";
    requestAnimationFrame(() => {
      document.getElementById(focusId)?.focus();
    });
  }, []);

  useEffect(() => {
    if (window.location.hash === "#registro") {
      setPanel("register");
    }
    const regError = params.get("reg_error") as RegisterErrorCode | null;
    if (regError && registerErrorMessages[regError]) {
      setPanel("register");
      setRegisterError(registerErrorMessages[regError]);
    }
  }, [params]);

  useEffect(() => {
    document.body.classList.toggle("auth-mode-register", panel === "register");
    document.title =
      panel === "register"
        ? "Registrarse | ESITEF Online"
        : "Ingresar | ESITEF Online";
    return () => {
      document.body.classList.remove("auth-mode-register");
    };
  }, [panel]);

  async function onLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoginLoading(false);
    if (res?.error) {
      setLoginError("Credenciales incorrectas.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function onRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegisterError("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");

    const emailInput = e.currentTarget.querySelector(
      "#reg_user_email"
    ) as HTMLInputElement | null;
    const passInput = e.currentTarget.querySelector(
      "#reg_user_pass"
    ) as HTMLInputElement | null;
    const confirmInput = e.currentTarget.querySelector(
      "#reg_user_pass_confirm"
    ) as HTMLInputElement | null;

    [emailInput, passInput, confirmInput].forEach((el) => {
      if (el) el.setCustomValidity("");
    });

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRe.test(email)) {
      if (emailInput) {
        emailInput.setCustomValidity(
          "Introduce un email válido (ej. nombre@dominio.com)."
        );
        emailInput.reportValidity();
      }
      return;
    }

    if (password.length <= 8) {
      if (passInput) {
        passInput.setCustomValidity(
          "La contraseña debe tener más de 8 caracteres."
        );
        passInput.reportValidity();
      }
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      if (passInput) {
        passInput.setCustomValidity(
          "Incluye al menos un carácter especial (ej. ! @ # $ % &)."
        );
        passInput.reportValidity();
      }
      return;
    }

    if (password !== passwordConfirm) {
      if (confirmInput) {
        confirmInput.setCustomValidity("Las contraseñas no coinciden.");
        confirmInput.reportValidity();
      }
      return;
    }

    setRegisterLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email,
        password,
        passwordConfirm,
      }),
    });

    const data = (await res.json().catch(() => null)) as {
      error?: string;
      code?: RegisterErrorCode;
    } | null;

    if (!res.ok) {
      setRegisterLoading(false);
      setRegisterError(
        data?.error ?? registerErrorMessages.failed
      );
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setRegisterLoading(false);

    if (signInRes?.error) {
      setRegisterError(
        "Cuenta creada. Inicia sesión con tu email y contraseña."
      );
      showPanel("login");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="login-main" id="login-main">
      <Link href="/" className="login-close" aria-label="Cerrar">
        <span className="login-close__line" />
        <span className="login-close__line" />
      </Link>

      <div className="login-form auth-panels">
        <section
          className="auth-panel auth-panel--login"
          id="auth-login"
          hidden={panel === "register"}
          aria-labelledby="auth-login-title"
        >
          <h1 className="login-form__title" id="auth-login-title">
            Bienvenid@ de nuevo
          </h1>
          <p className="login-form__subtitle">
            Ingresa con tu cuenta de ESITEF Online
          </p>

          {loginError && (
            <p className="login-form__error" role="alert">
              {loginError}
            </p>
          )}

          <form onSubmit={onLoginSubmit} noValidate>
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
                type={showLoginPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="login-toggle-pw"
                onClick={() => setShowLoginPassword((v) => !v)}
                aria-label={
                  showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showLoginPassword ? "ocultar" : "ver"}
              </button>
            </div>

            <p className="login-forgot">
              <a href="https://esitef.com/online/wp-login.php?action=lostpassword">
                ¿Olvidaste tu contraseña?
              </a>
            </p>

            <button className="login-submit" type="submit" disabled={loginLoading}>
              {loginLoading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <nav className="login-signup" aria-label="Crear cuenta">
            <span className="login-signup__text">¿No tienes cuenta?</span>{" "}
            <button
              type="button"
              className="login-signup__action js-auth-toggle"
              onClick={() => showPanel("register")}
            >
              Registrate ahora
            </button>
          </nav>
        </section>

        <section
          className="auth-panel auth-panel--register"
          id="auth-register"
          hidden={panel === "login"}
          aria-labelledby="auth-register-title"
        >
          <h1 className="login-form__title" id="auth-register-title">
            Crea tu cuenta
          </h1>
          <p className="login-form__subtitle">
            Únete a ESITEF Online en unos segundos.
          </p>

          {registerError && (
            <p className="login-form__error" role="alert">
              {registerError}
            </p>
          )}

          <form onSubmit={onRegisterSubmit} noValidate id="register-form">
            <div className="login-field-row">
              <div className="login-field">
                <label htmlFor="reg_first_name">Nombre</label>
                <input
                  type="text"
                  id="reg_first_name"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="login-field">
                <label htmlFor="reg_last_name">Apellidos</label>
                <input
                  type="text"
                  id="reg_last_name"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Tus apellidos"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="reg_user_email">Email</label>
              <input
                type="email"
                id="reg_user_email"
                name="email"
                autoComplete="email"
                placeholder="nombre@email.com"
                required
                inputMode="email"
                spellCheck={false}
              />
            </div>

            <div className="login-field login-field--password">
              <label htmlFor="reg_user_pass">Contraseña</label>
              <input
                type={showRegisterPassword ? "text" : "password"}
                id="reg_user_pass"
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={9}
              />
              <button
                type="button"
                className="login-toggle-pw"
                onClick={() => setShowRegisterPassword((v) => !v)}
                aria-label={
                  showRegisterPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showRegisterPassword ? "ocultar" : "ver"}
              </button>
              <p className="login-field-hint">
                Más de 8 caracteres e incluye un carácter especial (!@#$…).
              </p>
            </div>

            <div className="login-field login-field--password">
              <label htmlFor="reg_user_pass_confirm">Confirmar contraseña</label>
              <input
                type={showRegisterPasswordConfirm ? "text" : "password"}
                id="reg_user_pass_confirm"
                name="passwordConfirm"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={9}
              />
              <button
                type="button"
                className="login-toggle-pw"
                onClick={() => setShowRegisterPasswordConfirm((v) => !v)}
                aria-label={
                  showRegisterPasswordConfirm
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showRegisterPasswordConfirm ? "ocultar" : "ver"}
              </button>
            </div>

            <button
              className="login-submit"
              type="submit"
              disabled={registerLoading}
            >
              {registerLoading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <nav className="login-links" aria-label="Volver al inicio de sesión">
            <span className="login-links__muted">¿Ya tienes cuenta?</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              className="js-auth-toggle"
              onClick={() => showPanel("login")}
            >
              Iniciar sesión
            </button>
          </nav>
        </section>
      </div>
    </main>
  );
}
