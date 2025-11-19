import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a URL is safe to use in an `href` attribute.
 * Allows absolute `http`, `https`, and `mailto` URLs and relative URLs.
 * Rejects `javascript:`, `vbscript:`, `data:` and other non-http(s) schemes.
 */
export function isSafeUrl(url?: string) {
  if (!url || typeof url !== 'string') return false

  const trimmed = url.trim()
  const lower = trimmed.toLowerCase()

  // Disallow obvious dangerous schemes
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
    return false
  }

  try {
    // Use a base to allow relative URLs (e.g. /path, ../foo)
    const u = new URL(trimmed, 'https://example.com')
    return ['http:', 'https:', 'mailto:'].includes(u.protocol)
  } catch (e) {
    return false
  }
}
