import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import UserManagement from "@/components/user-management"

export default async function UsersPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  if (!authenticated) {
    redirect("/")
  }

  // Only admins can access this page
  if (userRole !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <UserManagement />
      </main>
    </div>
  )
}
