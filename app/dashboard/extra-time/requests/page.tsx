import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import ExtraTimeRequests from "@/components/extra-time-requests"

export default async function ExtraTimeRequestsPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()
  const isAdmin = userRole === "admin"

  if (!authenticated) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">
          {isAdmin ? "Manage Extra Time Requests" : "Your Extra Time Requests"}
        </h1>
        <ExtraTimeRequests isAdmin={isAdmin} />
      </main>
    </div>
  )
}
