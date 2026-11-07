"use client";

import { useMemo, useState } from "react";

import type { Intention } from "@/data/intentions";
import { type Product } from "@/data/products";
import ProductCard from "@/components/product-card";

/**
 * Browse UI for a Collections tab beyond Bracelets — Stone Décor, Pendants or
 * any Sanity-managed range. Flat and sizeless: every piece is
 * shown together, with an optional filter by shared Intentions so the same
 * "shop by intention" language spans every line. Reuses ProductCard, which
 * links each item to its own route.
 */
export default function RangeBrowser({
  products,
  intentions,
  emptyCopy = "New pieces are being crafted — check back shortly.",
}: {
  products: Product[];
  intentions: Intention[];
  /** Shown when the line has no items yet. */
  emptyCopy?: string;
}) {
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);

  // Only offer intentions that actually have items.
  const intentionOptions = useMemo(
    () => intentions.filter((i) => products.some((p) => p.intentions.includes(i.id))),
    [intentions, products],
  );

  const results = useMemo(
    () =>
      products.filter((p) => {
        if (
          selectedIntentions.length &&
          !p.intentions.some((id) => selectedIntentions.includes(id))
        )
          return false;
        return true;
      }),
    [products, selectedIntentions],
  );

  function toggleIntention(id: string) {
    setSelectedIntentions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const hasFilters = selectedIntentions.length > 0;
  return (
    <div className="mt-8">
      {/* Intention pills */}
      {intentionOptions.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {intentionOptions.map((i) => {
            const active = selectedIntentions.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => toggleIntention(i.id)}
                aria-pressed={active}
                className={
                  "rounded-full border px-3.5 py-1 text-xs transition-colors " +
                  (active
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-surface text-foreground hover:border-gold hover:text-primary-deep")
                }
              >
                {i.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results
            .filter((product) => product.show)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="font-display text-xl text-foreground">
            {hasFilters ? "Nothing matches those filters" : "New pieces coming soon"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {hasFilters
              ? "Try fewer filters, or clear them to see everything."
              : emptyCopy}
          </p>
        </div>
      )}
    </div>
  );
}
