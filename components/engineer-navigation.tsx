"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ClipboardList, User, Settings, BarChart2, FileText, HelpCircle, ListChecks } from "lucide-react"

const links = [
  { href: "/engineer/dashboard", label: "Gestión de Tickets", icon: ClipboardList },
  { href: "/engineer/profile", label: "Perfil", icon: User },
  { href: "/dashboard/engineer-stats", label: "Estadísticas", icon: BarChart2 },
  { href: "/engineer/unregistered-support", label: "Soporte No Registrado", icon: HelpCircle },
  { href: "/engineer/unregistered-support/review", label: "Revisar Soporte", icon: ListChecks },
  { href: "/engineer/changelog", label: "Changelog", icon: FileText },
  { href: "/engineer/settings", label: "Configuración", icon: Settings },
]

export default function EngineerNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium flex items-center",
            pathname === link.href ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 hover:text-primary",
          )}
        >
          <link.icon className="h-4 w-4 mr-2" />
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  )
}
