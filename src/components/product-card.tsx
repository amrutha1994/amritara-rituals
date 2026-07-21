import Link from "next/link";
import { isSoldOut, stockLabel, type Product } from "@/data/products";
import CardAddButton from "@/components/card-add-button";
import ProductImage from "@/components/product-image";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ProductCard({ product }: { product: Product }) {
  const href = `/collections/${product.slug}`;
  const soldOut = isSoldOut(product);
  const stock = stockLabel(product);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_30px_-18px_rgba(144,86,141,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(144,86,141,0.55)]">
      {/* Only the image and the title navigate to the detail page. The footer
          (price + Add to bag) is a separate, non-link region so taps never mix. */}
      <Link
        href={href}
        aria-label={`${product.name} — view details`}
        className="relative block aspect-square w-full overflow-hidden"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            soldOut ? "opacity-60" : ""
          }`}
        />
        <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-surface/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-gold-antique backdrop-blur-sm">
          {product.stone}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-2 p-5 pb-3">
        <h3 className="font-display text-lg font-medium text-foreground">
          <Link
            href={href}
            className="decoration-gold-light/60 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-sm leading-6 text-muted">{product.shortIntention}</p>
        {stock && (
          <p className="text-xs font-medium text-primary-deep">{stock}</p>
        )}
      </div>

      {/* Footer action row — its own stacking layer, above the links */}
      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 px-5 pb-5 pt-1">
        <span className="text-base font-semibold text-primary-deep">
          {inr.format(product.price)}
        </span>
        <CardAddButton product={product} />
      </div>
    </div>
  );
}
