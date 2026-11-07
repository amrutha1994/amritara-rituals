import type { Metadata } from "next";

import type { Faq } from "@/data/faqs";
import FaqList from "@/components/faq-list";
import { buildContactLink } from "@/lib/whatsapp";
import { getFaqs } from "@/sanity/queries";

const title = "FAQs";
const description =
  "Answers about our natural stones and crystals — how to cleanse and care for them, free bracelet restringing, pendants and ordering.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: { title, description, url: "/faq" },
};

/** Schema.org FAQPage data, so search engines and assistants can read the Q&A. */
function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <main className="flex flex-1 flex-col">
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        />
      )}
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              Good to know
            </p>
            <h1 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Frequently asked questions
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">
              Everything about our natural stones — choosing them, cleansing
              them and caring for them for years to come.
            </p>
          </div>

          {faqs.length > 0 && <FaqList faqs={faqs} className="mt-14" />}

          <div className="mt-16 rounded-3xl border border-gold/30 bg-surface p-6 text-center sm:p-8">
            <h2 className="font-display text-xl font-medium text-foreground sm:text-2xl">
              Still have a question?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
              Message us on WhatsApp — you&apos;ll hear back from a real person,
              not a bot.
            </p>
            <a
              href={buildContactLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
