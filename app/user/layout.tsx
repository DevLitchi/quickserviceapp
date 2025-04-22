"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
// Add the Settings icon import at the top with the other icons
import { Ticket, PlusCircle, Search, Clock, LogOut, Settings, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout, getUserRole } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const checkUserRole = async () => {
      const role = await getUserRole()
      setUserRole(role)

      // Redirigir si no es supervisor o gerente
      if (role !== "supervisor" && role !== "gerente") {
        if (role === "admin") {
          router.push("/admin")
        } else if (role === "ingeniero") {
          router.push("/engineer")
        } else {
          router.push("/")
        }
      }
    }

    checkUserRole()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [router])

  const handleLogoutAction = async () => {
    await logout()
    window.location.href = "/"
  }

  // Si no es supervisor o gerente, no renderizar nada hasta que se redirija
  if (userRole !== "supervisor" && userRole !== "gerente") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header
        className={cn("sticky top-0 z-50 bg-white transition-shadow duration-200", isScrolled ? "shadow-md" : "shadow")}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SFQS Ticket System</span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/user/view-tickets"
                className={cn(
                  "flex items-center space-x-1 py-2 px-3 rounded-md transition-colors",
                  pathname === "/user/view-tickets"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
              >
                <Search className="h-5 w-5" />
                <span>Ver Tickets</span>
              </Link>
              <Link
                href="/user/submit-ticket"
                className={cn(
                  "flex items-center space-x-1 py-2 px-3 rounded-md transition-colors",
                  pathname === "/user/submit-ticket"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
              >
                <PlusCircle className="h-5 w-5" />
                <span>Crear Ticket</span>
              </Link>
              <Link
                href="/user/extra-time"
                className={cn(
                  "flex items-center space-x-1 py-2 px-3 rounded-md transition-colors",
                  pathname === "/user/extra-time"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
              >
                <Clock className="h-5 w-5" />
                <span>Pedir Tiempo Extra</span>
              </Link>
              <Link
                href="/user/changelog"
                className={cn(
                  "flex items-center space-x-1 py-2 px-3 rounded-md transition-colors",
                  pathname === "/user/changelog"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
              >
                <FileText className="h-5 w-5" />
                <span>Changelog</span>
              </Link>
              {/* Add the Settings link in the desktop navigation section, before the Logout button */}
              <Link
                href="/user/settings"
                className={cn(
                  "flex items-center space-x-1 py-2 px-3 rounded-md transition-colors",
                  pathname === "/user/settings"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
              >
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </Link>
              <Button variant="ghost" onClick={handleLogoutAction} className="flex items-center space-x-1 py-2 px-3">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>

          {/* Mobile navigation */}
          <div
            id="mobile-menu"
            className={cn(
              "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
              isMobileMenuOpen ? "max-h-64 mt-4" : "max-h-0",
            )}
          >
            <nav className="flex flex-col space-y-2 pb-3">
              <Link
                href="/user/view-tickets"
                className={cn(
                  "flex items-center space-x-2 py-2 px-3 rounded-md",
                  pathname === "/user/view-tickets"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-5 w-5" />
                <span>Ver Tickets</span>
              </Link>
              <Link
                href="/user/submit-ticket"
                className={cn(
                  "flex items-center space-x-2 py-2 px-3 rounded-md",
                  pathname === "/user/submit-ticket"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PlusCircle className="h-5 w-5" />
                <span>Crear Ticket</span>
              </Link>
              <Link
                href="/user/extra-time"
                className={cn(
                  "flex items-center space-x-2 py-2 px-3 rounded-md",
                  pathname === "/user/extra-time"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock className="h-5 w-5" />
                <span>Pedir Tiempo Extra</span>
              </Link>
              <Link
                href="/user/changelog"
                className={cn(
                  "flex items-center space-x-2 py-2 px-3 rounded-md",
                  pathname === "/user/changelog"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span>Changelog</span>
              </Link>
              {/* Also add the Settings link in the mobile navigation section, before the Logout button */}
              <Link
                href="/user/settings"
                className={cn(
                  "flex items-center space-x-2 py-2 px-3 rounded-md",
                  pathname === "/user/settings"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogoutAction}
                className="flex items-center justify-start space-x-2 py-2 px-3 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Suspense>{children}</Suspense>
      </main>
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} SFQS Ticket System. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/help" className="text-sm text-gray-600 hover:text-primary">
                Ayuda
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-primary">
                Términos
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
