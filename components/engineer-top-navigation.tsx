"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ClipboardList, FileText, Settings, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"

const navLinks = [
  {
    href: "/engineer/unregistered-support",
    label: "Registrar Soporte",
    icon: HelpCircle,
  },
  {
    href: "/engineer/configuracion",
    label: "Configuración",
    icon: Settings,
  },
  {
    href: "/engineer/inventariado",
    label: "Inventariado",
    icon: FileText,
  },
  {
    href: "/engineer/dashboard",
    label: "Ver Tickets",
    icon: ClipboardList,
  },
]

export default function EngineerTopNavigation() {
  const pathname = usePathname()

  const handleLogoutAction = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/engineer" className="flex items-center">
              <span className="text-xl font-bold">SFQS Engineer</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary",
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                <link.icon className="h-4 w-4 mr-2" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleLogoutAction}
              className="text-gray-700 hover:bg-gray-100 hover:text-primary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
