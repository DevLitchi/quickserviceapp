import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define routes that don't require authentication
const publicRoutes = ["/", "/login", "/api/login", "/api/auth/session"]

// Define routes accessible by role
const routesByRole = {
  admin: ["/admin", "/dashboard", "/dashboard/users", "/dashboard/changelog"],
  ingeniero: [
    "/engineer",
    "/engineer/dashboard",
    "/engineer/profile",
    "/engineer/settings",
    "/engineer/help",
    "/engineer/terms",
    "/engineer/privacy",
    "/dashboard/changelog",
    "/dashboard/engineer-stats",
  ],
  supervisor: ["/user", "/user/submit-ticket", "/user/view-tickets", "/user/settings"],
  gerente: ["/user", "/user/submit-ticket", "/user/view-tickets", "/user/settings", "/manager", "/manager/settings"],
}

// Middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/") || pathname.includes("."))) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const sessionCookie = request.cookies.get("session")
  const userRoleCookie = request.cookies.get("userRole")

  if (!sessionCookie || !userRoleCookie) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const userRole = userRoleCookie.value

  // Handle redirects for consolidated routes
  if (pathname === "/engineer/changelog") {
    return NextResponse.redirect(new URL("/dashboard/changelog", request.url))
  }

  if (pathname === "/engineer/stats") {
    return NextResponse.redirect(new URL("/dashboard/engineer-stats", request.url))
  }

  // Check if user has access to the requested route
  const hasAccess =
    routesByRole[userRole as keyof typeof routesByRole]?.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) || pathname.startsWith("/api/")

  if (!hasAccess) {
    // Redirect to appropriate home page based on role
    switch (userRole) {
      case "admin":
        return NextResponse.redirect(new URL("/admin", request.url))
      case "ingeniero":
        return NextResponse.redirect(new URL("/engineer", request.url))
      case "supervisor":
      case "gerente":
        return NextResponse.redirect(new URL("/user", request.url))
      default:
        return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
