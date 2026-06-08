export interface Product {
  /** Stable unique identifier */
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
  /** Path to the product image (under /public) */
  image: string;
  /** URL-friendly slug, e.g. for /collections/[slug] */
  slug: string;
}

// Product photos live in /public/products. Rose Quartz has no matching photo yet,
// so it falls back to the hero banner until a pink-stone image is added.
const PLACEHOLDER_IMAGE = "/hero-banner.jpg";

export const products: Product[] = [
  {
    id: "amethyst-01",
    name: "Amethyst Calm Ritual",
    stone: "Amethyst",
    price: 2499,
    shortIntention: "Quiet the mind and invite restful clarity.",
    description:
      "A soothing band of deep violet amethyst, long cherished as the stone of serenity. Worn close to the pulse, it is intended to ease an overactive mind, deepen rest, and create space for intuition to surface.",
    image: "/products/amethyst.jpg",
    slug: "amethyst-calm-ritual",
  },
  {
    id: "rose-quartz-01",
    name: "Rose Quartz Heart Ritual",
    stone: "Rose Quartz",
    price: 1999,
    shortIntention: "Open the heart to gentle, unconditional love.",
    description:
      "Blush-pink rose quartz beads, the timeless stone of compassion. This ritual is crafted to soften the heart, nurture self-kindness, and draw warmth into every relationship you carry.",
    image: "/products/citrine.jpeg",
    slug: "rose-quartz-heart-ritual",
  },
  {
    id: "citrine-01",
    name: "Citrine Abundance Ritual",
    stone: "Citrine",
    price: 2799,
    shortIntention: "Spark joy, confidence, and abundance.",
    description:
      "Sun-warmed citrine, known as the merchant's stone of prosperity. Worn through the day, it is meant to lift the spirit, fuel creative momentum, and welcome abundance in all its forms.",
    image: "/products/citrine.jpeg",
    slug: "citrine-abundance-ritual",
  },
  {
    id: "black-tourmaline-01",
    name: "Black Tourmaline Shield Ritual",
    stone: "Black Tourmaline",
    price: 2299,
    shortIntention: "Ground your energy and shield from negativity.",
    description:
      "Deep, grounding black tourmaline — a protective anchor for body and spirit. This ritual is intended to steady the nerves, return you to the present, and form a quiet shield against draining energy.",
    image: "/products/tigereye.jpg",
    slug: "black-tourmaline-shield-ritual",
  },
  {
    id: "clear-quartz-01",
    name: "Clear Quartz Clarity Ritual",
    stone: "Clear Quartz",
    price: 2199,
    shortIntention: "Amplify intention and clear the path ahead.",
    description:
      "Luminous clear quartz, revered as the master healer and amplifier. Worn with purpose, it is meant to sharpen focus, magnify your intentions, and bring lucid clarity to each new day.",
    image: "/products/jade.jpg",
    slug: "clear-quartz-clarity-ritual",
  },
];

export default products;
