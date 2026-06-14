import {
  WHATSAPP_DISPLAY,
  buildContactLink,
  buildCustomEnquiryLink,
} from "@/lib/whatsapp";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.74c0 4.48-3.65 8.12-8.13 8.12a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.07 8.07 0 0 1-1.24-4.31c0-4.48 3.64-8.13 8.12-8.13Zm4.7 10.2c-.26-.13-1.52-.75-1.76-.83-.24-.09-.41-.13-.59.13-.17.26-.67.83-.82 1-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.07-1.28-.77-.68-1.28-1.53-1.43-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.06-.13-.59-1.42-.81-1.95-.21-.51-.43-.44-.59-.45l-.5-.01c-.17 0-.46.06-.7.33-.24.26-.92.9-.92 2.19s.94 2.54 1.07 2.72c.13.17 1.85 2.83 4.49 3.96.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.07 1.52-.62 1.74-1.22.21-.6.21-1.11.15-1.22-.06-.11-.24-.17-.5-.3Z" />
    </svg>
  );
}

const PROMISES = [
  {
    title: "A real conversation",
    body: "You message Amrutha directly — no bots, no forms lost in an inbox.",
  },
  {
    title: "Customised to you",
    body: "Tell us the intention you're reaching for and we'll match the stones to it.",
  },
  {
    title: "Order on WhatsApp",
    body: "Confirm sizing, payment and shipping in one simple chat.",
  },
] as const;

export default function ContactSection() {
  return (
    <section id="contact" className="bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-antique">
            Let&apos;s talk
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Have a question? Message us
          </h2>
          <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
            Every bracelet is made by hand and customised around you, so we love
            a chat before you order. Reach us on WhatsApp and we&apos;ll help you
            choose the right stones, size and ritual.
          </p>
        </div>

        {/* WhatsApp card */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_24px_60px_-30px_rgba(144,86,141,0.4)]">
          <div className="flex flex-col gap-8 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                WhatsApp Business
              </span>
              <p className="mt-4 font-display text-2xl text-primary-deep">
                {WHATSAPP_DISPLAY}
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground/70">
                Typically replies within a few hours · Mon–Sat, 10am–7pm IST
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[260px]">
              <a
                href={buildContactLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-center text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <a
                href={buildCustomEnquiryLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-7 py-3 text-center text-sm font-medium text-primary-deep transition-colors hover:border-primary"
              >
                Ask about a custom bracelet
              </a>
            </div>
          </div>

          {/* Promises strip */}
          <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-3">
            {PROMISES.map((item) => (
              <div key={item.title} className="bg-surface px-6 py-6">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
