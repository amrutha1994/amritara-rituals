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

export interface Product {
  /**
   * Stable tracking code / SKU. Stays fixed for the life of the product and
   * is what appears in the WhatsApp order, so keep it short and unique
   * (e.g. "AMR-AME-01"). Never reuse a retired code.
   */
  id: string;
  /** Display name of the bracelet */
  name: string;
  /** Primary gemstone */
  stone: string;
  /**
   * Listed price in INR — what the storefront shows. This is the sheet's
   * "Suggested Price" with shipping removed (`suggestedPrice - SHIPPING_FEE`);
   * shipping is added back as a separate line at order time.
   */
  price: number;
  /** One-line intention / purpose */
  shortIntention: string;
  /** Longer descriptive copy */
  description: string;
  /** Primary product image (under /public) — the first gallery image. */
  image: string;
  /**
   * All product photos for the detail-page gallery, in display order.
   * Always has at least one entry (`image` is its first element).
   */
  images: string[];
  /** URL-friendly slug, e.g. for /collections/[slug] */
  slug: string;
}

// Product photos live in /public/products. Until a product has its own photo,
// leave `image` out and it falls back to this placeholder.
const PLACEHOLDER_IMAGE = "/hero-banner.jpg";

// The detail-page gallery shows a carousel + thumbnails once a product has more
// than one photo. Until a product has its full set, we pad its gallery up to
// this many slots (repeating the last image) so the gallery still appears.
// Supply that many real photos via `images: [...]` and no padding happens.
const GALLERY_SLOTS = 3;

/**
 * Flat shipping charge (INR), kept separate from the listed price and added as
 * its own line at order time. The pricing sheet folds ₹70 shipping into each
 * "Suggested Price", so we subtract it back out for the listed price.
 */
export const SHIPPING_FEE = 70;

/**
 * What you fill in when adding a product. Only the essentials are required —
 * `slug` is derived from the name and the images fall back to the placeholder,
 * so a new product is usually just six lines.
 *
 * Provide either a single `image` or an `images` array (or both). The first
 * gallery image is whatever you list first — `images[0]`, or `image` when no
 * array is given.
 */
type ProductInput = Omit<Product, "slug" | "image" | "images" | "price"> & {
  slug?: string;
  image?: string;
  images?: string[];
  /**
   * The pricing sheet's "Suggested Price" (the final price including shipping).
   * The listed `price` is derived as `suggestedPrice - SHIPPING_FEE`.
   */
  suggestedPrice: number;
};

/** "Rose Quartz Heart Ritual" -> "rose-quartz-heart-ritual" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalises the raw list into full Product objects and guards against the
 * two mistakes that are easy to make by hand: a duplicate tracking code or a
 * duplicate slug. Runs once at module load, so a clash fails the build rather
 * than silently shipping — no runtime cost on the page.
 */
function defineProducts(items: ProductInput[]): Product[] {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  return items.map((item) => {
    const slug = item.slug ?? slugify(item.name);

    if (ids.has(item.id)) throw new Error(`Duplicate product id: "${item.id}"`);
    if (slugs.has(slug)) throw new Error(`Duplicate product slug: "${slug}"`);
    ids.add(item.id);
    slugs.add(slug);

    // Build the gallery from `images` (preferred) or the single `image`,
    // falling back to the placeholder. `image` always mirrors images[0].
    const provided =
      item.images?.length
        ? item.images
        : [item.image ?? PLACEHOLDER_IMAGE];

    // Pad short galleries up to GALLERY_SLOTS (repeating the last image) so the
    // detail-page carousel still appears with placeholder views. Once a product
    // supplies that many real photos, nothing is padded.
    const images = [...provided];
    while (images.length < GALLERY_SLOTS) {
      images.push(provided[provided.length - 1]);
    }

    // Listed price = sheet's suggested price minus the separate shipping fee.
    const { suggestedPrice, ...rest } = item;
    return {
      ...rest,
      price: suggestedPrice - SHIPPING_FEE,
      slug,
      image: images[0],
      images,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────
// To add a product: copy one block, give it a new unique `id`, fill the
// fields, and drop a photo in /public/products. `slug` and `image` are
// optional. That's it — the grid, the product page, and the WhatsApp order
// all pick it up automatically.
// ─────────────────────────────────────────────────────────────────────────
// `suggestedPrice` is the sheet's final price (incl. ₹70 shipping). The listed
// price is derived as suggestedPrice - SHIPPING_FEE. Images are placeholders
// for now — drop real photos in /public/products and add an `images: [...]`.
export const products: Product[] = defineProducts([
  // ── 6mm ──────────────────────────────────────────────────────────────
  {
    id: "AMT01",
    name: "Matte Yellow Tiger Eye Bracelet (6mm)",
    stone: "Tiger Eye",
    images: [
      "/products/images/6mm/matte-yellow-tiger-eye/matte-yellow-tiger-eye-6mm-3.jpg",
      "/products/images/6mm/matte-yellow-tiger-eye/matte-yellow-tiger-eye-6mm-1.jpg",
      "/products/images/6mm/matte-yellow-tiger-eye/matte-yellow-tiger-eye-6mm-2.jpg",
    ],
    suggestedPrice: 600,
    shortIntention: "Confidence and steady courage.",
    description:
      "Warm, matte yellow tiger eye — the stone of courage and grounded confidence, worn to steady the nerves and keep you focused on what matters.",
  },
  {
    id: "AMT02",
    name: "Moss Agate Bracelet (6mm)",
    stone: "Moss Agate",
    images: [
      "/products/images/6mm/moss-agate/moss-agate-6mm-1.jpg",
      "/products/images/6mm/moss-agate/moss-agate-6mm-2.jpg",
      "/products/images/6mm/moss-agate/moss-agate-6mm-3.jpg",
    ],
    suggestedPrice: 550,
    shortIntention: "Growth, renewal and abundance.",
    description:
      "Earthy green moss agate, long seen as the gardener's stone of growth and new beginnings — a quiet reminder that you are always becoming.",
  },
  {
    id: "AMT03",
    name: "Shattuckite Bracelet (6mm)",
    stone: "Shattuckite",
    images: [
      "/products/images/6mm/shattuckite/shattuckite-1.jpg",
      "/products/images/6mm/shattuckite/shattuckite-2.jpg",
      "/products/images/6mm/shattuckite/shattuckite-3.jpg",
      "/products/images/6mm/shattuckite/shattuckite-4.jpg",
    ],
    suggestedPrice: 650,
    shortIntention: "Intuition and inner truth.",
    description:
      "Deep blue shattuckite, a stone of intuition and honest expression, meant to help you speak and live your truth with clarity.",
  },
  {
    id: "AMT04",
    name: "Lava & Red Tiger Eye Bracelet (6mm)",
    stone: "Lava · Red Tiger Eye",
    images: [
      "/products/images/6mm/lava-red-tiger-eye/lava-red-tiger-eye-1.jpg",
      "/products/images/6mm/lava-red-tiger-eye/lava-red-tiger-eye-2.jpg",
      "/products/images/6mm/lava-red-tiger-eye/lava-red-tiger-eye-3.jpg",
    ],
    suggestedPrice: 500,
    shortIntention: "Grounded strength with fresh motivation.",
    description:
      "Porous black lava paired with fiery red tiger eye — grounding and drive in one strand, for steady footing and the push to begin.",
  },
  {
    id: "AMT05",
    name: "Red Tiger Eye Bracelet (6mm)",
    stone: "Red Tiger Eye",
    images: [
      "/products/images/6mm/red-tiger-eye/red-tiger-eye-1.jpg",
      "/products/images/6mm/red-tiger-eye/red-tiger-eye-2.jpg",
      "/products/images/6mm/red-tiger-eye/red-tiger-eye-3.jpg",
    ],
    suggestedPrice: 650,
    shortIntention: "Motivation, drive and vitality.",
    description:
      "Rich red tiger eye, a stone of motivation and energy, worn to stir momentum on the days you need a spark.",
  },
  {
    id: "AMT06",
    name: "Jade Bracelet (6mm)",
    stone: "Jade",
    images: ["/products/images/6mm/jade/jade-1.jpeg", "/products/images/6mm/jade/jade-2.jpeg"],
    suggestedPrice: 500,
    shortIntention: "Luck, balance and harmony.",
    description:
      "Soft olive jade, the timeless stone of luck and harmony, carried to invite calm balance and gentle good fortune.",
  },
  {
    id: "AMT07",
    name: "Tree Agate Bracelet (6mm)",
    stone: "Tree Agate",
    images: [
      "/products/images/6mm/tree-agate/tree-agate-1.jpg",
      "/products/images/6mm/tree-agate/tree-agate-2.jpg",
      "/products/images/6mm/tree-agate/tree-agate-3.jpg",
    ],
    suggestedPrice: 500,
    shortIntention: "Stability and quiet inner peace.",
    description:
      "Creamy tree agate veined with green — a grounding stone of stability and inner peace for staying rooted through the noise.",
  },
  {
    id: "AMT08",
    name: "Indian Bloodstone Bracelet (6mm)",
    stone: "Indian Bloodstone",
    images: [
      "/products/images/6mm/indian-bloodstone/indian-bloodstone-1.jpg",
      "/products/images/6mm/indian-bloodstone/indian-bloodstone-2.jpg",
      "/products/images/6mm/indian-bloodstone/indian-bloodstone-3.jpg",
      "/products/images/6mm/indian-bloodstone/indian-bloodstone-4.jpg",
    ],
    suggestedPrice: 800,
    shortIntention: "Vitality, courage and resilience.",
    description:
      "Deep green bloodstone flecked with red, prized as the stone of vitality and courage, worn to renew strength and resolve.",
  },
  {
    id: "AMT09",
    name: "Pyrite Bracelet (6mm)",
    stone: "Pyrite",
    images: [
      "/products/images/6mm/pyrite/pyrite-1.jpeg",
      "/products/images/6mm/pyrite/pyrite-2.jpeg",
      "/products/images/6mm/pyrite/pyrite-3.jpeg",
    ],
    suggestedPrice: 800,
    shortIntention: "Abundance and protective strength.",
    description:
      "Golden, metallic pyrite — the merchant's stone of abundance and a protective shield, meant to draw prosperity and confidence.",
  },
  {
    id: "AMT10",
    name: "Botswana Agate Bracelet (6mm)",
    stone: "Botswana Agate",
    images: ["/products/images/6mm/botswana-agate/botswana-agate-1.jpg", "/products/images/6mm/botswana-agate/botswana-agate-2.jpg"],
    suggestedPrice: 1100,
    shortIntention: "Comfort through change.",
    description:
      "Banded botswana agate, the soothing stone of transition, worn for comfort and steadiness when life is shifting.",
  },
  // ── 8mm ──────────────────────────────────────────────────────────────
  {
    id: "AMT11",
    name: "Dyed Jade Bracelet (8mm)",
    stone: "Dyed Jade",
    image: "/stones/dyed-jade.jpg",
    suggestedPrice: 500,
    shortIntention: "Renewal and gentle balance.",
    description:
      "Vivid green dyed jade, a fresh take on the stone of harmony, worn to invite renewal and an easy sense of balance.",
  },
  {
    id: "AMT12",
    name: "African Amethyst Bracelet (8mm)",
    stone: "African Amethyst",
    image: "/stones/african-amethyst.jpg",
    suggestedPrice: 950,
    shortIntention: "Calm clarity and intuition.",
    description:
      "Deep violet African amethyst, the stone of serenity, worn to quiet an overactive mind and open space for intuition.",
  },
  {
    id: "AMT13",
    name: "Dyed Citrine & Green Aventurine Bracelet (8mm)",
    stone: "Dyed Citrine · Green Aventurine",
    images: ["/stones/dyed-citrine.jpg", "/stones/green-aventurine.jpg"],
    suggestedPrice: 900,
    shortIntention: "Joyful energy and new opportunity.",
    description:
      "Sunny citrine paired with lucky green aventurine — a bright strand for joyful energy and an open door to opportunity.",
  },
  {
    id: "AMT14",
    name: "Black Tourmaline Bracelet (8mm)",
    stone: "Black Tourmaline",
    image: "/stones/black-tourmaline.jpg",
    suggestedPrice: 1150,
    shortIntention: "Protection and deep grounding.",
    description:
      "Deep black tourmaline, a protective anchor for body and spirit, worn to steady the nerves and shield against draining energy.",
  },
  {
    id: "AMT15",
    name: "Jade Bracelet (8mm)",
    stone: "Jade",
    image: "/stones/jade-8mm.jpg",
    suggestedPrice: 550,
    shortIntention: "Luck, balance and harmony.",
    description:
      "Soft olive jade in a bolder 8mm bead — the timeless stone of luck and harmony, for calm balance and gentle good fortune.",
  },
  {
    id: "AMT16",
    name: "Indian Bloodstone Bracelet (8mm)",
    stone: "Indian Bloodstone",
    image: "/stones/indian-bloodstone-8mm.jpg",
    suggestedPrice: 950,
    shortIntention: "Vitality, courage and resilience.",
    description:
      "Deep green bloodstone flecked with red in a generous 8mm bead, prized for vitality and courage, worn to renew strength and resolve.",
  },
  {
    id: "AMT17",
    name: "Indian Agate Bracelet (8mm)",
    stone: "Indian Agate",
    image: "/stones/indian-agate.jpg",
    suggestedPrice: 650,
    shortIntention: "Grounding and steady stability.",
    description:
      "Earthy banded Indian agate, a grounding stone of stability and balance, worn to stay calm and centred through the day.",
  },
  {
    id: "AMT18",
    name: "Lapis Lazuli Bracelet (8mm)",
    stone: "Lapis Lazuli",
    image: "/stones/lapis-lazuli.jpg",
    suggestedPrice: 1100,
    shortIntention: "Wisdom, truth and insight.",
    description:
      "Royal blue lapis lazuli flecked with gold, the ancient stone of wisdom and truth, worn to sharpen insight and self-expression.",
  },
  {
    id: "AMT19",
    name: "Web Jasper Bracelet (8mm)",
    stone: "Web Jasper",
    suggestedPrice: 650,
    shortIntention: "Calm, balance and grounding.",
    description:
      "Patterned web jasper, a nurturing stone of calm and balance, worn to feel grounded and gently supported.",
  },
]);

export default products;
