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
  /**
   * A few short metaphysical / wellbeing benefits of the stone, shown as a
   * list on the detail page. Optional — omit until a product has its copy.
   */
  benefits?: string[];
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
    name: "Golden Tiger Eye Bracelet (6mm)",
    slug: "matte-yellow-tiger-eye-bracelet-6mm",
    stone: "Tiger Eye",
    images: [
      "/products/images/6mm/matte-yellow-tiger-eye/matte-yellow-tiger-eye-6mm-3.jpg",
      "/products/images/6mm/matte-yellow-tiger-eye/matte-yellow-tiger-eye-6mm-1.jpg",
      "/products/images/6mm/matte-yellow-tiger-eye/matte-yellow-tiger-eye-6mm-2.jpg",
    ],
    suggestedPrice: 600,
    shortIntention: "Courage, confidence and grounded strength.",
    description:
      "Warm, matte golden tiger eye — long carried as the stone of courage and inner strength. Said to hold the focused gaze of the tiger, it steadies the nerves, sharpens the will, and keeps you rooted in your own quiet power.",
    benefits: [
      "Builds quiet confidence and the courage to act",
      "Grounds restless, scattered energy and calms anxious thoughts",
      "Sharpens focus and willpower for clear, steady decisions",
      "Forms a protective shield that deflects negativity and the evil eye",
      "Awakens the solar plexus — your centre of personal power and self-worth",
      "Draws abundance, opportunity and steady good fortune",
    ],
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
      "Earthy green moss agate, veined like a tiny forest in stone — long cherished as the gardener's talisman of growth and new beginnings. Deeply tied to the energy of nature, it is worn to feel rooted, replenished and quietly reminded that you are always becoming.",
    benefits: [
      "Nurtures new beginnings and steady, natural growth",
      "Grounds you in the calming, restorative energy of the earth",
      "Eases stress and soothes the nervous system back into balance",
      "Attracts abundance, prosperity and a gentle flow of good fortune",
      "Opens the heart to new friendships and renewed self-belief",
      "Encourages emotional balance and a hopeful, optimistic outlook",
    ],
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
      "Deep ocean-blue shattuckite, a rare and quietly powerful stone of intuition and honest expression. Said to bridge the heart and the higher mind, it is worn to open inner sight, steady the voice, and help you speak and live your truth with grace.",
    benefits: [
      "Awakens intuition and deepens your inner sense of knowing",
      "Opens the throat chakra for clear, honest, fearless expression",
      "Aligns the third eye, sharpening insight and spiritual vision",
      "Shields the aura and keeps your energy calm and protected",
      "Connects you to higher guidance and quiet inner wisdom",
      "Brings mind and heart into a peaceful, truthful balance",
    ],
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
      "Born of fire and earth — porous black lava paired with fiery red tiger eye. The lava, cooled from molten rock, lends raw grounding and courage, while red tiger eye stirs the blood with motivation and drive. Together they offer steady footing and the spark to begin.",
    benefits: [
      "Grounds and stabilises in moments of stress or change",
      "Lava stone lends courage, resilience and emotional strength",
      "Red tiger eye stirs motivation, vitality and a fresh will to act",
      "Awakens the root chakra for security and a sense of belonging",
      "Burns away lethargy and reignites passion for life",
      "Holds your intention — anoint the lava with a drop of essential oil",
    ],
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
      "Rich, fiery red tiger eye — known to the old traditions as the Dragon's Eye, a stone of raw energy and passion. It warms the blood, stirs momentum and rekindles courage, worn on the days you need a spark to move.",
    benefits: [
      "Ignites motivation, drive and a renewed zest for life",
      "Lifts low energy and dissolves sluggishness or hesitation",
      "Grounds and energises the root chakra for confident action",
      "Stirs passion, vitality and physical strength",
      "Strengthens self-belief and the courage to chase what you want",
      "Steadies fiery emotions into focused, purposeful momentum",
    ],
  },
  {
    id: "AMT06",
    name: "Jade Bracelet (6mm)",
    stone: "Jade",
    images: ["/products/images/6mm/jade/jade-1.jpeg", "/products/images/6mm/jade/jade-2.jpeg"],
    suggestedPrice: 500,
    shortIntention: "Luck, balance and harmony.",
    description:
      "Soft olive jade, treasured across the ages as the stone of luck and harmony. A gentle heart-healer believed to draw good fortune and longevity, it is carried to invite calm balance, serenity and a quiet sense of being looked after.",
    benefits: [
      "Invites luck, prosperity and a steady flow of good fortune",
      "Soothes the heart chakra, easing worry into calm balance",
      "Restores harmony in relationships and within yourself",
      "Acts as a gentle protective charm, especially while travelling",
      "Encourages wisdom, patience and serene decision-making",
      "Releases negativity and welcomes peace and renewal",
    ],
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
      "Creamy tree agate, branched with green like roots through stone — known as the stone of plenitude and inner stillness. Deeply connected to the earth, it is worn to feel grounded, safe and quietly at peace amid the noise of the world.",
    benefits: [
      "Grounds and stabilises, keeping you rooted through the noise",
      "Brings deep inner peace and a steady sense of calm",
      "Strengthens connection to nature and the nurturing earth",
      "Encourages abundance, growth and slow, lasting plenitude",
      "Builds perseverance and resilience to see things through",
      "Clears stagnant energy and restores a feeling of safety",
    ],
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
      "Deep forest-green bloodstone scattered with drops of red — an ancient warrior's stone of vitality and courage. Long believed to carry the power of life-blood itself, it is worn to renew strength, purify the body and steel your resolve.",
    benefits: [
      "Renews vitality, stamina and physical strength",
      "Kindles courage and resolve in the face of challenge",
      "Grounds and energises the root chakra",
      "Purifies and revitalises the body in folk-healing tradition",
      "Clears negativity and steadies turbulent emotions",
      "Builds perseverance to carry you through hard seasons",
    ],
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
      "Golden, metallic pyrite, glinting like captured sunlight — the merchant's stone of abundance and a mirror-bright shield. Worn to summon prosperity, fortify willpower and reflect away anything that would dim your shine.",
    benefits: [
      "Magnetises wealth, abundance and prosperity",
      "Strengthens willpower, confidence and ambition",
      "Forms a reflective shield against negative energy",
      "Energises the solar plexus and personal drive",
      "Sparks the motivation to turn ideas into action",
      "Restores vitality and warmth when energy runs low",
    ],
  },
  {
    id: "AMT10",
    name: "Botswana Agate Bracelet (6mm)",
    stone: "Botswana Agate",
    images: ["/products/images/6mm/botswana-agate/botswana-agate-1.jpg", "/products/images/6mm/botswana-agate/botswana-agate-2.jpg"],
    suggestedPrice: 1100,
    shortIntention: "Comfort through change.",
    description:
      "Softly banded Botswana agate in smoky greys and pinks — known as the soothing stone of change. A tender companion for life's transitions, it is worn for comfort, steadiness and a gentle reminder that you are held through every shift.",
    benefits: [
      "Soothes and comforts through times of change",
      "Gently releases grief, loneliness and held-in emotion",
      "Grounds anxious energy into a steady calm",
      "Supports breaking old habits and patterns",
      "Nurtures creativity and a warm, open heart",
      "Offers quiet protection and emotional security",
    ],
  },
  // ── 8mm ──────────────────────────────────────────────────────────────
  {
    id: "AMT11",
    name: "Dyed Jade Bracelet (8mm)",
    stone: "Dyed Jade",
    images: [
      "/products/images/8mm/dyed-jade/dyed-jade-1.jpeg",
      "/products/images/8mm/dyed-jade/dyed-jade-2.jpeg",
      "/products/images/8mm/dyed-jade/dyed-jade-3.jpeg",
      "/products/images/8mm/dyed-jade/dyed-jade-4.jpeg",
    ],
    suggestedPrice: 500,
    shortIntention: "Renewal and gentle balance.",
    description:
      "Vivid spring-green dyed jade, a bright and joyful take on the timeless stone of harmony. Worn to refresh tired energy, invite renewal and carry an easy, uplifting sense of balance through the day.",
    benefits: [
      "Refreshes and renews tired, stagnant energy",
      "Invites harmony, balance and gentle good luck",
      "Soothes the heart into calm and contentment",
      "Encourages openness, growth and new perspectives",
      "Dispels negativity and restores a sense of ease",
      "Brings a bright, uplifting lift to your mood",
    ],
  },
  {
    id: "AMT12",
    name: "African Amethyst Bracelet (8mm)",
    stone: "African Amethyst",
    images: [
      "/products/images/8mm/amethyst/amethyst-1.jpg",
      "/products/images/8mm/amethyst/amethyst-2.jpg",
      "/products/images/8mm/amethyst/amethyst-3.jpeg",
      "/products/images/8mm/amethyst/amethyst-4.jpeg",
    ],
    suggestedPrice: 950,
    shortIntention: "Calm clarity and intuition.",
    description:
      "Deep violet African amethyst, prized for its rich, royal colour — the stone of serenity and spirit. Worn to quiet an overactive mind, deepen intuition and open a still, clear space for the soul to listen.",
    benefits: [
      "Quiets an overactive mind into deep serenity",
      "Heightens intuition and spiritual awareness",
      "Opens and aligns the third eye and crown chakras",
      "Eases stress, anxiety and restless thoughts",
      "Supports peaceful, restorative sleep and vivid dreams",
      "Shields the aura and transmutes negative energy",
    ],
  },
  {
    id: "AMT13",
    name: "Dyed Citrine & Green Aventurine Bracelet (8mm)",
    stone: "Dyed Citrine · Green Aventurine",
    images: [
      "/products/images/8mm/dyed-citrine-green-aventurine/dyed-citrine-green-aventurine-1.jpeg",
      "/products/images/8mm/dyed-citrine-green-aventurine/dyed-citrine-green-aventurine-2.jpeg",
    ],
    suggestedPrice: 900,
    shortIntention: "Joyful energy and new opportunity.",
    description:
      "Sunny golden citrine strung with lucky green aventurine — light and luck woven into one bright strand. Citrine pours in joyful, abundant energy while aventurine opens the door to fresh opportunity and new beginnings.",
    benefits: [
      "Radiates joyful, sunny, optimistic energy",
      "Citrine draws success, abundance and manifestation",
      "Green aventurine opens the door to luck and opportunity",
      "Soothes the heart while energising the solar plexus",
      "Builds the confidence to seize new beginnings",
      "Clears doubt and invites a positive outlook",
    ],
  },
  {
    id: "AMT14",
    name: "Black Tourmaline Bracelet (8mm)",
    stone: "Black Tourmaline",
    images: [
      "/products/images/8mm/black-tourmaline/black-tourmaline-1.jpeg",
      "/products/images/8mm/black-tourmaline/black-tourmaline-2.jpeg",
      "/products/images/8mm/black-tourmaline/black-tourmaline-3.jpeg",
    ],
    suggestedPrice: 1150,
    shortIntention: "Protection and deep grounding.",
    description:
      "Deep, jet-black tourmaline — the most trusted guardian stone of all. A protective anchor for body and spirit, worn to steady the nerves, return you to the earth and shield against any energy that would drain or unsettle you.",
    benefits: [
      "Forms a powerful protective shield around your energy",
      "Deflects negativity, anxiety and draining influences",
      "Grounds and anchors you through the root chakra",
      "Transmutes fearful, heavy thoughts into calm",
      "Creates a steady sense of safety and stability",
      "A devoted guardian for sensitive, empathic souls",
    ],
  },
  {
    id: "AMT15",
    name: "Jade Bracelet (8mm)",
    stone: "Jade",
    images: [
      "/products/images/8mm/jade/jade-1.jpeg",
      "/products/images/8mm/jade/jade-2.jpeg",
      "/products/images/8mm/jade/jade-3.jpeg",
    ],
    suggestedPrice: 550,
    shortIntention: "Luck, balance and harmony.",
    description:
      "Soft olive jade in a bolder 8mm bead — the timeless stone of luck and harmony. A gentle heart-healer believed to draw good fortune and longevity, carried to invite calm balance, serenity and a quiet sense of being looked after.",
    benefits: [
      "Invites luck, prosperity and a steady flow of good fortune",
      "Soothes the heart chakra, easing worry into calm balance",
      "Restores harmony in relationships and within yourself",
      "Acts as a gentle protective charm, especially while travelling",
      "Encourages wisdom, patience and serene decision-making",
      "Releases negativity and welcomes peace and renewal",
    ],
  },
  {
    id: "AMT16",
    name: "Indian Bloodstone Bracelet (8mm)",
    stone: "Indian Bloodstone",
    image: "/stones/indian-bloodstone-8mm.jpg",
    suggestedPrice: 950,
    shortIntention: "Vitality, courage and resilience.",
    description:
      "Deep forest-green bloodstone flecked with red in a generous 8mm bead — an ancient warrior's stone of vitality and courage. Worn to renew strength, purify the body and steel your resolve through every trial.",
    benefits: [
      "Renews vitality, stamina and physical strength",
      "Kindles courage and resolve in the face of challenge",
      "Grounds and energises the root chakra",
      "Purifies and revitalises the body in folk-healing tradition",
      "Clears negativity and steadies turbulent emotions",
      "Builds perseverance to carry you through hard seasons",
    ],
  },
  {
    id: "AMT17",
    name: "Indian Agate Bracelet (8mm)",
    stone: "Indian Agate",
    images: [
      "/products/images/8mm/indian-agate/indian-agate-1.jpeg",
      "/products/images/8mm/indian-agate/indian-agate-2.jpeg",
      "/products/images/8mm/indian-agate/indian-agate-3.jpeg",
    ],
    suggestedPrice: 650,
    shortIntention: "Grounding and steady stability.",
    description:
      "Earthy banded Indian agate in warm, layered tones — a grounding stone of stability and balance. Worn to harmonise body, mind and spirit, and to stay calm and centred through the busiest of days.",
    benefits: [
      "Grounds and centres you through a busy day",
      "Harmonises body, mind and emotions into balance",
      "Calms anxiety and brings steady, even-keeled energy",
      "Strengthens the root chakra and sense of security",
      "Offers gentle, everyday protective energy",
      "Builds patience, stability and quiet endurance",
    ],
  },
  {
    id: "AMT18",
    name: "Lapis Lazuli Bracelet (8mm)",
    stone: "Lapis Lazuli",
    images: [
      "/products/images/8mm/lapiz-lazuli/lapiz-lazuli-1.jpeg",
      "/products/images/8mm/lapiz-lazuli/lapiz-lazuli-2.jpeg",
      "/products/images/8mm/lapiz-lazuli/lapiz-lazuli-3.jpeg",
    ],
    suggestedPrice: 1100,
    shortIntention: "Wisdom, truth and insight.",
    description:
      "Royal blue lapis lazuli flecked with golden pyrite, like a night sky scattered with stars — the ancient stone of wisdom and truth, beloved by pharaohs and philosophers. Worn to sharpen insight, awaken the inner voice and speak your truth with quiet authority.",
    benefits: [
      "Awakens wisdom, insight and clarity of mind",
      "Opens the throat chakra for honest self-expression",
      "Stimulates the third eye and inner vision",
      "Encourages integrity, truth and self-awareness",
      "Sharpens memory, focus and a love of learning",
      "Releases stress, inviting deep inner peace",
    ],
  },
  {
    id: "AMT19",
    name: "Web Jasper Bracelet (8mm)",
    stone: "Web Jasper",
    images: [
      "/products/images/8mm/web-jasper/web-jasper-1.jpeg",
      "/products/images/8mm/web-jasper/web-jasper-2.jpeg",
      "/products/images/8mm/web-jasper/web-jasper-3.jpeg",
    ],
    suggestedPrice: 650,
    shortIntention: "Calm, balance and grounding.",
    description:
      "Intricately veined web jasper, laced like a quiet map of the earth — known as a supreme nurturer. Worn to feel grounded, gently supported and wrapped in a slow, steady calm when life asks a lot of you.",
    benefits: [
      "Nurtures and supports through times of stress",
      "Grounds and stabilises with slow, steady energy",
      "Restores calm, balance and inner wholeness",
      "Encourages patience and tranquil endurance",
      "Absorbs negative energy and soothes the nerves",
      "Strengthens a quiet sense of safety and support",
    ],
  },
]);

/** Look up a product by its stable tracking code / id. */
export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export default products;
