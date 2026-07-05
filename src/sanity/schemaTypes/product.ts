import { defineField, defineType } from "sanity";

/**
 * A ready-made bracelet in the catalogue. `code` is the stable SKU that appears
 * in WhatsApp orders (e.g. "AMT01"); `slug` drives /collections/[slug]. The
 * listed price is derived in code as `suggestedPrice − SHIPPING_FEE`.
 */
export const productType = defineType({
  name: "product",
  title: "Product (Bracelet)",
  type: "document",
  fields: [
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
      title: "Suggested price (₹, incl. shipping)",
      type: "number",
      description:
        "Final price including shipping. The listed price is this minus the shipping fee.",
      validation: (r) => r.required().min(0),
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
