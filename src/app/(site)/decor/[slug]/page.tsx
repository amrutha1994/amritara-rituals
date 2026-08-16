import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getDecorProducts, getDecorBySlug } from "@/sanity/queries";
import DecorOrderPanel from "@/components/decor-order-panel";
import ProductGallery from "@/components/product-gallery";
import { hasOffer, stockStatus, type Product } from "@/data/products";
import { DECOR_ENABLED } from "@/lib/features";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Pre-render a page per décor item — but only when the feature is on, so no
// hidden URLs are generated while it's off.
export async function generateStaticParams() {
  if (!DECOR_ENABLED) return [];
  const products = await getDecorProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/decor/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = DECOR_ENABLED ? await getDecorBySlug(slug) : undefined;
  if (!product) return { title: "Not found" };
  const description = product.description || product.shortIntention;
  const url = `/decor/${slug}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: { card: "summary_large_image", images: [product.image] },
  };
}

/** Schema.org Product structured data (price + availability) for a décor item. */
function decorJsonLd(product: Product, slug: string) {
  const availability =
    stockStatus(product) === "sold_out"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortIntention,
    sku: product.id,
    category: "For your space",
    image: product.images.map((u) => (u.startsWith("http") ? u : absoluteUrl(u))),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability,
      url: absoluteUrl(`/decor/${slug}`),
    },
  };
}

export default async function DecorDetailPage({
  params,
}: PageProps<"/decor/[slug]">) {
  if (!DECOR_ENABLED) notFound();
  const { slug } = await params;
  const product = await getDecorBySlug(slug);
  if (!product) notFound();

  const onOffer = hasOffer(product);

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(decorJsonLd(product, slug)),
        }}
      />
      <section className="px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/decor"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <span aria-hidden>←</span> Back to For your space
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery product={product} />

            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
                For your space
                {product.stone ? ` · ${product.stone}` : ""}
              </p>
              <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
                {product.name}
              </h1>
              {product.shortIntention && (
                <p className="mt-3 text-lg italic text-primary-deep">
                  {product.shortIntention}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-baseline gap-3">
                <p className="text-2xl font-semibold text-primary-deep">
                  {inr.format(product.price)}
                </p>
                {onOffer && (
                  <>
                    <p className="text-lg text-muted line-through">
                      {inr.format(product.originalPrice)}
                    </p>
                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                      {product.offerPercent}% off
                    </span>
                  </>
                )}
              </div>

              {product.dimensions && (
                <p className="mt-2 text-sm text-muted">Size: {product.dimensions}</p>
              )}

              {product.description && (
                <p className="mt-6 text-base leading-8 text-muted">
                  {product.description}
                </p>
              )}

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
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-antique"
                        />
                        <span className="text-base leading-7 text-muted">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <DecorOrderPanel product={product} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
