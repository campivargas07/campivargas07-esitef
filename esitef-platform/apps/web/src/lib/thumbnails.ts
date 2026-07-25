import { wpAssetUrl } from "./wp-asset-url";
import { resolveCourseSlug, resolveCourseThumbnail } from "./course-slug-aliases";

export function sanitizeThumbnail(url: string | null | undefined) {
  if (!url || url === "NULL") return null;
  return wpAssetUrl(url);
}

export function normalizeThumbnailForCourse(
  slug: string,
  url: string | null | undefined
) {
  return resolveCourseThumbnail(slug, sanitizeThumbnail(url));
}
