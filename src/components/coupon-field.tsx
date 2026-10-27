"use client";

import { useId, useState } from "react";
import {
  couponMatches,
  isCouponEligible,
  type Coupon,
  type Product,
} from "@/data/products";
import { track } from "@/lib/analytics";
import { useCatalog } from "@/components/catalog-provider";
import { useSelection } from "@/components/selection-provider";

/**
 * The live coupon when the shopper has applied a code that matches it, else
 * `null`. One code per visit: once applied anywhere it covers the whole order.
 * Re-checked every render, so it drops away if the coupon is switched off in
 * Sanity.
 */
export function useAppliedCoupon(): Coupon | null {
  const { coupon } = useCatalog();
  const { couponCode } = useSelection();
  return couponCode && couponMatches(couponCode, coupon) ? coupon : null;
}

/**
 * The coupon discounting this product, or `null` — the applied coupon, unless
 * the product is flagged "Exclude from coupon" in Sanity.
 */
export function useProductCoupon(product: Product): Coupon | null {
  const coupon = useAppliedCoupon();
  return coupon && isCouponEligible(product) ? coupon : null;
}

/**
 * "Have a coupon code?" entry for the festive coupon set in Sanity Settings.
 * Renders nothing while the coupon is off, so it only appears during an offer.
 *
 * Every instance (product page, popup, customiser, bag) shares one applied
 * code, so entering it once shows "applied" everywhere and it can never be
 * applied twice. Pass `product` on a product page so an excluded item says it
 * stays full price.
 */
export default function CouponField({
  product,
  className = "",
}: {
  product?: Product;
  className?: string;
}) {
  const { coupon } = useCatalog();
  const { applyCoupon, removeCoupon } = useSelection();
  const applied = useAppliedCoupon();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  // Several fields can be on screen at once (bag + popup), so ids must be unique.
  const inputId = useId();

  if (!coupon.enabled) return null;

  const excluded = product !== undefined && !isCouponEligible(product);

  if (applied) {
    return (
      <div className={`flex flex-col gap-1 text-xs ${className}`}>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary-soft px-3 py-2 text-primary-deep">
          <span className="font-medium">
            <span aria-hidden>✓ </span>
            {applied.code} applied · {applied.percent}% off
          </span>
          <button
            type="button"
            onClick={() => {
              removeCoupon();
              setDraft("");
            }}
            className="font-medium text-muted underline-offset-4 hover:text-primary hover:underline"
          >
            Remove
          </button>
        </div>
        {excluded && (
          <p className="text-muted">
            This piece isn&apos;t part of the coupon offer, so it stays full price.
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`self-start text-xs font-medium text-primary-deep underline-offset-4 hover:text-primary hover:underline ${className}`}
      >
        Have a coupon code?
      </button>
    );
  }

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponMatches(draft, coupon)) {
      applyCoupon(draft);
      setError(false);
      track("coupon_applied", { code: coupon.code, percent: coupon.percent });
    } else {
      setError(true);
      track("coupon_rejected", { code: draft.trim().toUpperCase() });
    }
  };

  return (
    <form onSubmit={apply} className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only">
          Coupon code
        </label>
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(false);
          }}
          placeholder="Coupon code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error}
          className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm uppercase text-foreground placeholder:normal-case placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:bg-primary/50"
        >
          Apply
        </button>
      </div>
      {error && (
        <p className="text-xs text-primary-deep" role="alert">
          That code isn&apos;t valid right now.
        </p>
      )}
    </form>
  );
}
