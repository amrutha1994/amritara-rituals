"use client";

import {
  couponDiscountFor,
  deliveryFeeFor,
  hasOffer,
  type Product,
} from "@/data/products";
import { useCatalog } from "@/components/catalog-provider";
import { useProductCoupon } from "@/components/coupon-field";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * The price block on a product detail page. Normally the effective price, with
 * the regular price struck through when a Sanity offer is on. Once the shopper
 * applies the festive coupon (and the product isn't excluded), it switches to
 * the coupon price with the pre-coupon price struck through — the same amount
 * the WhatsApp order will total, so what they see is what they're quoted.
 *
 * A client component because the applied coupon lives in client state; the
 * server-rendered first paint is the plain price, as before.
 */
export default function DetailPrice({
  product,
  showDelivery = false,
  compact = false,
}: {
  product: Product;
  /** Show the "+ ₹X delivery" / "Free delivery" note under the price. */
  showDelivery?: boolean;
  /** Smaller, tighter version for the quick-order popup header. */
  compact?: boolean;
}) {
  const { delivery } = useCatalog();
  const coupon = useProductCoupon(product);

  const couponOn = coupon !== null;
  const discount = couponOn ? couponDiscountFor(product.price, coupon.percent) : 0;
  const price = product.price - discount;
  const offerOn = hasOffer(product);

  // The "was" price: before the coupon if one is applied, else before the offer.
  const struck = offerOn
    ? product.originalPrice
    : couponOn
      ? product.price
      : null;
  const badge = couponOn
    ? `${coupon.code} · ${coupon.percent}% off`
    : offerOn
      ? `${product.offerPercent}% off`
      : null;

  return (
    <>
      <div
        className={`flex flex-wrap items-baseline ${compact ? "mt-0.5 gap-2" : "mt-5 gap-3"}`}
      >
        <p
          className={`font-semibold text-primary-deep ${compact ? "" : "text-2xl"}`}
        >
          {inr.format(price)}
        </p>
        {struck !== null && (
          <p className={`text-muted line-through ${compact ? "text-sm" : "text-lg"}`}>
            {inr.format(struck)}
          </p>
        )}
        {badge && (
          <span
            className={`rounded-full bg-primary font-semibold text-white ${
              compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {showDelivery && (
        <p className="mt-1 text-sm text-muted">
          {deliveryFeeFor(price, delivery) === 0
            ? "Free delivery at checkout"
            : `+ ${inr.format(delivery.charge)} delivery at checkout`}
        </p>
      )}
    </>
  );
}
