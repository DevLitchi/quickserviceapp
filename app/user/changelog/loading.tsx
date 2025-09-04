import { Skeleton } from "@/components/ui/skeleton"
import UserNavigation from "@/components/user-navigation"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Gestión de Changelog</h1>
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}
