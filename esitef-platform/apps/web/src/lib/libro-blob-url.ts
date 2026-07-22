import { issueSignedToken, presignUrl } from "@vercel/blob";

const BLOB_HOST = ".blob.vercel-storage.com";
const PRIVATE_BLOB_HOST = ".private.blob.vercel-storage.com";

/** Stored Vercel Blob URL on a private store (needs presigned GET). */
export function isPrivateBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes(PRIVATE_BLOB_HOST);
  } catch {
    return false;
  }
}

export function isBlobStorageUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes(BLOB_HOST);
  } catch {
    return false;
  }
}

export function pathnameFromBlobUrl(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (!hostname.includes(BLOB_HOST)) return null;
    return pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

/** Presigned GET for private blobs; passthrough for public blob or external URLs. */
export async function getSignedLibroPdfUrl(
  storedUrl: string,
  validForMs = 7 * 24 * 60 * 60 * 1000
): Promise<string> {
  if (!isPrivateBlobUrl(storedUrl)) return storedUrl;

  const pathname = pathnameFromBlobUrl(storedUrl);
  if (!pathname) return storedUrl;

  const tokenValidUntil = Date.now() + validForMs;
  const token = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil: tokenValidUntil,
  });

  const { presignedUrl } = await presignUrl(token, {
    operation: "get",
    pathname,
    access: "private",
    validUntil: tokenValidUntil,
  });

  return presignedUrl;
}
