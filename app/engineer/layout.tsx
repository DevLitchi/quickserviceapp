"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ClipboardList,
  User,
  Award,
  LogOut,
  FileText,
  Settings,
  BarChart2,
  HelpCircle,
  ListChecks,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout, getUserRole, getUserEmail } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default function EngineerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
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

    // Check if we're on mobile and close sidebar by default
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkUserRole()
    handleResize() // Call once on initial load
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:w-20",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-primary" aria-hidden="true" />
            {isSidebarOpen && <span className="ml-3 text-xl font-bold">SFQS Engineer</span>}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hidden md:block"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform", !isSidebarOpen && "rotate-180")} />
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="py-4 flex flex-col h-[calc(100%-4rem)] justify-between">
          <nav className="space-y-1 px-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary",
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                <link.icon
                  className={cn(
                    "h-5 w-5 mr-3 flex-shrink-0",
                    pathname === link.href ? "text-white" : "text-gray-500 group-hover:text-primary",
                  )}
                  aria-hidden="true"
                />
                {(isSidebarOpen || isMobileSidebarOpen) && <span>{link.label}</span>}
                {!isSidebarOpen && !isMobileSidebarOpen && <span className="sr-only">{link.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="px-2 mt-auto">
            <Button
              variant="ghost"
              onClick={handleLogoutAction}
              className={cn(
                "w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-primary",
                !isSidebarOpen && !isMobileSidebarOpen && "justify-center",
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 mr-3" aria-hidden="true" />
              {(isSidebarOpen || isMobileSidebarOpen) && <span>Cerrar sesión</span>}
              {!isSidebarOpen && !isMobileSidebarOpen && <span className="sr-only">Cerrar sesión</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className={cn(
            "bg-white py-2 px-4 flex items-center justify-between border-b border-gray-200 transition-shadow",
            isScrolled ? "shadow-md" : "",
          )}
        >
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-lg font-semibold ml-2 md:ml-0">
            {/* Dynamic page title based on current path */}
            {navLinks.find((link) => link.href === pathname)?.label || "Panel de Ingeniero"}
          </div>
          <div className="flex items-center space-x-2">
            {userEmail && <span className="text-sm text-gray-500 hidden md:block">{userEmail}</span>}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="container mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-4 px-4">
          <div className="container mx-auto">
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
    </div>
  )
}
