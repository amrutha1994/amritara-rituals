import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

/**
 * A natural-stone décor object — the "Stone Décor" line (car/wall hangings and
 * figurines like owls, turtles and elephants, all shown together in one flat
 * section — no sub-categories). Kept as its own document type, separate from
 * bracelets, because it shops differently: no wrist size, but it does have
 * physical dimensions and a placement. It reuses the same commerce fields as a
 * bracelet (price, offer, stock, images, intentions) so it slots into the
 * existing cards and order flow.
 *
 * This whole line is hidden on the storefront until the `NEXT_PUBLIC_DECOR_ENABLED`
 * flag is turned on — but authors can add and prepare products here at any time.
 */
export const decorProductType = defineType({
  name: "decorProduct",
  title: "Stone Décor Product",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "decorProduct" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: 'e.g. "Seven Chakra Car Hanging" or "Amethyst Owl".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "code",
      title: "SKU / tracking code",
      type: "string",
      description:
        'Stable code shown in WhatsApp orders, e.g. "AMD01". Never reuse a retired code.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: "Drives the product page URL (/decor/…). Do not change once shared.",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "stone",
      title: "Stone / material",
      type: "string",
      description: 'The stone(s) it\'s made of, e.g. "Amethyst" or "Seven Chakra".',
    }),
    defineField({
      name: "suggestedPrice",
      title: "Price (₹, ex-shipping)",
      type: "number",
      description:
        "The regular price, before any offer. Shipping is added as a separate line at order time.",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "offerPercent",
      title: "Offer (% off)",
      type: "number",
      description:
        "Discount percentage on the price above. Leave at 0 for no offer. Rounded to the nearest ₹10.",
      initialValue: 0,
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "remainingQuantity",
      title: "Remaining quantity (stock)",
      type: "number",
      description:
        "How many are left. Leave blank if you're not tracking stock (always orderable). Set to 0 to show as Sold out.",
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: "show",
      title: "Show product",
      type: "boolean",
      description:
        "Whether this product should be visible in the store. Turn off to hide the product without deleting it.",
      initialValue: true,
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions / size",
      type: "string",
      description:
        'Physical size shoppers want to know, e.g. "Height 7 cm" or "Hanging length 30 cm".',
    }),
    defineField({
      name: "placement",
      title: "Placement",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Car", value: "car" },
          { title: "Wall", value: "wall" },
          { title: "Desk / shelf", value: "desk" },
          { title: "Altar / sacred space", value: "altar" },
        ],
      },
      description: "Where this object is meant to live. Optional.",
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
        "The intentions this object serves — powers the Stone Décor filter and ties it to the same 'shop by intention' language as bracelets.",
    }),
    defineField({
      name: "images",
      title: "Gallery images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description:
        "First image is the primary/card image. If left empty, a placeholder is shown until you add photos.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "stone", media: "images.0" },
  },
});
