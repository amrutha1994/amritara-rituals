import type { RangeIconName } from "@/data/ranges";

/**
 * Collections tab icons. Authors pick one per range in the Studio (see
 * `RANGE_ICONS`); all share the header's 1.7 line weight so tabs read as a set.
 */
const PATHS: Record<RangeIconName, React.ReactNode> = {
  // A bracelet band with a charm bead.
  bracelet: (
    <>
      <circle cx="12" cy="13" r="7" />
      <circle cx="12" cy="4" r="1.7" fill="currentColor" stroke="none" />
    </>
  ),
  // The header's décor glyph — a vessel.
  decor: (
    <>
      <path d="M6 9h12l-2.5 11h-7L6 9Z" />
      <path d="m6 9 2-4h8l2 4" />
      <path d="M9.5 9 12 5l2.5 4" />
    </>
  ),
  // A teardrop stone hanging from a cord.
  pendant: (
    <>
      <path d="M4 3c1.5 5 4.5 8 8 8s6.5-3 8-8" />
      <path d="M12 11c-2.4 2.6-3.5 4.6-3.5 6.2a3.5 3.5 0 0 0 7 0c0-1.6-1.1-3.6-3.5-6.2Z" />
    </>
  ),
  gem: (
    <>
      <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />
      <path d="M3 9h18M9 4l3 5 3-5M12 9v11" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.6 8l4.5 1.6L13.6 11 12 15.5 10.4 11 5.9 9.6 10.4 8 12 3.5Z" />
      <path d="M6 16.5 6.7 18.5 8.7 19.2 6.7 19.9 6 22 5.3 19.9 3.3 19.2 5.3 18.5 6 16.5Z" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  leaf: (
    <>
      <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
      <path d="M5 19 14 10" />
    </>
  ),
};

export default function RangeIcon({
  name,
  className,
}: {
  name: RangeIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name] ?? PATHS.gem}
    </svg>
  );
}
