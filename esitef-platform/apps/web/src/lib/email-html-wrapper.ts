import { EMAIL_ADAPTIVE_HEAD, emailTheme } from "@/lib/email-theme";
import { getEmailLogoUrl, getPublicSiteUrl } from "@/lib/site-url";

const { light } = emailTheme;

function emailLogoBlock(siteUrl: string): string {
  const logoUrl = getEmailLogoUrl(siteUrl);
  const home = siteUrl.replace(/\/$/, "");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding-bottom:24px;">
      <a href="${home}" style="text-decoration:none;">
        <img src="${logoUrl}" width="56" height="56" alt="ESITEF" style="display:block;margin:0 auto;border:0;" />
      </a>
    </td>
  </tr>
</table>`;
}

/** Wrap inline transactional HTML; adapts to prefers-color-scheme at open time. */
export function wrapTransactionalEmail(
  innerHtml: string,
  siteUrl = getPublicSiteUrl()
): string {
  const logo = emailLogoBlock(siteUrl);
  return `<!DOCTYPE html>
<html lang="es">
<head>
${EMAIL_ADAPTIVE_HEAD}
</head>
<body class="email-body" style="margin:0;padding:24px 0;background-color:${light.shell};color:${light.text};font-family:'Inter Tight','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" class="email-shell" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${light.shell}" style="background-color:${light.shell};">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table role="presentation" class="email-card" width="560" cellspacing="0" cellpadding="0" border="0" bgcolor="${light.card}" style="max-width:560px;width:100%;background-color:${light.card};border-radius:16px;">
          <tr>
            <td class="email-content" style="padding:32px 28px;color:${light.text};font-size:15px;line-height:24px;">
              ${logo}
              ${innerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
