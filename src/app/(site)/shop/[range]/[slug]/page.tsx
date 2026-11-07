import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getAllProducts, getRange, getRanges } from "@/sanity/queries";
import CompleteTheRitual from "@/components/complete-the-ritual";
import RangeOrderPanel from "@/components/range-order-panel";
import DetailPrice from "@/components/detail-price";
import ProductGallery from "@/components/product-gallery";
import {
  isNewArrival,
  pairedPieces,
  productHref,
  stockStatus,
  type Product,
} from "@/data/products";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * Product page for any Sanity-managed range (Stone Décor, Pendants, …):
 * /shop/<range>/<product>. A range that isn't switched on 404s.
 */
async function load(rangeSlug: string, slug: string) {
  const range = await getRange(rangeSlug);
  const product = range?.products.find((p) => p.slug === slug);
  return range && product ? { range, product } : undefined;
}

// Pre-render a page per product in every live range.
export async function generateStaticParams() {
  const ranges = await getRanges();
  return ranges.flatMap((r) =>
    r.products.map((p) => ({ range: r.slug, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[range]/[slug]">): Promise<Metadata> {
  const { range: rangeSlug, slug } = await params;
  const found = await load(rangeSlug, slug);
  if (!found) return { title: "Not found" };
  const { product } = found;
  const description = product.description || product.shortIntention;
  const url = productHref(product);
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

/** Schema.org Product structured data (price + availability) for a range product. */
function productJsonLd(product: Product, category: string) {
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
    category,
    image: product.images.map((u) => (u.startsWith("http") ? u : absoluteUrl(u))),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability,
      url: absoluteUrl(productHref(product)),
    },
  };
}

export default async function RangeProductPage({
  params,
}: PageProps<"/shop/[range]/[slug]">) {
  const { range: rangeSlug, slug } = await params;
  const [found, bracelets] = await Promise.all([
    load(rangeSlug, slug),
    getAllProducts(),
  ]);
  if (!found) notFound();
  const { range, product } = found;

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, range.title)),
        }}
      />
      <section className="px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/#${range.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <span aria-hidden>←</span> Back to {range.title}
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductGallery product={product} />

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
                  {range.title}
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

              {/* The tab's shared note (e.g. thread details) and this piece's size. */}
              {(range.productNote || product.dimensions) && (
                <p className="mt-2 text-sm text-muted">
                  {[range.productNote, product.dimensions && `Size: ${product.dimensions}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

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

              <RangeOrderPanel product={product} />

              {/* Bracelets in the same stone, when this tab pairs with them. */}
              {range.pairWithBracelets && (
                <CompleteTheRitual
                  items={pairedPieces(product, bracelets)}
                  copy="Pair it with a bracelet in the same stone."
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
