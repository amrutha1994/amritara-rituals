import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getAllProducts, getPendantBySlug, getPendants } from "@/sanity/queries";
import CompleteTheRitual from "@/components/complete-the-ritual";
import DecorOrderPanel from "@/components/decor-order-panel";
import DetailPrice from "@/components/detail-price";
import ProductGallery from "@/components/product-gallery";
import {
  PENDANT_THREAD_NOTE,
  isNewArrival,
  pairedPieces,
  stockStatus,
  type Product,
} from "@/data/products";
import { PENDANTS_ENABLED } from "@/lib/features";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// Pre-render a page per pendant — but only when the feature is on, so no
// hidden URLs are generated while it's off.
export async function generateStaticParams() {
  if (!PENDANTS_ENABLED) return [];
  const products = await getPendants();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/pendants/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = PENDANTS_ENABLED ? await getPendantBySlug(slug) : undefined;
  if (!product) return { title: "Not found" };
  const description = product.description || product.shortIntention;
  const url = `/pendants/${slug}`;
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

/** Schema.org Product structured data (price + availability) for a pendant. */
function pendantJsonLd(product: Product, slug: string) {
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
    category: "Pendants",
    image: product.images.map((u) => (u.startsWith("http") ? u : absoluteUrl(u))),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability,
      url: absoluteUrl(`/pendants/${slug}`),
    },
  };
}

export default async function PendantDetailPage({
  params,
}: PageProps<"/pendants/[slug]">) {
  if (!PENDANTS_ENABLED) notFound();
  const { slug } = await params;
  const [product, bracelets] = await Promise.all([
    getPendantBySlug(slug),
    getAllProducts(),
  ]);
  if (!product) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pendantJsonLd(product, slug)),
        }}
      />
      <section className="px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/#pendants"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <span aria-hidden>←</span> Back to Pendants
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery product={product} />

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
                  Pendant
                  {product.stone ? ` · ${product.stone}` : ""}
                </p>
                {isNewArrival(product) && (
                  <span className="rounded-full bg-crimson-deep px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    New
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
                {product.name}
              </h1>
              {product.shortIntention && (
                <p className="mt-3 text-lg italic text-primary-deep">
                  {product.shortIntention}
                </p>
              )}

              <DetailPrice product={product} />

              <p className="mt-2 text-sm text-muted">
                {PENDANT_THREAD_NOTE}
                {product.dimensions ? ` · ${product.dimensions}` : ""}
              </p>

              {product.description && (
                <p className="mt-6 text-base leading-8 text-muted whitespace-pre-line">
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

              {/* Bracelets in the same stone, to wear as a set. */}
              <CompleteTheRitual
                items={pairedPieces(product, bracelets)}
                copy="Pair it with a bracelet in the same stone."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
