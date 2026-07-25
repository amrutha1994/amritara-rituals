import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

/**
 * A ready-made bracelet in the catalogue. `code` is the stable SKU that appears
 * in WhatsApp orders (e.g. "AMT01"); `slug` drives /collections/[slug]. The
 * listed price shown on the storefront is exactly `suggestedPrice`; shipping is
 * added as a separate line at order time.
 *
 * Display order is manual: the hidden `orderRank` field (see the "Products
 * (ordered)" list in the Studio) is set by drag-and-drop and drives the
 * storefront sort. New products are appended to the end automatically.
 */
export const productType = defineType({
  name: "product",
  title: "Product (Bracelet)",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    // Hidden field that stores the drag-and-drop position; kept first so it
    // never clutters the form.
    orderRankField({ type: "product" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "code",
      title: "SKU / tracking code",
      type: "string",
      description:
        'Stable code shown in WhatsApp orders, e.g. "AMT01". Never reuse a retired code.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: "Drives the product page URL. Do not change once shared.",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "stone",
      title: "Primary gemstone",
      type: "string",
      description: 'Display name of the stone(s), e.g. "Jade" or "Lava · Red Tiger Eye".',
    }),
    defineField({
      name: "suggestedPrice",
      title: "Price (₹, ex-shipping)",
      type: "number",
      description:
        "The regular price of this bracelet, before any offer. Shipping is added as a separate line at order time.",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "offerPercent",
      title: "Offer (% off)",
      type: "number",
      description:
        "Discount percentage on the price above. Leave at 0 for no offer. Example: 5 turns a ₹100 bracelet into ₹95 across the storefront and orders.",
      initialValue: 0,
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "remainingQuantity",
      title: "Remaining quantity (stock)",
      type: "number",
      description:
        "How many of this bracelet are left. Leave blank if you're not tracking stock for it (always orderable). Set to 0 to show it as Sold out.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "shortIntention",
      title: "Short intention",
      type: "string",
      description: "One-line purpose shown on the card.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "benefits",
      title: "Benefits",
      type: "array",
      of: [{ type: "string" }],
      description: "Short metaphysical / wellbeing benefits, one per line.",
    }),
    defineField({
      name: "intentions",
      title: "Intentions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intention" }] }],
      description:
        "The intentions this bracelet serves — powers the collection filter. Seeded from its stone(s), but can be curated here.",
    }),
    defineField({
      name: "images",
      title: "Gallery images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "First image is the primary/card image.",
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "code", media: "images.0" },
  },
});
