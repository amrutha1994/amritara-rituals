import type { Metadata } from "next";
import Link from "next/link";
import BraceletCustomiser from "@/components/bracelet-customiser";
import { getStone, type BeadSize, type Stone } from "@/data/stones";
import { getAllStones } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Design your own ritual — Amritara Rituals",
  description:
    "Build a custom gemstone bracelet. Choose your bead size, combine the stones whose energy you're reaching for, and order it your way.",
};

/**
 * Reads an optional `?size=&stones=` hand-off (e.g. from the Stone Finder) and
 * returns it only if it's internally consistent — a known bead size with stone
 * ids that actually belong to it. Anything off is ignored, so the page still
 * opens cleanly as a blank customiser.
 */
function parsePrefill(
  searchParams: Record<string, string | string[] | undefined>,
  stones: Stone[],
) {
  const sizeParam = Array.isArray(searchParams.size)
    ? searchParams.size[0]
    : searchParams.size;
  const beadSize: BeadSize | null =
    sizeParam === "6mm" || sizeParam === "8mm" ? sizeParam : null;
  if (!beadSize) return { beadSize: null, stoneIds: [] as string[] };

  const stonesParam = Array.isArray(searchParams.stones)
    ? searchParams.stones[0]
    : searchParams.stones;
  const stoneIds = (stonesParam ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => getStone(stones, id)?.beadSize === beadSize);

  return { beadSize, stoneIds };
}

export default async function CustomisePage({
  searchParams,
}: PageProps<"/customise">) {
  const stones = await getAllStones();
  const { beadSize, stoneIds } = parsePrefill(await searchParams, stones);
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
            <BraceletCustomiser
              initialBeadSize={beadSize}
              initialStoneIds={stoneIds}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
