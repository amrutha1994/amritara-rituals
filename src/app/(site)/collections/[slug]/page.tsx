import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllProducts,
  getPendants,
  getProductBySlug,
} from "@/sanity/queries";
import CompleteTheRitual from "@/components/complete-the-ritual";
import ProductOrderPanel from "@/components/product-order-panel";
import DetailPrice from "@/components/detail-price";
import ProductGallery from "@/components/product-gallery";
import {
  displayName,
  pairedPieces,
  isNewArrival,
  stockStatus,
  type Product,
} from "@/data/products";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// Pre-render a page for every product at build time.
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ritual not found" };
  const description = product.description || product.shortIntention;
  const url = `/collections/${slug}`;
  // Bead size belongs in the title: two bracelets in the same stone are
  // otherwise identical in a tab, a search result and a shared link.
  const title = displayName(product);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: [{ url: product.image, alt: title }],
    },
    twitter: { card: "summary_large_image", images: [product.image] },
  };
}

/**
 * Schema.org Product structured data (JSON-LD) for a bracelet — this is what
 * lets Google show the price, currency and stock status as a rich result. The
 * price is the effective (post-offer) `product.price`; availability is derived
 * from tracked stock (untracked stock reads as in-stock so it stays orderable).
 */
function productJsonLd(product: Product, slug: string) {
  const availability =
    stockStatus(product) === "sold_out"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName(product),
    description: product.description || product.shortIntention,
    sku: product.id,
    image: product.images.map((u) => (u.startsWith("http") ? u : absoluteUrl(u))),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability,
      url: absoluteUrl(`/collections/${slug}`),
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const [product, pendants] = await Promise.all([
    getProductBySlug(slug),
    getPendants(),
  ]);
  if (!product) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, slug)),
        }}
      />
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
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
                  {product.stone}
                </p>
                {isNewArrival(product) && (
                  <span className="rounded-full bg-crimson-deep px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    New
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-title text-3xl font-normal text-foreground sm:text-4xl">
                {displayName(product)}
              </h1>
              <p className="mt-3 text-lg italic text-primary-deep">
                {product.shortIntention}
              </p>
              <DetailPrice product={product} showDelivery />

              <p className="mt-6 text-base leading-8 text-muted whitespace-pre-line">
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

              {/* The matching stone pendant (empty until pendants launch). */}
              <CompleteTheRitual
                items={pairedPieces(product, pendants, 1)}
                copy="Wear the same stone close to your heart, on a simple black thread."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
