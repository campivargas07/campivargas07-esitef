"use client";

import Link from "next/link";
import { useState } from "react";

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="a11y-menu">
      <button
        type="button"
        className="a11y-menu-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        title="Accesibilidad"
      >
        ⚙
      </button>
      {open && (
        <>
          <div
            className="a11y-menu-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="a11y-menu-dropdown" role="menu">
            <Link
              href="/dashboard?tab=preferences"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Preferencias de accesibilidad
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
