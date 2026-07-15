"use client";

import { useState } from "react";
import {
  BRACELET_SIZES,
  type BraceletSizeId,
  type Product,
} from "@/data/products";
import { buildProductOrderLink, toAbsoluteImageUrl } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { useCatalog } from "@/components/catalog-provider";
import { useSelection } from "@/components/selection-provider";
import { useToast } from "@/components/toast-provider";
import SizeChart from "@/components/size-chart";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.74c0 4.48-3.65 8.12-8.13 8.12a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.07 8.07 0 0 1-1.24-4.31c0-4.48 3.64-8.13 8.12-8.13Zm4.7 10.2c-.26-.13-1.52-.75-1.76-.83-.24-.09-.41-.13-.59.13-.17.26-.67.83-.82 1-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.07-1.28-.77-.68-1.28-1.53-1.43-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.06-.13-.59-1.42-.81-1.95-.21-.51-.43-.44-.59-.45l-.5-.01c-.17 0-.46.06-.7.33-.24.26-.92.9-.92 2.19s.94 2.54 1.07 2.72c.13.17 1.85 2.83 4.49 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.07 1.52-.62 1.74-1.22.21-.6.21-1.11.15-1.22-.06-.11-.24-.17-.5-.3Z" />
    </svg>
  );
}

export default function ProductOrderPanel({ product }: { product: Product }) {
  const [size, setSize] = useState<BraceletSizeId | null>(null);
  const [error, setError] = useState(false);
  const { add, decrement, qtyOf } = useSelection();
  const { delivery } = useCatalog();
  const { show } = useToast();

  const qty = size ? qtyOf(product.id, size) : 0;

  const handleOrder = (e: React.MouseEvent) => {
    if (!size) {
      e.preventDefault();
      setError(true);
      return;
    }
    // Open the business chat pre-filled, including an absolute link to the
    // product photo so WhatsApp renders it as a preview. We build the href on
    // click so we can use the live origin (avoids a hydration mismatch).
    e.preventDefault();
    track("whatsapp_order", {
      type: "product",
      id: product.id,
      name: product.name,
      size,
      value: product.price,
    });
    const imageUrl = toAbsoluteImageUrl(product.image, window.location.origin);
    window.open(
      buildProductOrderLink(product, size, delivery, imageUrl),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleAdd = () => {
    if (!size) {
      setError(true);
      return;
    }
    add(product.id, size);
    track("add_to_bag", {
      type: "product",
      id: product.id,
      name: product.name,
      size,
      value: product.price,
    });
    show(`Added ${product.name} · Size ${size}`);
  };

  const handleDecrement = () => {
    if (!size) return;
    decrement(product.id, size);
    show(`Removed ${product.name} · Size ${size}`);
  };

  return (
    <div className="mt-8">
      {/* Size selection */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Size{" "}
          {size ? (
            <span className="text-muted">· {size}</span>
          ) : (
            <span className="text-muted">· wrist fit</span>
          )}
        </span>
        <SizeChart />
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Select a size">
        {BRACELET_SIZES.map((option) => {
          const selected = size === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setSize(option.id);
                setError(false);
              }}
              className={`flex min-w-[5.5rem] flex-col items-center rounded-xl border px-4 py-2.5 text-center transition-colors ${
                selected
                  ? "border-primary bg-primary-soft text-primary-deep"
                  : "border-border bg-surface text-foreground/80 hover:border-primary/50"
              }`}
            >
              <span className="text-sm font-semibold">
                {option.label} ({option.id})
              </span>
              <span className="text-xs text-muted">{option.wrist}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-primary-deep">
          Please choose a size first.
        </p>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleOrder}
          aria-disabled={!size}
          className={`flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-center text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors ${
            size
              ? "bg-primary hover:bg-primary-deep"
              : "cursor-not-allowed bg-primary/50"
          }`}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Order on WhatsApp
        </button>

        {qty === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full border border-border bg-surface px-7 py-3 text-center text-sm font-medium text-primary-deep transition-colors hover:border-primary"
          >
            Add to bag
          </button>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-full border border-primary bg-primary-soft px-3 py-2">
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Remove one from your bag"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg text-primary-deep shadow-sm transition-colors hover:bg-primary hover:text-white"
            >
              −
            </button>
            <span className="text-sm font-medium text-primary-deep">
              {qty} in your bag
            </span>
            <button
              type="button"
              onClick={handleAdd}
              aria-label="Add one to your bag"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg text-primary-deep shadow-sm transition-colors hover:bg-primary hover:text-white"
            >
              +
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
