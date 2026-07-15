import { sendGAEvent } from "@next/third-parties/google";

/**
 * Google Analytics 4 measurement ID (e.g. "G-XXXXXXX"). Configured via env so it
 * ships with the other deployment settings; must be NEXT_PUBLIC_* to reach the
 * client. Empty locally / in previews, which disables analytics entirely.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

/** Whether analytics is active — false when no measurement ID is configured. */
export const analyticsEnabled = GA_ID.length > 0;

/** Values GA4 accepts as event parameters. */
type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Record a custom GA4 event. A no-op when analytics is disabled, so `track(...)`
 * calls are safe to leave in place during local development.
 *
 * This is the single point where the app talks to the analytics vendor — every
 * component calls `track()`, never `@next/third-parties` directly — so swapping
 * providers later is a one-file change.
 */
export function track(name: AnalyticsEvent, params?: EventParams): void {
  if (!analyticsEnabled) return;
  sendGAEvent("event", name, params ?? {});
}

/**
 * The custom events we record. Kept as a closed set so event names stay
 * consistent between where they're sent and how they're read in GA.
 *   - `whatsapp_order`  — clicked "Order on WhatsApp" (the key conversion)
 *   - `add_to_bag`      — added an item to the bag
 */
export type AnalyticsEvent = "whatsapp_order" | "add_to_bag";
