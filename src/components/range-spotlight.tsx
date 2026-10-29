import Link from "next/link";

import { isNewArrival } from "@/data/products";
import type { Range } from "@/data/ranges";
import ProductImage from "@/components/product-image";
import { getRanges } from "@/sanity/queries";

/**
 * Homepage spotlight strips, just above the collection — one per live range
 * with "Show homepage spotlight" switched on in the Studio (e.g. a launch).
 * The heading and text come from the range; the photos are its newest pieces.
 * Turning the switch off removes it, no deploy needed.
 */
export default async function RangeSpotlights() {
  const ranges = (await getRanges()).filter((r) => r.spotlight.enabled);
  if (ranges.length === 0) return null;
  return (
    <>
      {ranges.map((r) => (
        <Spotlight key={r.slug} range={r} />
      ))}
    </>
  );
}

function Spotlight({ range }: { range: Range }) {
  const visible = range.products.filter((p) => p.show);
  // New arrivals first, so a launch shows off what's new.
  const featured = [
    ...visible.filter(isNewArrival),
    ...visible.filter((p) => !isNewArrival(p)),
  ].slice(0, 3);

  return (
    <section className="bg-background px-6 pt-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-primary-deep via-primary to-primary-deep px-6 py-10 text-center text-white shadow-[0_24px_60px_-30px_rgba(110,64,105,0.8)] sm:flex-row sm:px-10 sm:text-left">
        <div className="flex-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-light/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-light">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-light" />
            New · {range.title}
          </span>
          <h2 className="mt-4 font-display text-3xl font-medium sm:text-4xl">
            {range.spotlight.heading || range.title}
          </h2>
          {range.spotlight.text && (
            <p className="mt-3 max-w-md whitespace-pre-line text-base leading-7 text-white/85">
              {range.spotlight.text}
            </p>
          )}
          <Link
            href={`#${range.slug}`}
            className="mt-6 inline-flex rounded-full bg-gold-light px-7 py-3 text-sm font-semibold tracking-wide text-clay-deep transition-colors hover:bg-gold"
          >
            Explore {range.title.toLowerCase()}
          </Link>
        </div>

        <div className="flex shrink-0 items-end justify-center">
          {featured.map((p, i) => (
            <span
              key={p.id}
              className={`relative block h-28 w-28 overflow-hidden rounded-2xl border-2 border-white/80 shadow-xl sm:h-36 sm:w-36 ${
                i === 1 ? "z-10 -mx-4 -translate-y-3" : ""
              } ${i === 0 ? "-rotate-6" : i === 2 ? "rotate-6" : ""}`}
            >
              <ProductImage src={p.image} alt={p.name} fill sizes="144px" className="object-cover" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
