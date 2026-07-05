import type { Product } from "@/data/products";
import type { BraceletSizeId } from "@/data/products";
import type { IntentionId } from "@/data/intentions";

/**
 * Stone content is authored in Sanity and mapped to these shapes in
 * `src/sanity/queries.ts`. This module keeps the types, config constants and
 * the pure pricing / recommendation logic — all of which take the fetched data
 * as arguments so they stay client-safe and testable.
 */

/**
 * Bead diameter. Stones are offered in one bead size each — the size shapes the
 * look (6mm is dainty, 8mm is bold), so a custom strand is built within a single
 * size rather than mixing diameters.
 */
export type BeadSize = "6mm" | "8mm";

export interface BeadSizeInfo {
  id: BeadSize;
  /** Short headline for the choice, e.g. "Dainty & delicate". */
  headline: string;
  /** One-line description of the feel. */
  note: string;
}

export const BEAD_SIZES: BeadSizeInfo[] = [
  { id: "6mm", headline: "Dainty & delicate", note: "Fine 6mm beads — soft and understated, lovely stacked." },
  { id: "8mm", headline: "Bold & grounding", note: "Generous 8mm beads — a confident, statement strand." },
];

/** How many different stones may share one strand. */
export const MIN_STONES = 1;
export const MAX_STONES = 4;

/** Custom prices are rounded to the nearest this many rupees to stay tidy. */
export const PRICE_ROUNDING = 10;

/**
 * One-time blend fee (rupees) added when a custom strand mixes 2+ stones. A
 * bracelet is a single fixed-length band shared equally among its stones, so the
 * stone cost is their average — this flat fee (charged once, never per stone)
 * covers the extra hand-work of laying out a blended design. A single-stone
 * custom strand pays no fee, so it costs exactly its ready-made bracelet price.
 */
export const BLEND_FEE = 100;

/** Wrist sizes available for a custom bracelet (same range as the catalogue). */
export type { BraceletSizeId };

export interface Stone {
  /** Stable id (Sanity `slug`), used in the cart + WhatsApp order. */
  id: string;
  /** Display name, e.g. "Tiger Eye". */
  name: string;
  beadSize: BeadSize;
  /** Short intention / property, e.g. "Confidence & protection". */
  power: string;
  /** The intentions this stone serves (intention ids), used by the finder. */
  intentions: IntentionId[];
  /**
   * Retail price (rupees, ex-shipping) of a full single-stone bracelet of this
   * stone — the source of truth for custom pricing.
   */
  price: number;
  /** Stone swatch image URL. */
  image: string;
  /** The bracelet product code this stone links to from the finder's "Buy now". */
  productId?: string;
}

/** Stones offered in a given bead size, in display order. */
export function stonesBySize(stones: Stone[], beadSize: BeadSize): Stone[] {
  return stones.filter((s) => s.beadSize === beadSize);
}

/** Look up a stone by id within a fetched list. */
export function getStone(stones: Stone[], id: string): Stone | undefined {
  return stones.find((s) => s.id === id);
}

export interface PriceBreakdown {
  /** The stones' shared strand cost — the average of the chosen stone prices. */
  base: number;
  /** One-time blend fee — BLEND_FEE for a mix of 2+ stones, else 0. */
  blendFee: number;
  /** base + blendFee. */
  total: number;
}

/**
 * Price of a custom bracelet for the chosen stones — "the strand shared equally
 * among your stones, plus a one-time blend fee when you mix":
 *
 *   unit = round(average of stone prices) + (stoneCount > 1 ? BLEND_FEE : 0)
 *
 * A single stone costs exactly its ready-made bracelet price (no fee); a blend
 * costs the average of its stones plus one flat fee. Returns 0 when nothing is
 * chosen.
 */
export function priceForStones(stoneIds: string[], stones: Stone[]): number {
  return priceBreakdownForStones(stoneIds, stones).total;
}

/** Itemised custom price, so the summary can show how the total is built. */
export function priceBreakdownForStones(
  stoneIds: string[],
  stones: Stone[],
): PriceBreakdown {
  const prices = stoneIds
    .map((id) => getStone(stones, id)?.price)
    .filter((p): p is number => p !== undefined);
  if (prices.length === 0) {
    return { base: 0, blendFee: 0, total: 0 };
  }
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const base = Math.round(avg / PRICE_ROUNDING) * PRICE_ROUNDING;
  const blendFee = prices.length > 1 ? BLEND_FEE : 0;
  return { base, blendFee, total: base + blendFee };
}

/**
 * Recommends the best stones for a single intention, across all bead sizes —
 * used by the Stone Finder's one-step flow. Stones that serve the intention are
 * ranked most-focused first (a stone devoted to this intention beats a
 * scattergun one), then cheapest, then deduped by name so the same stone doesn't
 * appear twice in 6mm and 8mm. Returns up to `count`.
 */
export function recommendStonesForIntention(
  stones: Stone[],
  intentionId: string,
  count = 3,
): Stone[] {
  const ranked = stones
    .filter((s) => s.intentions.includes(intentionId))
    .sort(
      (a, b) => a.intentions.length - b.intentions.length || a.price - b.price,
    );

  const seen = new Set<string>();
  const unique: Stone[] = [];
  for (const stone of ranked) {
    if (seen.has(stone.name)) continue;
    seen.add(stone.name);
    unique.push(stone);
    if (unique.length >= count) break;
  }
  return unique;
}

/**
 * The bracelet product a stone links to from the finder. Prefers the explicit
 * `productId`, falling back to a same-stone match by name.
 */
export function productForStone(
  stone: Stone,
  products: Product[],
): Product | undefined {
  if (stone.productId) return products.find((p) => p.id === stone.productId);
  return products.find(
    (p) => p.stone.toLowerCase() === stone.name.toLowerCase(),
  );
}

/** Cheapest stone offered in a bead size — used for a "from ₹…" hint. */
export function fromPrice(stones: Stone[], beadSize: BeadSize): number {
  const prices = stonesBySize(stones, beadSize).map((s) => s.price);
  return prices.length ? Math.min(...prices) : 0;
}
