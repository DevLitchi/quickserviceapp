"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Ticket, ClipboardList, Users, User, BarChart2, FileText } from "lucide-react"
import { logout, getUserRole } from "@/lib/auth"
import { useEffect, useState } from "react"

export default function DashboardHeader() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await getUserRole()
        setUserRole(role)
      } catch (error) {
        console.error("Failed to fetch user role:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Show loading state or nothing while determining user role
  if (loading) {
    return (
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SFQS</span>
          </div>
        </div>
      </header>
    )
  }

  // Get the appropriate title based on user role
  const getHeaderTitle = () => {
    switch (userRole) {
      case "admin":
        return "SFQS Admin"
      case "gerente":
        return "SFQS Manager Portal"
      case "supervisor":
        return "SFQS Supervisor Portal"
      case "ingeniero":
        return "SFQS Engineer Portal"
      default:
        return "SFQS Ticket System"
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{getHeaderTitle()}</span>
        </div>
        <nav className="flex items-center space-x-4 md:space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
            <ClipboardList className="h-5 w-5" />
            <span className="hidden md:inline">Tickets</span>
          </Link>

          {/* Show changelog link only for engineers, admins, and managers */}
          {(userRole === "ingeniero" || userRole === "admin" || userRole === "gerente") && (
            <Link href="/dashboard/changelog" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
              <FileText className="h-5 w-5" />
              <span className="hidden md:inline">Changelog</span>
            </Link>
          )}

          {(userRole === "admin" || userRole === "gerente") && (
            <Link href="/dashboard/users" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
              <Users className="h-5 w-5" />
              <span className="hidden md:inline">Users</span>
            </Link>
          )}

          {/* Show engineer stats link only for engineers */}
          {userRole === "ingeniero" && (
            <Link
              href="/dashboard/engineer-stats"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary"
            >
              <BarChart2 className="h-5 w-5" />
              <span className="hidden md:inline">Estadísticas</span>
            </Link>
          )}

          {userRole === "ingeniero" && (
            <Link href="/engineer/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary">
              <User className="h-5 w-5" />
              <span className="hidden md:inline">Mi Perfil</span>
            </Link>
          )}

          <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-1">
            <LogOut className="h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
