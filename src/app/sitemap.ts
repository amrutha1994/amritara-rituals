import type { MetadataRoute } from "next";

import { getAllProducts } from "@/sanity/queries";
import { absoluteUrl } from "@/lib/site";

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

  return [...staticRoutes, ...productRoutes];
}
