import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  if (response) {
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    // Geo is only available in Edge Runtime, not Node.js runtime
    // Remove or comment out the geo-related code
    // const country = request.geo?.country || "Unknown"
    // response.headers.set("X-User-Country", country)

    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - _vercel (Vercel internal routes)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
