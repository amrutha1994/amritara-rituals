"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BEAD_SIZES,
  MAX_STONES,
  stonesBySize,
  getStone,
  priceForStones,
  fromPrice,
  type BeadSize,
} from "@/data/stones";
import { BRACELET_SIZES, SHIPPING_FEE, type BraceletSizeId } from "@/data/products";
import { buildCustomOrderLink, type CustomOrderLine } from "@/lib/whatsapp";
import { useSelection } from "@/components/selection-provider";
import { useToast } from "@/components/toast-provider";
import SizeChart from "@/components/size-chart";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.74c0 4.48-3.65 8.12-8.13 8.12a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.07 8.07 0 0 1-1.24-4.31c0-4.48 3.64-8.13 8.12-8.13Zm4.7 10.2c-.26-.13-1.52-.75-1.76-.83-.24-.09-.41-.13-.59.13-.17.26-.67.83-.82 1-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.07-1.28-.77-.68-1.28-1.53-1.43-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.06-.13-.59-1.42-.81-1.95-.21-.51-.43-.44-.59-.45l-.5-.01c-.17 0-.46.06-.7.33-.24.26-.92.9-.92 2.19s.94 2.54 1.07 2.72c.13.17 1.85 2.83 4.49 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.07 1.52-.62 1.74-1.22.21-.6.21-1.11.15-1.22-.06-.11-.24-.17-.5-.3Z" />
    </svg>
  );
}

function StepHeading({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep">
        {n}
      </span>
      <div>
        <h2 className="font-display text-xl font-medium text-foreground">{title}</h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
    </div>
  );
}

export default function BraceletCustomiser() {
  const [beadSize, setBeadSize] = useState<BeadSize | null>(null);
  const [stoneIds, setStoneIds] = useState<string[]>([]);
  const [wrist, setWrist] = useState<BraceletSizeId | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { addCustom } = useSelection();
  const { show } = useToast();

  const availableStones = useMemo(
    () => (beadSize ? stonesBySize(beadSize) : []),
    [beadSize],
  );
  const chosenStones = useMemo(
    () => stoneIds.map((id) => getStone(id)).filter((s) => s !== undefined),
    [stoneIds],
  );

  const unitPrice = priceForStones(stoneIds);
  const totalPrice = unitPrice * qty;
  const atMax = stoneIds.length >= MAX_STONES;
  const isCombo = chosenStones.length > 1;

  const chooseBeadSize = (size: BeadSize) => {
    if (size === beadSize) return;
    // Stones are bead-size specific, so a size change starts the strand fresh.
    if (stoneIds.length > 0) {
      setStoneIds([]);
      show("Bead size changed — stone selection reset");
    }
    setBeadSize(size);
    setError(null);
  };

  const toggleStone = (id: string) => {
    setError(null);
    setStoneIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_STONES) {
        show(`You can combine up to ${MAX_STONES} stones`);
        return prev;
      }
      return [...prev, id];
    });
  };

  /** Returns true if the design is complete; otherwise sets an error hint. */
  const validate = (): boolean => {
    if (!beadSize) return setError("Choose a bead size to begin."), false;
    if (stoneIds.length === 0) return setError("Pick at least one stone."), false;
    if (!wrist) return setError("Choose your wrist size."), false;
    return true;
  };

  const handleAddToBag = () => {
    if (!validate() || !beadSize || !wrist) return;
    addCustom({ beadSize, stoneIds, size: wrist, qty, unitPrice });
    show(
      qty > 1
        ? `${qty} custom bracelets added to your bag`
        : "Custom bracelet added to your bag",
    );
    // Clear the design so the next one starts fresh (keep the bead size).
    setStoneIds([]);
    setQty(1);
  };

  const handleOrder = () => {
    if (!validate() || !beadSize || !wrist) return;
    const origin = window.location.origin;
    const line: CustomOrderLine = {
      beadSize,
      stoneNames: chosenStones.map((s) => s.name),
      size: wrist,
      qty,
      unitPrice,
      imageUrls: chosenStones.map((s) => `${origin}${s.image}`),
    };
    window.open(buildCustomOrderLink(line), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      {/* Steps */}
      <div className="flex flex-col gap-12">
        {/* Step 1 — bead size */}
        <section>
          <StepHeading n={1} title="Choose your bead size" hint="Sets the look and feel of the strand." />
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BEAD_SIZES.map((b) => {
              const selected = beadSize === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => chooseBeadSize(b.id)}
                  aria-pressed={selected}
                  className={`flex flex-col rounded-2xl border p-5 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl font-medium text-foreground">
                      {b.id}
                    </span>
                    <span className="text-sm font-semibold text-primary-deep">
                      from {inr.format(fromPrice(b.id))}
                    </span>
                  </div>
                  <span className="mt-1 text-sm font-medium text-primary-deep">
                    {b.headline}
                  </span>
                  <span className="mt-1 text-sm leading-6 text-muted">{b.note}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — stones */}
        <section className={beadSize ? "" : "pointer-events-none opacity-45"}>
          <StepHeading
            n={2}
            title="Choose your stones"
            hint={
              beadSize
                ? `Pick one, or combine up to ${MAX_STONES} for a blended intention.`
                : "Choose a bead size first to see the stones."
            }
          />

          {beadSize && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {availableStones.map((stone) => {
                const selected = stoneIds.includes(stone.id);
                const disabled = !selected && atMax;
                return (
                  <button
                    key={stone.id}
                    type="button"
                    onClick={() => toggleStone(stone.id)}
                    aria-pressed={selected}
                    disabled={disabled}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-colors ${
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span className="relative block aspect-square w-full overflow-hidden bg-surface">
                      <Image
                        src={stone.image}
                        alt={stone.name}
                        fill
                        sizes="(min-width: 640px) 20vw, 45vw"
                        className="object-cover"
                      />
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white shadow">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col gap-0.5 p-3">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {stone.name}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-primary-deep">
                          {inr.format(stone.price)}
                        </span>
                      </span>
                      <span className="text-xs leading-5 text-muted">{stone.power}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Step 3 — wrist size */}
        <section className={beadSize ? "" : "pointer-events-none opacity-45"}>
          <div className="flex items-center justify-between gap-3">
            <StepHeading n={3} title="Choose your wrist size" />
            <SizeChart />
          </div>
          <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Select a size">
            {BRACELET_SIZES.map((option) => {
              const selected = wrist === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setWrist(option.id);
                    setError(null);
                  }}
                  className={`flex min-w-[5.5rem] flex-col items-center rounded-xl border px-4 py-2.5 text-center transition-colors ${
                    selected
                      ? "border-primary bg-primary-soft text-primary-deep"
                      : "border-border bg-surface text-foreground/80 hover:border-primary/50"
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {option.label} ({option.id})
                  </span>
                  <span className="text-xs text-muted">{option.wrist}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_18px_50px_-30px_rgba(144,86,141,0.5)]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
            Your ritual
          </p>

          {/* Bead size */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">Bead size</span>
            <span className="font-medium text-foreground">
              {beadSize ?? "—"}
            </span>
          </div>

          {/* Wrist size */}
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Wrist size</span>
            <span className="font-medium text-foreground">{wrist ?? "—"}</span>
          </div>

          {/* Stones */}
          <div className="mt-4">
            <p className="text-sm text-muted">
              Stones {chosenStones.length > 0 && `· ${chosenStones.length}`}
            </p>
            {chosenStones.length === 0 ? (
              <p className="mt-2 text-sm italic text-muted/80">
                No stones chosen yet.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {chosenStones.map((stone) => (
                  <li
                    key={stone.id}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 p-1.5 pr-2"
                  >
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={stone.image}
                        alt={stone.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {stone.name}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {stone.power}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStone(stone.id)}
                      aria-label={`Remove ${stone.name}`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="6" y1="18" x2="18" y2="6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-muted">Quantity</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-foreground">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary-deep transition-colors hover:border-primary hover:bg-primary-soft"
              >
                +
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="text-2xl font-semibold text-primary-deep">
                {chosenStones.length === 0 ? "—" : inr.format(totalPrice)}
              </span>
            </div>
            {chosenStones.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                + {inr.format(SHIPPING_FEE)} shipping at checkout
                {isCombo && " · combination price is the average of your stones"}
              </p>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-primary-deep">{error}</p>}

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleOrder}
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Order on WhatsApp
            </button>
            <button
              type="button"
              onClick={handleAddToBag}
              className="rounded-full border border-border bg-surface px-7 py-3 text-sm font-medium text-primary-deep transition-colors hover:border-primary"
            >
              Add to bag
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
