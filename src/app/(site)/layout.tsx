import { GoogleAnalytics } from "@next/third-parties/google";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { SelectionProvider } from "@/components/selection-provider";
import { ToastProvider } from "@/components/toast-provider";
import { ProductSheetProvider } from "@/components/product-sheet-provider";
import { CatalogProvider } from "@/components/catalog-provider";
import SelectionBar from "@/components/selection-bar";
import { GA_ID, analyticsEnabled } from "@/lib/analytics";
import { getCatalog } from "@/sanity/queries";

/**
 * Time-based revalidation (ISR): storefront pages are re-generated at most once
 * every 60s, and only when visited — so Studio edits go live within about a
 * minute without a redeploy. Applies to all routes in this group.
 */
export const revalidate = 60;

/**
 * Storefront layout — the site chrome (header, footer, cart) and the client
 * providers it needs. Fetches the catalogue once on the server and hydrates the
 * client `CatalogProvider`, so the cart and interactive components can read it.
 * Lives in the `(site)` route group so `/studio` doesn't inherit any of it.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await getCatalog();

  return (
    <CatalogProvider value={catalog}>
      <ToastProvider>
        <SelectionProvider>
          <ProductSheetProvider>
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
            <SelectionBar />
          </ProductSheetProvider>
        </SelectionProvider>
      </ToastProvider>
      {/* Storefront-only analytics (excludes /studio). GA4 auto-tracks
          pageviews; custom events are sent via lib/analytics `track`. Rendered
          only when a measurement ID is configured. */}
      {analyticsEnabled && <GoogleAnalytics gaId={GA_ID} />}
    </CatalogProvider>
  );
}
