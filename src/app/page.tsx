import Image from "next/image";
import Link from "next/link";
import CollectionsSection from "@/components/collections-section";
import ContactSection from "@/components/contact-section";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero banner */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full">
          <Image
            src="/hero-banner.jpg"
            alt="Crystal bracelets, gemstones and incense arranged on a soft linen surface"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[35%_center] lg:object-right"
          />

          {/* Scrim so the left-side text stays legible. Heavier on small
              screens, where the text sits over busier parts of the image. */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30 sm:from-background/90 sm:via-background/45 sm:to-transparent" />

          {/* Overlay content drives the banner's height: padding gives the
              minimum, and min-h guarantees a generous band on larger screens.
              Using min-h (not a fixed h) means the content can grow taller than
              the band when needed, so nothing gets clipped at any width. The
              fill image tracks this wrapper's height. */}
          <div className="relative mx-auto flex max-w-6xl items-center px-6 py-14 sm:min-h-[48vh] sm:px-8 sm:py-12 lg:min-h-[56vh] lg:py-16">
            <div className="max-w-md text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold-antique backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-antique" />
                Handcrafted gemstone rituals
              </span>

              <h1 className="mt-6 font-display font-normal not-italic leading-tight text-primary-deep">
                <span className="block whitespace-nowrap text-[clamp(1.75rem,7vw,3rem)] leading-none">
                  Amritara Rituals
                </span>
                <span className="mt-2 block text-base text-gold-antique sm:text-lg lg:text-xl">
                  Align your energy &amp; soul
                </span>
              </h1>

              <p className="mt-5 max-w-sm text-base leading-8 text-foreground/80 sm:text-lg">
                Wearable rituals, carved in stone.
              </p>
              <p className="mt-3 max-w-sm text-base leading-8 text-foreground/80 sm:text-lg">
                Every stone holds an energy. Every bracelet, a reminder to come
                home to yourself.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#collections"
                  className="rounded-full bg-primary px-7 py-3 text-center text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
                >
                  Explore the collection
                </Link>
                <Link
                  href="/stone-finder"
                  className="rounded-full border border-gold/40 bg-surface/70 px-7 py-3 text-center text-sm font-medium text-gold-antique backdrop-blur-sm transition-colors hover:border-gold hover:text-primary-deep"
                >
                  Find your stone
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product collection */}
      <CollectionsSection />

      {/* Customise your own — call to action */}
      <section className="bg-background px-6 pb-20">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gold/30 bg-surface p-8 text-center shadow-[0_20px_60px_-32px_rgba(144,86,141,0.5)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
            Make it yours
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Customise your own bracelet
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-muted">
            Can&apos;t find your stone? Choose your bead size and combine the
            crystals whose energy you&apos;re reaching for into a bracelet made
            just for you.
          </p>
          <Link
            href="/customise"
            className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
          >
            Start Customising
          </Link>
        </div>
      </section>

      {/* Antique-gold divider between sections */}
      <div className="gold-rule" />

      {/* Our story */}
      <section id="story" className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              Our story
            </p>
            <h2 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Made by hand, with intention
            </h2>
          </div>

          <div className="mt-8 flex flex-col gap-6 text-base leading-8 text-muted sm:text-lg">
            <p>
              Amritara began on my own wrist, during a season when I was trying
              to find my way back to myself. A single strand of stones became
              the thing I reached for on the hard days. That small, steadying
              ritual slowly helped me heal, and in time I knew I wanted to make
              the same quiet comfort for others, one bracelet at a time.
            </p>
            <p>
              I make every piece by hand, with the utmost attention. Each stone
              is chosen for the energy it carries, whether that is calm, courage,
              clarity or protection. I customise every bracelet around the
              intention you&apos;re reaching for, so the power of each crystal is
              matched to you rather than picked at random.
            </p>
            <p>
              Amritara Rituals crafts gemstone bracelets as quiet reminders to
              return to yourself. Each stone is chosen for its energy, and every
              piece becomes a small daily ritual. I blend the timeless symbolism
              of the lotus with the living presence of natural crystals, so what
              you wear feels less like jewellery and more like a moment of
              stillness you can carry with you.
            </p>
            <p>
              Every order is cleansed and set with care before it reaches you,
              because to me these aren&apos;t products. They&apos;re little
              companions made to grow alongside the person wearing them.
            </p>
          </div>

          <p className="mt-10 text-center font-display text-xl italic text-primary-deep">
            With love, Amrutha
          </p>
        </div>
      </section>

      {/* Antique-gold divider between sections */}
      <div className="gold-rule" />

      {/* Contact */}
      <ContactSection />
    </main>
  );
}
