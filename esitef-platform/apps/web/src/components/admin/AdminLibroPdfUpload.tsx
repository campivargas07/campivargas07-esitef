"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  libroKey: string;
  libroTitle: string;
  slot: string;
  hasPdf: boolean;
};

export function AdminLibroPdfUpload({
  libroKey,
  libroTitle,
  slot,
  hasPdf,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus("error");
      setMessage("Selecciona un PDF.");
      return;
    }

    setStatus("uploading");
    setMessage(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("slot", slot);

    const res = await fetch(`/api/admin/libros/${libroKey}/pdf`, {
      method: "POST",
      body: formData,
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      fileName?: string;
    };

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Error al subir.");
      return;
    }

    setStatus("done");
    setMessage(data.fileName ? `Subido: ${data.fileName}` : "PDF actualizado.");
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <form className="admin-libro-upload" onSubmit={onSubmit}>
      <span className="admin-libro-upload__slot">PDF {slot}</span>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        aria-label={`Subir PDF ${slot} de ${libroTitle}`}
      />
      <button type="submit" disabled={status === "uploading"}>
        {status === "uploading"
          ? "Subiendo…"
          : hasPdf
            ? "Reemplazar"
            : "Subir"}
      </button>
      {message && (
        <p
          className={
            status === "error" ? "admin-libro-upload__error" : "admin-libro-upload__ok"
          }
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
