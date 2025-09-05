"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
// Add the Settings icon import at the top with the other icons
import { Ticket, LogOut, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout, getUserRole } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
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
      {/* Only show header on main user page */}
      {pathname === "/user" && (
        <header
          className={cn("sticky top-0 z-50 bg-white transition-shadow duration-200", isScrolled ? "shadow-md" : "shadow")}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ticket className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">SFQS Ticket System</span>
              </div>

              {/* Only show logout button */}
              <Button variant="ghost" onClick={handleLogoutAction} className="flex items-center space-x-1 py-2 px-3">
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Show back button on other pages */}
      {pathname !== "/user" && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/user">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogoutAction} className="flex items-center space-x-1">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      )}

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
