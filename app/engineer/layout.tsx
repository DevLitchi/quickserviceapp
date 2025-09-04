"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/auth"

export default function EngineerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkUserRole = async () => {
      const role = await getUserRole()
      setUserRole(role)

      // Redirigir si no es ingeniero
      if (role !== "ingeniero") {
        if (role === "admin") {
          router.push("/admin")
        } else if (role === "supervisor" || role === "gerente") {
          router.push("/user")
        } else {
          router.push("/")
        }
      }
    }

    checkUserRole()
  }, [router])

  // Si no es ingeniero, no renderizar nada hasta que se redirija
  if (userRole !== "ingeniero") {
    return null
  }

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  )
}
