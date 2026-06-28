import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products, SHIPPING_FEE } from "@/data/products";
import ProductOrderPanel from "@/components/product-order-panel";
import ProductGallery from "@/components/product-gallery";

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
            {/* Image gallery */}
            <ProductGallery product={product} />

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
              <p className="mt-1 text-sm text-muted">
                + {inr.format(SHIPPING_FEE)} shipping at checkout
              </p>

              <p className="mt-6 text-base leading-8 text-muted">
                {product.description}
              </p>

              {product.benefits && product.benefits.length > 0 && (
                <div className="mt-7">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
                    Spiritual Benefits
                  </h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {product.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-antique"
                        />
                        <span className="text-base leading-7 text-muted">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ProductOrderPanel product={product} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
