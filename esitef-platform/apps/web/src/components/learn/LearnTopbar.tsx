"use client";

import Link from "next/link";

type Props = {
  courseTitle: string;
  courseSlug: string;
  progressPercent: number;
  focusMode: boolean;
  onToggleFocus: () => void;
  onToggleSidebar: () => void;
};

export function LearnTopbar({
  courseTitle,
  courseSlug,
  progressPercent,
  focusMode,
  onToggleFocus,
  onToggleSidebar,
}: Props) {
  return (
    <header className="learn-topbar">
      <div className="learn-topbar-start">
        <Link href="/dashboard" className="learn-topbar-exit">
          ← Salir
        </Link>
        <button
          type="button"
          className="learn-topbar-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Mostrar contenido"
        >
          ☰
        </button>
        <div className="learn-topbar-title">
          <span className="learn-topbar-course">{courseTitle}</span>
          <span className="learn-topbar-progress">{progressPercent}% completado</span>
        </div>
      </div>
      <div className="learn-topbar-actions">
        <button
          type="button"
          className={`learn-topbar-btn${focusMode ? " is-active" : ""}`}
          onClick={onToggleFocus}
          aria-pressed={focusMode}
        >
          {focusMode ? "Mostrar menú" : "Modo focus"}
        </button>
        <Link href={`/cursos/${courseSlug}`} className="learn-topbar-btn">
          Detalles
        </Link>
      </div>
    </header>
  );
}
