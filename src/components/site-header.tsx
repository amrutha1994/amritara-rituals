"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type IconProps = { className?: string };

const Icon = {
  Home: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  Collections: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </svg>
  ),
  Story: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M4 5a2 2 0 0 1 2-2h7v18H6a2 2 0 0 1-2-2V5Z" />
      <path d="M13 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </svg>
  ),
  Rituals: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  Contact: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  ),
} as const;

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Icon.Home },
  { label: "Collections", href: "#collections", icon: Icon.Collections },
  { label: "Our Story", href: "#story", icon: Icon.Story },
  { label: "Rituals", href: "#rituals", icon: Icon.Rituals },
  { label: "Contact", href: "#contact", icon: Icon.Contact },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("/");

  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          aria-label="Amritara Rituals — home"
          onClick={() => setActive("/")}
        >
          <Image
            src="/logo.png"
            alt="Amritara Rituals"
            width={417}
            height={597}
            priority
            sizes="80px"
            className="h-[56px] w-auto sm:h-[64px]"
          />
        </Link>

        {/* Centered floating pill nav */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-surface/95 p-1.5 shadow-[0_12px_34px_-14px_rgba(144,86,141,0.45)] ring-1 ring-border md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href;
            const IconCmp = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.href)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-foreground/70 hover:bg-primary-soft/60 hover:text-primary"
                }`}
              >
                <IconCmp className="h-[18px] w-[18px]" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="#collections"
            className="hidden rounded-full border border-gold/40 bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-gold-light/30 transition-colors hover:bg-primary-deep md:inline-flex"
          >
            Shop
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-primary shadow-sm ring-1 ring-border transition-colors hover:bg-primary-soft md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
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
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="mx-4 mb-3 rounded-2xl border border-border bg-surface p-3 shadow-lg md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const IconCmp = link.icon;
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => {
                      setActive(link.href);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary-soft hover:text-primary"
                  >
                    <IconCmp className="h-[18px] w-[18px]" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
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
    </header>
  );
}
