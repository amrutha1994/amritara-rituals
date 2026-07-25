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
