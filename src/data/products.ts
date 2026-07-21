import type { IntentionId } from "@/data/intentions";

/** Bracelet size identifiers (wrist-circumference based). */
export type BraceletSizeId = "S" | "M" | "L";

export interface BraceletSize {
  id: BraceletSizeId;
  /** Human-friendly name, e.g. "Medium" */
  label: string;
  /** Wrist circumference the size is intended for, e.g. "15–16 cm" */
  wrist: string;
  /** Typical fit guidance by gender, e.g. "Women" or "Men / Women" */
  fit: string;
}

// All bracelets are offered in the same three wrist-based sizes for now.
// (Most beaded styles have a little give, so the ranges overlap slightly.)
// `fit` is a rough guide — women's wrists tend to run smaller than men's,
// but wrist measurement is always the reliable way to choose.
export const BRACELET_SIZES: BraceletSize[] = [
  { id: "S", label: "Small", wrist: "14–15 cm", fit: "Women" },
  { id: "M", label: "Medium", wrist: "15–16 cm", fit: "Women / Men" },
  { id: "L", label: "Large", wrist: "16–17 cm", fit: "Men" },
];

/**
 * A ready-made bracelet. The content is authored in Sanity and mapped to this
 * shape in `src/sanity/queries.ts`; this module keeps the type, config and pure
 * helpers so client components can import them without touching the server.
 */
export interface Product {
  /**
   * Stable tracking code / SKU (Sanity `code`). Appears in the WhatsApp order,
   * so keep it short and unique (e.g. "AMR-AME-01"). Never reuse a retired code.
   */
  id: string;
  /** Display name of the bracelet */
  name: string;
  /** Primary gemstone */
  stone: string;
  /**
   * Listed price in INR — what the storefront shows. This is exactly the Sanity
   * `suggestedPrice`; delivery (see `DeliverySettings`) is added as a separate
   * line at order time when the order subtotal is below the free threshold.
   */
  price: number;
  /**
   * Units left in stock (Sanity `remainingQuantity`). Optional:
   *   - `undefined` → stock not tracked; always orderable, nothing shown
   *   - `0` → sold out; ordering is disabled
   *   - `> 0` → shown to shoppers as "Only N left"
   */
  remainingQuantity?: number;
  /** One-line intention / purpose */
  shortIntention: string;
  /** Longer descriptive copy */
  description: string;
  /**
   * A few short metaphysical / wellbeing benefits of the stone, shown as a
   * list on the detail page. Optional — omit until a product has its copy.
   */
  benefits?: string[];
  /** Primary product image (first gallery image). */
  image: string;
  /** All product photos for the detail-page gallery, in display order. */
  images: string[];
  /** URL-friendly slug, e.g. for /collections/[slug] */
  slug: string;
  /**
   * The intention ids this bracelet serves (Sanity intention `key`s), seeded
   * from its stone(s). Drives the collection filter. Empty until authored.
   */
  intentions: IntentionId[];
}

/** Stock state derived from a product's optional `remainingQuantity`. */
export type StockStatus = "untracked" | "in_stock" | "sold_out";

export function stockStatus(product: Product): StockStatus {
  if (product.remainingQuantity == null) return "untracked";
  return product.remainingQuantity <= 0 ? "sold_out" : "in_stock";
}

/** True when stock is tracked and none remain — ordering should be blocked. */
export function isSoldOut(product: Product): boolean {
  return stockStatus(product) === "sold_out";
}

/**
 * Short shopper-facing stock note, or `null` when nothing should be shown
 * (stock untracked, or sold out — the "Sold out" state is handled separately).
 * Low counts read as urgency ("Only 2 left"); larger counts stay factual.
 */
export function stockLabel(product: Product): string | null {
  if (stockStatus(product) !== "in_stock") return null;
  const n = product.remainingQuantity as number;
  return n <= 5 ? `Only ${n} left` : `${n} in stock`;
}

/**
 * The delivery rule, editable in Sanity (see the `settings` singleton) so prices
 * can change without a deploy: an order whose subtotal is below `freeThreshold`
 * pays a flat `charge`; at or above it, delivery is free.
 */
export interface DeliverySettings {
  /** Flat delivery fee (INR) for orders below the free-delivery threshold. */
  charge: number;
  /** Subtotal (INR) at or above which delivery is free. */
  freeThreshold: number;
}

/**
 * Fallback used until the Sanity `settings` document is created (or if it can't
 * be fetched), so ordering never breaks. Mirrors the schema's initial values.
 */
export const DEFAULT_DELIVERY: DeliverySettings = { charge: 50, freeThreshold: 700 };

/**
 * Delivery fee for an order subtotal: the flat `charge` while under the
 * threshold, free once the subtotal reaches it. An empty order (subtotal 0)
 * pays nothing.
 */
export function deliveryFeeFor(subtotal: number, d: DeliverySettings): number {
  return subtotal > 0 && subtotal < d.freeThreshold ? d.charge : 0;
}

/** Look up a product by its stable tracking code / id within a fetched list. */
export function getProduct(
  products: Product[],
  id: string,
): Product | undefined {
  return products.find((p) => p.id === id);
}
