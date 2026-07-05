import { getProduct, products, type BraceletSizeId, type Product } from "@/data/products";
import type { IntentionId } from "@/data/intentions";

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

/** Custom-bracelet prices are rounded to the nearest this many rupees. */
export const PRICE_ROUNDING = 50;

/** Wrist sizes available for a custom bracelet (same range as the catalogue). */
export type { BraceletSizeId };

export interface Stone {
  /** Stable id used in the cart + WhatsApp order. */
  id: string;
  /** Display name, e.g. "Tiger Eye". */
  name: string;
  beadSize: BeadSize;
  /** Short intention / property, e.g. "Confidence & protection". */
  power: string;
  /**
   * The feelings / intentions this stone serves, used by the Stone Finder to
   * match a person's mood to a blend. See `intentions.ts` for the full list.
   */
  intentions: IntentionId[];
  /**
   * Price of a full single-stone bracelet of this stone (rupees). This already
   * reflects the bead size and the stone's relative cost. A combination strand
   * is priced as the average of its stones (see `priceForStones`), since the
   * strand is divided among them rather than adding beads.
   */
  price: number;
  /** Path to the stone swatch image (under /public). */
  image: string;
  /**
   * The bracelet product (see `products.ts`) this stone links to from the Stone
   * Finder's "Buy now". Points at the closest matching strand — the same stone
   * where we stock it, otherwise the nearest sibling. Leave undefined when no
   * bracelet fits; the finder then falls back to the customiser.
   */
  productId?: string;
}

// NOTE: images are reused from the existing product photos as placeholders.
// Swap in proper close-up swatch photos under /public/stones when available.
const PLACEHOLDER = "/hero-banner.jpg";

type StoneInput = Omit<Stone, "id" | "image"> & { id?: string; image?: string };

/** "Indian Agate" -> "indian-agate" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defineStones(items: StoneInput[]): Stone[] {
  const ids = new Set<string>();
  return items.map((item) => {
    // Ids carry the bead size so the same stone can exist in both 6mm and 8mm
    // (e.g. Jade) without clashing.
    const id = item.id ?? `${slugify(item.name)}-${item.beadSize}`;
    if (ids.has(id)) throw new Error(`Duplicate stone id: "${id}"`);
    ids.add(id);
    return { ...item, id, image: item.image ?? PLACEHOLDER };
  });
}

// ─────────────────────────────────────────────────────────────────────────
// To add a stone: copy a line, set its name, bead size, power and a photo.
// `id` is derived from the name and `image` falls back to a placeholder.
// ─────────────────────────────────────────────────────────────────────────
export const stones: Stone[] = defineStones([
  // 8mm — real inventory. Prices set a little above each strand's cost from the
  // purchase tracker (a strand makes ~2 bracelets), keeping cost ordering.
  { name: "Jade", beadSize: "8mm", power: "Luck & harmony", intentions: ["abundance", "harmony", "healing"], price: 249, image: "/stones/jade-8mm.jpg", productId: "AMT15" },
  { name: "Green Aventurine", beadSize: "8mm", power: "Luck & opportunity", intentions: ["abundance", "growth", "harmony"], price: 329, image: "/stones/green-aventurine.jpg", productId: "AMT13" },
  { name: "Indian Agate", beadSize: "8mm", power: "Grounding & stability", intentions: ["grounding", "calm", "protection"], price: 349, image: "/stones/indian-agate.jpg", productId: "AMT17" },
  { name: "Indian Bloodstone", beadSize: "8mm", power: "Vitality & courage", intentions: ["motivation", "confidence", "healing"], price: 629, image: "/stones/indian-bloodstone-8mm.jpg", productId: "AMT16" },
  { name: "African Amethyst", beadSize: "8mm", power: "Calm & intuition", intentions: ["calm", "clarity", "healing"], price: 649, image: "/stones/african-amethyst.jpg", productId: "AMT12" },
  { name: "Lapis Lazuli", beadSize: "8mm", power: "Wisdom & truth", intentions: ["clarity", "confidence", "harmony"], price: 779, image: "/stones/lapis-lazuli.jpg", productId: "AMT18" },
  { name: "Dyed Citrine", beadSize: "8mm", power: "Joy & abundance", intentions: ["abundance", "motivation", "confidence"], price: 799, image: "/stones/dyed-citrine.jpg", productId: "AMT13" },
  { name: "Black Tourmaline", beadSize: "8mm", power: "Protection & grounding", intentions: ["protection", "grounding", "calm"], price: 849, image: "/stones/black-tourmaline.jpg", productId: "AMT14" },
  // 6mm — real inventory. Prices are set a little above each strand's cost
  // from the purchase tracker (a strand makes ~2 bracelets), keeping the
  // sheet's relative ordering. Adjust freely.
  { name: "Matte Yellow Tiger Eye", beadSize: "6mm", power: "Confidence & courage", intentions: ["confidence", "grounding", "protection"], price: 299, image: "/stones/matte-yellow-tiger-eye.jpg", productId: "AMT01" },
  { name: "Red Tiger Eye", beadSize: "6mm", power: "Motivation & vitality", intentions: ["motivation", "confidence"], price: 329, image: "/stones/red-tiger-eye.jpg", productId: "AMT05" },
  { name: "Moss Agate", beadSize: "6mm", power: "Growth & abundance", intentions: ["growth", "abundance", "healing"], price: 269, image: "/stones/moss-agate.jpg", productId: "AMT02" },
  { name: "Tree Agate", beadSize: "6mm", power: "Stability & inner peace", intentions: ["grounding", "calm", "growth"], price: 209, image: "/stones/tree-agate.jpg", productId: "AMT07" },
  { name: "Shattuckite", beadSize: "6mm", power: "Intuition & truth", intentions: ["clarity", "calm"], price: 349, image: "/stones/shattuckite.jpg", productId: "AMT03" },
  { name: "Black Lava", beadSize: "6mm", power: "Grounding & strength", intentions: ["grounding", "protection", "confidence"], price: 149, image: "/stones/black-lava.jpg", productId: "AMT04" },
  { name: "Jade", beadSize: "6mm", power: "Luck & harmony", intentions: ["abundance", "harmony", "healing"], price: 229, image: "/stones/jade.jpg", productId: "AMT06" },
  { name: "Dyed Jade", beadSize: "6mm", power: "Renewal & balance", intentions: ["growth", "harmony", "healing"], price: 199, image: "/stones/dyed-jade.jpg", productId: "AMT11" },
  { name: "Black Zebra Jasper", beadSize: "6mm", power: "Balance & grounding", intentions: ["grounding", "protection", "calm"], price: 299, image: "/stones/black-zebra-jasper.jpg", productId: "AMT19" },
  { name: "Indian Bloodstone", beadSize: "6mm", power: "Vitality & courage", intentions: ["motivation", "confidence", "healing"], price: 499, image: "/stones/indian-bloodstone.jpg", productId: "AMT08" },
  { name: "Pyrite", beadSize: "6mm", power: "Abundance & protection", intentions: ["abundance", "confidence", "protection"], price: 499, image: "/stones/pyrite.jpg", productId: "AMT09" },
  // NOTE: Botswana Agate is 6mm per the purchase sheet (its photo was in the
  // 8mm folder by mistake). Move to 8mm here if you actually stock it in 8mm.
  { name: "Botswana Agate", beadSize: "6mm", power: "Comfort & change", intentions: ["healing", "calm", "growth"], price: 779, image: "/stones/botswana-agate.jpg", productId: "AMT10" },
]);

/** Stones offered in a given bead size, in display order. */
export function stonesBySize(beadSize: BeadSize): Stone[] {
  return stones.filter((s) => s.beadSize === beadSize);
}

/** Look up a stone by id. */
export function getStone(id: string): Stone | undefined {
  return stones.find((s) => s.id === id);
}

/**
 * Price of a custom bracelet for the chosen stones. A single stone is its own
 * price; a combination is the average of the chosen stones, rounded to keep
 * totals tidy — because the strand is shared between them, not added up.
 * Returns 0 when nothing is chosen.
 */
export function priceForStones(stoneIds: string[]): number {
  const prices = stoneIds
    .map((id) => getStone(id)?.price)
    .filter((p): p is number => p !== undefined);
  if (prices.length === 0) return 0;
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  return Math.round(avg / PRICE_ROUNDING) * PRICE_ROUNDING;
}

/**
 * Recommends a small blend of stones for the chosen feelings within one bead
 * size. Each stone scores by how many of the selected intentions it serves; the
 * top `count` are returned (best match first). Falls back to the most versatile
 * stones in the size if nothing matches, so the finder never dead-ends.
 */
export function recommendStones(
  intentionIds: string[],
  beadSize: BeadSize,
  count = 3,
): Stone[] {
  const wanted = new Set(intentionIds);
  const pool = stonesBySize(beadSize);

  const scored = pool
    .map((stone) => ({
      stone,
      score: stone.intentions.filter((i) => wanted.has(i)).length,
    }))
    // Best match first; tie-break toward more focused (fewer-intention) stones
    // so a precise match isn't beaten by a scattergun one, then by lower price.
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.stone.intentions.length - b.stone.intentions.length ||
        a.stone.price - b.stone.price,
    );

  const matched = scored.filter((s) => s.score > 0).map((s) => s.stone);
  // If too few stones actually match, top up from the rest of the pool.
  const filler = scored.filter((s) => s.score === 0).map((s) => s.stone);
  return [...matched, ...filler].slice(0, Math.min(count, MAX_STONES));
}

/**
 * Recommends the best stones for a single intention, across all bead sizes —
 * used by the Stone Finder's one-step flow. Stones that serve the intention are
 * ranked most-focused first (a stone devoted to this intention beats a
 * scattergun one), then cheapest, then deduped by name so the same stone doesn't
 * appear twice in 6mm and 8mm. Returns up to `count`.
 */
export function recommendStonesForIntention(
  intentionId: string,
  count = 3,
): Stone[] {
  const ranked = stones
    .filter((s) => s.intentions.includes(intentionId as IntentionId))
    .sort(
      (a, b) =>
        a.intentions.length - b.intentions.length || a.price - b.price,
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
 * `productId`, falling back to a same-stone match by name so a newly added
 * stone still resolves if it shares a name with a catalogue bracelet.
 */
export function productForStone(stone: Stone): Product | undefined {
  if (stone.productId) return getProduct(stone.productId);
  return products.find((p) => p.stone.toLowerCase() === stone.name.toLowerCase());
}

/** Cheapest stone offered in a bead size — used for a "from ₹…" hint. */
export function fromPrice(beadSize: BeadSize): number {
  const prices = stonesBySize(beadSize).map((s) => s.price);
  return prices.length ? Math.min(...prices) : 0;
}

export default stones;
