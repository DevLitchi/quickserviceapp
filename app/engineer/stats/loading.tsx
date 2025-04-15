import { Skeleton } from "@/components/ui/skeleton"

export default function StatsLoading() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-6 rounded-lg border">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full mt-4" />
              </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border">
            <Skeleton className="h-5 w-1/3 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="p-6 rounded-lg border">
            <Skeleton className="h-5 w-1/3 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
