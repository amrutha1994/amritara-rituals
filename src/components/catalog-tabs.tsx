"use client";

import { useId, useState } from "react";

import type { Intention } from "@/data/intentions";
import type { Product } from "@/data/products";
import CollectionBrowser from "@/components/collection-browser";
import DecorBrowser from "@/components/decor-browser";

type TabId = "bracelets" | "decor";

/** Per-tab subcopy — the tab label acts as the title, so this is the only intro line. */
const COPY: Record<TabId, { subcopy: string }> = {
  bracelets: {
    subcopy: "One crystal, one intention. Choose the energy you want to wear!",
  },
  decor: {
    subcopy:
      "Natural-stone objects to carry an intention into your home, car and sacred spaces.",
  },
};

type IconProps = { className?: string };

// A bracelet band with a charm bead — clean and non-spinner-like.
function BraceletIcon({ className }: IconProps) {
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
      <circle cx="12" cy="13" r="7" />
      <circle cx="12" cy="4" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

// The same décor glyph used in the site header, for a consistent language.
function DecorIcon({ className }: IconProps) {
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
      <path d="M6 9h12l-2.5 11h-7L6 9Z" />
      <path d="m6 9 2-4h8l2 4" />
      <path d="M9.5 9 12 5l2.5 4" />
    </svg>
  );
}

const TABS: { id: TabId; label: string; Icon: (p: IconProps) => React.ReactElement }[] = [
  { id: "bracelets", label: "Bracelets", Icon: BraceletIcon },
  { id: "decor", label: "For your space", Icon: DecorIcon },
];

/**
 * The Collections section as two ranges the shopper switches between —
 * Bracelets (default) and Stone Décor — each with its own filters and grid.
 * A segmented, keyboard-navigable tablist styled like the header's pill nav.
 *
 * When there are no décor items (feature flag off, or none authored yet) the
 * tabs disappear and it renders exactly as the old bracelet-only section, so
 * nothing extra ever shows before the line is ready.
 */
export default function CatalogTabs({
  products,
  decor,
  intentions,
}: {
  products: Product[];
  decor: Product[];
  intentions: Intention[];
}) {
  const [tab, setTab] = useState<TabId>("bracelets");
  const baseId = useId();

  const showTabs = decor.length > 0;
  const active: TabId = showTabs ? tab : "bracelets";

  const tabId = (id: TabId) => `${baseId}-tab-${id}`;
  const panelId = (id: TabId) => `${baseId}-panel-${id}`;

  // Left/Right arrows move between tabs and carry focus with the selection,
  // matching native tablist behaviour.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === active);
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    document.getElementById(tabId(next.id))?.focus();
  }

  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
        The collection
      </p>

      {showTabs && (
        <div
          role="tablist"
          aria-label="Product ranges"
          onKeyDown={onKeyDown}
          className="mt-6 flex w-full border-b border-border"
        >
          {TABS.map(({ id, label, Icon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={tabId(id)}
                aria-selected={selected}
                aria-controls={panelId(id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(id)}
                className={
                  "-mb-px flex flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:text-base " +
                  (selected
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/55 hover:text-foreground")
                }
              >
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-auto mt-4 max-w-2xl text-center">
        <p className="mx-auto max-w-xl text-sm leading-7 text-muted sm:text-base">
          {COPY[active].subcopy}
        </p>
      </div>

      {/* Both panels stay mounted so a shopper's filters survive tab switches;
          `hidden` shows only the active one. */}
      {showTabs ? (
        <>
          <div
            role="tabpanel"
            id={panelId("bracelets")}
            aria-labelledby={tabId("bracelets")}
            hidden={active !== "bracelets"}
          >
            <CollectionBrowser products={products} intentions={intentions} />
          </div>
          <div
            role="tabpanel"
            id={panelId("decor")}
            aria-labelledby={tabId("decor")}
            hidden={active !== "decor"}
          >
            <DecorBrowser products={decor} intentions={intentions} />
          </div>
        </>
      ) : (
        <CollectionBrowser products={products} intentions={intentions} />
      )}
    </div>
  );
}
