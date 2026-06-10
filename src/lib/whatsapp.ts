import type { BraceletSizeId, Product } from "@/data/products";

// ─────────────────────────────────────────────────────────────────────────
// PLACEHOLDER — WhatsApp Business is not set up yet.
// Once the account is live, replace this with the real number in full
// international format: country code + number, digits only (no '+', spaces,
// or dashes). e.g. India "919876543210". That is the ONLY change needed to
// make every "Order on WhatsApp" link live.
// ─────────────────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = "910000000000";

/** True while the number is still the placeholder, so the UI can hint at it. */
export const IS_WHATSAPP_PLACEHOLDER = WHATSAPP_NUMBER === "910000000000";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function waLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** A bracelet + chosen size + quantity, used to compose an order message. */
export interface OrderLine {
  product: Product;
  size: BraceletSizeId;
  qty: number;
}

function lineText(line: OrderLine): string {
  const base = `${line.product.name} (${line.product.stone}) — Size ${line.size}`;
  if (line.qty > 1) {
    return `${base} × ${line.qty} — ${inr.format(line.product.price)} each (${inr.format(
      line.product.price * line.qty,
    )})`;
  }
  return `${base} — ${inr.format(line.product.price)}`;
}

/** Deep link that opens WhatsApp pre-filled to order one product. */
export function buildProductOrderLink(product: Product, size: BraceletSizeId): string {
  const text = [
    "Hi Amritara Rituals! 🌸",
    "I'd like to order this ritual:",
    `• ${lineText({ product, size, qty: 1 })}`,
    "",
    "Could you help me complete the order?",
  ].join("\n");
  return waLink(text);
}

/** Deep link that opens WhatsApp pre-filled to order a selection of products. */
export function buildSelectionOrderLink(lines: OrderLine[]): string {
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const body = lines.map((l, i) => `${i + 1}. ${lineText(l)}`).join("\n");
  const text = [
    "Hi Amritara Rituals! 🌸",
    "I'd like to order these rituals:",
    body,
    "",
    `Total: ${inr.format(total)}`,
    "Could you help me complete the order?",
  ].join("\n");
  return waLink(text);
}
