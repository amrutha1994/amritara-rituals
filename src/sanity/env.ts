/**
 * Sanity connection settings — the single source of truth for projectId /
 * dataset, shared by the storefront client and the standalone Studio.
 *
 * projectId and dataset are PUBLIC identifiers (safe to commit — they only
 * grant read access to published content). They're read from env when set
 * (e.g. per-environment on the host) and otherwise fall back to these defaults.
 * The defaults also matter for the Studio bundle, which can't read
 * `NEXT_PUBLIC_*` vars at runtime.
 *
 * Replace the projectId default with your real project id once created. The
 * write token used by the migration script stays server-only in the env.
 */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "7yu3coya";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
