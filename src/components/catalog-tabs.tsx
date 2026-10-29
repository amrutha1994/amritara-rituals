"use client";

import { useEffect, useId, useMemo, useState } from "react";

import type { Intention } from "@/data/intentions";
import { isNewArrival, type Product } from "@/data/products";
import CollectionBrowser from "@/components/collection-browser";
import DecorBrowser from "@/components/decor-browser";

type TabId = "bracelets" | "decor" | "pendants";

/** The URL hash that deep-links each tab: `/#bracelets`, `/#decor`, `/#pendants`. */
function tabFromHash(hash: string): TabId | null {
  const h = hash.replace(/^#/, "");
  return h === "bracelets" || h === "decor" || h === "pendants" ? h : null;
}

/** Per-tab subcopy — the tab label acts as the title, so this is the only intro line. */
const COPY: Record<TabId, { subcopy: string }> = {
  bracelets: {
    subcopy: "One crystal, one intention. Choose the energy you want to wear!",
  },
  decor: {
    subcopy:
      "Natural-stone objects to carry an intention into your home, car and sacred spaces.",
  },
  pendants: {
    subcopy: "One stone, worn close to your heart — on a simple black thread.",
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

// A teardrop stone hanging from a cord — same line weight as the other glyphs.
function PendantIcon({ className }: IconProps) {
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
      <path d="M4 3c1.5 5 4.5 8 8 8s6.5-3 8-8" />
      <path d="M12 11c-2.4 2.6-3.5 4.6-3.5 6.2a3.5 3.5 0 0 0 7 0c0-1.6-1.1-3.6-3.5-6.2Z" />
    </svg>
  );
}

const TABS: { id: TabId; label: string; Icon: (p: IconProps) => React.ReactElement }[] = [
  { id: "bracelets", label: "Bracelets", Icon: BraceletIcon },
  { id: "decor", label: "For your space", Icon: DecorIcon },
  { id: "pendants", label: "Pendants", Icon: PendantIcon },
];

/**
 * The Collections section as the ranges the shopper switches between —
 * Bracelets (default), Stone Décor and Pendants — each with its own filters
 * and grid.
 * A segmented, keyboard-navigable tablist styled like the header's pill nav.
 *
 * A tab only shows once its line has items (feature flag on and something
 * authored). With only bracelets, the tabs disappear entirely and it renders
 * exactly as the old bracelet-only section, so nothing shows before it's ready.
 */
export default function CatalogTabs({
  products,
  decor,
  pendants,
  intentions,
}: {
  products: Product[];
  decor: Product[];
  pendants: Product[];
  intentions: Intention[];
}) {
  const [tab, setTab] = useState<TabId>("bracelets");
  const baseId = useId();

  // A tab only appears once its line has items (and its feature flag is on —
  // the server returns [] while it's off).
  const hasDecor = decor.length > 0;
  const hasPendants = pendants.length > 0;
  const tabs = useMemo(
    () =>
      TABS.filter(
        (t) =>
          t.id === "bracelets" ||
          (t.id === "decor" && hasDecor) ||
          (t.id === "pendants" && hasPendants),
      ),
    [hasDecor, hasPendants],
  );
  const showTabs = tabs.length > 1;
  const active: TabId = tabs.some((t) => t.id === tab) ? tab : "bracelets";
  // Launch signal: the Pendants tab wears a NEW badge while any pendant is
  // marked "New arrival" in Sanity, and drops it once none are.
  const pendantsNew = pendants.some(isNewArrival);

  // Deep links: `/#decor` opens the décor tab and scrolls the collection into
  // view. Read on mount (shared links, cross-page navigation) and on
  // `hashchange` (in-page anchors, back/forward). The hash names no element, so
  // the browser doesn't scroll by itself — we bring the section into view.
  useEffect(() => {
    if (!showTabs) return;
    function sync() {
      const fromHash = tabFromHash(window.location.hash);
      if (!fromHash) return;
      // Ignore a hash for a line that isn't live (e.g. an old `/#pendants` link).
      if (!tabs.some((t) => t.id === fromHash)) return;
      setTab(fromHash);
      document.getElementById("collections")?.scrollIntoView();
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [showTabs, tabs]);

  // Switching tabs mirrors the choice into the URL so the address bar is always
  // a shareable link to what's on screen. `replaceState` keeps the page where it
  // is (no jump, no extra history entries) and fires no `hashchange`.
  function selectTab(id: TabId) {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  const tabId = (id: TabId) => `${baseId}-tab-${id}`;
  const panelId = (id: TabId) => `${baseId}-panel-${id}`;

  // Left/Right arrows move between tabs and carry focus with the selection,
  // matching native tablist behaviour.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next.id);
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
          {tabs.map(({ id, label, Icon }) => {
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
                onClick={() => selectTab(id)}
                className={
                  "-mb-px flex flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:text-base " +
                  (selected
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/55 hover:text-foreground")
                }
              >
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                {label}
                {id === "pendants" && pendantsNew && (
                  <span className="rounded-full bg-crimson-deep px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    New
                  </span>
                )}
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
          <div
            role="tabpanel"
            id={panelId("pendants")}
            aria-labelledby={tabId("pendants")}
            hidden={active !== "pendants"}
          >
            <DecorBrowser
              products={pendants}
              intentions={intentions}
              emptyCopy="Our pendants are being strung — check back shortly."
            />
          </div>
        </>
      ) : (
        <CollectionBrowser products={products} intentions={intentions} />
      )}
    </div>
  );
}
