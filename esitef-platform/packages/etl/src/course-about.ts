/** Mirrors esitef-minimal/inc/courses-landing.php — landing "Acerca del curso". */

const LEGACY_BUILDER_RE =
  /\b(elementor|tutor-course-details|tutor-course-benefits|tutor-course-content|etlms-|wp-block-tutor)/i;

export function courseHasLegacyBuilder(
  raw: string,
  hasElementorMeta = false
): boolean {
  if (hasElementorMeta) return true;
  if (LEGACY_BUILDER_RE.test(raw)) return true;
  // Tutor bundle: child course cards embedded in post_content.
  if (/\bhref="[^"]*\/courses\//i.test(raw)) return true;
  return false;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** MariaDB -B tab output encodes line breaks as literal \\n / \\r. */
function normalizeWpMetaText(text: string): string {
  return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\r");
}

function textToParagraphs(text: string): string {
  return normalizeWpMetaText(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

export function resolveCourseAboutContent(input: {
  postContent: string;
  postExcerpt: string;
  benefits?: string | null;
  hasLegacyBuilder?: boolean;
}): string {
  const benefits = input.benefits?.trim();
  if (benefits) return textToParagraphs(benefits);

  const excerpt = input.postExcerpt?.trim();
  if (excerpt) return `<p>${escapeHtml(excerpt)}</p>`;

  const raw = input.postContent.trim();
  if (!raw) return "";

  const legacy =
    input.hasLegacyBuilder ?? courseHasLegacyBuilder(raw);
  if (legacy) return "";

  const plain = raw.replace(/<[^>]+>/g, "").trim();
  return plain ? textToParagraphs(plain) : "";
}
