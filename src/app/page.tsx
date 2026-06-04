import Image from "next/image";

export default function Home() {
  return (
    <main className="aura relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Soft launching-soon eyebrow */}
      <span className="mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Launching soon
      </span>

      {/* Brand logo (lotus mandala + wordmark) */}
      <Image
        src="/logo.png"
        alt="Amritara Rituals — align your energy & soul"
        width={1080}
        height={588}
        priority
        className="h-auto w-[300px] drop-shadow-[0_8px_40px_rgba(155,134,196,0.35)] sm:w-[420px]"
      />

      {/* Brand story */}
      <div className="mt-12 flex max-w-xl flex-col items-center gap-6">
        <h1 className="font-display text-3xl font-medium leading-snug text-lavender-deep sm:text-4xl">
          Wearable rituals, aligned to your energy
        </h1>
        <p className="text-base leading-8 text-muted sm:text-lg">
          Amritara Rituals crafts gemstone bracelets as quiet reminders to
          return to yourself — each stone chosen for its energy, each piece a
          small daily ritual. We blend the timeless symbolism of the lotus with
          the living presence of natural crystals.
        </p>
        <p className="text-base leading-8 text-foreground/80 sm:text-lg">
          Our first collection is being prepared with care. Something beautiful
          is on its way.
        </p>
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs uppercase tracking-[0.2em] text-muted">
        © {new Date().getFullYear()} Amritara Rituals
      </p>
    </main>
  );
}
