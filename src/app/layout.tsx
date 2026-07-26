import type { Metadata } from "next";
import { Cormorant_Garamond, Mulish } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";

// Elegant serif for the wordmark & headings — echoes the logo's lettering.
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Soft, modern sans for body copy.
const body = Mulish({
  variable: "--font-body",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Amritara Rituals crafts handmade gemstone bracelets as wearable rituals — each stone chosen for the energy and intention it carries. Shop the collection or design your own.";

export const metadata: Metadata = {
  // Lets Next resolve every relative URL below (canonical, OG images) to an
  // absolute one — required for social cards and canonical tags to work.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Page-level string titles become "Page name — Amritara Rituals".
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "gemstone bracelets",
    "crystal bracelets",
    "healing crystals",
    "chakra bracelet",
    "handmade bracelets",
    "intention jewelry",
    SITE_NAME,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
    images: [
      {
        url: "/hero-banner.jpg",
        width: 1696,
        height: 624,
        alt: "Amritara Rituals gemstone bracelets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/hero-banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Organization-level structured data, emitted on every page so search engines
// can associate the brand, logo and site across results.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/logo.png"),
  slogan: SITE_TAGLINE,
};

/**
 * Root layout — intentionally minimal. It only owns <html>/<body>, fonts and
 * global styles so it can be shared by both the storefront (the `(site)` group,
 * which adds the header/footer chrome) and the chrome-free `/studio` route.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          // JSON.stringify output is safe to inline; no user input is included.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
