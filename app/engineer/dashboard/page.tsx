"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole, getCurrentUser } from "@/lib/auth"
import EngineerTicketList from "@/components/engineer-ticket-list"
import EngineerDashboard from "@/components/engineer-dashboard"
import EngineerTopNavigation from "@/components/engineer-top-navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"


export default function EngineerDashboardPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await isAuthenticated()
        const role = await getUserRole()
        const user = await getCurrentUser()

        setAuthenticated(isAuth)
        setUserRole(role)
        setCurrentUser(user)
        setLoading(false)

        if (!isAuth) {
          redirect("/")
        }

        if (role !== "ingeniero" && role !== "admin") {
          redirect("/dashboard")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EngineerTopNavigation />
        <div className="container mx-auto py-6 px-4">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Prepare engineer data with defaults for any missing fields
  const engineerData = {
    id: currentUser?.id || 0,
    name: currentUser?.name || "Test Engineer",
    email: currentUser?.email || "engineer@milwaukeeelectronics.com",
    level: currentUser?.level || 1,
    exp: currentUser?.exp || 0,
    ticketsSolved: currentUser?.ticketsSolved || 0,
    ticketsPending: currentUser?.ticketsPending || 0,
    backgroundMusic: currentUser?.backgroundMusic || "https://example.com/music/track1.mp3",
    area: currentUser?.area || "Test Engineering",
    position: currentUser?.position || "Engineer",
    avatar: currentUser?.avatar || "/placeholder.svg?height=128&width=128",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EngineerTopNavigation />
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard de Ingeniero</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section aria-labelledby="tickets-heading">
              <h2 id="tickets-heading" className="sr-only">
                Gestión de Tickets
              </h2>
              {loading ? (
                <TicketListSkeleton />
              ) : (
                <ErrorBoundary>
                  <EngineerTicketList />
                </ErrorBoundary>
              )}
            </section>
          </div>

          <div>
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                Estadísticas y Progreso
              </h2>
              {loading ? <DashboardSkeleton /> : <EngineerDashboard engineerData={engineerData} />}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>
  } catch (error) {
    console.error("Error in EngineerTicketList:", error)
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Error al cargar los tickets. Por favor, recargue la página o contacte al administrador.
        </AlertDescription>
      </Alert>
    )
  }
}

function TicketListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-12 w-full" />
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
