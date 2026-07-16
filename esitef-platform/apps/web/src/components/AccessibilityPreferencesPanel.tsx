"use client";

import { useEffect, useState } from "react";
import {
  applyA11yToDocument,
  DEFAULT_A11Y,
  parseA11yCookie,
  setA11yCookie,
  type AccessibilityPrefs,
  type FontScale,
  type VisionFilter,
} from "@/lib/accessibility";

type Props = {
  initialCookie?: string | null;
};

export function AccessibilityPreferencesPanel({ initialCookie }: Props) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() =>
    parseA11yCookie(initialCookie)
  );

  useEffect(() => {
    applyA11yToDocument(prefs);
  }, [prefs]);

  function update(patch: Partial<AccessibilityPrefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setA11yCookie(next);
  }

  return (
    <div className="a11y-panel">
      <fieldset className="a11y-fieldset">
        <legend>Tamaño de texto</legend>
        {(
          [
            ["compact", "Compacto"],
            ["normal", "Normal"],
            ["large", "Grande"],
          ] as [FontScale, string][]
        ).map(([value, label]) => (
          <label key={value} className="a11y-option">
            <input
              type="radio"
              name="fontScale"
              checked={prefs.fontScale === value}
              onChange={() => update({ fontScale: value })}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <label className="a11y-toggle">
        <input
          type="checkbox"
          checked={prefs.contrast === "high"}
          onChange={(e) =>
            update({ contrast: e.target.checked ? "high" : "normal" })
          }
        />
        Alto contraste
      </label>

      <label className="a11y-toggle">
        <input
          type="checkbox"
          checked={prefs.reducedMotion}
          onChange={(e) => update({ reducedMotion: e.target.checked })}
        />
        Reducir movimiento
      </label>

      <fieldset className="a11y-fieldset">
        <legend>Filtro de visión</legend>
        <select
          value={prefs.visionFilter}
          onChange={(e) =>
            update({ visionFilter: e.target.value as VisionFilter })
          }
        >
          <option value="none">Ninguno</option>
          <option value="protanopia">Protanopia</option>
          <option value="deuteranopia">Deuteranopia</option>
          <option value="deuteranomaly">Deuteranomaly</option>
        </select>
      </fieldset>

      <button
        type="button"
        className="btn btn-outline"
        onClick={() => {
          setPrefs(DEFAULT_A11Y);
          setA11yCookie(DEFAULT_A11Y);
        }}
      >
        Restaurar valores
      </button>
    </div>
  );
}
