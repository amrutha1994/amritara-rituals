import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

/**
 * Read-only client for fetching published content on the server.
 * `useCdn: false` so Next's own caching (ISR revalidation) is the single source
 * of freshness — each regeneration reads live data, then Next caches it for the
 * revalidate window (see `getCatalog` / the `(site)` layout). Queries live in
 * `src/sanity/queries.ts`, so the rest of the app never talks to Sanity directly.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});
