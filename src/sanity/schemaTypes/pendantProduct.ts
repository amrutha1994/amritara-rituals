import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

/**
 * A natural-stone pendant on a black thread — the "Pendants" line. Every
 * pendant comes on the same black thread at one fixed length, so there's no
 * size or thread choice: it orders like a décor piece (sizeless), and shares the
 * bracelet commerce fields (price, offer, coupon, stock, images, intentions) so
 * it slots into the existing cards, bag and order flow.
 *
 * Pendants pair with bracelets of the same stone ("Complete the ritual") and
 * appear in the Stone Finder, matched on the `stone` name — so write it exactly
 * as the stone is named elsewhere, e.g. "Green Aventurine".
 *
 * The whole line is hidden on the storefront until `NEXT_PUBLIC_PENDANTS_ENABLED`
 * is turned on — but pendants can be added and prepared here at any time.
 */
export const pendantProductType = defineType({
  name: "pendantProduct",
  title: "Pendant",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "pendantProduct" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: 'e.g. "Amethyst Thread Pendant".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "code",
      title: "SKU / tracking code",
      type: "string",
      description:
        'Stable code shown in WhatsApp orders, e.g. "AMTP01". Never reuse a retired code.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: "Drives the product page URL (/pendants/…). Do not change once shared.",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "stone",
      title: "Stone",
      type: "string",
      description:
        'The pendant\'s stone, e.g. "Green Aventurine". Spell it the way the matching bracelet and Stone Finder stone are named, so they link up.',
      validation: (r) => r.required(),
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
      name: "excludeFromCoupon",
      title: "Exclude from coupon",
      type: "boolean",
      description:
        "Turn on to keep the festive coupon (set in Settings) from discounting this item. Off by default, so every item gets the coupon.",
      initialValue: false,
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
      name: "isNew",
      title: "New arrival",
      type: "boolean",
      description:
        'Marks this pendant as a recent addition — shows a "New" badge on its card and product page. While any pendant is marked new, the Pendants tab shows a NEW badge and the homepage shows the pendants launch strip.',
      initialValue: false,
    }),
    defineField({
      name: "dimensions",
      title: "Pendant size",
      type: "string",
      description:
        'Optional — the stone\'s size, e.g. "Pendant approx. 3 cm". The thread is the same on every pendant, so it\'s described on the page automatically.',
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
      description:
        "Line breaks show on the site exactly as typed — press Enter for a new line, or leave an empty line between paragraphs.",
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
        "The intentions this pendant serves — powers the Pendants filter, using the same 'shop by intention' language as bracelets.",
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
