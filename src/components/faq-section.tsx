import FaqList from "@/components/faq-list";
import { getFaqs } from "@/sanity/queries";

/**
 * Homepage FAQ section (anchor `#faq`), just above Contact so questions are
 * answered right before a shopper decides to message. Shows every published
 * FAQ in Studio order; renders nothing until there are some.
 */
export default async function FaqSection() {
  const faqs = await getFaqs();
  if (faqs.length === 0) return null;

  return (
    <>
      <section id="faq" className="bg-background px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
              Good to know
            </p>
            <h2 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <FaqList faqs={faqs} className="mt-10" />
        </div>
      </section>
      {/* Divider before Contact — only when the section shows. */}
      <div className="gold-rule" />
    </>
  );
}
