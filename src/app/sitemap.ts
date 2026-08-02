import type { MetadataRoute } from "next";

import { getAllProducts, getDecorProducts } from "@/sanity/queries";
import { absoluteUrl } from "@/lib/site";
import { DECOR_ENABLED } from "@/lib/features";

/**
 * The XML sitemap served at /sitemap.xml — every indexable storefront URL, so
 * search engines discover the whole catalogue without crawling link-by-link.
 * Product URLs are pulled live from Sanity, so new bracelets appear
 * automatically (revalidated on the same 60s ISR cadence as the catalogue).
 * The standalone Studio and API routes are intentionally left out.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/customise"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/stone-finder"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/collections/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Stone Décor URLs are only advertised once the feature is live. `getDecorProducts`
  // already returns [] when the flag is off, but we also skip the /decor landing.
  const decorRoutes: MetadataRoute.Sitemap = DECOR_ENABLED
    ? [
        {
          url: absoluteUrl("/decor"),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        ...(await getDecorProducts()).map((product) => ({
          url: absoluteUrl(`/decor/${product.slug}`),
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ]
    : [];

  return [...staticRoutes, ...productRoutes, ...decorRoutes];
}
