"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/manager", label: "Panel Principal" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/users", label: "Usuarios" },
  { href: "/dashboard/extra-time/requests", label: "Tiempo Extra" },
  { href: "/dashboard/changelog", label: "Changelog" },
  { href: "/manager/settings", label: "Configuración" },
]

export function ManagerNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium",
            pathname === link.href ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
