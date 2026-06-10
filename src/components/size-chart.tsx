"use client";

import { useEffect, useState } from "react";
import { BRACELET_SIZES } from "@/data/products";

/**
 * A "Size guide" link that opens a modal with the wrist-size chart and a short
 * how-to-measure note. Self-contained: drop it in anywhere a size reference is
 * useful. `className` styles the trigger so it can blend into its context.
 */
export default function SizeChart({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "text-sm font-medium text-primary underline-offset-4 hover:underline"
        }
      >
        Size guide
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-chart-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close size guide"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
                  Find your fit
                </p>
                <h2
                  id="size-chart-title"
                  className="mt-2 font-display text-2xl font-medium text-foreground"
                >
                  Size guide
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <table className="mt-6 w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.15em] text-muted">
                  <th className="pb-2 font-semibold">Size</th>
                  <th className="pb-2 font-semibold">Wrist</th>
                </tr>
              </thead>
              <tbody>
                {BRACELET_SIZES.map((size) => (
                  <tr key={size.id} className="border-b border-border/60">
                    <td className="py-3 font-medium text-foreground">
                      {size.label}{" "}
                      <span className="text-muted">({size.id})</span>
                    </td>
                    <td className="py-3 text-foreground/80">{size.wrist}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 rounded-xl bg-primary-soft/60 p-4 text-sm leading-6 text-foreground/80">
              <p className="font-medium text-primary-deep">
                How to measure your wrist
              </p>
              <p className="mt-1">
                Wrap a soft tape measure (or a strip of paper) snugly around
                your wrist, just below the wrist bone. Note the measurement in
                centimetres and match it to a size above. Between two sizes?
                Size up for a relaxed fit, down for a closer one.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
