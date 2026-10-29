import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllIntentions, getPendants } from "@/sanity/queries";
import DecorBrowser from "@/components/decor-browser";
import { PENDANTS_ENABLED } from "@/lib/features";

const title = "Pendants";
const description =
  "Natural-stone pendants on a black thread — amethyst, lapis lazuli, rose quartz, pyrite and more. One stone, worn close to your heart.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pendants" },
  openGraph: { title, description, url: "/pendants" },
};

export default async function PendantsPage() {
  // Hidden until released: even a direct visit 404s while the flag is off.
  if (!PENDANTS_ENABLED) notFound();

  const [products, intentions] = await Promise.all([
    getPendants(),
    getAllIntentions(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              Worn close to the heart
            </p>
            <h1 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Pendants
            </h1>
            <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
              One natural stone on a simple black thread — an intention you
              carry with you, resting right at your heart.
            </p>
          </div>

          <DecorBrowser
            products={products}
            intentions={intentions}
            emptyCopy="Our pendants are being strung — check back shortly."
          />
        </div>
      </section>
    </main>
  );
}
