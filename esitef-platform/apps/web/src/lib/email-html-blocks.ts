import { emailFonts, emailTheme } from "@/lib/email-theme";
import { getEmailLogoUrl } from "@/lib/site-url";

const { light } = emailTheme;

export function emailLogoBlock(siteUrl: string): string {
  const logoUrl = getEmailLogoUrl(siteUrl);
  const home = siteUrl.replace(/\/$/, "");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding:0 0 24px;">
      <a href="${home}" style="text-decoration:none;">
        <img src="${logoUrl}" width="56" height="56" alt="ESITEF" style="display:block;margin:0 auto;border:0;" />
      </a>
    </td>
  </tr>
</table>`;
}

export function emailEyebrowHtml(label: string): string {
  return `<p class="email-eyebrow" style="color:${light.muted};font-family:${emailFonts.eyebrow};font-size:11px;font-weight:700;letter-spacing:0.14em;line-height:16px;margin:0 0 10px;text-transform:uppercase;">${label}</p>`;
}

export function emailHeadingHtml(text: string): string {
  return `<h1 class="email-heading email-text" style="color:${light.text};font-family:${emailFonts.heading};font-size:26px;font-weight:700;line-height:32px;margin:0 0 16px;">${text}</h1>`;
}

export function emailParagraphHtml(text: string): string {
  return `<p class="email-paragraph email-text" style="color:${light.text};font-family:${emailFonts.body};font-size:15px;line-height:24px;margin:0 0 16px;">${text}</p>`;
}

export function emailDetailBoxHtml(rows: { label: string; value: string }[]): string {
  const items = rows
    .map(
      (r) =>
        `<p class="email-detail-label" style="color:${light.detailLabel};font-family:${emailFonts.eyebrow};font-size:10px;font-weight:700;letter-spacing:0.12em;margin:0 0 4px;text-transform:uppercase;">${r.label}</p>` +
        `<p class="email-detail-value email-text" style="color:${light.text};font-family:${emailFonts.body};font-size:15px;font-weight:500;line-height:22px;margin:0 0 14px;">${r.value}</p>`
    )
    .join("");
  return `<div class="email-detail-box" style="background-color:${light.detailBg};border:1px solid ${light.detailBorder};border-radius:16px;margin:20px 0;padding:18px 20px;">${items}</div>`;
}

export function emailButtonHtml(href: string, label: string): string {
  return `<table role="presentation" class="email-btn-wrap" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px;">
  <tr>
    <td align="center">
      <a href="${href}" class="email-btn" style="background-color:${light.brand};border-radius:999px;color:#ffffff;display:inline-block;font-family:${emailFonts.body};font-size:15px;font-weight:600;padding:14px 28px;text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;
}

export function emailSignOffHtml(): string {
  return `<p class="email-muted" style="color:${light.muted};font-family:${emailFonts.body};font-size:14px;line-height:22px;margin:8px 0 0;">— Equipo ESITEF</p>`;
}

export function emailFooterLinksHtml(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `<hr class="email-hr" style="border:none;border-top:1px solid ${light.border};margin:28px 0 20px;" />
<p class="email-muted email-footer" style="color:${light.muted};font-size:12px;line-height:20px;margin:0 0 8px;text-align:center;">ESITEF — Formación para profesionales de salud y movimiento</p>
<p class="email-muted email-footer" style="color:${light.muted};font-size:12px;line-height:20px;margin:0;text-align:center;">
  <a href="${base}" class="email-link" style="color:${light.link};">Visitar la web</a>
  &nbsp;·&nbsp;
  <a href="${base}/formaciones" class="email-link" style="color:${light.link};">Formaciones</a>
  &nbsp;·&nbsp;
  <a href="${base}/contacto" class="email-link" style="color:${light.link};">Contacto</a>
</p>`;
}
