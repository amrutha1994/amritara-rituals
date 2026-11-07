/**
 * FAQ page content type. Questions are authored in Sanity (`faq` documents)
 * and mapped to this shape in `src/sanity/queries.ts`.
 */
export interface Faq {
  id: string;
  question: string;
  /** Plain text; line breaks are kept, and "- " lines render as bullets. */
  answer: string;
}
