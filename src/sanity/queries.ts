import "server-only";

import { cache } from "react";

import type { Intention } from "@/data/intentions";
import { DEFAULT_DELIVERY, type DeliverySettings, type Product } from "@/data/products";
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
  suggestedPrice,
  remainingQuantity,
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
  suggestedPrice: number;
  remainingQuantity: number | null;
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
  return {
    id: r.id,
    name: r.name,
    stone: r.stone ?? "",
    // Listed price = exactly the Sanity price; delivery is added on top at order
    // time only when the order subtotal is below the free-delivery threshold.
    price: r.suggestedPrice,
    remainingQuantity: r.remainingQuantity ?? undefined,
    shortIntention: r.shortIntention ?? "",
    description: r.description ?? "",
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
  freeDeliveryThreshold
}`;

interface RawSettings {
  deliveryCharge: number | null;
  freeDeliveryThreshold: number | null;
}

/**
 * The delivery rule from the Sanity `settings` singleton, falling back to
 * DEFAULT_DELIVERY until that document is created (so ordering never breaks).
 */
export const getDeliverySettings = cache(async (): Promise<DeliverySettings> => {
  const raw = await client.fetch<RawSettings | null>(
    SETTINGS_QUERY,
    {},
    fetchOptions,
  );
  return {
    charge: raw?.deliveryCharge ?? DEFAULT_DELIVERY.charge,
    freeThreshold: raw?.freeDeliveryThreshold ?? DEFAULT_DELIVERY.freeThreshold,
  };
});

// ── Combined ─────────────────────────────────────────────────────────────────

export interface Catalog {
  products: Product[];
  stones: Stone[];
  intentions: Intention[];
  delivery: DeliverySettings;
}

/** The whole catalogue in one call — used to hydrate the client catalog context. */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const [products, stones, intentions, delivery] = await Promise.all([
    getAllProducts(),
    getAllStones(),
    getAllIntentions(),
    getDeliverySettings(),
  ]);
  return { products, stones, intentions, delivery };
});
