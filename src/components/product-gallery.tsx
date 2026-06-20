"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";

function ChevronIcon({
  direction,
  className,
}: {
  direction: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {direction === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

export default function ProductGallery({ product }: { product: Product }) {
  const { images, name, stone } = product;
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const go = (next: number) => {
    // wrap around so the gallery never dead-ends
    setIndex((next + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_18px_50px_-24px_rgba(144,86,141,0.5)]">
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${name} — view ${index + 1} of ${images.length}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-surface/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-gold-antique backdrop-blur-sm">
          {stone}
        </span>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/85 text-primary-deep shadow-sm backdrop-blur-sm transition-colors hover:bg-primary hover:text-white"
            >
              <ChevronIcon direction="left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/85 text-primary-deep shadow-sm backdrop-blur-sm transition-colors hover:bg-primary hover:text-white"
            >
              <ChevronIcon direction="right" className="h-5 w-5" />
            </button>

            {/* Dot indicator */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {images.map((src, i) => (
                <span
                  key={src + i}
                  aria-hidden
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-primary" : "w-1.5 bg-surface/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => {
            const selected = i === index;
            return (
              <button
                key={src + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={selected}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition-colors ${
                  selected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={src}
                  alt={`${name} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
