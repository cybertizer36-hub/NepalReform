import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Disable middleware by matching nothing. Security headers moved to next.config.mjs
export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
