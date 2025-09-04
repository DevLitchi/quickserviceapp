import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import ChangelogManager from "@/components/changelog-manager"

export default async function ChangelogPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  if (!authenticated) {
    redirect("/")
  }

  // Only engineers, admins, and managers can access this page
  if (userRole !== "ingeniero" && userRole !== "admin" && userRole !== "gerente") {
    redirect("/restricted")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Changelog Management</h1>
        <ChangelogManager />
      </main>
    </div>
  )
}
