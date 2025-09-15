export const CACHE_DURATIONS = {
  VOTE_COUNTS: 60, // 1 minute
  SUGGESTIONS: 120, // 2 minutes
  STATIC_CONTENT: 300, // 5 minutes
  LONG_CACHE: 3600, // 1 hour
} as const

export function setCacheHeaders(response: Response, duration: number, isPublic = true) {
  const cacheControl = isPublic ? `public, max-age=${duration}, s-maxage=${duration}` : `private, max-age=${duration}`

  response.headers.set("Cache-Control", cacheControl)
  response.headers.set("Vary", "Accept-Encoding")
  return response
}

export function setNoCacheHeaders(response: Response) {
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  return response
}
