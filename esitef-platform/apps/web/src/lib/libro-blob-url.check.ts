/**
 * ponytail: self-check for private blob URL helpers.
 * Run: npx tsx src/lib/libro-blob-url.check.ts
 */
import {
  isPrivateBlobUrl,
  pathnameFromBlobUrl,
} from "./libro-blob-url";

const sample =
  "https://abc123.private.blob.vercel-storage.com/libros/dolor/1-test.pdf";

console.assert(
  isPrivateBlobUrl(sample),
  "private blob host should be detected"
);
console.assert(
  !isPrivateBlobUrl("https://abc.public.blob.vercel-storage.com/x.pdf"),
  "public blob host should not be private"
);
console.assert(
  pathnameFromBlobUrl(sample) === "libros/dolor/1-test.pdf",
  "pathname extraction"
);

console.log("libro-blob-url.check.ts OK");
