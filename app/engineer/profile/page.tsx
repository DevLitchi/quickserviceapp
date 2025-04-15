import { Suspense } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole, getCurrentUser } from "@/lib/auth"
import EngineerProfile from "@/components/engineer-profile"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mi Perfil | SFQS Ticket System",
  description: "Visualiza y personaliza tu perfil de ingeniero, estadísticas y progreso",
}

export default async function EngineerProfilePage() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()
  const currentUser = await getCurrentUser()

  if (!authenticated) {
    redirect("/")
  }

  // Solo ingenieros pueden acceder a esta página
  if (userRole !== "ingeniero") {
    redirect("/dashboard")
  }

  const updateProfile = async (updatedData: Partial<typeof currentUser>) => {
    "use server"

    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : ""

      const response = await fetch(`${baseUrl}/api/engineers/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error updating profile:", errorData)
        return false
      }

      return true
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" aria-hidden="true"></div>
              <span className="text-sm font-medium">{currentUser?.email}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<ProfileSkeleton />}>
            <EngineerProfile userData={currentUser || {}} onUpdateProfile={updateProfile} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
