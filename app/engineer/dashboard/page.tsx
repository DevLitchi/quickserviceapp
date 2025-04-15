import type React from "react"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole, getCurrentUser } from "@/lib/auth"
import EngineerTicketList from "@/components/engineer-ticket-list"
import EngineerDashboard from "@/components/engineer-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import DebugTicketData from "@/components/debug-ticket-data"

export const metadata: Metadata = {
  title: "Dashboard de Ingeniero | SFQS Ticket System",
  description: "Gestiona tickets, visualiza estadísticas y monitorea tu progreso como ingeniero",
}

export default async function EngineerDashboardPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()
  const currentUser = await getCurrentUser()

  console.log("Auth status:", authenticated)
  console.log("User role:", userRole)
  console.log("Current user:", currentUser ? "Found" : "Not found")

  if (!authenticated) {
    redirect("/")
  }

  // Solo ingenieros pueden acceder a esta página
  if (userRole !== "ingeniero") {
    redirect("/dashboard")
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
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Dashboard de Ingeniero</h1>
          <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" aria-hidden="true"></div>
              <span className="text-sm font-medium">
                Nivel {engineerData.level} | {engineerData.exp} EXP
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section aria-labelledby="tickets-heading">
              <h2 id="tickets-heading" className="sr-only">
                Gestión de Tickets
              </h2>
              <Suspense fallback={<TicketListSkeleton />}>
                <ErrorBoundary>
                  <EngineerTicketList />
                </ErrorBoundary>
              </Suspense>

              {process.env.NODE_ENV !== "production" && <DebugTicketData />}
            </section>
          </div>

          <div>
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">
                Estadísticas y Progreso
              </h2>
              <Suspense fallback={<DashboardSkeleton />}>
                <EngineerDashboard engineerData={engineerData} />
              </Suspense>
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
