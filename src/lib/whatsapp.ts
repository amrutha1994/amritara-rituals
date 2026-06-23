import type { BraceletSizeId, Product } from "@/data/products";

// WhatsApp Business number in full international format: country code + number,
// digits only (no '+', spaces, or dashes). India (+91) 9249041474.
export const WHATSAPP_NUMBER = "919249041474";

/** True while the number is still the placeholder, so the UI can hint at it. */
export const IS_WHATSAPP_PLACEHOLDER = WHATSAPP_NUMBER === "919249041474";

/** Human-friendly version of the number, e.g. "+91 92490 41474". */
export const WHATSAPP_DISPLAY = WHATSAPP_NUMBER.replace(
  /^(\d{2})(\d{5})(\d{5})$/,
  "+$1 $2 $3",
);

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function waLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Deep link that opens WhatsApp pre-filled for a general enquiry. */
export function buildContactLink(): string {
  const text = [
    "Hi Amritara Rituals!",
    "I'd love to know more about your bracelets.",
  ].join("\n");
  return waLink(text);
}

/** Deep link to ask about a custom / intention-based bracelet. */
export function buildCustomEnquiryLink(): string {
  const text = [
    "Hi Amritara Rituals!",
    "I'd like a bracelet customised around an intention. Could you help me choose the right stones?",
  ].join("\n");
  return waLink(text);
}

/** A bracelet + chosen size + quantity, used to compose an order message. */
export interface OrderLine {
  product: Product;
  size: BraceletSizeId;
  qty: number;
}

/** A designed custom bracelet, used to compose an order message. */
export interface CustomOrderLine {
  beadSize: string;
  /** Chosen stone names, in order. */
  stoneNames: string[];
  size: BraceletSizeId;
  qty: number;
  /** Price of one bracelet. */
  unitPrice: number;
  /** Optional absolute photo URLs for the chosen stones (for previews). */
  imageUrls?: string[];
}

function lineText(line: OrderLine): string {
  // The [code] is the product's tracking id (SKU); it lets an order be matched
  // back to an exact product even if names or prices change later.
  const base = `[${line.product.id}] ${line.product.name} (${line.product.stone}) — Size ${line.size}`;
  if (line.qty > 1) {
    return `${base} × ${line.qty} — ${inr.format(line.product.price)} each (${inr.format(
      line.product.price * line.qty,
    )})`;
  }
  return `${base} — ${inr.format(line.product.price)}`;
}

/** A human-readable block describing one custom bracelet. */
function customLineText(line: CustomOrderLine): string {
  const stones = line.stoneNames.join(", ");
  const priceTail =
    line.qty > 1
      ? `× ${line.qty} — ${inr.format(line.unitPrice)} each (${inr.format(
          line.unitPrice * line.qty,
        )})`
      : `— ${inr.format(line.unitPrice)}`;
  const rows = [
    `Custom bracelet (${line.beadSize}) — Size ${line.size} ${priceTail}`,
    `   Stones: ${stones}`,
  ];
  if (line.imageUrls?.length) {
    rows.push(`   Photos: ${line.imageUrls.join(" | ")}`);
  }
  return rows.join("\n");
}

/**
 * The pre-filled message body for ordering one product (no link wrapper).
 *
 * Pass an absolute `imageUrl` to include a "Photo:" line — WhatsApp turns that
 * link into a photo preview, which is the only way to get the product image
 * into a chat opened by a wa.me link (links can't carry file attachments).
 */
export function buildProductOrderText(
  product: Product,
  size: BraceletSizeId,
  imageUrl?: string,
): string {
  return [
    "Hi Amritara Rituals!",
    "I'd like to order this ritual:",
    `• ${lineText({ product, size, qty: 1 })}`,
    ...(imageUrl ? ["", `Photo: ${imageUrl}`] : []),
    "",
    "Could you help me complete the order?",
  ].join("\n");
}

/** Deep link that opens WhatsApp pre-filled to order one product. */
export function buildProductOrderLink(
  product: Product,
  size: BraceletSizeId,
  imageUrl?: string,
): string {
  return waLink(buildProductOrderText(product, size, imageUrl));
}

/** The pre-filled message body for ordering one custom bracelet. */
export function buildCustomOrderText(line: CustomOrderLine): string {
  return [
    "Hi Amritara Rituals!",
    "I'd like to order this custom bracelet:",
    `• ${customLineText(line)}`,
    "",
    "Could you help me complete the order?",
  ].join("\n");
}

/** Deep link that opens WhatsApp pre-filled to order one custom bracelet. */
export function buildCustomOrderLink(line: CustomOrderLine): string {
  return waLink(buildCustomOrderText(line));
}

/**
 * Deep link that opens WhatsApp pre-filled to order a whole bag — any mix of
 * catalogue products and custom bracelets.
 *
 * Pass `origin` (e.g. window.location.origin) to append "Photo:" links so
 * WhatsApp shows previews — links can't carry file attachments, so the URL
 * preview is how the images reach the chat.
 */
export function buildSelectionOrderLink(
  lines: OrderLine[],
  customLines: CustomOrderLine[] = [],
  origin?: string,
): string {
  const total =
    lines.reduce((sum, l) => sum + l.product.price * l.qty, 0) +
    customLines.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);

  // Continuous numbering across both kinds of line.
  let n = 0;
  const productRows = lines.map((l) => {
    const row = `${++n}. ${lineText(l)}`;
    return origin ? `${row}\n   Photo: ${origin}${l.product.image}` : row;
  });
  const customRows = customLines.map((c) => `${++n}. ${customLineText(c)}`);

  const text = [
    "Hi Amritara Rituals!",
    "I'd like to order these rituals:",
    ...productRows,
    ...customRows,
    "",
    `Total: ${inr.format(total)}`,
    "Could you help me complete the order?",
  ].join("\n");
  return waLink(text);
}
