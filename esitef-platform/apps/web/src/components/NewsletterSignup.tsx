"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TrackingLeadEvent } from "@/components/tracking/TrackingEvents";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; theme?: string; language?: string }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type Status =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "validation"
  | "captcha"
  | "rate";

export function NewsletterSignup() {
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");

  function mountTurnstile() {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      language: "es",
    });
  }

  useEffect(() => {
    mountTurnstile();
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const code = searchParams.get("newsletter");
    if (!code) return;

    if (code === "ok") setStatus("success");
    else if (code === "invalid") setStatus("validation");
    else if (code === "captcha") setStatus("captcha");
    else if (code === "rate") setStatus("rate");
    else if (code === "error") setStatus("error");

    const next = new URLSearchParams(searchParams.toString());
    next.delete("newsletter");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  function resetTurnstile() {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  async function submitEmail(form: HTMLFormElement) {
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();

    if (!email || !EMAIL_RE.test(email)) {
      setStatus("validation");
      return;
    }

    const turnstileToken =
      (data.get("cf-turnstile-response") as string | null)?.trim() || undefined;

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("captcha");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: data.get("website"),
          turnstileToken,
        }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        resetTurnstile();
        return;
      }

      resetTurnstile();

      if (res.status === 400) {
        setStatus("validation");
        return;
      }
      if (res.status === 403) {
        setStatus("captcha");
        return;
      }
      if (res.status === 429) {
        setStatus("rate");
        return;
      }

      setStatus("error");
    } catch {
      resetTurnstile();
      setStatus("error");
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submitEmail(e.currentTarget);
  }

  function onButtonClick() {
    const form = formRef.current;
    if (!form) return;
    void submitEmail(form);
  }

  if (status === "success") {
    return (
      <>
        <TrackingLeadEvent method="newsletter" />
        <p
          className="footer-newsletter-feedback footer-newsletter-feedback--success"
          role="status"
        >
          ¡Listo! Te hemos enviado un correo de bienvenida.
        </p>
      </>
    );
  }

  return (
    <>
      {TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={mountTurnstile}
        />
      ) : null}

      <form
        ref={formRef}
        className="footer-newsletter-form"
        method="post"
        action="/api/newsletter"
        onSubmit={onSubmit}
        noValidate
        aria-label="Formulario newsletter"
      >
        <div className="footer-newsletter-hp" aria-hidden="true">
          <label htmlFor="newsletter-website">Website</label>
          <input
            type="text"
            id="newsletter-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="nombre@email.com"
          aria-label="Tu email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          disabled={status === "loading"}
        />
        <button
          type="button"
          disabled={status === "loading"}
          onClick={onButtonClick}
        >
          {status === "loading" ? "Enviando…" : "Suscribirse"}
        </button>
      </form>

      {TURNSTILE_SITE_KEY ? (
        <div className="footer-newsletter-turnstile" ref={turnstileRef} />
      ) : null}

      {status === "validation" && (
        <p
          className="footer-newsletter-feedback footer-newsletter-feedback--error"
          role="alert"
        >
          Introduce un email válido.
        </p>
      )}
      {status === "captcha" && (
        <p
          className="footer-newsletter-feedback footer-newsletter-feedback--error"
          role="alert"
        >
          Completa la verificación anti-spam e inténtalo de nuevo.
        </p>
      )}
      {status === "rate" && (
        <p
          className="footer-newsletter-feedback footer-newsletter-feedback--error"
          role="alert"
        >
          Demasiados intentos. Espera unos minutos e inténtalo de nuevo.
        </p>
      )}
      {status === "error" && (
        <p
          className="footer-newsletter-feedback footer-newsletter-feedback--error"
          role="alert"
        >
          No pudimos completar la suscripción. Inténtalo más tarde.
        </p>
      )}
    </>
  );
}
