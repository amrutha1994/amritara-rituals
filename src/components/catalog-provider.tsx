"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Intention } from "@/data/intentions";
import type { Product } from "@/data/products";
import type { Stone } from "@/data/stones";

import type { Catalog } from "@/sanity/queries";

interface CatalogValue extends Catalog {
  getProduct: (id: string) => Product | undefined;
  getStone: (id: string) => Stone | undefined;
  getIntention: (id: string) => Intention | undefined;
}

const CatalogContext = createContext<CatalogValue | null>(null);

/**
 * Holds the catalogue (products, stones, intentions) fetched once on the server
 * and handed to the client, so interactive components (customiser, stone finder,
 * cart) can read it synchronously — mirroring the old hardcoded imports.
 */
export function CatalogProvider({
  value,
  children,
}: {
  value: Catalog;
  children: ReactNode;
}) {
  const ctx = useMemo<CatalogValue>(() => {
    const productMap = new Map(value.products.map((p) => [p.id, p]));
    const stoneMap = new Map(value.stones.map((s) => [s.id, s]));
    const intentionMap = new Map(value.intentions.map((i) => [i.id, i]));
    return {
      ...value,
      getProduct: (id) => productMap.get(id),
      getStone: (id) => stoneMap.get(id),
      getIntention: (id) => intentionMap.get(id),
    };
  }, [value]);

  return (
    <CatalogContext.Provider value={ctx}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return ctx;
}
