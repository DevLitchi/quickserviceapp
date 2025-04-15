import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación usando cookies directamente
  const authCookie = cookies().get("auth")
  const roleCookie = cookies().get("userRole")

  const isAuthenticated = authCookie?.value === "true"
  const userRole = roleCookie?.value

  if (!isAuthenticated || userRole !== "gerente") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  )
}
