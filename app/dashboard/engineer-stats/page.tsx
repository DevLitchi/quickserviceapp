import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import TeamStats from "@/components/team-stats"

export const metadata = {
  title: "Estadísticas del Equipo de Ingenieros | SFQS",
  description: "Estadísticas detalladas del rendimiento del equipo de ingenieros",
}

export default async function EngineerTeamStatsPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  if (!authenticated) {
    redirect("/login")
  }

  // Only engineers can access this page now
  if (userRole !== "ingeniero") {
    redirect("/restricted")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Estadísticas del Equipo de Ingenieros</h1>
        <TeamStats />
      </main>
    </div>
  )
}
