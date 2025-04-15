import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import TicketList from "@/components/ticket-list"
import SystemOverview from "@/components/system-overview"

export default async function DashboardPage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TicketList />
          </div>
          <div>
            <SystemOverview />
          </div>
        </div>
      </main>
    </div>
  )
}
