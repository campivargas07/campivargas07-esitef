"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error" | "validation";

export function NewsletterSignup() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const code = searchParams.get("newsletter");
    if (!code) return;

    if (code === "ok") setStatus("success");
    else if (code === "invalid") setStatus("validation");
    else if (code === "error") setStatus("error");

    const next = new URLSearchParams(searchParams.toString());
    next.delete("newsletter");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  async function submitEmail(form: HTMLFormElement) {
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!email || !EMAIL_RE.test(email)) {
      setStatus("validation");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      setStatus(res.status === 400 ? "validation" : "error");
    } catch {
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
      <p
        className="footer-newsletter-feedback footer-newsletter-feedback--success"
        role="status"
      >
        ¡Listo! Te hemos enviado un correo de bienvenida.
      </p>
    );
  }

  return (
    <>
      <form
        ref={formRef}
        className="footer-newsletter-form"
        method="post"
        action="/api/newsletter"
        onSubmit={onSubmit}
        noValidate
        aria-label="Formulario newsletter"
      >
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
      {status === "validation" && (
        <p
          className="footer-newsletter-feedback footer-newsletter-feedback--error"
          role="alert"
        >
          Introduce un email válido.
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
