"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BraceletSizeId } from "@/data/products";

// A "selection" is the lightweight stand-in for a cart: it lives only in
// memory for the session (no persistence, no backend). It exists so a visitor
// can gather a few rituals and send them as a single WhatsApp message.
//
// Each line is a unique product + size, with a quantity. Adding the same
// product + size again increases the quantity rather than creating a new line.
export interface SelectionItem {
  productId: string;
  size: BraceletSizeId;
  qty: number;
}

interface SelectionContextValue {
  items: SelectionItem[];
  /** Add one of a product + size (creates the line, or increments its qty). */
  add: (productId: string, size: BraceletSizeId) => void;
  /** Remove one of a product + size (deletes the line if qty hits zero). */
  decrement: (productId: string, size: BraceletSizeId) => void;
  /** Remove a product + size line entirely, whatever its quantity. */
  remove: (productId: string, size: BraceletSizeId) => void;
  /** Remove one unit of a product, newest line first (for the card's −). */
  decrementProduct: (productId: string) => void;
  clear: () => void;
  /** Quantity of a specific product + size. */
  qtyOf: (productId: string, size: BraceletSizeId) => number;
  /** Total quantity across all sizes of a product. */
  productQty: (productId: string) => number;
  /** Total quantity across the whole selection. */
  count: number;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

const sameLine = (a: SelectionItem, productId: string, size: BraceletSizeId) =>
  a.productId === productId && a.size === size;

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SelectionItem[]>([]);

  const add = useCallback((productId: string, size: BraceletSizeId) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => sameLine(i, productId, size));
      if (idx === -1) return [...prev, { productId, size, qty: 1 }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      return next;
    });
  }, []);

  const decrement = useCallback((productId: string, size: BraceletSizeId) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => sameLine(i, productId, size));
      if (idx === -1) return prev;
      const line = prev[idx];
      if (line.qty > 1) {
        const next = [...prev];
        next[idx] = { ...line, qty: line.qty - 1 };
        return next;
      }
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const remove = useCallback((productId: string, size: BraceletSizeId) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, size)));
  }, []);

  const decrementProduct = useCallback((productId: string) => {
    setItems((prev) => {
      // Newest line first, so repeated taps peel units off in reverse order.
      let idx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].productId === productId) {
          idx = i;
          break;
        }
      }
      if (idx === -1) return prev;
      const line = prev[idx];
      if (line.qty > 1) {
        const next = [...prev];
        next[idx] = { ...line, qty: line.qty - 1 };
        return next;
      }
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const qtyOf = useCallback(
    (productId: string, size: BraceletSizeId) =>
      items.find((i) => sameLine(i, productId, size))?.qty ?? 0,
    [items],
  );

  const productQty = useCallback(
    (productId: string) =>
      items
        .filter((i) => i.productId === productId)
        .reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  const value = useMemo<SelectionContextValue>(
    () => ({
      items,
      add,
      decrement,
      remove,
      decrementProduct,
      clear,
      qtyOf,
      productQty,
      count,
    }),
    [items, add, decrement, remove, decrementProduct, clear, qtyOf, productQty, count],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return ctx;
}
