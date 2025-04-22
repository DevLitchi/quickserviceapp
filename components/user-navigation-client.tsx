"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/user", label: "Panel Principal" },
  { href: "/user/submit-ticket", label: "Crear Ticket" },
  { href: "/user/view-tickets", label: "Mis Tickets" },
  { href: "/user/settings", label: "Configuración" },
]

export default function UserNavigationClient() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap space-x-2 space-y-2 md:space-x-4 md:space-y-0">
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
