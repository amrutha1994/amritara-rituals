"use client";

import { useState } from "react";
import { deliveryFeeFor } from "@/data/products";
import { useCatalog } from "@/components/catalog-provider";
import { useSelection } from "@/components/selection-provider";
import {
  buildSelectionOrderLink,
  toAbsoluteImageUrl,
  type OrderLine,
  type CustomOrderLine,
} from "@/lib/whatsapp";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SelectionBar() {
  const {
    items,
    customItems,
    add,
    decrement,
    remove,
    incrementCustom,
    decrementCustom,
    removeCustom,
    clear,
    count,
  } = useSelection();
  const { getProduct, getStone, delivery } = useCatalog();
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  // Resolve selected ids back to full products for display + messaging.
  const lines: OrderLine[] = items
    .map((i) => {
      const product = getProduct(i.productId);
      return product ? { product, size: i.size, qty: i.qty } : null;
    })
    .filter((l): l is OrderLine => l !== null);

  // Resolve custom configs into displayable lines (stone names + images).
  const customLines = customItems.map((c) => {
    const stones = c.stoneIds.map((id) => getStone(id)).filter((s) => s !== undefined);
    return {
      id: c.id,
      beadSize: c.beadSize,
      size: c.size,
      qty: c.qty,
      unitPrice: c.unitPrice,
      stones,
    };
  });

  const total =
    lines.reduce((sum, l) => sum + l.product.price * l.qty, 0) +
    customLines.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
  const deliveryFee = deliveryFeeFor(total, delivery);
  const noun = count === 1 ? "ritual" : "rituals";

  // Build the order link on click so we can use the live origin for the photo
  // preview links (avoids a hydration mismatch from reading window at render).
  const handleOrder = () => {
    const origin = window.location.origin;
    const customOrderLines: CustomOrderLine[] = customLines.map((c) => ({
      beadSize: c.beadSize,
      stoneNames: c.stones.map((s) => s.name),
      size: c.size,
      qty: c.qty,
      unitPrice: c.unitPrice,
      imageUrls: c.stones.map((s) => toAbsoluteImageUrl(s.image, origin)),
    }));
    const link = buildSelectionOrderLink(lines, customOrderLines, delivery, origin);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,34rem)] -translate-x-1/2">
      {/* Expandable list of selected items */}
      {open && (
        <div className="mb-3 max-h-[50vh] overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-medium text-foreground">
              Your bag
            </p>
            <button
              type="button"
              onClick={clear}
              className="text-xs font-medium text-muted underline-offset-4 hover:text-primary hover:underline"
            >
              Clear all
            </button>
          </div>

          <ul className="mt-3 flex flex-col divide-y divide-border/70">
            {/* Custom bracelets */}
            {customLines.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    Custom bracelet ({line.beadSize})
                  </p>
                  <p className="truncate text-xs text-muted">
                    {line.stones.map((s) => s.name).join(", ") || "No stones"} ·
                    Size {line.size} · {inr.format(line.unitPrice * line.qty)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => decrementCustom(line.id)}
                      aria-label="Remove one custom bracelet"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-foreground">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementCustom(line.id)}
                      aria-label="Add one custom bracelet"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCustom(line.id)}
                    aria-label="Remove this custom bracelet entirely"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}

            {/* Catalogue rituals */}
            {lines.map((line) => (
              <li
                key={`${line.product.id}-${line.size}`}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {line.product.name}
                  </p>
                  <p className="text-xs text-muted">
                    Size {line.size} · {inr.format(line.product.price * line.qty)}
                    {line.qty > 1 && (
                      <span> ({inr.format(line.product.price)} each)</span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => decrement(line.product.id, line.size)}
                      aria-label={`Remove one ${line.product.name} size ${line.size}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-foreground">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => add(line.product.id, line.size)}
                      aria-label={`Add one ${line.product.name} size ${line.size}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(line.product.id, line.size)}
                    aria-label={`Remove ${line.product.name} size ${line.size} entirely`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Price breakdown — delivery is shown separately from the items. */}
          <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>Subtotal</span>
              <span>{inr.format(total)}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>Delivery</span>
              <span>{deliveryFee > 0 ? inr.format(deliveryFee) : "FREE"}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{inr.format(total + deliveryFee)}</span>
            </div>
          </div>

        </div>
      )}

      {/* Collapsed bar */}
      <div className="flex items-center gap-2 rounded-full border border-gold-light/30 bg-primary p-1.5 pl-5 text-white shadow-[0_18px_40px_-16px_rgba(110,64,105,0.7)]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left text-sm font-medium"
        >
          <span>
            {count} {noun} · {inr.format(total)}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleOrder}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-deep transition-colors hover:bg-primary-soft"
        >
          Order on WhatsApp
        </button>
      </div>
    </div>
  );
}
