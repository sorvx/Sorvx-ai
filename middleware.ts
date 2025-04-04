import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/register" ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password")

  // Get the token from the cookies
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access auth pages, redirect to home
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!isPublicPath && !token && !path.startsWith("/api/auth")) {
    // If user is not logged in and tries to access protected pages, redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ["/", "/chat/:path*", "/login", "/register", "/forgot-password", "/reset-password/:path*", "/api/:path*"],
}

