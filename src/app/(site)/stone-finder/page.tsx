import type { Metadata } from "next";
import Link from "next/link";
import StoneFinder from "@/components/stone-finder";

const title = "Find your stone";
const description =
  "Not sure where to begin? Choose your main intention and we'll reveal the healing stones whose energy you're reaching for — ready to wear or made your own.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stone-finder" },
  openGraph: { title, description, url: "/stone-finder" },
};

export default function StoneFinderPage() {
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

          {/* Intro */}
          <div className="mx-auto mt-8 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              Begin with an intention
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Find your healing stone
            </h1>
            <p className="mt-4 text-base leading-8 text-muted">
              Crystals have long been chosen not by name, but by the energy we
              long for. Tell us the intention you&apos;re reaching for, and
              we&apos;ll reveal the stones quietly calling to you.
            </p>
          </div>

          <div className="mt-12">
            <StoneFinder />
          </div>
        </div>
      </section>
    </main>
  );
}
