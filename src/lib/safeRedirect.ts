/**
 * Returns a same-origin path for redirect-after-auth, or null if unsafe.
 */
export function getSafeRedirectPath(raw: string | null): string | null {
  if (raw == null || typeof raw !== "string") return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  return decoded;
}
