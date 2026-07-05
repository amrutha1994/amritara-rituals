"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { INTENTIONS, getIntention } from "@/data/intentions";
import { recommendStonesForIntention, productForStone } from "@/data/stones";
import ProductImage from "@/components/product-image";

/** How many stones the finder reveals for the chosen intention. */
const BLEND_SIZE = 3;

export default function StoneFinder() {
  const [intention, setIntention] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const chosen = intention ? getIntention(intention) : undefined;

  const stones = useMemo(
    () => (intention ? recommendStonesForIntention(intention, BLEND_SIZE) : []),
    [intention],
  );

  const reset = () => {
    setRevealed(false);
    setIntention(null);
  };

  // ── Result view ──────────────────────────────────────────────────────────
  if (revealed && chosen) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
            Your ritual
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Best stones for {chosen.label.toLowerCase()}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-muted">
            Chosen to invite {chosen.invites}. Start with any one — or wear them
            together for a deeper blend.
          </p>
          <span className="mx-auto mt-6 block h-px w-40 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stones.map((stone) => {
            const product = productForStone(stone);
            const href = product
              ? `/collections/${product.slug}`
              : `/customise?size=${stone.beadSize}&stones=${stone.id}`;
            return (
              <div key={stone.id} className="flex flex-col text-center">
                <span className="relative mx-auto block aspect-square w-full max-w-[220px] overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_18px_50px_-30px_rgba(144,86,141,0.5)]">
                  <ProductImage
                    src={stone.image}
                    alt={stone.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </span>
                <span className="mt-5 font-display text-xl font-medium text-gold-antique">
                  {stone.name}
                </span>
                <span className="mt-1 text-sm text-muted">{stone.power}</span>
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-gold/60 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-gold-antique transition-colors hover:border-gold hover:bg-primary hover:text-white"
                >
                  Buy now
                </Link>
              </div>
            );
          })}
        </div>

        <ul className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 text-sm leading-7 text-muted">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-antique" />
            Start with any one stone, or wear them together in different
            combinations.
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-antique" />
            Each is a genuine natural crystal, cleansed and set with care before
            it reaches you.
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-antique" />
            Wear them as a ring, pendant or bracelet — no astrological
            recommendation needed.
          </li>
        </ul>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            &laquo; Start over
          </button>
        </div>
      </div>
    );
  }

  // ── Selection view ─────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
        Select your main intention
      </h2>
      <p className="mt-3 text-sm text-muted">
        Choose the energy you&apos;re reaching for, and we&apos;ll reveal the
        stones that carry it.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {INTENTIONS.map((item) => {
          const selected = intention === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setIntention(item.id)}
              aria-pressed={selected}
              className={`rounded-xl border px-5 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${
                selected
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-primary/40 bg-surface text-foreground/80 hover:border-primary hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <button
          type="button"
          disabled={!intention}
          onClick={() => setRevealed(true)}
          className="inline-flex rounded-full bg-primary px-9 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next &raquo;
        </button>
        {!intention && (
          <p className="mt-3 text-xs text-muted">
            Pick an intention to continue.
          </p>
        )}
      </div>
    </div>
  );
}
