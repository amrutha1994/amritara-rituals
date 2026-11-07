import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

/**
 * One question on the /faq page, shown as a single list in the order set by
 * drag-and-drop in the "FAQs (ordered)" list. Unpublished drafts never show on
 * the site, so a question can be prepared — or held back until its answer is
 * final — without going live.
 */
export const faqType = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "faq" }),
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 5,
      description:
        'Line breaks show on the site exactly as typed. Start a line with "- " to show it as a bullet point.',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "answer" },
  },
});
