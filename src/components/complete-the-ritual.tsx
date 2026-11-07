import Link from "next/link";

import { displayName, productHref, type Product } from "@/data/products";
import CardAddButton from "@/components/card-add-button";
import ProductImage from "@/components/product-image";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * "Complete the ritual" — a short row of pieces in the same stone from another
 * line (the matching pendant under a bracelet, the matching bracelets under a
 * pendant). Each has the card's Add button, which opens the quick-order popup,
 * so the pair can go into one bag. Renders nothing when there's no match.
 */
export default function CompleteTheRitual({
  items,
  copy,
  title = "Complete the ritual",
}: {
  items: Product[];
  /** One line under the heading, e.g. "Wear the same stone close to your heart." */
  copy: string;
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-12 rounded-3xl border border-gold/30 bg-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>

      <ul className="mt-4 flex flex-col divide-y divide-border/70">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-3">
            <Link
              href={productHref(item)}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border"
            >
              <ProductImage
                src={item.image}
                alt={displayName(item)}
                fill
                sizes="64px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={productHref(item)}
                className="block truncate font-title text-base text-foreground transition-colors hover:text-primary"
              >
                {displayName(item)}
              </Link>
              <p className="text-sm font-semibold text-primary-deep">
                {inr.format(item.price)}
              </p>
            </div>
            <CardAddButton product={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
