"use client";

import type { Product } from "@/data/products";
import { useProductSheet } from "@/components/product-sheet-provider";
import { useSelection } from "@/components/selection-provider";

/**
 * Card footer button. Opens the shared quick-order sheet for the product.
 * Reflects how many of this product are already in the selection.
 */
export default function CardAddButton({ product }: { product: Product }) {
  const { open } = useProductSheet();
  const { productQty } = useSelection();
  const qty = productQty(product.id);
  const selected = qty > 0;

  return (
    <button
      type="button"
      onClick={() => open(product)}
      aria-label={
        selected
          ? `Edit ${product.name} in your bag`
          : `Add ${product.name} to your bag`
      }
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? "bg-primary text-white ring-1 ring-gold-light/30 hover:bg-primary-deep"
          : "border border-border text-primary-deep hover:border-primary hover:bg-primary-soft"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {selected ? `In bag · ${qty}` : "Add to bag"}
    </button>
  );
}
