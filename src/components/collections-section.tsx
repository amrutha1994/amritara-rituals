import {
  getAllIntentions,
  getAllProducts,
  getDecorProducts,
  getPendants,
} from "@/sanity/queries";
import CatalogTabs from "@/components/catalog-tabs";

export default async function CollectionsSection() {
  const [products, decor, pendants, intentions] = await Promise.all([
    getAllProducts(),
    getDecorProducts(),
    getPendants(),
    getAllIntentions(),
  ]);
  return (
    <section id="collections" className="bg-background px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <CatalogTabs
          products={products}
          decor={decor}
          pendants={pendants}
          intentions={intentions}
        />
      </div>
    </section>
  );
}
