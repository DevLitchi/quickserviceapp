import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import TeamStats from "@/components/team-stats"

export default async function EngineerStatsPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  // Only allow engineers to access this page
  if (!authenticated || userRole !== "ingeniero") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Engineer Statistics</h1>
        <TeamStats />
      </main>
    </div>
  )
}
