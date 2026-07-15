export type ThemeMode = "light" | "dark" | "system";
export type FontScale = "compact" | "normal" | "large";
export type VisionFilter = "none" | "protanopia" | "deuteranopia" | "deuteranomaly";

export type AccessibilityPrefs = {
  theme: ThemeMode;
  contrast: "normal" | "high";
  fontScale: FontScale;
  visionFilter: VisionFilter;
  reducedMotion: boolean;
};

export const A11Y_COOKIE = "esitef-a11y";

export const DEFAULT_A11Y: AccessibilityPrefs = {
  theme: "system",
  contrast: "normal",
  fontScale: "normal",
  visionFilter: "none",
  reducedMotion: false,
};

const FONT_SCALES: Record<FontScale, string> = {
  compact: "0.92",
  normal: "1",
  large: "1.12",
};

export function parseA11yCookie(raw?: string | null): AccessibilityPrefs {
  if (!raw) return DEFAULT_A11Y;
  try {
    const parsed = JSON.parse(raw) as Partial<AccessibilityPrefs>;
    return { ...DEFAULT_A11Y, ...parsed };
  } catch {
    return DEFAULT_A11Y;
  }
}

export function serializeA11yCookie(prefs: AccessibilityPrefs) {
  return JSON.stringify(prefs);
}

/** Resolved attribute for <html data-theme> (CSS tokens). Cookie may still store "system". */
export function resolveDomTheme(
  prefs: AccessibilityPrefs,
  osPrefersDark?: boolean | null
): ThemeMode {
  if (prefs.theme === "light" || prefs.theme === "dark") return prefs.theme;
  if (osPrefersDark === true) return "dark";
  if (osPrefersDark === false) return "light";
  return "system";
}

export function resolveHtmlAttrs(
  prefs: AccessibilityPrefs,
  osPrefersDark?: boolean | null
) {
  return {
    "data-theme": resolveDomTheme(prefs, osPrefersDark),
    "data-contrast": prefs.contrast === "high" ? "high" : undefined,
    "data-font-scale": FONT_SCALES[prefs.fontScale],
    "data-vision": prefs.visionFilter !== "none" ? prefs.visionFilter : undefined,
    "data-motion": prefs.reducedMotion ? "reduced" : undefined,
  } as Record<string, string | undefined>;
}

export function setA11yCookie(prefs: AccessibilityPrefs) {
  document.cookie = `${A11Y_COOKIE}=${encodeURIComponent(serializeA11yCookie(prefs))};path=/;max-age=31536000;SameSite=Lax`;
  applyA11yToDocument(prefs);
}

export function applyA11yToDocument(prefs: AccessibilityPrefs) {
  const html = document.documentElement;
  const osPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const attrs = resolveHtmlAttrs(prefs, osPrefersDark);

  for (const key of [
    "data-theme",
    "data-contrast",
    "data-font-scale",
    "data-vision",
    "data-motion",
  ]) {
    html.removeAttribute(key);
  }

  for (const [key, value] of Object.entries(attrs)) {
    if (value) html.setAttribute(key, value);
  }
}
