import "server-only";

import { cache } from "react";

import type { Faq } from "@/data/faqs";
import type { Intention } from "@/data/intentions";
import {
  DEFAULT_ANNOUNCEMENT,
  DEFAULT_COUPON,
  DEFAULT_GIFT_WRAP,
  DEFAULT_DELIVERY,
  normaliseCouponCode,
  discountedPrice,
  type Announcement,
  type Coupon,
  type GiftWrap,
  type DeliverySettings,
  type Product,
} from "@/data/products";
import {
  RANGE_ICONS,
  type Range,
  type RangeIconName,
} from "@/data/ranges";
import type { Stone } from "@/data/stones";

import { client } from "./client";

// Fallback when an image asset is somehow missing — keeps the UI from breaking.
const PLACEHOLDER_IMAGE = "/hero-banner.jpg";

/**
 * Rewrite a raw Sanity asset URL so the CDN delivers a right-sized, modern
 * image instead of the multi-MB original:
 *   - `auto=format` → serve WebP/AVIF when the browser accepts it
 *   - `fit=max` + `w` → cap the width (never upscales), so we don't ship a
 *     2000px original into a ~700px slot
 *   - `q` → trim bytes at a quality that's visually lossless for photos
 * This shrinks the source `next/image` has to fetch from megabytes to tens of
 * KB, which is the real cause of slow product-image loads. Non-Sanity URLs
 * (e.g. the local placeholder) pass through untouched.
 */
function sanityImage(url: string, width = 1200, quality = 75): string {
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  const params = new URLSearchParams({
    auto: "format",
    fit: "max",
    w: String(width),
    q: String(quality),
  });
  return `${url}?${params.toString()}`;
}

// Re-fetch from Sanity at most once every 60s (see the (site) layout's ISR).
// Kept in sync with `export const revalidate` there.
const REVALIDATE = 60;
const fetchOptions = { next: { revalidate: REVALIDATE } };

// ── Products ─────────────────────────────────────────────────────────────────

const PRODUCTS_QUERY = `*[_type == "product"] | order(orderRank asc){
  "id": code,
  name,
  stone,
  beadSize,
  suggestedPrice,
  offerPercent,
  excludeFromCoupon,
  remainingQuantity,
  show,
  isNew,
  shortIntention,
  description,
  benefits,
  "slug": slug.current,
  "intentions": intentions[]->key.current,
  "images": images[].asset->url
}`;

interface RawProduct {
  id: string;
  name: string;
  stone: string | null;
  beadSize: string | null;
  suggestedPrice: number;
  offerPercent: number | null;
  excludeFromCoupon: boolean | null;
  remainingQuantity: number | null;
  show: boolean | null;
  isNew: boolean | null;
  shortIntention: string | null;
  description: string | null;
  benefits: string[] | null;
  slug: string;
  intentions: (string | null)[] | null;
  images: (string | null)[] | null;
}

function mapProduct(r: RawProduct): Product {
  const images = (r.images ?? [])
    .filter((u): u is string => Boolean(u))
    .map((u) => sanityImage(u));
  const gallery = images.length ? images : [PLACEHOLDER_IMAGE];
  const offerPercent = r.offerPercent ?? 0;
  return {
    id: r.id,
    name: r.name,
    stone: r.stone ?? "",
    // Narrowed rather than cast: the field is a free string in GROQ, and an
    // unset or stray value should read as "not recorded", never as a size.
    beadSize:
      r.beadSize === "6mm" || r.beadSize === "8mm" ? r.beadSize : undefined,
    // Effective price = the regular price with any Sanity offer applied. This is
    // what every total is computed from; delivery is added on top at order time
    // only when the order subtotal is below the free-delivery threshold.
    price: discountedPrice(r.suggestedPrice, offerPercent),
    originalPrice: r.suggestedPrice,
    offerPercent,
    excludeFromCoupon: r.excludeFromCoupon ?? false,
    remainingQuantity: r.remainingQuantity ?? undefined,
    show: r.show ?? true,
    // Unset (older documents authored before the flag existed) means not new.
    isNew: r.isNew ?? false,
    shortIntention: r.shortIntention ?? "",
    // Line breaks typed in the Studio are kept (pages render it with
    // `whitespace-pre-line`); only stray blank lines at the ends are trimmed.
    description: r.description?.trim() ?? "",
    benefits: r.benefits ?? undefined,
    image: gallery[0],
    images: gallery,
    slug: r.slug,
    intentions: (r.intentions ?? []).filter((i): i is string => Boolean(i)),
  };
}

/** All bracelets, in catalogue (code) order. Deduped per request. */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const raw = await client.fetch<RawProduct[]>(PRODUCTS_QUERY, {}, fetchOptions);
  return raw.map(mapProduct);
});

/** One bracelet by slug (for /collections/[slug]). */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | undefined> => {
    const products = await getAllProducts();
    return products.find((p) => p.slug === slug);
  },
);

// ── Ranges (Collections tabs beyond Bracelets) ──────────────────────────────
// Stone Décor, Pendants and any future range are `productRange` documents with
// `rangeProduct`s, so a new tab is created entirely in the Studio. A range only
// reaches the storefront once it's switched on ("Show on site"); its products
// are mapped into the shared `Product` shape with a `range` ref, so they reuse
// the product card, bag and order flow (sizeless).

const RANGES_QUERY = `*[_type == "productRange" && show == true && defined(slug.current)] | order(orderRank asc){
  "slug": slug.current,
  title,
  itemName,
  icon,
  subcopy,
  intro,
  productNote,
  pairWithBracelets,
  pairingLine,
  spotlightEnabled,
  spotlightHeading,
  spotlightText,
  "products": *[_type == "rangeProduct" && range._ref == ^._id] | order(orderRank asc){
    "id": code,
    name,
    stone,
    suggestedPrice,
    offerPercent,
    excludeFromCoupon,
    remainingQuantity,
    show,
    isNew,
    dimensions,
    shortIntention,
    description,
    benefits,
    "slug": slug.current,
    "intentions": intentions[]->key.current,
    "images": images[].asset->url
  }
}`;

interface RawRangeProduct extends RawProduct {
  dimensions: string | null;
}

interface RawRange {
  slug: string;
  title: string;
  itemName: string | null;
  icon: string | null;
  subcopy: string | null;
  intro: string | null;
  productNote: string | null;
  pairWithBracelets: boolean | null;
  pairingLine: string | null;
  spotlightEnabled: boolean | null;
  spotlightHeading: string | null;
  spotlightText: string | null;
  products: RawRangeProduct[] | null;
}

const ICON_NAMES = new Set<string>(RANGE_ICONS.map((i) => i.value));

function mapRange(r: RawRange): Range {
  const ref = { slug: r.slug, title: r.title, itemName: r.itemName?.trim() || "piece" };
  return {
    ...ref,
    icon: (r.icon && ICON_NAMES.has(r.icon) ? r.icon : "gem") as RangeIconName,
    subcopy: r.subcopy ?? "",
    intro: r.intro?.trim() ?? "",
    productNote: r.productNote ?? "",
    pairWithBracelets: r.pairWithBracelets ?? false,
    pairingLine: r.pairingLine ?? "",
    spotlight: {
      enabled: r.spotlightEnabled ?? false,
      heading: r.spotlightHeading ?? "",
      text: r.spotlightText ?? "",
    },
    // Products without a price yet (still being prepared) never reach the site.
    products: (r.products ?? [])
      .filter((p) => p.id && p.slug && typeof p.suggestedPrice === "number")
      .map((p) => ({
        ...mapProduct(p),
        range: ref,
        dimensions: p.dimensions ?? undefined,
      })),
  };
}

/** Live ranges (switched on, with a visible product), in tab order. Deduped per request. */
export const getRanges = cache(async (): Promise<Range[]> => {
  const raw = await client.fetch<RawRange[]>(RANGES_QUERY, {}, fetchOptions);
  // A tab with nothing visible yet stays hidden, even if it's switched on.
  return raw.map(mapRange).filter((r) => r.products.some((p) => p.show));
});

/** One live range by its URL name (for /shop/[range]). */
export const getRange = cache(
  async (slug: string): Promise<Range | undefined> =>
    (await getRanges()).find((r) => r.slug === slug),
);

/** Every product across the live ranges. */
export const getRangeProducts = cache(async (): Promise<Product[]> =>
  (await getRanges()).flatMap((r) => r.products),
);

// ── Stones ───────────────────────────────────────────────────────────────────

const STONES_QUERY = `*[_type == "stone"] | order(beadSize asc, name asc){
  "id": slug.current,
  name,
  beadSize,
  power,
  price,
  "intentions": intentions[]->key.current,
  "productId": product->code,
  "image": image.asset->url
}`;

interface RawStone {
  id: string;
  name: string;
  beadSize: "6mm" | "8mm";
  power: string | null;
  price: number;
  intentions: (string | null)[] | null;
  productId: string | null;
  image: string | null;
}

function mapStone(r: RawStone): Stone {
  return {
    id: r.id,
    name: r.name,
    beadSize: r.beadSize,
    power: r.power ?? "",
    intentions: (r.intentions ?? []).filter((i): i is string => Boolean(i)),
    price: r.price,
    image: r.image ? sanityImage(r.image) : PLACEHOLDER_IMAGE,
    productId: r.productId ?? undefined,
  };
}

/** All stones. Deduped per request. */
export const getAllStones = cache(async (): Promise<Stone[]> => {
  const raw = await client.fetch<RawStone[]>(STONES_QUERY, {}, fetchOptions);
  return raw.map(mapStone);
});

// ── Intentions ───────────────────────────────────────────────────────────────

const INTENTIONS_QUERY = `*[_type == "intention"] | order(order asc){
  "id": key.current,
  label,
  feeling,
  invites
}`;

interface RawIntention {
  id: string;
  label: string;
  feeling: string | null;
  invites: string | null;
}

function mapIntention(r: RawIntention): Intention {
  return {
    id: r.id,
    label: r.label,
    feeling: r.feeling ?? "",
    invites: r.invites ?? "",
  };
}

/** All intentions, in display order. Deduped per request. */
export const getAllIntentions = cache(async (): Promise<Intention[]> => {
  const raw = await client.fetch<RawIntention[]>(
    INTENTIONS_QUERY,
    {},
    fetchOptions,
  );
  return raw.map(mapIntention);
});

// ── Settings ─────────────────────────────────────────────────────────────────

const SETTINGS_QUERY = `*[_type == "settings"][0]{
  deliveryCharge,
  freeDeliveryThreshold,
  announcementEnabled,
  announcementText,
  couponEnabled,
  couponCode,
  couponPercent,
  giftWrapEnabled,
  giftWrapPrice
}`;

interface RawSettings {
  deliveryCharge: number | null;
  freeDeliveryThreshold: number | null;
  announcementEnabled: boolean | null;
  announcementText: string | null;
  couponEnabled: boolean | null;
  couponCode: string | null;
  couponPercent: number | null;
  giftWrapEnabled: boolean | null;
  giftWrapPrice: number | null;
}

/** The `settings` singleton, or `null` until it's created. Deduped per request. */
const getRawSettings = cache(async (): Promise<RawSettings | null> => {
  return client.fetch<RawSettings | null>(SETTINGS_QUERY, {}, fetchOptions);
});

/**
 * The delivery rule from the Sanity `settings` singleton, falling back to
 * DEFAULT_DELIVERY until that document is created (so ordering never breaks).
 */
export const getDeliverySettings = cache(async (): Promise<DeliverySettings> => {
  const raw = await getRawSettings();
  return {
    charge: raw?.deliveryCharge ?? DEFAULT_DELIVERY.charge,
    freeThreshold: raw?.freeDeliveryThreshold ?? DEFAULT_DELIVERY.freeThreshold,
  };
});

/**
 * The announcement banner from the `settings` singleton. Only counts as enabled
 * when the toggle is on *and* there's text to show, so an empty message can
 * never render a blank bar. Falls back to hidden until settings exist.
 */
export const getAnnouncement = cache(async (): Promise<Announcement> => {
  const raw = await getRawSettings();
  const text = raw?.announcementText?.trim() ?? DEFAULT_ANNOUNCEMENT.text;
  return {
    enabled: Boolean(raw?.announcementEnabled) && text.length > 0,
    text,
  };
});

/**
 * The festive coupon from the `settings` singleton. Only counts as enabled when
 * the toggle is on, a code is set and the percent is positive, so a half-filled
 * coupon can never be redeemed. Falls back to no coupon until settings exist.
 */
export const getCoupon = cache(async (): Promise<Coupon> => {
  const raw = await getRawSettings();
  const code = normaliseCouponCode(raw?.couponCode ?? DEFAULT_COUPON.code);
  const percent = raw?.couponPercent ?? DEFAULT_COUPON.percent;
  return {
    enabled: Boolean(raw?.couponEnabled) && code.length > 0 && percent > 0,
    code,
    percent,
  };
});

// ── FAQs ─────────────────────────────────────────────────────────────────────

const FAQS_QUERY = `*[_type == "faq" && defined(question) && defined(answer)] | order(orderRank asc){
  "id": _id,
  question,
  answer
}`;

/** Published FAQs in Studio order (drafts never show). Deduped per request. */
export const getFaqs = cache(async (): Promise<Faq[]> => {
  const raw = await client.fetch<Faq[]>(FAQS_QUERY, {}, fetchOptions);
  return raw.map((f) => ({ ...f, answer: f.answer.trim() }));
});

/** Gift wrap from the `settings` singleton; offered at ₹15 until it's set there. */
export const getGiftWrap = cache(async (): Promise<GiftWrap> => {
  const raw = await getRawSettings();
  return {
    enabled: raw?.giftWrapEnabled ?? DEFAULT_GIFT_WRAP.enabled,
    price: Math.max(raw?.giftWrapPrice ?? DEFAULT_GIFT_WRAP.price, 0),
  };
});

// ── Combined ─────────────────────────────────────────────────────────────────

export interface Catalog {
  products: Product[];
  stones: Stone[];
  intentions: Intention[];
  delivery: DeliverySettings;
  announcement: Announcement;
  /** The festive coupon shoppers can redeem in their bag. */
  coupon: Coupon;
  /** Optional gift wrap offered in the bag. */
  giftWrap: GiftWrap;
  /** Live Collections tabs beyond Bracelets (Stone Décor, Pendants, …). */
  ranges: Range[];
}

/** The whole catalogue in one call — used to hydrate the client catalog context. */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const [products, stones, intentions, delivery, announcement, coupon, giftWrap, ranges] =
    await Promise.all([
      getAllProducts(),
      getAllStones(),
      getAllIntentions(),
      getDeliverySettings(),
      getAnnouncement(),
      getCoupon(),
      getGiftWrap(),
      getRanges(),
    ]);
  return {
    products,
    stones,
    intentions,
    delivery,
    announcement,
    coupon,
    giftWrap,
    ranges,
  };
});
