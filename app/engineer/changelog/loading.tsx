import { Skeleton } from "@/components/ui/skeleton"
import EngineerTopNavigation from "@/components/engineer-top-navigation"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EngineerTopNavigation />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Inventariado</h1>
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}
