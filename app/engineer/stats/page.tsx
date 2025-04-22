import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"

export default async function EngineerStatsRedirect() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  if (!authenticated || userRole !== "ingeniero") {
    redirect("/")
  }

  // Redirect to the consolidated stats page
  redirect("/dashboard/engineer-stats")
}
