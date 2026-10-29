"use client";

import { useId } from "react";

import { useCatalog } from "@/components/catalog-provider";
import { useSelection } from "@/components/selection-provider";

/** Longest gift message — enough for a card, short enough for a WhatsApp line. */
export const GIFT_MESSAGE_MAX = 150;

/** What an order needs to know about gift wrap: its price and the card message. */
export interface GiftOption {
  price: number;
  message: string;
}

/**
 * The gift wrap the next order should include, or `null` — set when the shopper
 * ticked it and it's offered in Sanity Settings. Shared by the bag and every
 * single-item "Order on WhatsApp" button, so it's one choice per visit.
 */
export function useGiftOption(): GiftOption | null {
  const { giftWrap: offer } = useCatalog();
  const { giftWrap, giftMessage } = useSelection();
  return offer.enabled && giftWrap ? { price: offer.price, message: giftMessage.trim() } : null;
}

/**
 * "Add gift wrap" checkbox with an optional gift message, shown in the bag and
 * above each "Order on WhatsApp" button. Renders nothing when gift wrap is
 * switched off in Sanity Settings.
 */
export default function GiftWrapOption({ className = "" }: { className?: string }) {
  const { giftWrap: offer } = useCatalog();
  const { giftWrap, setGiftWrap, giftMessage, setGiftMessage } = useSelection();
  const messageId = useId();

  if (!offer.enabled) return null;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={giftWrap}
          onChange={(e) => setGiftWrap(e.target.checked)}
          className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-primary)]"
        />
        <span className="flex-1">
          <span aria-hidden>🎁 </span>Add gift wrap
        </span>
        <span className="text-muted">
          {offer.price > 0 ? `+ ₹${offer.price}` : "Free"}
        </span>
      </label>

      {giftWrap && (
        <div className="flex flex-col gap-1">
          <label htmlFor={messageId} className="text-xs text-muted">
            Gift message (optional) — we&apos;ll write it on a card
          </label>
          <textarea
            id={messageId}
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value.slice(0, GIFT_MESSAGE_MAX))}
            rows={2}
            maxLength={GIFT_MESSAGE_MAX}
            placeholder="e.g. Happy birthday, Meera! Wishing you calm and joy."
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <p className="self-end text-[11px] text-muted">
            {giftMessage.length}/{GIFT_MESSAGE_MAX}
          </p>
        </div>
      )}
    </div>
  );
}
