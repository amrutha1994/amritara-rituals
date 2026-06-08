import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/collections/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_30px_-18px_rgba(144,86,141,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(144,86,141,0.55)]"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-surface/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-gold-antique backdrop-blur-sm">
          {product.stone}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-medium text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="text-sm leading-6 text-muted">{product.shortIntention}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-semibold text-primary-deep">
            {inr.format(product.price)}
          </span>
          <span className="text-sm font-medium text-primary transition-colors group-hover:text-primary-deep">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
