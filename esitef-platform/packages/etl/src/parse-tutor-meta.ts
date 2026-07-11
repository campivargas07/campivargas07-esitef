/** Parse Tutor LMS PHP-serialized `_video` postmeta without a PHP runtime. */
export function parseTutorVideoMeta(metaValue: string): {
  videoUrl?: string;
  durationSeconds?: number;
} {
  if (!metaValue) return {};

  const youtube = metaValue.match(/source_youtube";s:\d+:"([^"]+)"/);
  const vimeo = metaValue.match(/source_vimeo";s:\d+:"([^"]+)"/);
  const external = metaValue.match(/source_external_url";s:\d+:"([^"]+)"/);
  const videoUrl = youtube?.[1] || vimeo?.[1] || external?.[1];

  const hours = Number(metaValue.match(/s:5:"hours";s:\d+:"(\d+)"/)?.[1] ?? 0);
  const minutes = Number(metaValue.match(/s:7:"minutes";s:\d+:"(\d+)"/)?.[1] ?? 0);
  const seconds = Number(metaValue.match(/s:7:"seconds";s:\d+:"(\d+)"/)?.[1] ?? 0);
  const durationSeconds =
    hours > 0 || minutes > 0 || seconds > 0
      ? hours * 3600 + minutes * 60 + seconds
      : undefined;

  return { videoUrl, durationSeconds };
}

/** Parse Tutor `_tutor_completed_lesson_id_*` meta_value (unix seconds or MySQL datetime). */
export function parseWpCompletionTimestamp(
  value: string | null | undefined
): Date | undefined {
  if (!value || value === "NULL") return undefined;

  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    const ms = trimmed.length >= 13 ? n : n * 1000;
    const date = new Date(ms);
    return Number.isFinite(date.getTime()) ? date : undefined;
  }

  const date = new Date(trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T"));
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function priceToCents(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}
