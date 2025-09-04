import { Skeleton } from "@/components/ui/skeleton"

export default function LandingLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-24 w-full max-w-2xl mx-auto mb-8" />
          <Skeleton className="h-8 w-full max-w-md mx-auto mb-8" />
          <Skeleton className="h-16 w-64 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  )
}
