import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { sendMail } from "@/lib/mail";
import { renderEmailTemplate } from "@/lib/render-email";
import { getPublicSiteUrl } from "@/lib/site-url";

export async function sendNewsletterWelcomeEmail(to: string) {
  const siteUrl = getPublicSiteUrl();
  const { html, text } = await renderEmailTemplate(
    NewsletterWelcomeEmail({ siteUrl })
  );

  return sendMail({
    to,
    subject: "Bienvenido al newsletter de ESITEF",
    html,
    text,
  });
}
