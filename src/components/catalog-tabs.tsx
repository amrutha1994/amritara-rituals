"use client";

import { useEffect, useId, useMemo, useState } from "react";

import type { Intention } from "@/data/intentions";
import { isNewArrival, type Product } from "@/data/products";
import type { Range, RangeIconName } from "@/data/ranges";
import CollectionBrowser from "@/components/collection-browser";
import RangeBrowser from "@/components/range-browser";
import RangeIcon from "@/components/range-icon";

/** Bracelets are the built-in first tab; every other tab is a Sanity range. */
const BRACELETS = "bracelets";

const BRACELET_SUBCOPY = "One crystal, one intention. Choose the energy you want to wear!";

interface Tab {
  /** Also the URL hash that deep-links the tab: `/#bracelets`, `/#decor`, … */
  id: string;
  label: string;
  icon: RangeIconName;
  subcopy: string;
  /** NEW badge while any product in the tab is marked "New arrival". */
  isNew: boolean;
}

/**
 * The Collections section as the ranges the shopper switches between —
 * Bracelets (default) followed by every live Sanity range (Stone Décor,
 * Pendants, …), each with its own filters and grid. A segmented,
 * keyboard-navigable tablist styled like the header's pill nav.
 *
 * Range tabs come entirely from the Studio: a range appears once it's switched
 * on and has a visible product. With only bracelets, the tabs disappear and it
 * renders exactly as the bracelet-only section.
 */
export default function CatalogTabs({
  products,
  ranges,
  intentions,
}: {
  products: Product[];
  ranges: Range[];
  intentions: Intention[];
}) {
  const [tab, setTab] = useState<string>(BRACELETS);
  const baseId = useId();

  const tabs = useMemo<Tab[]>(
    () => [
      { id: BRACELETS, label: "Bracelets", icon: "bracelet", subcopy: BRACELET_SUBCOPY, isNew: false },
      ...ranges
        // A range can't take the bracelets tab's id.
        .filter((r) => r.slug !== BRACELETS)
        .map((r) => ({
          id: r.slug,
          label: r.title,
          icon: r.icon,
          subcopy: r.subcopy,
          isNew: r.products.some((p) => p.show && isNewArrival(p)),
        })),
    ],
    [ranges],
  );
  const showTabs = tabs.length > 1;
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  // Deep links: `/#decor` opens the décor tab and scrolls the collection into
  // view. Read on mount (shared links, cross-page navigation) and on
  // `hashchange` (in-page anchors, back/forward). The hash names no element, so
  // the browser doesn't scroll by itself — we bring the section into view.
  useEffect(() => {
    if (!showTabs) return;
    function sync() {
      const fromHash = window.location.hash.replace(/^#/, "");
      // Ignore hashes that aren't a live tab (other anchors, retired tabs).
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
  function selectTab(id: string) {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  // Left/Right arrows move between tabs and carry focus with the selection,
  // matching native tablist behaviour.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active.id);
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
        // Scrolls sideways when there are more tabs than fit (e.g. a phone with
        // four or more ranges) instead of squashing the labels.
        <div
          role="tablist"
          aria-label="Product ranges"
          onKeyDown={onKeyDown}
          className="mt-6 flex w-full overflow-x-auto border-b border-border [scrollbar-width:none]"
        >
          {tabs.map(({ id, label, icon, isNew }) => {
            const selected = active.id === id;
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
                  "-mb-px flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:text-base " +
                  (selected
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/55 hover:text-foreground")
                }
              >
                <RangeIcon name={icon} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                {label}
                {isNew && (
                  <span className="rounded-full bg-crimson-deep px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {active.subcopy && (
        <div className="mx-auto mt-4 max-w-2xl text-center">
          <p className="mx-auto max-w-xl text-sm leading-7 text-muted sm:text-base">
            {active.subcopy}
          </p>
        </div>
      )}

      {/* Every panel stays mounted so a shopper's filters survive tab switches;
          `hidden` shows only the active one. */}
      {showTabs ? (
        <>
          <div
            role="tabpanel"
            id={panelId(BRACELETS)}
            aria-labelledby={tabId(BRACELETS)}
            hidden={active.id !== BRACELETS}
          >
            <CollectionBrowser products={products} intentions={intentions} />
          </div>
          {ranges
            .filter((r) => r.slug !== BRACELETS)
            .map((r) => (
              <div
                key={r.slug}
                role="tabpanel"
                id={panelId(r.slug)}
                aria-labelledby={tabId(r.slug)}
                hidden={active.id !== r.slug}
              >
                <RangeBrowser products={r.products} intentions={intentions} />
              </div>
            ))}
        </>
      ) : (
        <CollectionBrowser products={products} intentions={intentions} />
      )}
    </div>
  );
}
