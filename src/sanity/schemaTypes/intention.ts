import { defineField, defineType } from "sanity";

/**
 * An emotional / spiritual intention a customer can start from in the Stone
 * Finder. Stones reference these. `key` is the stable id (e.g. "calm") that the
 * app matches on — keep it fixed once set.
 */
export const intentionType = defineType({
  name: "intention",
  title: "Intention",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'Short choice shown to customers, e.g. "Calm & Peace".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "key",
      title: "Key (stable id)",
      type: "slug",
      description:
        'Stable id referenced by stones, e.g. "calm". Do not change once set.',
      options: { source: "label", maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "feeling",
      title: "Feeling (subtitle)",
      type: "string",
      description: 'First-person feeling, e.g. "I feel anxious or overwhelmed".',
    }),
    defineField({
      name: "invites",
      title: "Invites",
      type: "string",
      description:
        'What they are reaching for — used in result copy, e.g. "calm and a quiet mind".',
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "label", subtitle: "key.current" },
  },
});
