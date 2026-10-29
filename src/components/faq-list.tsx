import type { Faq } from "@/data/faqs";

/**
 * An answer as authored in Sanity: line breaks are kept, and a run of lines
 * starting with "- " becomes a bulleted list, so care steps read as steps.
 */
function Answer({ text }: { text: string }) {
  const blocks: ({ kind: "text"; text: string } | { kind: "list"; items: string[] })[] = [];
  for (const line of text.split("\n")) {
    const bullet = line.match(/^\s*[-•]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.kind === "list") last.items.push(bullet[1]);
      else blocks.push({ kind: "list", items: [bullet[1]] });
    } else if (last?.kind === "text") {
      last.text += `\n${line}`;
    } else {
      blocks.push({ kind: "text", text: line });
    }
  }

  return (
    <div className="flex flex-col gap-3 text-base leading-8 text-muted">
      {blocks.map((block, i) =>
        block.kind === "list" ? (
          <ul key={i} className="flex flex-col gap-1.5">
            {block.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-antique"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          block.text.trim() && (
            <p key={i} className="whitespace-pre-line">
              {block.text.trim()}
            </p>
          )
        ),
      )}
    </div>
  );
}

/**
 * The FAQs as one list of tap-to-open questions, in the order set in the
 * Studio. Native <details>/<summary>, so it needs no client JS. Shared by the
 * homepage FAQ section and the /faq page.
 */
export default function FaqList({
  faqs,
  className = "",
}: {
  faqs: Faq[];
  className?: string;
}) {
  return (
    <div
      className={`divide-y divide-border rounded-3xl border border-border bg-surface ${className}`}
    >
      {faqs.map((faq) => (
        <details key={faq.id} className="group px-5 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-title text-base text-foreground transition-colors hover:text-primary sm:text-lg [&::-webkit-details-marker]:hidden">
            {faq.question}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="shrink-0 text-gold-antique transition-transform group-open:rotate-180"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="pb-6">
            <Answer text={faq.answer} />
          </div>
        </details>
      ))}
    </div>
  );
}
