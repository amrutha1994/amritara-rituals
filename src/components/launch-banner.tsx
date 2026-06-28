// ⚠️ TEMPORARY — "Launching soon" announcement bar.
// Remove this component (and its mount in src/app/layout.tsx) once the store
// goes live and orders are open.
export default function LaunchBanner() {
  return (
    <div className="bg-gradient-to-r from-primary-deep via-primary to-primary-deep text-white">
      <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium tracking-[0.12em] sm:text-sm">
        <span aria-hidden>✦</span>
        <span className="uppercase">
          Launching soon — browse our collection, ordering opens shortly.
        </span>
        <span aria-hidden>✦</span>
      </p>
    </div>
  );
}
