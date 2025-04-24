"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ClipboardList, User, Award, LogOut, FileText, Settings, BarChart2, HelpCircle, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout, getUserRole, getUserEmail } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default function EngineerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const checkUserRole = async () => {
      const role = await getUserRole()
      const email = await getUserEmail()
      setUserRole(role)
      setUserEmail(email)

      // Redirigir si no es ingeniero
      if (role !== "ingeniero") {
        if (role === "admin") {
          router.push("/admin")
        } else if (role === "supervisor" || role === "gerente") {
          router.push("/user")
        } else {
          router.push("/")
        }
      }
    }

    checkUserRole()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [router])

  // Set up auto-refresh for dbasilio@milwaukeeelectronics.com on dashboard page
  useEffect(() => {
    // Clear any existing interval when component mounts or dependencies change
    if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }

    // Only set up refresh for the specific user and only on the dashboard page
    if (userEmail === "dbasilio@milwaukeeelectronics.com" && pathname === "/engineer/dashboard") {
      console.log("Setting up auto-refresh for admin user on dashboard")
      const interval = setInterval(() => {
        console.log("Auto-refreshing dashboard page")
        window.location.reload()
      }, 60000) // 60000 ms = 1 minute

      setRefreshInterval(interval)
    }

    // Clean up interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [pathname, userEmail])

  // Actualizar el array de enlaces de navegación para incluir las estadísticas detalladas
  const navLinks = [
    {
      href: "/engineer/dashboard",
      label: "Tickets",
      icon: ClipboardList,
    },
    {
      href: "/engineer/profile",
      label: "Mi Perfil",
      icon: User,
    },
    {
      href: "/dashboard/engineer-stats",
      label: "Estadísticas",
      icon: BarChart2,
    },
    {
      href: "/engineer/unregistered-support",
      label: "Soporte No Registrado",
      icon: HelpCircle,
    },
    {
      href: "/engineer/unregistered-support/review",
      label: "Revisar Soporte",
      icon: ListChecks,
    },
    {
      href: "/engineer/changelog",
      label: "Changelog",
      icon: FileText,
    },
    {
      href: "/engineer/settings",
      label: "Configuración",
      icon: Settings,
    },
  ]

  const handleLogoutAction = async () => {
    await logout()
    window.location.href = "/"
  }

  // Si no es ingeniero, no renderizar nada hasta que se redirija
  if (userRole !== "ingeniero") {
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
              <Award className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold">SFQS Engineer Portal</span>
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
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-1 py-2 px-3 rounded-md transition-colors",
                        pathname === link.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-700 hover:text-primary hover:bg-gray-50",
                      )}
                      aria-current={pathname === link.href ? "page" : undefined}
                    >
                      <link.icon className="h-5 w-5" aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Button
                    variant="ghost"
                    onClick={handleLogoutAction}
                    className="flex items-center space-x-1 py-2 px-3"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    <span>Logout</span>
                  </Button>
                </li>
              </ul>
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-3 rounded-md",
                    pathname === link.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  <link.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <Button
                variant="ghost"
                onClick={handleLogoutAction}
                className="flex items-center justify-start space-x-2 py-2 px-3 w-full text-left"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} SFQS Ticket System. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/engineer/help" className="text-sm text-gray-600 hover:text-primary">
                Ayuda
              </Link>
              <Link href="/engineer/terms" className="text-sm text-gray-600 hover:text-primary">
                Términos
              </Link>
              <Link href="/engineer/privacy" className="text-sm text-gray-600 hover:text-primary">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
