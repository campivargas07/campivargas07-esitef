/** Light/dark tokens for transactional email (aligned with globals.css / design-system.md). */
export const emailTheme = {
  light: {
    shell: "#f2f2f2",
    card: "#ffffff",
    text: "#282828",
    muted: "#696969",
    border: "#e5e5e5",
    link: "#e3203a",
    brand: "#e3203a",
    brandHover: "#b3192e",
    detailBg: "#eff0ff",
    detailBorder: "#e8e9fd",
    detailLabel: "#3b42d9",
  },
  dark: {
    shell: "#16181e",
    card: "#1a1d24",
    text: "#f3f4f6",
    muted: "#9ca3af",
    border: "#2d3340",
    link: "#f87171",
    brand: "#e3203a",
    brandHover: "#e3203a",
    detailBg: "#1e2038",
    detailBorder: "#2d3340",
    detailLabel: "#a5b4fc",
  },
} as const;

export const emailFonts = {
  heading:
    "'Bricolage Grotesque', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  body: "'Inter Tight', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  eyebrow: "Inconsolata, 'Courier New', Courier, monospace",
} as const;

export const EMAIL_ADAPTIVE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Inter+Tight:wght@400;500;600&family=Inconsolata:wght@600;700&display=swap');
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, .email-body {
    background-color: ${emailTheme.light.shell} !important;
    color: ${emailTheme.light.text} !important;
    font-family: ${emailFonts.body};
  }
  .email-card {
    background-color: ${emailTheme.light.card} !important;
    color: ${emailTheme.light.text} !important;
    border-radius: 28px !important;
    overflow: hidden !important;
  }
  .email-accent-bar {
    background-color: ${emailTheme.light.brand} !important;
    height: 4px !important;
    line-height: 4px !important;
    font-size: 4px !important;
  }
  .email-text { color: ${emailTheme.light.text} !important; font-family: ${emailFonts.body}; }
  .email-muted { color: ${emailTheme.light.muted} !important; font-family: ${emailFonts.body}; }
  .email-eyebrow {
    color: ${emailTheme.light.muted} !important;
    font-family: ${emailFonts.eyebrow};
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.14em !important;
    line-height: 16px !important;
    margin: 0 0 10px !important;
    text-transform: uppercase !important;
  }
  .email-heading {
    color: ${emailTheme.light.text} !important;
    font-family: ${emailFonts.heading};
    font-size: 26px !important;
    font-weight: 700 !important;
    line-height: 32px !important;
    margin: 0 0 16px !important;
  }
  .email-paragraph {
    color: ${emailTheme.light.text} !important;
    font-family: ${emailFonts.body};
    font-size: 15px !important;
    line-height: 24px !important;
    margin: 0 0 16px !important;
  }
  .email-detail-box {
    background-color: ${emailTheme.light.detailBg} !important;
    border: 1px solid ${emailTheme.light.detailBorder} !important;
    border-radius: 16px !important;
    margin: 20px 0 !important;
    padding: 18px 20px !important;
  }
  .email-detail-label {
    color: ${emailTheme.light.detailLabel} !important;
    font-family: ${emailFonts.eyebrow};
    font-size: 10px !important;
    font-weight: 700 !important;
    letter-spacing: 0.12em !important;
    line-height: 14px !important;
    margin: 0 0 4px !important;
    text-transform: uppercase !important;
  }
  .email-detail-value {
    color: ${emailTheme.light.text} !important;
    font-family: ${emailFonts.body};
    font-size: 15px !important;
    font-weight: 500 !important;
    line-height: 22px !important;
    margin: 0 0 14px !important;
  }
  .email-detail-value:last-child { margin-bottom: 0 !important; }
  .email-btn-wrap { margin: 28px 0 8px !important; text-align: center !important; }
  .email-btn {
    background-color: ${emailTheme.light.brand} !important;
    border-radius: 999px !important;
    color: #ffffff !important;
    display: inline-block !important;
    font-family: ${emailFonts.body};
    font-size: 15px !important;
    font-weight: 600 !important;
    line-height: 100% !important;
    padding: 14px 28px !important;
    text-decoration: none !important;
  }
  .email-hr { border-color: ${emailTheme.light.border} !important; margin: 28px 0 20px !important; }
  .email-link { color: ${emailTheme.light.link} !important; }
  .email-footer { font-size: 12px !important; line-height: 20px !important; text-align: center !important; }
  @media (prefers-color-scheme: dark) {
    body, .email-body { background-color: ${emailTheme.dark.shell} !important; color: ${emailTheme.dark.text} !important; }
    .email-shell { background-color: ${emailTheme.dark.shell} !important; }
    .email-card { background-color: ${emailTheme.dark.card} !important; color: ${emailTheme.dark.text} !important; }
    .email-content { color: ${emailTheme.dark.text} !important; }
    .email-text, .email-paragraph { color: ${emailTheme.dark.text} !important; }
    .email-muted, .email-eyebrow { color: ${emailTheme.dark.muted} !important; }
    .email-heading { color: ${emailTheme.dark.text} !important; }
    .email-detail-box {
      background-color: ${emailTheme.dark.detailBg} !important;
      border-color: ${emailTheme.dark.detailBorder} !important;
    }
    .email-detail-label { color: ${emailTheme.dark.detailLabel} !important; }
    .email-detail-value { color: ${emailTheme.dark.text} !important; }
    .email-hr { border-color: ${emailTheme.dark.border} !important; }
    .email-link { color: ${emailTheme.dark.link} !important; }
  }
`.trim();

export const EMAIL_ADAPTIVE_HEAD = `<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
${EMAIL_ADAPTIVE_CSS}
</style>`;
