/**
 * Site-wide announcement strip shown at the very top of every storefront page.
 * The copy and on/off state come from the Sanity `settings` singleton (see
 * `getAnnouncement`), so promos like a launch-month offer can be edited or
 * hidden without a deploy. Renders nothing when there's no message to show.
 */
export default function AnnouncementBanner({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="bg-gradient-to-r from-primary-deep via-primary to-primary-deep text-white">
      <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium tracking-[0.12em] sm:text-sm">
        <span aria-hidden>✦</span>
        <span>{text}</span>
        <span aria-hidden>✦</span>
      </p>
    </div>
  );
}
