/**
 * Convert watch/share URLs to iframe-safe embed URLs.
 * Vimeo page URLs (vimeo.com/ID) refuse framing → "rechazó la conexión".
 */
export function toVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.includes("youtube.com/watch")) {
      const id = new URL(trimmed).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : trimmed;
    }
    if (trimmed.includes("youtu.be/")) {
      const id = trimmed.split("youtu.be/")[1]?.split(/[?&#]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : trimmed;
    }
    if (trimmed.includes("youtube.com/embed")) return trimmed;

    if (trimmed.includes("player.vimeo.com/video/")) {
      return trimmed.split("?")[0] + vimeoQueryFromPage(trimmed);
    }

    // https://vimeo.com/123456789 or https://vimeo.com/123456789/abcdef (unlisted hash)
    const vimeo = trimmed.match(
      /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?/i
    );
    if (vimeo) {
      const id = vimeo[1];
      const hash = vimeo[2];
      const base = `https://player.vimeo.com/video/${id}`;
      return hash ? `${base}?h=${hash}` : base;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function vimeoQueryFromPage(url: string): string {
  try {
    const h = new URL(url).searchParams.get("h");
    return h ? `?h=${h}` : "";
  } catch {
    return "";
  }
}
