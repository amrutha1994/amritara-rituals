/**
 * Intentions are the emotional / spiritual "feelings" a customer can start from
 * in the Stone Finder. Each stone is tagged with the intentions it serves (see
 * `stones.ts`), and the finder recommends stones from the intention a person
 * resonates with.
 *
 * The content now lives in Sanity — see `src/sanity/queries.ts` for the fetch +
 * mapping. This module keeps the shared type and pure helpers.
 */
export interface Intention {
  /** Stable id (Sanity `key`), referenced from each stone's `intentions`. */
  id: string;
  /** Short label shown as the intention choice, e.g. "Calm & Peace". */
  label: string;
  /** First-person feeling — a gentle subtitle under the label. */
  feeling: string;
  /** What they're reaching for — the positive flip side, used in result copy. */
  invites: string;
}

/** Intention ids are dynamic (authored in Sanity), so this is just a string. */
export type IntentionId = string;

/** Look up an intention by id within a fetched list. */
export function getIntention(
  intentions: Intention[],
  id: string,
): Intention | undefined {
  return intentions.find((i) => i.id === id);
}
