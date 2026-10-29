import type { Product } from "@/data/products";

/**
 * A product range shown as its own Collections tab — Stone Décor, Pendants, or
 * any range added later. Ranges are authored in Sanity (`productRange`
 * documents), so a new tab needs no code change: create the range, add
 * products to it, and switch it on. Bracelets are the one built-in range (they
 * have wrist sizes, bead sizes and the customiser), so they aren't a `Range`.
 *
 * Every range is sizeless: a piece is picked and ordered as-is, with a quantity.
 */

/** Tab icons an author can pick from in the Studio. */
export const RANGE_ICONS = [
  { title: "Bracelet", value: "bracelet" },
  { title: "Home / décor", value: "decor" },
  { title: "Pendant", value: "pendant" },
  { title: "Gem", value: "gem" },
  { title: "Sparkle", value: "sparkle" },
  { title: "Heart", value: "heart" },
  { title: "Moon", value: "moon" },
  { title: "Leaf", value: "leaf" },
] as const;

export type RangeIconName = (typeof RANGE_ICONS)[number]["value"];

/** The bits of a range a product carries, for links and labels. */
export interface RangeRef {
  /** URL key: /shop/<slug>/…, and the tab's `/#<slug>` link. */
  slug: string;
  /** Tab label, e.g. "Pendants". */
  title: string;
  /** One item, in a sentence: "pendant", "piece". */
  itemName: string;
}

export interface Range extends RangeRef {
  icon: RangeIconName;
  /** Line under the tab when it's selected. */
  subcopy: string;
  /** Intro paragraph on the range's own page. */
  intro: string;
  /** Shown on every product page in the range, e.g. thread details. */
  productNote: string;
  /**
   * Pair with bracelets of the same stone: "Complete the ritual" on bracelet
   * and product pages, and links from the Stone Finder.
   */
  pairWithBracelets: boolean;
  /** The line under "Complete the ritual" on a bracelet page. */
  pairingLine: string;
  /** Homepage spotlight strip above the collection. */
  spotlight: { enabled: boolean; heading: string; text: string };
  /** The range's products, in Studio order. */
  products: Product[];
}
