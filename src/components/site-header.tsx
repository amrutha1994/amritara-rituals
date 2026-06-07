"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "#collections" },
  { label: "Our Story", href: "#story" },
  { label: "Rituals", href: "#rituals" },
  { label: "Contact", href: "#contact" },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header-sheen sticky top-0 z-50 shadow-[0_2px_24px_-12px_rgba(144,86,141,0.35)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 sm:px-6">
        {/* Logo — hard left */}
        <Link
          href="/"
          className="-ml-3 mr-auto flex items-center sm:-ml-5"
          aria-label="Amritara Rituals — home"
        >
          <Image
            src="/logo.png"
            alt="Amritara Rituals"
            width={700}
            height={381}
            priority
            className="w-[180px] sm:w-[220px] lg:w-[260px]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#collections"
            className="rounded-full border border-gold/40 bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep"
          >
            Shop
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-soft md:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border bg-surface px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href="#collections"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-deep"
              >
                Shop
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {/* Antique-gold accent line */}
      <div className="gold-rule" />
    </header>
  );
}
