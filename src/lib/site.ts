/**
 * Single source of truth for the site's public identity — used by metadata,
 * canonical URLs, the sitemap, robots, and structured data (JSON-LD) so they
 * can never drift apart.
 *
 * The base URL comes from `NEXT_PUBLIC_SITE_URL` so it can differ per
 * environment (preview vs production) without a code change; it falls back to
 * the production domain. Any trailing slash is stripped so `absoluteUrl` can
 * safely join paths.
 */
export const SITE_NAME = "Amritara Rituals";

/** Short tagline reused in titles and social cards. */
export const SITE_TAGLINE = "Align your energy & soul";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.amritararituals.com"
).replace(/\/+$/, "");

/**
 * Turn an app path (e.g. "/collections/jade") into a fully-qualified URL.
 * A bare "/" maps to the site root. Used wherever an absolute URL is required
 * (sitemap entries, JSON-LD, Open Graph).
 */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
