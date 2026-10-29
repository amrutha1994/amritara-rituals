import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllIntentions, getRange, getRanges } from "@/sanity/queries";
import RangeBrowser from "@/components/range-browser";

/**
 * A Sanity-managed range's own page: /shop/<range> (Stone Décor, Pendants, …).
 * The same products also show as a tab in the homepage Collections section.
 */
export async function generateStaticParams() {
  const ranges = await getRanges();
  return ranges.map((r) => ({ range: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[range]">): Promise<Metadata> {
  const { range: slug } = await params;
  const range = await getRange(slug);
  if (!range) return { title: "Not found" };
  const description = range.intro || range.subcopy;
  const url = `/shop/${range.slug}`;
  return {
    title: range.title,
    description,
    alternates: { canonical: url },
    openGraph: { title: range.title, description, url },
  };
}

export default async function RangePage({ params }: PageProps<"/shop/[range]">) {
  const { range: slug } = await params;
  const [range, intentions] = await Promise.all([getRange(slug), getAllIntentions()]);
  if (!range) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              The collection
            </p>
            <h1 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
              {range.title}
            </h1>
            {(range.intro || range.subcopy) && (
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-muted sm:text-lg">
                {range.intro || range.subcopy}
              </p>
            )}
          </div>

          <RangeBrowser products={range.products} intentions={intentions} />
        </div>
      </section>
    </main>
  );
}
