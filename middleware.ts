import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth")
  const roleCookie = request.cookies.get("userRole")

  const isAuthenticated = authCookie?.value === "true"
  const userRole = roleCookie?.value

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login", "/register"]

  // Rutas específicas por rol - Asegurarse de que todos los roles puedan acceder a las rutas de tickets
  const adminRoutes = [
    "/admin",
    "/dashboard",
    "/dashboard/users",
    "/dashboard/changelog",
    "/dashboard/extra-time",
    "/dashboard/engineer-stats",
  ]
  const engineerRoutes = [
    "/engineer",
    "/engineer/changelog",
    "/engineer/stats",
    "/dashboard/engineer-stats",
    "/dashboard/changelog",
  ]
  const userRoutes = ["/user", "/user/changelog", "/dashboard/changelog", "/dashboard/engineer-stats"]

  // Rutas comunes que todos los roles pueden acceder
  const commonRoutes = [
    "/api/tickets",
    "/api/tickets/submit",
    "/api/engineers/team-stats",
    "/api/engineers/detailed-stats",
    "/api/changelog",
  ]

  const path = request.nextUrl.pathname

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
    // Administradores pueden acceder a rutas de admin
    if (userRole === "admin" && !adminRoutes.some((route) => path === route || path.startsWith(route))) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    // Ingenieros pueden acceder a rutas de ingeniero y algunas rutas de dashboard
    if (userRole === "ingeniero" && !engineerRoutes.some((route) => path === route || path.startsWith(route))) {
      return NextResponse.redirect(new URL("/engineer", request.url))
    }

    // Usuarios regulares (supervisores y gerentes) pueden acceder a rutas de usuario y algunas rutas de dashboard
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
