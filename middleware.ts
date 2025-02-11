import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const RATE_LIMIT_DURATION = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const authCookie = request.cookies.get("auth")

  // Add auth check endpoint to public routes
  if (path === "/api/auth/check") {
    return NextResponse.next()
  }

  // Define protected routes
  const protectedRoutes = ["/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  // Rate limiting for login attempts
  if (path === "/(auth)/login") {
    const attempts = request.cookies.get("login-attempts")
    const lastAttempt = request.cookies.get("last-attempt")
    const blockedUntil = request.cookies.get("blocked-until")

    // Check if user is blocked
    if (blockedUntil) {
      const blockTime = parseInt(blockedUntil.value)
      if (Date.now() < blockTime) {
        return NextResponse.redirect(new URL("/blocked", request.url))
      }
      // Remove block if time has passed
      const response = NextResponse.next()
      response.cookies.delete("blocked-until")
      return response
    }

    if (attempts && lastAttempt) {
      const attemptCount = parseInt(attempts.value)
      const lastAttemptTime = parseInt(lastAttempt.value)
      
      // Reset attempts after duration
      if (Date.now() - lastAttemptTime > RATE_LIMIT_DURATION) {
        const response = NextResponse.next()
        response.cookies.delete("login-attempts")
        response.cookies.delete("last-attempt")
        return response
      }

      // Block if too many attempts
      if (attemptCount >= MAX_ATTEMPTS) {
        const response = NextResponse.redirect(new URL("/blocked", request.url))
        response.cookies.set("blocked-until", String(Date.now() + RATE_LIMIT_DURATION))
        return response
      }
    }
  }

  // Handle protected routes
  if (isProtectedRoute && !authCookie) {
    const url = new URL("/(auth)/login", request.url)
    url.searchParams.set("from", path)
    return NextResponse.redirect(url)
  }

  // Redirect from login if already authenticated
  if (path === "/(auth)/login" && authCookie) {
    return NextResponse.redirect(new URL("/admin/data-entry", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
}

