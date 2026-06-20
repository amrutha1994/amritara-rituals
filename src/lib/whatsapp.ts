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

/** The pre-filled message body for ordering one product (no link wrapper). */
export function buildProductOrderText(product: Product, size: BraceletSizeId): string {
  return [
    "Hi Amritara Rituals!",
    "I'd like to order this ritual:",
    `• ${lineText({ product, size, qty: 1 })}`,
    "",
    "Could you help me complete the order?",
  ].join("\n");
}

/** Deep link that opens WhatsApp pre-filled to order one product. */
export function buildProductOrderLink(product: Product, size: BraceletSizeId): string {
  return waLink(buildProductOrderText(product, size));
}

/**
 * Try to share the order *with the product photo attached* via the native
 * Web Share API, so the customer can pick WhatsApp from the share sheet and
 * the actual image is sent (not just a link).
 *
 * A wa.me link can only carry text, so when the device/browser can't share a
 * file (most desktops), we fall back to opening the pre-filled chat instead.
 *
 * @returns "shared" if the share sheet handled it, "fallback" if we opened the
 *          wa.me link, or "cancelled" if the user dismissed the share sheet.
 */
export async function shareOrderWithImage(opts: {
  text: string;
  imageUrl: string;
  /** wa.me link to use when file sharing isn't available. */
  fallbackLink: string;
  /** Title used by the share sheet / file name. */
  title: string;
}): Promise<"shared" | "fallback" | "cancelled"> {
  const { text, imageUrl, fallbackLink, title } = opts;

  const openFallback = (): "fallback" => {
    window.open(fallbackLink, "_blank", "noopener,noreferrer");
    return "fallback";
  };

  // No Web Share, or it can't carry files → just open the chat.
  if (typeof navigator === "undefined" || !navigator.canShare) {
    return openFallback();
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return openFallback();
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const file = new File([blob], `${title}.${ext}`, {
      type: blob.type || "image/jpeg",
    });

    if (!navigator.canShare({ files: [file] })) return openFallback();

    await navigator.share({ files: [file], text, title });
    return "shared";
  } catch (err) {
    // User dismissed the share sheet — don't also open a chat behind it.
    if (err instanceof DOMException && err.name === "AbortError") {
      return "cancelled";
    }
    return openFallback();
  }
}

/** Deep link that opens WhatsApp pre-filled to order a selection of products. */
export function buildSelectionOrderLink(lines: OrderLine[]): string {
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const body = lines.map((l, i) => `${i + 1}. ${lineText(l)}`).join("\n");
  const text = [
    "Hi Amritara Rituals!",
    "I'd like to order these rituals:",
    body,
    "",
    `Total: ${inr.format(total)}`,
    "Could you help me complete the order?",
  ].join("\n");
  return waLink(text);
}
