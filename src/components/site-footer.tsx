import Link from "next/link";

const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "#collections" },
  { label: "Our Story", href: "#story" },
  { label: "Contact", href: "#contact" },
] as const;

const SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "Pinterest", href: "#" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <p className="font-display text-2xl tracking-wide text-primary-deep">
              Amritara Rituals
            </p>
            <p className="mt-2 text-sm italic text-muted">
              Align your energy and soul
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/70">
              Handcrafted gemstone bracelets, made as wearable rituals to help
              you return to yourself.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {FOOTER_NAV.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/75 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Connect
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SOCIAL.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/75 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs uppercase tracking-[0.2em] text-muted">
          © {new Date().getFullYear()} Amritara Rituals — All rights reserved
        </div>
      </div>
    </footer>
  );
}
