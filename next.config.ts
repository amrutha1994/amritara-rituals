import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity-hosted images (served after the content migration).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // Stone Décor and Pendants moved under /shop/<range>/… when ranges became
  // Sanity-managed tabs. Keep old shared links and search results working.
  async redirects() {
    return [
      { source: "/decor", destination: "/shop/decor", permanent: true },
      { source: "/decor/:slug", destination: "/shop/decor/:slug", permanent: true },
      { source: "/pendants", destination: "/shop/pendants", permanent: true },
      { source: "/pendants/:slug", destination: "/shop/pendants/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
