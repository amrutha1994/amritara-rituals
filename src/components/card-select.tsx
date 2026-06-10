"use client";

import { useEffect, useRef, useState } from "react";
import { BRACELET_SIZES, type BraceletSizeId } from "@/data/products";
import { useSelection } from "@/components/selection-provider";
import { useToast } from "@/components/toast-provider";

/**
 * "Add" control for a product card. Sits over the card image as a sibling of
 * the card's link (never nested inside the <a>). Tapping it opens a per-size
 * quantity stepper, so a shopper can add multiples of the same size or mix
 * sizes. The standalone − beside the badge peels off one unit per tap.
 */
export default function CardSelect({
  productId,
  productName,
  className,
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { add, decrement, decrementProduct, qtyOf, productQty, items } =
    useSelection();
  const { show } = useToast();

  const totalQty = productQty(productId);
  const inSelection = totalQty > 0;

  // Close on an outside click using a document listener rather than an overlay
  // element. An overlay would intercept the click meant for another card's
  // button, forcing a second click; a listener lets that click both close this
  // picker and act on its target in one go. Escape also closes.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleAdd = (sizeId: BraceletSizeId) => {
    add(productId, sizeId);
    show(`Added ${productName} · Size ${sizeId}`);
  };

  const handleDecrement = (sizeId: BraceletSizeId) => {
    decrement(productId, sizeId);
    show(`Removed ${productName} · Size ${sizeId}`);
  };

  // The card's − peels one unit off the most recently added size.
  const handleCardMinus = () => {
    const lastLine = [...items].reverse().find((i) => i.productId === productId);
    decrementProduct(productId);
    if (lastLine) show(`Removed ${productName} · Size ${lastLine.size}`);
  };

  return (
    <div ref={ref} className={className}>
      <div className="relative z-20 flex items-center gap-1.5">
        {/* Quick-remove: peels off one unit per tap */}
        {inSelection && (
          <button
            type="button"
            onClick={handleCardMinus}
            aria-label={`Remove one ${productName} from selection`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-primary-deep shadow-sm ring-1 ring-border backdrop-blur-sm transition-colors hover:bg-primary-deep hover:text-white"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Add ${productName} to selection`}
          aria-expanded={open}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 backdrop-blur-sm transition-colors ${
            inSelection
              ? "bg-primary text-white ring-gold-light/30"
              : "bg-surface/90 text-primary ring-border hover:bg-primary hover:text-white"
          }`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {inSelection ? `Added · ${totalQty}` : "Add"}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-60 rounded-xl border border-border bg-surface p-3 shadow-xl">
          <p className="px-0.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Choose size &amp; quantity
          </p>
          <div className="flex flex-col gap-1.5">
            {BRACELET_SIZES.map((size) => {
              const qty = qtyOf(productId, size.id);
              return (
                <div
                  key={size.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-1 py-1"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {size.label}{" "}
                      <span className="text-muted">({size.id})</span>
                    </p>
                    <p className="text-[11px] text-muted">{size.wrist}</p>
                  </div>

                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleAdd(size.id)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDecrement(size.id)}
                        aria-label={`Remove one size ${size.id}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-foreground">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdd(size.id)}
                        aria-label={`Add one size ${size.id}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
