import { defineField, defineType } from "sanity";

/**
 * Storefront settings — a single (singleton) document holding shop-wide values
 * that aren't tied to one product. Right now that's the delivery rule:
 * bracelets/orders under `freeDeliveryThreshold` pay `deliveryCharge`; at or
 * above the threshold, delivery is free. Both are editable here so pricing can
 * change without a code deploy. The Studio pins this to a single "Settings"
 * entry (see sanity.config.ts) so there's only ever one.
 */
export const settingsType = defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  fieldsets: [
    {
      name: "coupon",
      title: "Festive coupon",
      description:
        "A code shoppers enter in their bag for an instant discount. Applies to all products by default; exclude individual products from their own page.",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "deliveryCharge",
      title: "Delivery charge (₹)",
      type: "number",
      description:
        "Flat delivery fee added to an order whose subtotal is below the free-delivery threshold.",
      initialValue: 50,
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "freeDeliveryThreshold",
      title: "Free delivery from (₹)",
      type: "number",
      description:
        "Orders with a subtotal at or above this amount get free delivery; below it, the delivery charge applies.",
      initialValue: 700,
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "announcementEnabled",
      title: "Show announcement banner",
      type: "boolean",
      description:
        "Turn the site-wide banner strip at the very top of every page on or off.",
      initialValue: false,
    }),
    defineField({
      name: "announcementText",
      title: "Announcement banner text",
      type: "string",
      description:
        'The message shown in the banner, e.g. "Launch month offer — 5–10% off". Only appears when the banner is switched on above.',
    }),
    // ── Festive coupon ──────────────────────────────────────────────────────
    // One shop-wide code a shopper types into their bag for an instant % off.
    // It applies to every bracelet, décor piece and custom bracelet except
    // products flagged "Exclude from coupon" on their own page.
    defineField({
      name: "couponEnabled",
      title: "Coupon active",
      type: "boolean",
      description:
        "Turn the coupon on or off. While off, the code is rejected in the bag even if someone types it.",
      initialValue: false,
      fieldset: "coupon",
    }),
    defineField({
      name: "couponCode",
      title: "Coupon code",
      type: "string",
      description:
        'What shoppers type in their bag, e.g. "DIWALI10". Not case-sensitive. Mention it in the announcement banner so people know about it.',
      fieldset: "coupon",
      validation: (r) =>
        r.custom((code, ctx) => {
          const enabled = (ctx.document as { couponEnabled?: boolean } | undefined)
            ?.couponEnabled;
          if (enabled && !code?.trim()) return "Add a code while the coupon is active.";
          if (code && /\s/.test(code.trim())) return "Codes can't contain spaces.";
          return true;
        }),
    }),
    defineField({
      name: "couponPercent",
      title: "Coupon discount (% off)",
      type: "number",
      description:
        "Instant discount on eligible items in the bag. Applied on top of any per-product offer.",
      initialValue: 10,
      fieldset: "coupon",
      validation: (r) => r.min(1).max(90),
    }),
  ],
  preview: {
    select: { charge: "deliveryCharge", threshold: "freeDeliveryThreshold" },
    prepare({ charge, threshold }) {
      return {
        title: "Delivery & storefront settings",
        subtitle: `₹${charge ?? 0} delivery · free from ₹${threshold ?? 0}`,
      };
    },
  },
});
