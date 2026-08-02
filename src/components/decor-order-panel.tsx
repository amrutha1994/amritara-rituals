"use client";

import { isSoldOut, stockLabel, type Product } from "@/data/products";
import {
  buildDecorOrderLink,
  buildDecorPreOrderLink,
  toAbsoluteImageUrl,
} from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { useCatalog } from "@/components/catalog-provider";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.74c0 4.48-3.65 8.12-8.13 8.12a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.07 8.07 0 0 1-1.24-4.31c0-4.48 3.64-8.13 8.12-8.13Zm4.7 10.2c-.26-.13-1.52-.75-1.76-.83-.24-.09-.41-.13-.59.13-.17.26-.67.83-.82 1-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.07-1.28-.77-.68-1.28-1.53-1.43-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.06-.13-.59-1.42-.81-1.95-.21-.51-.43-.44-.59-.45l-.5-.01c-.17 0-.46.06-.7.33-.24.26-.92.9-.92 2.19s.94 2.54 1.07 2.72c.13.17 1.85 2.83 4.49 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.07 1.52-.62 1.74-1.22.21-.6.21-1.11.15-1.22-.06-.11-.24-.17-.5-.3Z" />
    </svg>
  );
}

/**
 * Order panel for a Stone Décor object. Deliberately simpler than the bracelet
 * panel — no wrist size and no shared bag — so this line stays isolated from the
 * size-based cart. It's a single WhatsApp order (or pre-order when sold out).
 */
export default function DecorOrderPanel({ product }: { product: Product }) {
  const { delivery } = useCatalog();
  const soldOut = isSoldOut(product);
  const stock = stockLabel(product);

  const handleOrder = () => {
    // Build the href on click so we can use the live origin for the photo link
    // (avoids a hydration mismatch).
    const imageUrl = toAbsoluteImageUrl(product.image, window.location.origin);
    if (soldOut) {
      track("whatsapp_preorder", {
        type: "decor",
        id: product.id,
        name: product.name,
        value: product.price,
      });
      window.open(
        buildDecorPreOrderLink(product, imageUrl),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    track("whatsapp_order", {
      type: "decor",
      id: product.id,
      name: product.name,
      value: product.price,
    });
    window.open(
      buildDecorOrderLink(product, delivery, imageUrl),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="mt-8">
      {soldOut ? (
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-border/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          Sold out
        </p>
      ) : stock ? (
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-deep">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
          {stock}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleOrder}
        className="flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-center text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {soldOut ? "Pre-order on WhatsApp" : "Order on WhatsApp"}
      </button>

      {soldOut && (
        <p className="mt-2 text-xs text-muted">
          Currently sold out — pre-order and we&apos;ll reserve one for you on the
          next batch.
        </p>
      )}
    </div>
  );
}
