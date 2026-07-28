"use client";

import { useMemo, useState } from "react";

import type { Intention } from "@/data/intentions";
import type { Product } from "@/data/products";
import ProductCard from "@/components/product-card";

/** Price bands (listed price, ₹). Boundaries chosen to keep each band populated. */
const PRICE_BANDS: { id: string; label: string; test: (p: number) => boolean }[] = [
  { id: "u500", label: "Under ₹500", test: (p) => p < 500 },
  { id: "500-750", label: "₹500 – ₹750", test: (p) => p >= 500 && p < 750 },
  { id: "750-1000", label: "₹750 – ₹1,000", test: (p) => p >= 750 && p < 1000 },
  { id: "o1000", label: "Over ₹1,000", test: (p) => p >= 1000 },
];

const SORTS: { id: string; label: string; cmp?: (a: Product, b: Product) => number }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high", cmp: (a, b) => a.price - b.price },
  { id: "price-desc", label: "Price: high to low", cmp: (a, b) => b.price - a.price },
  { id: "name", label: "Name: A–Z", cmp: (a, b) => a.name.localeCompare(b.name) },
];

// Native <select> arrows render inconsistently across browsers (Chrome hugs the
// edge, Safari leaves more room). We hide the native arrow (`appearance-none`)
// and draw our own chevron, with `pr-9` reserving space so text/arrow never
// collide — identical in every browser.
const selectClass =
  "cursor-pointer appearance-none rounded-full border border-border bg-surface py-2 pl-4 pr-9 text-sm text-foreground shadow-sm transition-colors hover:border-gold focus:border-gold focus:outline-none";

/** A pill-styled dropdown with a consistent custom chevron. */
function SelectPill(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex">
      <select {...props} className={selectClass} />
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export default function CollectionBrowser({
  products,
  intentions,
}: {
  products: Product[];
  intentions: Intention[];
}) {
  // ── Filter state (local — a click always re-renders) ──────────────────────
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [selectedStone, setSelectedStone] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sort, setSort] = useState("featured");

  // ── Facet options (only offer values that actually exist) ─────────────────
  const intentionOptions = useMemo(
    () => intentions.filter((i) => products.some((p) => p.intentions.includes(i.id))),
    [intentions, products],
  );
  const stoneOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.stone).filter(Boolean))).sort(),
    [products],
  );

  // ── Apply filters + sort ──────────────────────────────────────────────────
  const results = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.id === selectedPrice);
    let list = products.filter((p) => {
      if (
        selectedIntentions.length &&
        !p.intentions.some((id) => selectedIntentions.includes(id))
      )
        return false;
      if (selectedStone && p.stone !== selectedStone) return false;
      if (band && !band.test(p.price)) return false;
      return true;
    });
    const cmp = SORTS.find((s) => s.id === sort)?.cmp;
    if (cmp) list = [...list].sort(cmp);
    return list;
  }, [products, selectedIntentions, selectedStone, selectedPrice, sort]);

  const hasFilters =
    selectedIntentions.length > 0 || Boolean(selectedStone) || Boolean(selectedPrice);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function toggleIntention(id: string) {
    setSelectedIntentions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function clearAll() {
    setSelectedIntentions([]);
    setSelectedStone("");
    setSelectedPrice("");
  }

  return (
    <div className="mt-12">
      {/* Flagship facet: shop by intention */}
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-antique">
          Shop by intention
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {intentionOptions.map((i) => {
            const active = selectedIntentions.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => toggleIntention(i.id)}
                aria-pressed={active}
                className={
                  "rounded-full border px-4 py-1.5 text-sm transition-colors " +
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
      </div>

      {/* Controls bar: count · stone · price · sort · clear */}
      <div className="mt-8 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted" aria-live="polite">
          {results.length} {results.length === 1 ? "bracelet" : "bracelets"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <SelectPill
            aria-label="Filter by stone"
            value={selectedStone}
            onChange={(e) => setSelectedStone(e.target.value)}
          >
            <option value="">All stones</option>
            {stoneOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectPill>

          <SelectPill
            aria-label="Filter by price"
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
          >
            <option value="">Any price</option>
            {PRICE_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </SelectPill>

          <SelectPill
            aria-label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </SelectPill>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-3 py-2 text-sm font-medium text-gold-antique underline-offset-4 transition-colors hover:text-primary-deep hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="font-display text-xl text-foreground">
            No bracelets match those filters
          </p>
          <p className="mt-2 text-sm text-muted">
            Try fewer filters or a different intention.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
