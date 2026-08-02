/**
 * Feature flags — simple build-time toggles for work that ships in the codebase
 * but isn't live yet. Because they're `NEXT_PUBLIC_*`, the same value is
 * available in both server and client components, so a single check hides a
 * feature everywhere (nav, routes, sitemap, homepage) with no prop threading.
 *
 * Flipping a flag needs a redeploy (the value is inlined at build time). Set it
 * in your host's env (e.g. Vercel → Environment Variables) when you're ready to
 * release, then redeploy.
 */

/**
 * The Stone Décor line (natural-stone objects: car/wall hangings, figurines).
 * Off by default so the whole feature stays hidden — its nav entry, `/decor`
 * routes, homepage band and sitemap URLs all disappear — until this is set to
 * the string "true".
 */
export const DECOR_ENABLED = process.env.NEXT_PUBLIC_DECOR_ENABLED === "true";
