import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth")
  const roleCookie = request.cookies.get("userRole")

  const isAuthenticated = authCookie?.value === "true"
  const userRole = roleCookie?.value

  // Rutas públicas que no requieren autenticación - Removed /register
  const publicRoutes = ["/", "/login"]

  // Rutas específicas por rol - Removed restricted routes
  const adminRoutes = ["/admin", "/dashboard", "/dashboard/users"]
  const engineerRoutes = [
    "/engineer",
    "/engineer/stats",
    "/dashboard/engineer-stats",
    "/engineer/profile",
    "/engineer/unregistered-support",
    "/engineer/unregistered-support/review",
  ]
  const userRoutes = ["/user"]

  // Rutas comunes que todos los roles pueden acceder
  const commonRoutes = ["/api/tickets", "/api/tickets/submit"]

  // Rutas de changelog - solo accesible para ingenieros y roles administrativos
  const changelogRoutes = ["/dashboard/changelog"]

  const path = request.nextUrl.pathname

  // Explicitly block removed routes
  const blockedRoutes = [
    "/register",
    "/admin/pending-registrations",
    "/admin/xp-management",
    "/admin/changelog",
    "/dashboard/extra-time",
    "/dashboard/extra-time/requests",
    "/user/extra-time",
    "/user/extra-time/requests",
    "/user/changelog",
    "/engineer/changelog",
  ]

  // Block access to removed routes
  if (blockedRoutes.some((route) => path === route || path.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Special handling for changelog - only engineers and admin/manager roles can access
  if (path === "/dashboard/changelog" && userRole !== "ingeniero" && userRole !== "admin" && userRole !== "gerente") {
    return NextResponse.redirect(new URL("/restricted", request.url))
  }

  // Special handling for engineer stats - only engineers can access
  if (path === "/dashboard/engineer-stats" && userRole !== "ingeniero") {
    return NextResponse.redirect(new URL("/restricted", request.url))
  }

  // Si no está autenticado y no es una ruta pública, redirigir al login
  if (!isAuthenticated && !publicRoutes.some((route) => path === route || path.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si está autenticado y está en la página de login, redirigir según el rol
  if (isAuthenticated && (path === "/login" || path === "/")) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    } else if (userRole === "ingeniero") {
      return NextResponse.redirect(new URL("/engineer", request.url))
    } else if (userRole === "supervisor" || userRole === "gerente") {
      return NextResponse.redirect(new URL("/user", request.url))
    } else {
      // Por defecto, redirigir a la página de usuario
      return NextResponse.redirect(new URL("/user", request.url))
    }
  }

  // Permitir acceso a rutas comunes para todos los roles autenticados
  if (isAuthenticated && commonRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next()
  }

  // Control de acceso basado en roles
  if (isAuthenticated) {
    // Administradores pueden acceder a rutas de admin y changelog
    if (
      userRole === "admin" &&
      !adminRoutes.some((route) => path === route || path.startsWith(route)) &&
      !changelogRoutes.some((route) => path === route)
    ) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    // Ingenieros pueden acceder a rutas de ingeniero, changelog y estadísticas
    if (
      userRole === "ingeniero" &&
      !engineerRoutes.some((route) => path === route || path.startsWith(route)) &&
      !changelogRoutes.some((route) => path === route)
    ) {
      return NextResponse.redirect(new URL("/engineer", request.url))
    }

    // Usuarios regulares (supervisores y gerentes) pueden acceder a rutas de usuario
    if (
      (userRole === "supervisor" || userRole === "gerente") &&
      !userRoutes.some((route) => path === route || path.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/user", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
