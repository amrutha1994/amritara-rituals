import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products } from "@/data/products";
import ProductOrderPanel from "@/components/product-order-panel";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

// Pre-render a page for every product at build time.
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Ritual not found — Amritara Rituals" };
  return {
    title: `${product.name} — Amritara Rituals`,
    description: product.shortIntention,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <section className="px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/#collections"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <span aria-hidden>←</span> Back to the collection
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_18px_50px_-24px_rgba(144,86,141,0.5)]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-surface/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-gold-antique backdrop-blur-sm">
                {product.stone}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
                {product.stone}
              </p>
              <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 text-lg italic text-primary-deep">
                {product.shortIntention}
              </p>
              <p className="mt-5 text-2xl font-semibold text-primary-deep">
                {inr.format(product.price)}
              </p>

              <p className="mt-6 text-base leading-8 text-muted">
                {product.description}
              </p>

              <ProductOrderPanel product={product} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
