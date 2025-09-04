import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import DashboardHeader from "@/components/dashboard-header"
import ExtraTimeForm from "@/components/extra-time-form"

export default async function ExtraTimePage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Extra Time Request</h1>
        <ExtraTimeForm />
      </main>
    </div>
  )
}
