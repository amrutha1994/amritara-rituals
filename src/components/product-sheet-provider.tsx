"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import ProductOrderPanel from "@/components/product-order-panel";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface ProductSheetContextValue {
  /** Open the quick-order sheet for a product. */
  open: (product: Product) => void;
  close: () => void;
}

const ProductSheetContext = createContext<ProductSheetContextValue | null>(null);

// One sheet shared across the whole app (not one per card). The card "Add"
// buttons call open(product); the sheet hosts the same selection controls the
// detail page uses, so the two stay in sync.
export function ProductSheetProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  const open = useCallback((p: Product) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [product, close]);

  return (
    <ProductSheetContext.Provider value={{ open, close }}>
      {children}
      {product && <ProductSheet product={product} onClose={close} />}
    </ProductSheetContext.Provider>
  );
}

function ProductSheet({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${product.name}`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      {/* Panel: bottom sheet on mobile, centred modal from sm up */}
      <div className="sheet-in relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        {/* Mobile grab handle */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary sm:right-5 sm:top-5"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>

        {/* Product header */}
        <div className="flex items-center gap-4 pr-8">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-antique">
              {product.stone}
            </p>
            <h2 className="font-display text-xl font-medium text-foreground">
              {product.name}
            </h2>
            <p className="mt-0.5 font-semibold text-primary-deep">
              {inr.format(product.price)}
            </p>
          </div>
        </div>

        {/* Description + a low-key path to the full product page */}
        <p className="mt-4 text-sm leading-7 text-muted">
          {product.description}
        </p>
        <Link
          href={`/collections/${product.slug}`}
          onClick={onClose}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-deep"
        >
          View full details
          <span aria-hidden>→</span>
        </Link>

        {/* Shared selection controls — identical to the detail page */}
        <ProductOrderPanel key={product.id} product={product} />
      </div>
    </div>
  );
}

export function useProductSheet(): ProductSheetContextValue {
  const ctx = useContext(ProductSheetContext);
  if (!ctx) {
    throw new Error("useProductSheet must be used within a ProductSheetProvider");
  }
  return ctx;
}
