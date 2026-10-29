import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

import { RANGE_ICONS } from "../../data/ranges";

/**
 * A Collections tab (product range) — e.g. "For your space" or "Pendants".
 * Create one, add Shop products to it, switch "Show on site" on, and it appears
 * as a new tab with its own pages — no code change. Tabs sit after Bracelets in
 * the order set by drag-and-drop in "Collection tabs (ordered)".
 *
 * Every range is sizeless: shoppers pick a piece and order it as-is. A range
 * that needs choices at checkout (lengths, colours) still needs code.
 */
export const productRangeType = defineType({
  name: "productRange",
  title: "Collection tab",
  type: "document",
  orderings: [orderRankOrdering],
  groups: [
    { name: "tab", title: "Tab", default: true },
    { name: "pairing", title: "Bracelet pairing" },
    { name: "spotlight", title: "Homepage spotlight" },
  ],
  fields: [
    orderRankField({ type: "productRange" }),
    defineField({
      name: "title",
      title: "Tab name",
      type: "string",
      description: 'Shown on the tab and as the page heading, e.g. "Thread Pendants".',
      group: "tab",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL name",
      type: "slug",
      description:
        "Used in links: /shop/<url name>/… and /#<url name>. Do not change once shared.",
      options: { source: "title", maxLength: 40 },
      group: "tab",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "show",
      title: "Show on site",
      type: "boolean",
      description:
        "Turn on to launch this tab. It appears once it's on and has at least one published product.",
      initialValue: false,
      group: "tab",
    }),
    defineField({
      name: "icon",
      title: "Tab icon",
      type: "string",
      options: { list: [...RANGE_ICONS], layout: "radio", direction: "horizontal" },
      initialValue: "gem",
      group: "tab",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "itemName",
      title: "One item is called…",
      type: "string",
      description:
        'Singular, lower case — used in sentences like "Also as a pendant". e.g. "pendant", "piece".',
      initialValue: "piece",
      group: "tab",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subcopy",
      title: "Line under the tab",
      type: "string",
      description: "One sentence shown under the tabs when this one is selected.",
      group: "tab",
    }),
    defineField({
      name: "intro",
      title: "Page intro",
      type: "text",
      rows: 3,
      description: "Paragraph at the top of this range's own page (/shop/<url name>).",
      group: "tab",
    }),
    defineField({
      name: "productNote",
      title: "Note on every product page",
      type: "string",
      description:
        'Optional detail that applies to every item, shown under the price, e.g. "On a black thread · one fixed length, ready to wear".',
      group: "tab",
    }),
    defineField({
      name: "pairWithBracelets",
      title: "Pair with bracelets of the same stone",
      type: "boolean",
      description:
        'Shows matching items as "Complete the ritual" on bracelet pages (and matching bracelets on these product pages), and links them from the Stone Finder. Matches on each product\'s Stone name.',
      initialValue: false,
      group: "pairing",
    }),
    defineField({
      name: "pairingLine",
      title: "Line on bracelet pages",
      type: "string",
      description:
        'Under "Complete the ritual" on a bracelet page, e.g. "Wear the same stone close to your heart."',
      group: "pairing",
      hidden: ({ document }) => !document?.pairWithBracelets,
    }),
    defineField({
      name: "spotlightEnabled",
      title: "Show homepage spotlight",
      type: "boolean",
      description:
        "A banner above the collection promoting this tab — great for a launch. Turn it off when the launch is over.",
      initialValue: false,
      group: "spotlight",
    }),
    defineField({
      name: "spotlightHeading",
      title: "Spotlight heading",
      type: "string",
      group: "spotlight",
      hidden: ({ document }) => !document?.spotlightEnabled,
    }),
    defineField({
      name: "spotlightText",
      title: "Spotlight text",
      type: "text",
      rows: 2,
      group: "spotlight",
      hidden: ({ document }) => !document?.spotlightEnabled,
    }),
  ],
  preview: {
    select: { title: "title", show: "show" },
    prepare({ title, show }) {
      return { title, subtitle: show ? "Live on site" : "Hidden" };
    },
  },
});
