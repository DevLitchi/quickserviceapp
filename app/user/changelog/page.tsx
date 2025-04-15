import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import ChangelogManager from "@/components/changelog-manager"
import UserNavigation from "@/components/user-navigation"

export default async function UserChangelogPage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  if (!authenticated || (userRole !== "gerente" && userRole !== "supervisor")) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Gestión de Changelog</h1>
        <ChangelogManager />
      </main>
    </div>
  )
}
