import { routing } from "@/i18n/routing";
import type { Post } from "@/types";

/** Prefer `NEXT_PUBLIC_APP_URL` in production so metadata and share URLs are absolute. */
export function getSiteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "";
}

/**
 * Path with locale prefix (`as-needed`: default locale has no prefix).
 * `pathname` must start with `/`.
 */
export function localizedPath(pathname: string, locale: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const prefix =
    routing.localePrefix === "as-needed" && locale === routing.defaultLocale
      ? ""
      : `/${locale}`;
  return `${prefix}${path}`;
}

export function blogPostAbsoluteUrl(slug: string, locale: string): string {
  const base = getSiteBaseUrl();
  if (!base) return "";
  return `${base}${localizedPath(`/blog/${slug}`, locale)}`;
}

function resolveAbsoluteImageUrl(url: string): string | undefined {
  const t = url.trim();
  if (!t) return undefined;
  if (t.startsWith("https://") || t.startsWith("http://")) return t;
  const base = getSiteBaseUrl();
  if (!base) return undefined;
  return t.startsWith("/") ? `${base}${t}` : `${base}/${t}`;
}

export function postOgImageUrl(post: Post): string | undefined {
  const raw = post.featuredImage?.trim();
  if (!raw) return undefined;
  return resolveAbsoluteImageUrl(raw);
}

export function postDescriptionForMeta(post: Post): string {
  const ex = post.excerpt?.trim();
  if (ex) {
    return ex.length > 200 ? `${ex.slice(0, 197)}…` : ex;
  }
  const raw = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return raw.length > 200 ? `${raw.slice(0, 197)}…` : raw;
}
