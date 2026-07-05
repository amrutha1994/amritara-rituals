/**
 * Intentions are the emotional / spiritual "feelings" a customer can start from
 * in the Stone Finder. Each stone is tagged with the intentions it serves (see
 * `stones.ts`), and the finder recommends a blend from the intentions a person
 * resonates with. Keep this list small and human — these are feelings, not a
 * mineral catalogue.
 */
export interface Intention {
  /** Stable id, referenced from each stone's `intentions`. */
  id: string;
  /** Short label shown as the intention choice, e.g. "Calm & Peace". */
  label: string;
  /** First-person feeling — a gentle subtitle under the label. */
  feeling: string;
  /** What they're reaching for — the positive flip side, used in the result copy. */
  invites: string;
}

export const INTENTIONS: Intention[] = [
  {
    id: "calm",
    label: "Calm & Peace",
    feeling: "I feel anxious or overwhelmed",
    invites: "calm and a quiet mind",
  },
  {
    id: "protection",
    label: "Protection",
    feeling: "I feel drained or unprotected",
    invites: "protection and a shielded energy",
  },
  {
    id: "grounding",
    label: "Grounding",
    feeling: "I feel scattered or unsteady",
    invites: "grounding and steady footing",
  },
  {
    id: "confidence",
    label: "Confidence",
    feeling: "I'm doubting myself",
    invites: "confidence and courage",
  },
  {
    id: "motivation",
    label: "Motivation & Drive",
    feeling: "I feel stuck or unmotivated",
    invites: "drive and fresh energy",
  },
  {
    id: "abundance",
    label: "Abundance & Luck",
    feeling: "I'm calling in abundance",
    invites: "prosperity and good fortune",
  },
  {
    id: "clarity",
    label: "Clarity & Intuition",
    feeling: "I'm seeking clarity or intuition",
    invites: "insight and inner truth",
  },
  {
    id: "harmony",
    label: "Love & Harmony",
    feeling: "I want more peace and harmony",
    invites: "harmony and an open heart",
  },
  {
    id: "growth",
    label: "Growth & New Beginnings",
    feeling: "I'm starting something new",
    invites: "growth and new beginnings",
  },
  {
    id: "healing",
    label: "Emotional Healing",
    feeling: "I need emotional healing",
    invites: "healing and gentle renewal",
  },
];

export type IntentionId = (typeof INTENTIONS)[number]["id"];

/** Look up an intention by id. */
export function getIntention(id: string): Intention | undefined {
  return INTENTIONS.find((i) => i.id === id);
}
