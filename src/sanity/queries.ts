import "server-only";

import { cache } from "react";

import type { Intention } from "@/data/intentions";
import type { Product } from "@/data/products";
import { SHIPPING_FEE } from "@/data/products";
import type { Stone } from "@/data/stones";

import { client } from "./client";

// Fallback when an image asset is somehow missing — keeps the UI from breaking.
const PLACEHOLDER_IMAGE = "/hero-banner.jpg";

// Re-fetch from Sanity at most once every 60s (see the (site) layout's ISR).
// Kept in sync with `export const revalidate` there.
const REVALIDATE = 60;
const fetchOptions = { next: { revalidate: REVALIDATE } };

// ── Products ─────────────────────────────────────────────────────────────────

const PRODUCTS_QUERY = `*[_type == "product"] | order(code asc){
  "id": code,
  name,
  stone,
  suggestedPrice,
  shortIntention,
  description,
  benefits,
  "slug": slug.current,
  "images": images[].asset->url
}`;

interface RawProduct {
  id: string;
  name: string;
  stone: string | null;
  suggestedPrice: number;
  shortIntention: string | null;
  description: string | null;
  benefits: string[] | null;
  slug: string;
  images: (string | null)[] | null;
}

function mapProduct(r: RawProduct): Product {
  const images = (r.images ?? []).filter((u): u is string => Boolean(u));
  const gallery = images.length ? images : [PLACEHOLDER_IMAGE];
  return {
    id: r.id,
    name: r.name,
    stone: r.stone ?? "",
    // Listed price = the sheet's suggested price minus the separate shipping fee.
    price: r.suggestedPrice - SHIPPING_FEE,
    shortIntention: r.shortIntention ?? "",
    description: r.description ?? "",
    benefits: r.benefits ?? undefined,
    image: gallery[0],
    images: gallery,
    slug: r.slug,
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
    image: r.image ?? PLACEHOLDER_IMAGE,
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

// ── Combined ─────────────────────────────────────────────────────────────────

export interface Catalog {
  products: Product[];
  stones: Stone[];
  intentions: Intention[];
}

/** The whole catalogue in one call — used to hydrate the client catalog context. */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const [products, stones, intentions] = await Promise.all([
    getAllProducts(),
    getAllStones(),
    getAllIntentions(),
  ]);
  return { products, stones, intentions };
});
