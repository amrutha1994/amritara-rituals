import { defineField, defineType } from "sanity";

/**
 * A gemstone offered in a single bead size. Powers the Stone Finder and the
 * bracelet customiser. `slug` is the stable id used in URLs and the cart
 * (e.g. "jade-8mm") — keep it fixed once set.
 */
export const stoneType = defineType({
  name: "stone",
  title: "Stone",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "beadSize",
      title: "Bead size",
      type: "string",
      options: {
        list: [
          { title: "6mm", value: "6mm" },
          { title: "8mm", value: "8mm" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Id (slug)",
      type: "slug",
      description:
        'Stable id used in URLs and the cart, e.g. "jade-8mm". Do not change once set.',
      options: {
        source: (doc) => `${doc.name ?? ""} ${doc.beadSize ?? ""}`,
        maxLength: 60,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "power",
      title: "Power",
      type: "string",
      description: 'Short property, e.g. "Luck & harmony".',
    }),
    defineField({
      name: "price",
      title: "Retail price (₹, ex-shipping)",
      type: "number",
      description:
        "Retail price of a single-stone bracelet of this stone. Keep in sync with its ready-made bracelet where one exists.",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "intentions",
      title: "Intentions",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intention" }] }],
      description: "The intentions this stone serves (drives finder matches).",
    }),
    defineField({
      name: "image",
      title: "Swatch image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "product",
      title: "Bracelet (Buy now target)",
      type: "reference",
      to: [{ type: "product" }],
      description:
        "The ready-made bracelet this stone links to from the Stone Finder.",
    }),
  ],
  orderings: [
    {
      title: "Bead size, then name",
      name: "beadThenName",
      by: [
        { field: "beadSize", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "beadSize", media: "image" },
  },
});
