import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import ChangelogManager from "@/components/changelog-manager"
import EngineerTopNavigation from "@/components/engineer-top-navigation"

export default async function EngineerChangelogPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  if (!authenticated || userRole !== "ingeniero") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EngineerTopNavigation />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Inventariado</h1>
        <ChangelogManager />
      </main>
    </div>
  )
}
