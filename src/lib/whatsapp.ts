import {
  couponDiscountFor,
  deliveryFeeFor,
  displayName,
  isCouponEligible,
  type BraceletSizeId,
  type Coupon,
  type DeliverySettings,
  type Product,
} from "@/data/products";

// WhatsApp Business number in full international format: country code + number,
// digits only (no '+', spaces, or dashes). Configured via env so it lives with
// the other deployment settings rather than in code — set
// NEXT_PUBLIC_WHATSAPP_NUMBER (it must be NEXT_PUBLIC_* to reach the client
// components that build order links). The fallback is the current live number,
// so ordering still works if the env var isn't set.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919249041474";

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

/** The "Delivery:" order-summary line — shows the fee, or "FREE" when waived. */
function deliveryLine(fee: number): string {
  return `Delivery: ${fee > 0 ? inr.format(fee) : "FREE"}`;
}

/**
 * The "you saved" summary line, or nothing when no discount applies. Item
 * prices in the message are already the coupon prices, so this is a note, not
 * a further deduction. The code is spelled out so the owner can check it
 * against the live offer.
 */
function couponLines(coupon: Coupon | null | undefined, discount: number): string[] {
  if (!coupon || discount <= 0) return [];
  return [`Coupon ${coupon.code} (${coupon.percent}% off) — you saved ${inr.format(discount)}`];
}

/** Gift wrap on an order: added once, with an optional message for the card. */
export interface GiftWrapChoice {
  price: number;
  message?: string;
}

/** The "Gift wrap" (and "Gift message") order-summary lines, or nothing. */
function giftLines(gift: GiftWrapChoice | null | undefined): string[] {
  if (!gift) return [];
  const lines = [`Gift wrap: ${gift.price > 0 ? inr.format(gift.price) : "FREE"}`];
  const message = gift.message?.trim();
  if (message) lines.push(`Gift message: "${message}"`);
  return lines;
}

/**
 * The price part of an order row. With the coupon on it shows the reduced
 * price — what the shopper is actually paying — plus the code and the regular
 * price for reference, e.g. "₹585 — FESTIVE10 applied (was ₹650)".
 */
function priceText(
  unitPrice: number,
  qty: number,
  unitDiscount: number,
  coupon: Coupon | null | undefined,
): string {
  const unit = unitPrice - unitDiscount;
  const price =
    qty > 1
      ? `${inr.format(unit)} each (${inr.format(unit * qty)})`
      : inr.format(unit);
  if (!coupon || unitDiscount <= 0) return price;
  const was = qty > 1 ? `${inr.format(unitPrice)} each` : inr.format(unitPrice);
  return `${price} — ${coupon.code} applied (was ${was})`;
}

/**
 * Coupon discount on `qty` units at `unitPrice` (0 when ineligible / no
 * coupon). Rounded per unit, so it always matches the reduced price shown on
 * the product page and in the bag.
 */
function itemDiscount(
  coupon: Coupon | null | undefined,
  unitPrice: number,
  eligible: boolean,
  qty = 1,
): number {
  return coupon && eligible ? couponDiscountFor(unitPrice, coupon.percent) * qty : 0;
}

/**
 * Absolute URL for an image that may already be absolute (a Sanity CDN URL) or a
 * site-relative path (a local fallback). WhatsApp needs a full URL to render a
 * photo preview, so relative paths are prefixed with the current origin.
 */
export function toAbsoluteImageUrl(image: string, origin: string): string {
  return /^https?:\/\//.test(image) ? image : `${origin}${image}`;
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
  /** Wrist size for a bracelet; `null` for a sizeless Stone Décor piece. */
  size: BraceletSizeId | null;
  qty: number;
  /** Whether the shopper applied the festive coupon to this item. */
  couponApplied?: boolean;
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
  /** Whether the shopper applied the festive coupon to this design. */
  couponApplied?: boolean;
}

function lineText(line: OrderLine, coupon?: Coupon | null): string {
  // The [code] is the product's tracking id (SKU); it lets an order be matched
  // back to an exact product even if names or prices change later. The name
  // carries the bead size so the order stays readable at a glance — 6mm and 8mm
  // of the same stone are different bracelets to pack.
  const stone = line.product.stone ? ` (${line.product.stone})` : "";
  // Décor pieces have no wrist size, so their row simply omits it.
  const size = line.size ? ` — Size ${line.size}` : "";
  const base = `[${line.product.id}] ${displayName(line.product)}${stone}${size}`;
  const qty = line.qty > 1 ? ` × ${line.qty}` : "";
  const unitDiscount = lineDiscount({ ...line, qty: 1 }, coupon);
  return `${base}${qty} — ${priceText(line.product.price, line.qty, unitDiscount, coupon)}`;
}

/** A human-readable block describing one custom bracelet. */
function customLineText(line: CustomOrderLine, coupon?: Coupon | null): string {
  const stones = line.stoneNames.join(", ");
  const qty = line.qty > 1 ? ` × ${line.qty}` : "";
  const unitDiscount = customLineDiscount({ ...line, qty: 1 }, coupon);
  const rows = [
    `Custom bracelet (${line.beadSize}) — Size ${line.size}${qty} — ${priceText(
      line.unitPrice,
      line.qty,
      unitDiscount,
      coupon,
    )}`,
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
  delivery: DeliverySettings,
  imageUrl?: string,
  coupon?: Coupon | null,
  gift?: GiftWrapChoice | null,
): string {
  const discount = itemDiscount(coupon, product.price, isCouponEligible(product));
  const payable = product.price - discount;
  const fee = deliveryFeeFor(payable, delivery);
  return [
    "Hi Amritara Rituals!",
    "I'd like to order this ritual:",
    `• ${lineText({ product, size, qty: 1, couponApplied: discount > 0 }, coupon)}`,
    ...(imageUrl ? ["", `Photo: ${imageUrl}`] : []),
    "",
    ...couponLines(coupon, discount),
    ...giftLines(gift),
    deliveryLine(fee),
    `Total: ${inr.format(payable + (gift?.price ?? 0) + fee)}`,
    "",
    "Could you help me complete the order?",
  ].join("\n");
}

/** Deep link that opens WhatsApp pre-filled to order one product. */
export function buildProductOrderLink(
  product: Product,
  size: BraceletSizeId,
  delivery: DeliverySettings,
  imageUrl?: string,
  coupon?: Coupon | null,
  gift?: GiftWrapChoice | null,
): string {
  return waLink(buildProductOrderText(product, size, delivery, imageUrl, coupon, gift));
}

/**
 * The pre-filled message body for ordering one range product (any tab beyond
 * Bracelets — décor, pendants, …). Same shape as
 * a bracelet order but sizeless (no wrist size); the code and name
 * identify the item.
 */
export function buildRangeOrderText(
  product: Product,
  delivery: DeliverySettings,
  imageUrl?: string,
  coupon?: Coupon | null,
  gift?: GiftWrapChoice | null,
): string {
  const discount = itemDiscount(coupon, product.price, isCouponEligible(product));
  const payable = product.price - discount;
  const fee = deliveryFeeFor(payable, delivery);
  return [
    "Hi Amritara Rituals!",
    "I'd like to order this piece:",
    `• ${product.name} (${product.id}) — ${priceText(product.price, 1, discount, coupon)}`,
    ...(imageUrl ? ["", `Photo: ${imageUrl}`] : []),
    "",
    ...couponLines(coupon, discount),
    ...giftLines(gift),
    deliveryLine(fee),
    `Total: ${inr.format(payable + (gift?.price ?? 0) + fee)}`,
    "",
    "Could you help me complete the order?",
  ].join("\n");
}

/** Deep link that opens WhatsApp pre-filled to order one range product. */
export function buildRangeOrderLink(
  product: Product,
  delivery: DeliverySettings,
  imageUrl?: string,
  coupon?: Coupon | null,
  gift?: GiftWrapChoice | null,
): string {
  return waLink(buildRangeOrderText(product, delivery, imageUrl, coupon, gift));
}

/** Deep link to pre-order a sold-out range product (intent-to-buy, no total). */
export function buildRangePreOrderLink(
  product: Product,
  imageUrl?: string,
): string {
  const text = [
    "Hi Amritara Rituals!",
    "This piece is sold out — I'd like to pre-order it:",
    `• ${product.name} (${product.id})`,
    ...(imageUrl ? ["", `Photo: ${imageUrl}`] : []),
    "",
    "Could you let me know when it's back and reserve one for me?",
  ].join("\n");
  return waLink(text);
}

/**
 * The pre-filled message body for PRE-ORDERING a sold-out product. Framed as
 * intent-to-buy rather than a live order: no delivery/total (those are settled
 * when it's back in stock), just the item and a request to reserve one. Helps
 * the owner gauge demand and restock accordingly.
 */
export function buildPreOrderText(
  product: Product,
  size: BraceletSizeId,
  imageUrl?: string,
): string {
  return [
    "Hi Amritara Rituals!",
    "This ritual is sold out — I'd like to pre-order it:",
    `• ${lineText({ product, size, qty: 1 })}`,
    ...(imageUrl ? ["", `Photo: ${imageUrl}`] : []),
    "",
    "Could you let me know when it's back and reserve one for me?",
  ].join("\n");
}

/** Deep link that opens WhatsApp pre-filled to pre-order a sold-out product. */
export function buildPreOrderLink(
  product: Product,
  size: BraceletSizeId,
  imageUrl?: string,
): string {
  return waLink(buildPreOrderText(product, size, imageUrl));
}

/** The pre-filled message body for ordering one custom bracelet. */
export function buildCustomOrderText(
  line: CustomOrderLine,
  delivery: DeliverySettings,
  coupon?: Coupon | null,
  gift?: GiftWrapChoice | null,
): string {
  const subtotal = line.unitPrice * line.qty;
  // Custom bracelets are always coupon-eligible — there's no product to opt out.
  const discount = itemDiscount(coupon, line.unitPrice, true, line.qty);
  const payable = subtotal - discount;
  const fee = deliveryFeeFor(payable, delivery);
  return [
    "Hi Amritara Rituals!",
    "I'd like to order this custom bracelet:",
    `• ${customLineText({ ...line, couponApplied: discount > 0 }, coupon)}`,
    "",
    ...couponLines(coupon, discount),
    ...giftLines(gift),
    deliveryLine(fee),
    `Total: ${inr.format(payable + (gift?.price ?? 0) + fee)}`,
    "",
    "Could you help me complete the order?",
  ].join("\n");
}

/** Deep link that opens WhatsApp pre-filled to order one custom bracelet. */
export function buildCustomOrderLink(
  line: CustomOrderLine,
  delivery: DeliverySettings,
  coupon?: Coupon | null,
  gift?: GiftWrapChoice | null,
): string {
  return waLink(buildCustomOrderText(line, delivery, coupon, gift));
}

/** Coupon discount on one bag line (0 without the coupon, or if the product is excluded). */
export function lineDiscount(line: OrderLine, coupon?: Coupon | null): number {
  return line.couponApplied
    ? itemDiscount(coupon, line.product.price, isCouponEligible(line.product), line.qty)
    : 0;
}

/** Coupon discount on one custom bracelet line (0 without the coupon). */
export function customLineDiscount(
  line: Pick<CustomOrderLine, "unitPrice" | "qty" | "couponApplied">,
  coupon?: Coupon | null,
): number {
  return line.couponApplied ? itemDiscount(coupon, line.unitPrice, true, line.qty) : 0;
}

/**
 * Subtotal, coupon discount and amount payable (before delivery) for a bag. The
 * coupon is one code for the whole order: lines are flagged `couponApplied`
 * when it's on, and products flagged `excludeFromCoupon` are never discounted.
 * Shared by the bag UI and the order message so the two can never disagree.
 */
export function selectionTotals(
  lines: OrderLine[],
  customLines: Pick<CustomOrderLine, "unitPrice" | "qty" | "couponApplied">[],
  coupon?: Coupon | null,
): { subtotal: number; discount: number; payable: number } {
  let subtotal = 0;
  let discount = 0;
  for (const l of lines) {
    subtotal += l.product.price * l.qty;
    discount += lineDiscount(l, coupon);
  }
  for (const c of customLines) {
    subtotal += c.unitPrice * c.qty;
    discount += customLineDiscount(c, coupon);
  }
  return { subtotal, discount, payable: subtotal - discount };
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
  customLines: CustomOrderLine[],
  delivery: DeliverySettings,
  origin?: string,
  coupon?: Coupon | null,
  /** Set when the shopper ticked gift wrap: its price is added once. */
  giftWrap?: GiftWrapChoice | null,
): string {
  const { discount, payable } = selectionTotals(
    lines,
    customLines,
    coupon,
  );
  const fee = deliveryFeeFor(payable, delivery);

  // Continuous numbering across both kinds of line.
  let n = 0;
  const productRows = lines.map((l) => {
    const row = `${++n}. ${lineText(l, coupon)}`;
    return origin
      ? `${row}\n   Photo: ${toAbsoluteImageUrl(l.product.image, origin)}`
      : row;
  });
  const customRows = customLines.map(
    (c) => `${++n}. ${customLineText(c, coupon)}`,
  );

  const text = [
    "Hi Amritara Rituals!",
    "I'd like to order these rituals:",
    ...productRows,
    ...customRows,
    "",
    // Item prices above are already the coupon prices, so the subtotal is too.
    `Subtotal: ${inr.format(payable)}`,
    ...couponLines(coupon, discount),
    ...giftLines(giftWrap),
    deliveryLine(fee),
    `Total: ${inr.format(payable + (giftWrap?.price ?? 0) + fee)}`,
    "Could you help me complete the order?",
  ].join("\n");
  return waLink(text);
}
