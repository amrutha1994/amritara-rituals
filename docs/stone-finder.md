# Stone Finder — feature spec

_Guided "choose a stone by how you feel" experience that funnels into the
existing custom-bracelet builder._

## Why

Two customer mindsets, two front doors, one engine:

- **Decisive / stone-first** — "I want moss agate + pyrite." → **Customiser** (`/customise`).
- **Seeking / intention-first** — "I feel anxious and stuck." → **Stone Finder** (`/stone-finder`).

The Finder is the spiritual hook and a top-of-funnel discovery surface. It does
**not** own checkout — it always hands off into the Customiser, which owns the
single configuration + WhatsApp order path. Separate doors, same room.

## User flow

1. **Entry** — "Find your stone" nav link + intro page.
2. **Step 1 — feelings.** Pick up to 3 from a fixed list of intentions
   (e.g. "I feel anxious or overwhelmed").
3. **Step 2 — bead size.** 6mm (dainty) or 8mm (bold) — required because stones
   and pricing are bead-size specific.
4. **Reveal.** A blend of up to 3 stones, scored against the chosen feelings,
   with names, swatches, "inviting in …" copy, and a price preview.
5. **Hand-off.** "Make this my bracelet" → `/customise?size=<bead>&stones=<ids>`
   opens the Customiser pre-filled. Customer confirms wrist size + quantity and
   orders. "Start over" resets the quiz.

## Architecture

| Piece | File | Notes |
|---|---|---|
| Intention taxonomy | `src/data/intentions.ts` | 10 feelings: id, `feeling`, `invites`. |
| Stone tagging | `src/data/stones.ts` | each stone has `intentions: IntentionId[]`. |
| Recommender | `recommendStones()` in `src/data/stones.ts` | scores by overlap; focused matches win ties; tops up so it never dead-ends. |
| Quiz UI | `src/components/stone-finder.tsx` | client component, quiz → result phases. |
| Page | `src/app/stone-finder/page.tsx` | intro + `<StoneFinder />`. |
| Hand-off (read) | `src/app/customise/page.tsx` | parses `?size=&stones=`, validates ids belong to the bead size, passes as props. |
| Pre-fill (apply) | `src/components/bracelet-customiser.tsx` | `initialBeadSize` / `initialStoneIds` props seed state. |
| Entry point | `src/components/site-header.tsx` | "Find your stone" nav link. |

The hand-off is a plain URL (`?size=8mm&stones=jade-8mm,pyrite-8mm`) — shareable,
bookmarkable, and validated server-side so a bad link still opens a clean
builder. Stone ids already encode bead size, so no ambiguity.

## Decisions

- **Blend, not single stone.** Recommends up to 3 — more personal, higher value,
  and shows off the combination feature. Capped at `MAX_STONES` (4).
- **Bead size in the quiz**, not deferred — keeps recommendation + pricing
  correct and the hand-off unambiguous.
- **No new checkout logic** — the Finder is stateless discovery; the Customiser
  remains the single source of truth for cart + WhatsApp orders.

## Future ideas (not built)

- Save / share a result link.
- A homepage hero CTA into the Finder (currently only the nav link).
- Per-result ritual copy (cleansing, affirmation) pulled from product `benefits`.
- Analytics on which feelings convert, to tune the intention→stone tags.
- Expand intentions or weight tags (primary vs secondary) if matches feel blunt.
