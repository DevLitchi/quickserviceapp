import DashboardHeader from "@/components/dashboard-header"
import ChangelogManager from "@/components/changelog-manager"

export default function AdminChangelogPage() {
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
