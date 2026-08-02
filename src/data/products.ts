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
   * Effective price in INR — what the shopper actually pays and what every
   * total is computed from. Equals `originalPrice` when there's no offer, or the
   * discounted price (rounded to the rupee) when `offerPercent > 0`. Delivery
   * (see `DeliverySettings`) is added as a separate line at order time when the
   * order subtotal is below the free threshold.
   */
  price: number;
  /**
   * The regular price before any offer (Sanity `suggestedPrice`). Shown as a
   * struck-through reference next to `price` only when an offer is active.
   */
  originalPrice: number;
  /**
   * Discount percentage configured in Sanity (`offerPercent`). `0` means no
   * offer — `price` then equals `originalPrice`.
   */
  offerPercent: number;
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
  /**
   * What kind of product this is. `undefined`/"bracelet" is the wearable
   * bracelet (the default). "decor" is a Stone Décor object — it has no wrist
   * size and links under /decor instead of /collections. Drives the few
   * type-aware bits in shared components (card link, order flow).
   */
  kind?: "bracelet" | "decor";
  /** Décor only — physical size text, e.g. "Height 7 cm". */
  dimensions?: string;
  /** Décor only — placement ids where the object is meant to live (car/wall/…). */
  placement?: string[];
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
 * The site-wide announcement banner, editable in the Sanity `settings` singleton
 * so promo copy (e.g. a launch-month offer) can be shown, changed, or hidden
 * without a deploy. The banner only renders when `enabled` is true and `text`
 * is non-empty.
 */
export interface Announcement {
  /** Whether the banner strip should be shown at all. */
  enabled: boolean;
  /** The message displayed in the banner. */
  text: string;
}

/** Fallback until the `settings` document is created: banner hidden. */
export const DEFAULT_ANNOUNCEMENT: Announcement = { enabled: false, text: "" };

/**
 * Delivery fee for an order subtotal: the flat `charge` while under the
 * threshold, free once the subtotal reaches it. An empty order (subtotal 0)
 * pays nothing.
 */
export function deliveryFeeFor(subtotal: number, d: DeliverySettings): number {
  return subtotal > 0 && subtotal < d.freeThreshold ? d.charge : 0;
}

/**
 * The price a shopper actually pays given a regular price and an offer: the
 * regular price (unrounded) when there's no offer, otherwise the discounted
 * price rounded to the nearest ₹10 for a clean shelf price — e.g. 5% off ₹1000
 * → ₹950, and an 803 result rounds to 800 while 807 rounds to 810. The regular
 * price is left untouched so only the discount introduces rounding.
 * `offerPercent` is clamped to 0–100 so a bad value can never produce a negative
 * or inflated price.
 */
export function discountedPrice(original: number, offerPercent: number): number {
  const pct = Math.min(Math.max(offerPercent || 0, 0), 100);
  if (pct <= 0) return original;
  return Math.round((original * (1 - pct / 100)) / 10) * 10;
}

/** True when the product has an active offer (a struck price should be shown). */
export function hasOffer(product: Product): boolean {
  return product.offerPercent > 0 && product.price < product.originalPrice;
}

/** Look up a product by its stable tracking code / id within a fetched list. */
export function getProduct(
  products: Product[],
  id: string,
): Product | undefined {
  return products.find((p) => p.id === id);
}
