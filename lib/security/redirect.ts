export function validateRedirectPath(next: unknown, fallback: string = "/dashboard"): string {
  if (typeof next !== "string") return fallback
  const trimmed = next.trim()

  // Disallow absolute URLs or protocol-relative URLs
  if (/^https?:\/\//i.test(trimmed)) return fallback
  if (trimmed.startsWith("//")) return fallback

  // Must be an absolute path within this origin
  if (!trimmed.startsWith("/")) return fallback

  // Basic CRLF and control chars guard
  if (/\r|\n|\u0000/.test(trimmed)) return fallback

  // Optionally, constrain to site paths (avoid admin/api redirects unless intended)
  // For now, allow any internal path. Extend with a whitelist if needed.
  return trimmed || fallback
}
