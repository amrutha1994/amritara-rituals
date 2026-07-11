"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * next/image with a simple spinner shown while the photo loads. The parent must
 * be `relative` (these images are all `fill`), since the loader is an overlay.
 *
 * Cached images can finish before React attaches `onLoad`, so we also flip to
 * "loaded" via a ref callback when the underlying <img> reports `complete`.
 */
export default function ProductImage({
  onLoad,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="img-shimmer absolute inset-0 z-10 grid place-items-center">
          <span
            aria-hidden
            className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-soft border-t-gold-antique"
          />
          <span className="sr-only">Loading image…</span>
        </div>
      )}
      <Image
        {...props}
        ref={(img) => {
          if (img?.complete) setLoaded(true);
        }}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={() => setLoaded(true)}
      />
    </>
  );
}
