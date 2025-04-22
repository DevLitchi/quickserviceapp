import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"

export default async function EngineerChangelogRedirect() {
  const authenticated = await isAuthenticated()
  const userRole = await getUserRole()

  if (!authenticated || userRole !== "ingeniero") {
    redirect("/")
  }

  // Redirect to the consolidated changelog page
  redirect("/dashboard/changelog")
}
