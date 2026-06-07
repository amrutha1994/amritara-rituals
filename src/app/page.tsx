import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero banner */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[58vh] min-h-[360px] w-full sm:h-[66vh] lg:h-[78vh]">
          <Image
            src="/hero-banner.jpg"
            alt="Crystal bracelets, gemstones and incense arranged on a soft linen surface"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />

          {/* Scrim so the left-side text stays legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/45 to-transparent" />

          {/* Overlay content */}
          <div className="relative mx-auto flex h-full max-w-6xl items-center px-6 sm:px-8">
            <div className="max-w-md text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold-antique backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-antique" />
                Handcrafted gemstone rituals
              </span>

              <h1 className="mt-6 font-display text-4xl font-medium italic leading-tight text-primary-deep sm:text-5xl lg:text-6xl">
                Align your energy and soul
              </h1>

              <p className="mt-5 max-w-sm text-base leading-8 text-foreground/80 sm:text-lg">
                Gemstone bracelets crafted as wearable rituals — each stone
                chosen for its energy, each piece a small daily return to
                yourself.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#collections"
                  className="rounded-full bg-primary px-7 py-3 text-center text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
                >
                  Explore the collection
                </Link>
                <Link
                  href="#story"
                  className="rounded-full border border-border bg-surface/70 px-7 py-3 text-center text-sm font-medium text-primary-deep backdrop-blur-sm transition-colors hover:border-primary"
                >
                  Our story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Antique-gold divider */}
      <div className="gold-rule" />

      {/* Brand story */}
      <section className="bg-background px-6 py-20 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <p className="text-base leading-8 text-muted sm:text-lg">
            Amritara Rituals crafts gemstone bracelets as quiet reminders to
            return to yourself — each stone chosen for its energy, each piece a
            small daily ritual. We blend the timeless symbolism of the lotus
            with the living presence of natural crystals.
          </p>
          <p className="text-base leading-8 text-foreground/80 sm:text-lg">
            Our first collection is being prepared with care. Something
            beautiful is on its way.
          </p>
        </div>
      </section>

      {/* Antique-gold divider between sections */}
      <div className="gold-rule" />

      {/* Placeholder intro band */}
      <section id="story" className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
            The ritual
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Jewellery with intention
          </h2>
          <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
            Every Amritara piece begins with a feeling — calm, courage, clarity,
            protection — and the gemstone that carries it. More of our story,
            collections, and rituals are coming soon to this space.
          </p>
        </div>
      </section>
    </main>
  );
}
