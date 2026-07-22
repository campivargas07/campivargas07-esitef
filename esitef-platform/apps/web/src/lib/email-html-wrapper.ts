import { EMAIL_ADAPTIVE_HEAD, emailTheme } from "@/lib/email-theme";
import { emailFooterLinksHtml, emailLogoBlock } from "@/lib/email-html-blocks";
import { getPublicSiteUrl } from "@/lib/site-url";

const { light } = emailTheme;

/** Wrap inline transactional HTML; adapts to prefers-color-scheme at open time. */
export function wrapTransactionalEmail(
  innerHtml: string,
  siteUrl = getPublicSiteUrl()
): string {
  const logo = emailLogoBlock(siteUrl);
  const footer = emailFooterLinksHtml(siteUrl);
  return `<!DOCTYPE html>
<html lang="es">
<head>
${EMAIL_ADAPTIVE_HEAD}
</head>
<body class="email-body" style="margin:0;padding:24px 0;background-color:${light.shell};color:${light.text};font-family:'Inter Tight','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" class="email-shell" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${light.shell}" style="background-color:${light.shell};">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table role="presentation" class="email-card" width="560" cellspacing="0" cellpadding="0" border="0" bgcolor="${light.card}" style="max-width:560px;width:100%;background-color:${light.card};border-radius:28px;overflow:hidden;">
          <tr>
            <td class="email-accent-bar" bgcolor="${light.brand}" style="background-color:${light.brand};height:4px;line-height:4px;font-size:4px;">&nbsp;</td>
          </tr>
          <tr>
            <td class="email-content" style="padding:32px 28px;color:${light.text};font-size:15px;line-height:24px;">
              ${logo}
              ${innerHtml}
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
