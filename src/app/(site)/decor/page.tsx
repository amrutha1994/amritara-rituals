import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllIntentions, getDecorProducts } from "@/sanity/queries";
import DecorBrowser from "@/components/decor-browser";
import { DECOR_ENABLED } from "@/lib/features";

const title = "For your space";
const description =
  "Natural-stone objects for your home, car and sacred spaces — seven-chakra car hangings, wall hangings and crystal figurines like owls, turtles and elephants.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/decor" },
  openGraph: { title, description, url: "/decor" },
};

export default async function DecorPage() {
  // Hidden until released: even a direct visit 404s while the flag is off.
  if (!DECOR_ENABLED) notFound();

  const [products, intentions] = await Promise.all([
    getDecorProducts(),
    getAllIntentions(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              Beyond bracelets
            </p>
            <h1 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
              For your space
            </h1>
            <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
              Sacred objects carved from natural stone — to carry an intention
              into your home, your car and the spaces you return to.
            </p>
          </div>

          <DecorBrowser products={products} intentions={intentions} />
        </div>
      </section>
    </main>
  );
}
