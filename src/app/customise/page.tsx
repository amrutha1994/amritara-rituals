import type { Metadata } from "next";
import Link from "next/link";
import BraceletCustomiser from "@/components/bracelet-customiser";

export const metadata: Metadata = {
  title: "Design your own ritual — Amritara Rituals",
  description:
    "Build a custom gemstone bracelet. Choose your bead size, combine the stones whose energy you're reaching for, and order it your way.",
};

export default function CustomisePage() {
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
          <div className="mt-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              Make it yours
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Design your own ritual
            </h1>
            <p className="mt-4 text-base leading-8 text-muted">
              Choose your bead size, then gather the stones whose energy you&apos;re
              reaching for — wear one on its own, or blend a few into a strand made
              just for you. Each piece is cleansed and crafted by hand before it
              reaches you.
            </p>
          </div>

          <div className="mt-12">
            <BraceletCustomiser />
          </div>
        </div>
      </section>
    </main>
  );
}
