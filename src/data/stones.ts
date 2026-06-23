import type { BraceletSizeId } from "@/data/products";

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
   * Price of a full single-stone bracelet of this stone (rupees). This already
   * reflects the bead size and the stone's relative cost. A combination strand
   * is priced as the average of its stones (see `priceForStones`), since the
   * strand is divided among them rather than adding beads.
   */
  price: number;
  /** Path to the stone swatch image (under /public). */
  image: string;
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
  { name: "Jade", beadSize: "8mm", power: "Luck & harmony", price: 249, image: "/stones/jade-8mm.jpg" },
  { name: "Green Aventurine", beadSize: "8mm", power: "Luck & opportunity", price: 329, image: "/stones/green-aventurine.jpg" },
  { name: "Indian Agate", beadSize: "8mm", power: "Grounding & stability", price: 349, image: "/stones/indian-agate.jpg" },
  { name: "Indian Bloodstone", beadSize: "8mm", power: "Vitality & courage", price: 629, image: "/stones/indian-bloodstone-8mm.jpg" },
  { name: "African Amethyst", beadSize: "8mm", power: "Calm & intuition", price: 649, image: "/stones/african-amethyst.jpg" },
  { name: "Lapis Lazuli", beadSize: "8mm", power: "Wisdom & truth", price: 779, image: "/stones/lapis-lazuli.jpg" },
  { name: "Dyed Citrine", beadSize: "8mm", power: "Joy & abundance", price: 799, image: "/stones/dyed-citrine.jpg" },
  { name: "Black Tourmaline", beadSize: "8mm", power: "Protection & grounding", price: 849, image: "/stones/black-tourmaline.jpg" },
  // 6mm — real inventory. Prices are set a little above each strand's cost
  // from the purchase tracker (a strand makes ~2 bracelets), keeping the
  // sheet's relative ordering. Adjust freely.
  { name: "Matte Yellow Tiger Eye", beadSize: "6mm", power: "Confidence & courage", price: 299, image: "/stones/matte-yellow-tiger-eye.jpg" },
  { name: "Red Tiger Eye", beadSize: "6mm", power: "Motivation & vitality", price: 329, image: "/stones/red-tiger-eye.jpg" },
  { name: "Moss Agate", beadSize: "6mm", power: "Growth & abundance", price: 269, image: "/stones/moss-agate.jpg" },
  { name: "Tree Agate", beadSize: "6mm", power: "Stability & inner peace", price: 209, image: "/stones/tree-agate.jpg" },
  { name: "Shattuckite", beadSize: "6mm", power: "Intuition & truth", price: 349, image: "/stones/shattuckite.jpg" },
  { name: "Black Lava", beadSize: "6mm", power: "Grounding & strength", price: 149, image: "/stones/black-lava.jpg" },
  { name: "Jade", beadSize: "6mm", power: "Luck & harmony", price: 229, image: "/stones/jade.jpg" },
  { name: "Dyed Jade", beadSize: "6mm", power: "Renewal & balance", price: 199, image: "/stones/dyed-jade.jpg" },
  { name: "Black Zebra Jasper", beadSize: "6mm", power: "Balance & grounding", price: 299, image: "/stones/black-zebra-jasper.jpg" },
  { name: "Indian Bloodstone", beadSize: "6mm", power: "Vitality & courage", price: 499, image: "/stones/indian-bloodstone.jpg" },
  { name: "Pyrite", beadSize: "6mm", power: "Abundance & protection", price: 499, image: "/stones/pyrite.jpg" },
  // NOTE: Botswana Agate is 6mm per the purchase sheet (its photo was in the
  // 8mm folder by mistake). Move to 8mm here if you actually stock it in 8mm.
  { name: "Botswana Agate", beadSize: "6mm", power: "Comfort & change", price: 779, image: "/stones/botswana-agate.jpg" },
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

/** Cheapest stone offered in a bead size — used for a "from ₹…" hint. */
export function fromPrice(beadSize: BeadSize): number {
  const prices = stonesBySize(beadSize).map((s) => s.price);
  return prices.length ? Math.min(...prices) : 0;
}

export default stones;
