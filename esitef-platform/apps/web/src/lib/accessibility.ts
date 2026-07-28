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
export const THEME_PREVIEW_COOKIE = "esitef-theme-preview";
export const THEME_PREVIEW_VALUE = "dark";

/** ponytail: dark CSS queda en repo; poner false cuando el diseño oscuro esté listo */
export const THEME_FORCE_LIGHT = true;

export function isThemePreviewDark(raw?: string | null): boolean {
  return raw === THEME_PREVIEW_VALUE;
}

export const DEFAULT_A11Y: AccessibilityPrefs = {
  theme: "light",
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
    return normalizeA11yPrefs({ ...DEFAULT_A11Y, ...parsed });
  } catch {
    return DEFAULT_A11Y;
  }
}

export function serializeA11yCookie(prefs: AccessibilityPrefs) {
  return JSON.stringify(normalizeA11yPrefs(prefs));
}

/** Coerce stale cookie values when light is forced at runtime. */
export function normalizeA11yPrefs(prefs: AccessibilityPrefs): AccessibilityPrefs {
  if (!THEME_FORCE_LIGHT || prefs.theme === "light") return prefs;
  return { ...prefs, theme: "light" };
}

/** Resolved attribute for <html data-theme> (CSS tokens). */
export function resolveDomTheme(
  prefs: AccessibilityPrefs,
  osPrefersDark?: boolean | null,
  previewDark?: boolean
): ThemeMode {
  if (previewDark) return "dark";
  if (THEME_FORCE_LIGHT) return "light";
  if (prefs.theme === "light" || prefs.theme === "dark") return prefs.theme;
  if (osPrefersDark === true) return "dark";
  if (osPrefersDark === false) return "light";
  return "system";
}

export function resolveHtmlAttrs(
  prefs: AccessibilityPrefs,
  osPrefersDark?: boolean | null,
  previewDark?: boolean
) {
  return {
    "data-theme": resolveDomTheme(prefs, osPrefersDark, previewDark),
    "data-contrast": prefs.contrast === "high" ? "high" : undefined,
    "data-font-scale": FONT_SCALES[prefs.fontScale],
    "data-vision": prefs.visionFilter !== "none" ? prefs.visionFilter : undefined,
    "data-motion": prefs.reducedMotion ? "reduced" : undefined,
  } as Record<string, string | undefined>;
}

export function setA11yCookie(prefs: AccessibilityPrefs) {
  const normalized = normalizeA11yPrefs(prefs);
  document.cookie = `${A11Y_COOKIE}=${encodeURIComponent(serializeA11yCookie(normalized))};path=/;max-age=31536000;SameSite=Lax`;
  applyA11yToDocument(normalized);
}

function readThemePreviewCookie(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${THEME_PREVIEW_COOKIE}=`));
  if (!match) return false;
  return isThemePreviewDark(decodeURIComponent(match.slice(THEME_PREVIEW_COOKIE.length + 1)));
}

export function applyA11yToDocument(prefs: AccessibilityPrefs) {
  const normalized = normalizeA11yPrefs(prefs);
  const html = document.documentElement;
  const osPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const attrs = resolveHtmlAttrs(normalized, osPrefersDark, readThemePreviewCookie());

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
