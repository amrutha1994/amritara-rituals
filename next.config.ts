import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity-hosted images (served after the content migration).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
