import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt served at /robots.txt — the whole storefront is crawlable, and we
 * point crawlers at the sitemap so they can find every product page. (The admin
 * Studio is a separate app on its own domain, so there's nothing to exclude
 * here.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(),
  };
}
