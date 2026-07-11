import { Suspense } from "react";

import { getAllIntentions, getAllProducts } from "@/sanity/queries";
import CollectionBrowser from "@/components/collection-browser";
import ProductCard from "@/components/product-card";

export default async function CollectionsSection() {
  const [products, intentions] = await Promise.all([
    getAllProducts(),
    getAllIntentions(),
  ]);
  return (
    <section id="collections" className="bg-background px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
            The collection
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Wearable rituals
          </h2>
          <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
            Each bracelet is crafted around a single gemstone and the intention
            it carries — choose the energy you want to wear.
          </p>
        </div>

        {/* useSearchParams (in CollectionBrowser) needs a Suspense boundary so
            the rest of this static page can still be prerendered. The fallback
            renders the full grid so the initial HTML shows every product. */}
        <Suspense
          fallback={
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          }
        >
          <CollectionBrowser products={products} intentions={intentions} />
        </Suspense>
      </div>
    </section>
  );
}
