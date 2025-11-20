import { NextRequest, NextResponse } from "next/server"

type BucketKey = string

// Simple in-memory timestamp buckets per key. Suitable for single-instance/node runtimes.
const buckets: Map<BucketKey, number[]> = new Map()

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for") || ""
  const ip = xf.split(",")[0]?.trim()
  if (ip) return ip
  const xr = req.headers.get("x-real-ip")
  if (xr) return xr
  try {
    // As last resort, use socket address when available (not in edge runtime)
    // @ts-ignore - not available on all platforms
    return (req as any)?.ip || "unknown"
  } catch {
    return "unknown"
  }
}

export function checkRateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowMs: number
): { ok: true; remaining: number; resetMs: number } | { ok: false; response: NextResponse } {
  const ip = getClientIp(req)
  const bucketKey: BucketKey = `${key}:${ip}`
  const now = Date.now()
  const windowStart = now - windowMs

  const arr = buckets.get(bucketKey) || []
  const recent = arr.filter((t) => t > windowStart)

  if (recent.length >= limit) {
    const oldest = recent[0]
    const resetMs = Math.max(0, windowMs - (now - oldest))
    const res = NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    res.headers.set("Retry-After", Math.ceil(resetMs / 1000).toString())
    res.headers.set("X-RateLimit-Limit", String(limit))
    res.headers.set("X-RateLimit-Remaining", "0")
    return { ok: false, response: res }
  }

  recent.push(now)
  buckets.set(bucketKey, recent)
  const remaining = Math.max(0, limit - recent.length)
  const nextResetMs = recent.length ? Math.max(0, windowMs - (now - recent[0])) : windowMs
  return { ok: true, remaining, resetMs: nextResetMs }
}
