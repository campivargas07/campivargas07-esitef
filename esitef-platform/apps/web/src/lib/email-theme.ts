/** Light/dark tokens for transactional email (matches globals.css dark block). */
export const emailTheme = {
  light: {
    shell: "#f2f2f2",
    card: "#ffffff",
    text: "#282828",
    muted: "#696969",
    border: "#e5e5e5",
    link: "#e3203a",
    brand: "#e3203a",
  },
  dark: {
    shell: "#16181e",
    card: "#1a1d24",
    text: "#f3f4f6",
    muted: "#9ca3af",
    border: "#2d3340",
    link: "#f87171",
    brand: "#e3203a",
  },
} as const;

export const EMAIL_ADAPTIVE_CSS = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, .email-body { background-color: ${emailTheme.light.shell} !important; color: ${emailTheme.light.text} !important; }
  .email-card { background-color: ${emailTheme.light.card} !important; color: ${emailTheme.light.text} !important; }
  .email-text { color: ${emailTheme.light.text} !important; }
  .email-muted { color: ${emailTheme.light.muted} !important; }
  .email-hr { border-color: ${emailTheme.light.border} !important; }
  .email-link { color: ${emailTheme.light.link} !important; }
  @media (prefers-color-scheme: dark) {
    body, .email-body { background-color: ${emailTheme.dark.shell} !important; color: ${emailTheme.dark.text} !important; }
    .email-shell { background-color: ${emailTheme.dark.shell} !important; }
    .email-card { background-color: ${emailTheme.dark.card} !important; color: ${emailTheme.dark.text} !important; }
    .email-content { color: ${emailTheme.dark.text} !important; }
    .email-text { color: ${emailTheme.dark.text} !important; }
    .email-muted { color: ${emailTheme.dark.muted} !important; }
    .email-hr { border-color: ${emailTheme.dark.border} !important; }
    .email-link { color: ${emailTheme.dark.link} !important; }
  }
`.trim();

export const EMAIL_ADAPTIVE_HEAD = `<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
${EMAIL_ADAPTIVE_CSS}
</style>`;
