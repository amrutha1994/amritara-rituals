"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

export default function CollectionBrowser({
  products,
  intentions,
}: {
  products: Product[];
  intentions: Intention[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Current filter state (read from the URL) ──────────────────────────────
  const selectedIntentions = (searchParams.get("intention") ?? "")
    .split(",")
    .filter(Boolean);
  const selectedStone = searchParams.get("stone") ?? "";
  const selectedPrice = searchParams.get("price") ?? "";
  const sort = searchParams.get("sort") ?? "featured";

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

  // ── URL helpers ───────────────────────────────────────────────────────────
  function commit(next: URLSearchParams) {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    commit(next);
  }
  function toggleIntention(id: string) {
    const set = new Set(selectedIntentions);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setParam("intention", Array.from(set).join(","));
  }
  function clearAll() {
    commit(new URLSearchParams());
  }

  const selectClass =
    "rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:border-gold focus:border-gold focus:outline-none";

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
          <select
            aria-label="Filter by stone"
            className={selectClass}
            value={selectedStone}
            onChange={(e) => setParam("stone", e.target.value)}
          >
            <option value="">All stones</option>
            {stoneOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by price"
            className={selectClass}
            value={selectedPrice}
            onChange={(e) => setParam("price", e.target.value)}
          >
            <option value="">Any price</option>
            {PRICE_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort"
            className={selectClass}
            value={sort}
            onChange={(e) => setParam("sort", e.target.value === "featured" ? "" : e.target.value)}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

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
