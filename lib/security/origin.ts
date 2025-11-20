import { NextRequest } from 'next/server'

// Determine if the incoming request is from an allowed origin for state-changing operations
export function isAllowedOrigin(request: NextRequest, extraAllowed: string[] = []): boolean {
  const originHeader = request.headers.get('origin') || ''
  const refererHeader = request.headers.get('referer') || ''

  let candidate = ''
  try {
    candidate = originHeader || (refererHeader ? new URL(refererHeader).origin : '')
  } catch {
    candidate = ''
  }

  // If we cannot determine origin, reject to be safe
  if (!candidate) return false

  const requestOrigin = request.nextUrl.origin
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL
  const defaults = [requestOrigin]

  if (envOrigin) {
    try { defaults.push(new URL(envOrigin).origin) } catch {}
  }

  const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000']
  const allowed = new Set<string>([...defaults, ...localOrigins, ...extraAllowed])

  return allowed.has(candidate)
}
