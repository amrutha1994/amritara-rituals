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
  /** Price in Indian Rupees (INR) */
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

/**
 * What you fill in when adding a product. Only the essentials are required —
 * `slug` is derived from the name and the images fall back to the placeholder,
 * so a new product is usually just six lines.
 *
 * Provide either a single `image` or an `images` array (or both). The first
 * gallery image is whatever you list first — `images[0]`, or `image` when no
 * array is given.
 */
type ProductInput = Omit<Product, "slug" | "image" | "images"> & {
  slug?: string;
  image?: string;
  images?: string[];
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
    const images =
      item.images?.length
        ? item.images
        : [item.image ?? PLACEHOLDER_IMAGE];

    return { ...item, slug, image: images[0], images };
  });
}

// ─────────────────────────────────────────────────────────────────────────
// To add a product: copy one block, give it a new unique `id`, fill the
// fields, and drop a photo in /public/products. `slug` and `image` are
// optional. That's it — the grid, the product page, and the WhatsApp order
// all pick it up automatically.
// ─────────────────────────────────────────────────────────────────────────
export const products: Product[] = defineProducts([
  {
    id: "AMR-AME-01",
    name: "Amethyst Calm Ritual",
    stone: "Amethyst",
    price: 2499,
    shortIntention: "Quiet the mind and invite restful clarity.",
    description:
      "A soothing band of deep violet amethyst, long cherished as the stone of serenity. Worn close to the pulse, it is intended to ease an overactive mind, deepen rest, and create space for intuition to surface.",
    images: ["/products/amethyst.jpg", "/products/jade.jpg", "/products/tigereye.jpg"],
  },
  {
    id: "AMR-ROS-01",
    name: "Rose Quartz Heart Ritual",
    stone: "Rose Quartz",
    price: 1999,
    shortIntention: "Open the heart to gentle, unconditional love.",
    description:
      "Blush-pink rose quartz beads, the timeless stone of compassion. This ritual is crafted to soften the heart, nurture self-kindness, and draw warmth into every relationship you carry.",
    images: ["/products/citrine.jpeg", "/products/amethyst.jpg", "/products/jade.jpg"],
  },
  {
    id: "AMR-CIT-01",
    name: "Citrine Abundance Ritual",
    stone: "Citrine",
    price: 2799,
    shortIntention: "Spark joy, confidence, and abundance.",
    description:
      "Sun-warmed citrine, known as the merchant's stone of prosperity. Worn through the day, it is meant to lift the spirit, fuel creative momentum, and welcome abundance in all its forms.",
    images: ["/products/citrine.jpeg", "/products/tigereye.jpg", "/products/amethyst.jpg"],
  },
  {
    id: "AMR-BTM-01",
    name: "Black Tourmaline Shield Ritual",
    stone: "Black Tourmaline",
    price: 2299,
    shortIntention: "Ground your energy and shield from negativity.",
    description:
      "Deep, grounding black tourmaline — a protective anchor for body and spirit. This ritual is intended to steady the nerves, return you to the present, and form a quiet shield against draining energy.",
    images: ["/products/tigereye.jpg", "/products/jade.jpg", "/products/citrine.jpeg"],
  },
  {
    id: "AMR-CLQ-01",
    name: "Clear Quartz Clarity Ritual",
    stone: "Clear Quartz",
    price: 2199,
    shortIntention: "Amplify intention and clear the path ahead.",
    description:
      "Luminous clear quartz, revered as the master healer and amplifier. Worn with purpose, it is meant to sharpen focus, magnify your intentions, and bring lucid clarity to each new day.",
    images: ["/products/jade.jpg", "/products/amethyst.jpg", "/products/tigereye.jpg"],
  },
]);

export default products;
