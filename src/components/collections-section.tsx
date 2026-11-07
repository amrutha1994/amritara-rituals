import { getAllIntentions, getAllProducts, getRanges } from "@/sanity/queries";
import CatalogTabs from "@/components/catalog-tabs";

export default async function CollectionsSection() {
  const [products, ranges, intentions] = await Promise.all([
    getAllProducts(),
    getRanges(),
    getAllIntentions(),
  ]);
  return (
    <section id="collections" className="bg-background px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <CatalogTabs products={products} ranges={ranges} intentions={intentions} />
      </div>
    </section>
  );
}
